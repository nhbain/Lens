/**
 * Integration tests for state persistence layer.
 * Tests the complete workflow of creating, saving, loading, and updating state.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the file-system module to simulate Tauri APIs
const mockFileStore = new Map<string, string>()

vi.mock('./file-system', () => ({
  readStateFile: vi.fn(async (filename: string) => {
    return mockFileStore.get(filename) ?? null
  }),
  writeStateFileAtomic: vi.fn(async (filename: string, content: string) => {
    mockFileStore.set(filename, content)
  }),
  removeStateFile: vi.fn(async (filename: string) => {
    mockFileStore.delete(filename)
    mockFileStore.delete(`${filename}.bak`)
  }),
  listStateFiles: vi.fn(async () => {
    return Array.from(mockFileStore.keys()).filter(
      (k) => !k.endsWith('.bak') && !k.endsWith('.tmp')
    )
  }),
  stateFileExists: vi.fn(async (filename: string) => {
    return mockFileStore.has(filename)
  }),
  backupStateFile: vi.fn(async (filename: string) => {
    const content = mockFileStore.get(filename)
    if (content) {
      mockFileStore.set(`${filename}.bak`, content)
      return true
    }
    return false
  }),
  restoreFromBackup: vi.fn(async (filename: string) => {
    const backup = mockFileStore.get(`${filename}.bak`)
    if (backup) {
      mockFileStore.set(filename, backup)
      return true
    }
    return false
  }),
}))

// Import after mocking
import {
  getOrCreateFileState,
  loadFileState,
  saveFileState,
  updateItemStatus,
  updateContentHash,
  deleteFileState,
  listTrackedFiles,
  generateStateFilename,
} from './state-manager'
import { computeContentHash, hasContentChanged } from './file-hash'
import { createFileTrackingState } from './types'

describe('State Persistence Integration', () => {
  beforeEach(() => {
    mockFileStore.clear()
    vi.clearAllMocks()
  })

  describe('Complete workflow: create, save, load, update', () => {
    it('persists state across simulated app restarts', async () => {
      const sourcePath = '/Users/test/project/README.md'
      const markdownContent = `# Project

- [ ] Task 1
- [ ] Task 2
- [x] Task 3
`
      // Step 1: Initial app start - create state for a new file
      const contentHash = computeContentHash(markdownContent)
      const initialState = await getOrCreateFileState(sourcePath, contentHash)

      expect(initialState.sourcePath).toBe(sourcePath)
      expect(initialState.contentHash).toBe(contentHash)
      expect(Object.keys(initialState.items)).toHaveLength(0)

      // Step 2: User marks some items as in_progress/complete
      await updateItemStatus(sourcePath, 'task-1-id', 'in_progress')
      await updateItemStatus(sourcePath, 'task-2-id', 'complete')

      // Step 3: Simulate app restart by loading state fresh
      const reloadedState = await loadFileState(sourcePath)

      expect(reloadedState).not.toBeNull()
      expect(reloadedState!.items['task-1-id'].status).toBe('in_progress')
      expect(reloadedState!.items['task-2-id'].status).toBe('complete')

      // Step 4: Verify content hash still matches (file unchanged)
      expect(hasContentChanged(markdownContent, reloadedState!.contentHash)).toBe(false)
    })

    it('detects when source file has changed', async () => {
      const sourcePath = '/Users/test/project/TODO.md'
      const originalContent = '# TODO\n\n- [ ] Original task'
      const modifiedContent = '# TODO\n\n- [ ] Original task\n- [ ] New task'

      // Create initial state
      const originalHash = computeContentHash(originalContent)
      await getOrCreateFileState(sourcePath, originalHash)

      // Simulate file modification
      const state = await loadFileState(sourcePath)
      expect(state).not.toBeNull()

      // Check if content changed
      const changed = hasContentChanged(modifiedContent, state!.contentHash)
      expect(changed).toBe(true)

      // Update the hash after re-parsing
      const newHash = computeContentHash(modifiedContent)
      await updateContentHash(sourcePath, newHash)

      // Verify hash is updated
      const updatedState = await loadFileState(sourcePath)
      expect(hasContentChanged(modifiedContent, updatedState!.contentHash)).toBe(false)
    })

    it('tracks multiple files independently', async () => {
      const file1 = '/project/file1.md'
      const file2 = '/project/file2.md'
      const file3 = '/project/nested/file3.md'

      // Create states for multiple files
      await getOrCreateFileState(file1, 'hash1')
      await getOrCreateFileState(file2, 'hash2')
      await getOrCreateFileState(file3, 'hash3')

      // Update items in different files
      await updateItemStatus(file1, 'item-a', 'complete')
      await updateItemStatus(file2, 'item-b', 'in_progress')
      await updateItemStatus(file3, 'item-c', 'pending')

      // Verify each file's state is independent
      const state1 = await loadFileState(file1)
      const state2 = await loadFileState(file2)
      const state3 = await loadFileState(file3)

      expect(state1!.items['item-a'].status).toBe('complete')
      expect(state2!.items['item-b'].status).toBe('in_progress')
      expect(state3!.items['item-c'].status).toBe('pending')

      // List all tracked files
      const trackedFiles = await listTrackedFiles()
      expect(trackedFiles).toHaveLength(3)
      expect(trackedFiles).toContain(file1)
      expect(trackedFiles).toContain(file2)
      expect(trackedFiles).toContain(file3)
    })

    it('handles file deletion and recreation', async () => {
      const sourcePath = '/project/temp.md'

      // Create and populate state
      await getOrCreateFileState(sourcePath, 'original-hash')
      await updateItemStatus(sourcePath, 'item-1', 'complete')

      // Delete the state
      await deleteFileState(sourcePath)

      // Verify it's gone
      const deletedState = await loadFileState(sourcePath)
      expect(deletedState).toBeNull()

      // Recreate with new content
      const newState = await getOrCreateFileState(sourcePath, 'new-hash')
      expect(newState.contentHash).toBe('new-hash')
      expect(Object.keys(newState.items)).toHaveLength(0) // Fresh state
    })
  })

  describe('State file format validation', () => {
    it('persists state as valid JSON', async () => {
      const sourcePath = '/project/test.md'
      await getOrCreateFileState(sourcePath, 'test-hash')
      await updateItemStatus(sourcePath, 'item-1', 'in_progress')

      // Get the raw stored content
      const filename = generateStateFilename(sourcePath)
      const rawContent = mockFileStore.get(filename)

      expect(rawContent).toBeDefined()

      // Verify it's valid JSON
      const parsed = JSON.parse(rawContent!)
      expect(parsed.sourcePath).toBe(sourcePath)
      expect(parsed.contentHash).toBe('test-hash')
      expect(parsed.items['item-1'].status).toBe('in_progress')
      expect(parsed.createdAt).toBeDefined()
      expect(parsed.updatedAt).toBeDefined()
    })

    it('generates unique filenames for different source paths', () => {
      const paths = [
        '/project/README.md',
        '/project/docs/README.md',
        '/other/README.md',
        '/project/readme.md', // different case
      ]

      const filenames = paths.map(generateStateFilename)
      const uniqueFilenames = new Set(filenames)

      // All filenames should be unique
      expect(uniqueFilenames.size).toBe(paths.length)

      // All should follow the naming convention
      filenames.forEach((name) => {
        expect(name).toMatch(/^state-[a-z0-9]+\.json$/)
      })
    })
  })

  describe('Backup and recovery', () => {
    it('creates backup before overwriting existing state', async () => {
      const sourcePath = '/project/important.md'

      // Create initial state
      const state = createFileTrackingState(sourcePath, 'hash-v1')
      await saveFileState(state)

      // Update the state (should create backup)
      const updatedState = { ...state, contentHash: 'hash-v2' }
      await saveFileState(updatedState)

      // Verify backup exists
      const filename = generateStateFilename(sourcePath)
      expect(mockFileStore.has(`${filename}.bak`)).toBe(true)
    })
  })
})
