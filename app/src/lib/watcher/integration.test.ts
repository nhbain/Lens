/**
 * Integration tests for the watcher module.
 * Tests complete workflows from configuration to event handling.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

// Mock file stores
const mockConfigStore = new Map<string, string>()

// Mock Tauri fs module
vi.mock('../state/file-system', () => ({
  readStateFile: vi.fn((filename: string) => {
    return Promise.resolve(mockConfigStore.get(filename) ?? null)
  }),
  writeStateFileAtomic: vi.fn((filename: string, content: string) => {
    mockConfigStore.set(filename, content)
    return Promise.resolve()
  }),
  stateFileExists: vi.fn((filename: string) => {
    return Promise.resolve(mockConfigStore.has(filename))
  }),
}))

// Create mock watcher instance
const mockWatcherInstance = {
  on: vi.fn().mockReturnThis(),
  close: vi.fn().mockResolvedValue(undefined),
}

// Mock chokidar
vi.mock('chokidar', () => ({
  default: {
    watch: vi.fn(() => mockWatcherInstance),
  },
}))

// Mock files module
const mockTrackedFiles = new Map<string, boolean>()
vi.mock('../files', () => ({
  addTrackedFile: vi.fn((path: string) => {
    mockTrackedFiles.set(path, true)
    return Promise.resolve({ success: true })
  }),
  removeTrackedFile: vi.fn((path: string) => {
    const existed = mockTrackedFiles.has(path)
    mockTrackedFiles.delete(path)
    return Promise.resolve(existed)
  }),
  isFileTracked: vi.fn((path: string) => mockTrackedFiles.has(path)),
  updateContentHash: vi.fn(),
}))

// Mock state module
vi.mock('../state', () => ({
  computeContentHash: vi.fn(() => 'mock-hash'),
}))

import chokidar from 'chokidar'
import { addTrackedFile, removeTrackedFile, isFileTracked } from '../files'
import {
  loadWatchConfig,
  addWatchedDirectory,
  removeWatchedDirectory,
  getWatchedDirectories,
  isDirectoryWatched,
  clearConfigCache,
} from './watch-config'
import {
  startWatching,
  stopWatching,
  startAllConfiguredWatchers,
  stopAllWatchers,
  isWatching,
  getActiveWatcherCount,
  clearAllWatcherState,
} from './directory-watcher'
import {
  connectEventHandler,
  disconnectEventHandler,
  isEventHandlerConnected,
  onTrackedFileAdded,
  clearEventHandlerState,
} from './event-handler'

describe('watcher integration', () => {
  beforeEach(async () => {
    // Clear all stores
    mockConfigStore.clear()
    mockTrackedFiles.clear()

    // Clear all mocks
    vi.clearAllMocks()
    vi.useFakeTimers()

    // Reset mock implementations
    mockWatcherInstance.on.mockClear().mockReturnThis()
    mockWatcherInstance.close.mockClear().mockResolvedValue(undefined)

    // Clear module state
    clearConfigCache()
    await clearAllWatcherState()
    clearEventHandlerState()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('full workflow: add directory → detect file → track automatically', () => {
    it('tracks new files automatically when added to watched directory', async () => {
      // Step 1: Load config
      await loadWatchConfig()

      // Step 2: Add a directory to watch
      const result = await addWatchedDirectory('/docs')
      expect(result.success).toBe(true)
      expect(isDirectoryWatched('/docs')).toBe(true)

      // Step 3: Start watching the directory
      const started = startWatching('/docs')
      expect(started).toBe(true)
      expect(isWatching('/docs')).toBe(true)

      // Step 4: Connect event handler
      connectEventHandler()
      expect(isEventHandlerConnected()).toBe(true)

      // Step 5: Simulate file add event
      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      expect(addHandler).toBeDefined()

      // Register callback to verify
      const addedFiles: string[] = []
      onTrackedFileAdded((path, success) => {
        if (success) addedFiles.push(path)
      })

      // Simulate adding a markdown file
      addHandler('/docs/readme.md')

      // Fast-forward debounce time
      vi.advanceTimersByTime(200)

      // Allow async operations to complete
      await vi.waitFor(() => {
        expect(addTrackedFile).toHaveBeenCalledWith('/docs/readme.md')
      })

      expect(addedFiles).toContain('/docs/readme.md')
    })

    it('does not track non-markdown files', async () => {
      await loadWatchConfig()
      await addWatchedDirectory('/docs')
      startWatching('/docs')
      connectEventHandler()

      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      // Simulate adding a non-markdown file
      addHandler('/docs/image.png')
      vi.advanceTimersByTime(200)

      // Give time for async handler using runAllTimersAsync
      await vi.runAllTimersAsync()

      expect(addTrackedFile).not.toHaveBeenCalled()
    })
  })

  describe('full workflow: file modified → re-parse triggered', () => {
    it('detects file changes and updates tracked files', async () => {
      await loadWatchConfig()
      await addWatchedDirectory('/docs')
      startWatching('/docs')
      connectEventHandler()

      // Pre-track the file
      mockTrackedFiles.set('/docs/readme.md', true)

      const changeHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'change'
      )?.[1] as (path: string) => void

      expect(changeHandler).toBeDefined()

      // Simulate file change
      changeHandler('/docs/readme.md')
      vi.advanceTimersByTime(200)

      await vi.waitFor(() => {
        expect(isFileTracked).toHaveBeenCalledWith('/docs/readme.md')
      })
    })
  })

  describe('full workflow: file deleted → handled gracefully', () => {
    it('removes tracking when file is deleted', async () => {
      await loadWatchConfig()
      await addWatchedDirectory('/docs')
      startWatching('/docs')
      connectEventHandler()

      // Pre-track the file
      mockTrackedFiles.set('/docs/readme.md', true)

      const unlinkHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'unlink'
      )?.[1] as (path: string) => void

      expect(unlinkHandler).toBeDefined()

      // Simulate file deletion
      unlinkHandler('/docs/readme.md')
      vi.advanceTimersByTime(200)

      await vi.waitFor(() => {
        expect(removeTrackedFile).toHaveBeenCalledWith('/docs/readme.md')
      })
    })
  })

  describe('configuration persistence', () => {
    it('persists configuration across app restarts', async () => {
      // First "session"
      await loadWatchConfig()
      await addWatchedDirectory('/docs', ['*.md', '*.txt'])
      await addWatchedDirectory('/notes', ['*.markdown'])

      // Verify persisted
      expect(mockConfigStore.has('watch-config.json')).toBe(true)

      // Simulate app restart by clearing cache
      clearConfigCache()

      // Second "session"
      await loadWatchConfig()

      const directories = getWatchedDirectories()
      expect(directories).toHaveLength(2)

      const docsDir = directories.find((d) => d.path === '/docs')
      const notesDir = directories.find((d) => d.path === '/notes')

      expect(docsDir?.patterns).toEqual(['*.md', '*.txt'])
      expect(notesDir?.patterns).toEqual(['*.markdown'])
    })

    it('restores watchers after restart', async () => {
      // First "session" - add directories
      await loadWatchConfig()
      await addWatchedDirectory('/docs')
      await addWatchedDirectory('/notes')

      // Simulate restart
      clearConfigCache()
      await clearAllWatcherState()
      vi.mocked(chokidar.watch).mockClear()

      // Second "session" - restore
      await loadWatchConfig()
      const started = startAllConfiguredWatchers()

      expect(started).toBe(2)
      expect(getActiveWatcherCount()).toBe(2)
    })
  })

  describe('nested directory handling', () => {
    it('prevents adding nested directories', async () => {
      await loadWatchConfig()
      await addWatchedDirectory('/parent')

      const result = await addWatchedDirectory('/parent/child')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('NESTED_DIRECTORY')
    })

    it('allows sibling directories', async () => {
      await loadWatchConfig()
      await addWatchedDirectory('/docs/project1')

      const result = await addWatchedDirectory('/docs/project2')

      expect(result.success).toBe(true)
    })
  })

  describe('cleanup on shutdown', () => {
    it('stops all watchers and disconnects event handler', async () => {
      await loadWatchConfig()
      await addWatchedDirectory('/docs')
      startWatching('/docs')
      connectEventHandler()

      expect(isWatching('/docs')).toBe(true)
      expect(isEventHandlerConnected()).toBe(true)

      // Simulate shutdown
      disconnectEventHandler()
      await stopAllWatchers()

      expect(isWatching('/docs')).toBe(false)
      expect(isEventHandlerConnected()).toBe(false)
      expect(mockWatcherInstance.close).toHaveBeenCalled()
    })
  })

  describe('removing watched directories', () => {
    it('stops watcher when directory is removed', async () => {
      await loadWatchConfig()
      await addWatchedDirectory('/docs')
      startWatching('/docs')

      expect(isWatching('/docs')).toBe(true)
      expect(isDirectoryWatched('/docs')).toBe(true)

      // Stop and remove
      await stopWatching('/docs')
      await removeWatchedDirectory('/docs')

      expect(isWatching('/docs')).toBe(false)
      expect(isDirectoryWatched('/docs')).toBe(false)
    })
  })
})
