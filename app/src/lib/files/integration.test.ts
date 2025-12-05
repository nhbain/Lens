/**
 * Integration tests for the file import workflow.
 * Tests the complete flow: pick, validate, track, display, remove.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Tauri APIs before importing the modules
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  mkdir: vi.fn(),
  remove: vi.fn(),
  readDir: vi.fn(),
  exists: vi.fn(),
  rename: vi.fn(),
}))

vi.mock('@tauri-apps/api/path', () => ({
  appDataDir: vi.fn(() => Promise.resolve('/mock/app/data')),
  join: vi.fn((...parts: string[]) => Promise.resolve(parts.join('/'))),
}))

import { open } from '@tauri-apps/plugin-dialog'
import { readTextFile, readDir, exists } from '@tauri-apps/plugin-fs'

import {
  openMarkdownFilePicker,
  validateMarkdownFile,
  pickAndValidateMarkdownFile,
  addTrackedFile,
  removeTrackedFile,
  getTrackedFiles,
  isFileTracked,
  clearCache,
} from './index'

// Sample markdown content (3 checkboxes + 2 headings = 5 items)
const validMarkdownContent = `# Test Document

## Tasks
- [ ] Task 1
- [x] Task 2
- [ ] Task 3
`

const expectedItemCount = 5 // 3 checkboxes + 2 headings

describe('File Import Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCache()

    // Default mock for state module directory operations
    vi.mocked(readDir).mockResolvedValue([])
    vi.mocked(exists).mockResolvedValue(false)
  })

  afterEach(() => {
    clearCache()
  })

  describe('Complete workflow: pick → validate → track → remove', () => {
    it('successfully imports a file through the full workflow', async () => {
      const testPath = '/users/test/documents/notes.md'

      // Mock file picker returning a path
      vi.mocked(open).mockResolvedValue(testPath)

      // Mock file read
      vi.mocked(readTextFile).mockResolvedValue(validMarkdownContent)

      // Step 1: Open file picker
      const pickedPath = await openMarkdownFilePicker()
      expect(pickedPath).toBe(testPath)
      expect(open).toHaveBeenCalledWith({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        title: 'Select Markdown File',
      })

      // Step 2: Validate the file
      const validation = await validateMarkdownFile(testPath)
      expect(validation.success).toBe(true)
      expect(validation.path).toBe(testPath)
      expect(validation.fileName).toBe('notes.md')
      expect(validation.itemCount).toBe(expectedItemCount)

      // Step 3: Add to tracking
      const addResult = await addTrackedFile(testPath)
      expect(addResult.success).toBe(true)
      expect(addResult.alreadyTracked).toBeFalsy()
      expect(addResult.file?.fileName).toBe('notes.md')
      expect(addResult.file?.itemCount).toBe(expectedItemCount)

      // Verify file is now tracked
      expect(isFileTracked(testPath)).toBe(true)
      expect(getTrackedFiles()).toHaveLength(1)

      // Step 4: Remove from tracking
      const removed = await removeTrackedFile(testPath)
      expect(removed).toBe(true)

      // Verify file is no longer tracked
      expect(isFileTracked(testPath)).toBe(false)
      expect(getTrackedFiles()).toHaveLength(0)
    })

    it('handles user cancellation gracefully', async () => {
      // User cancels file picker
      vi.mocked(open).mockResolvedValue(null)

      const result = await pickAndValidateMarkdownFile()

      expect(result).toBeNull()
      expect(getTrackedFiles()).toHaveLength(0)
    })

    it('handles duplicate file imports gracefully', async () => {
      const testPath = '/users/test/documents/notes.md'

      vi.mocked(open).mockResolvedValue(testPath)
      vi.mocked(readTextFile).mockResolvedValue(validMarkdownContent)

      // First import
      const firstAdd = await addTrackedFile(testPath)
      expect(firstAdd.success).toBe(true)
      expect(firstAdd.alreadyTracked).toBeFalsy()

      // Second import (duplicate)
      const secondAdd = await addTrackedFile(testPath)
      expect(secondAdd.success).toBe(true)
      expect(secondAdd.alreadyTracked).toBe(true)
      expect(secondAdd.file?.fileName).toBe('notes.md')

      // Should still only have one tracked file
      expect(getTrackedFiles()).toHaveLength(1)
    })

    it('handles invalid file gracefully', async () => {
      const testPath = '/users/test/documents/readme.txt'

      vi.mocked(open).mockResolvedValue(testPath)

      // Try to add non-markdown file
      const result = await addTrackedFile(testPath)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not a markdown file')
      expect(getTrackedFiles()).toHaveLength(0)
    })

    it('handles file read errors gracefully', async () => {
      const testPath = '/users/test/documents/missing.md'

      vi.mocked(open).mockResolvedValue(testPath)
      vi.mocked(readTextFile).mockRejectedValue(new Error('ENOENT: No such file'))

      const result = await addTrackedFile(testPath)

      expect(result.success).toBe(false)
      expect(result.error).toContain('not found')
      expect(getTrackedFiles()).toHaveLength(0)
    })
  })

  describe('Multiple file management', () => {
    it('tracks multiple files correctly', async () => {
      const paths = [
        '/users/test/docs/file1.md',
        '/users/test/docs/file2.md',
        '/users/test/docs/file3.md',
      ]

      vi.mocked(readTextFile).mockResolvedValue(validMarkdownContent)

      // Add all files
      for (const path of paths) {
        const result = await addTrackedFile(path)
        expect(result.success).toBe(true)
      }

      // Verify all tracked
      expect(getTrackedFiles()).toHaveLength(3)
      paths.forEach((path) => {
        expect(isFileTracked(path)).toBe(true)
      })

      // Remove middle file
      await removeTrackedFile(paths[1])
      expect(getTrackedFiles()).toHaveLength(2)
      expect(isFileTracked(paths[0])).toBe(true)
      expect(isFileTracked(paths[1])).toBe(false)
      expect(isFileTracked(paths[2])).toBe(true)
    })
  })

  describe('Combined pick and validate', () => {
    it('pickAndValidateMarkdownFile combines operations correctly', async () => {
      const testPath = '/users/test/documents/notes.md'

      vi.mocked(open).mockResolvedValue(testPath)
      vi.mocked(readTextFile).mockResolvedValue(validMarkdownContent)

      const result = await pickAndValidateMarkdownFile()

      expect(result).not.toBeNull()
      expect(result?.success).toBe(true)
      expect(result?.path).toBe(testPath)
      expect(result?.fileName).toBe('notes.md')
      expect(result?.itemCount).toBe(expectedItemCount)
    })
  })
})
