/**
 * Tests for tracked files management.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the state module
vi.mock('../state', () => ({
  listTrackedFiles: vi.fn(),
  loadFileState: vi.fn(),
  deleteFileState: vi.fn(),
  createFileTrackingState: vi.fn(() => ({
    sourcePath: '',
    contentHash: '',
    items: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })),
  saveFileState: vi.fn().mockResolvedValue(undefined),
}))

// Mock the file-picker module
vi.mock('./file-picker', () => ({
  validateMarkdownFile: vi.fn(),
}))

// Import after mocking
import { listTrackedFiles as listStateFiles, loadFileState, deleteFileState } from '../state'
import { validateMarkdownFile } from './file-picker'
import {
  getTrackedFiles,
  getTrackedFile,
  isFileTracked,
  getTrackedFilesCount,
  addTrackedFile,
  removeTrackedFile,
  updateLastAccessed,
  updateItemCount,
  updateContentHash,
  loadTrackedFiles,
  isCacheInitialized,
  clearCache,
  removeAllTrackedFiles,
} from './tracked-files'

describe('Tracked Files Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearCache()
  })

  describe('getTrackedFiles', () => {
    it('returns empty array when no files tracked', () => {
      expect(getTrackedFiles()).toEqual([])
    })

    it('returns all tracked files', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file1.md',
        fileName: 'file1.md',
        itemCount: 5,
        contentHash: 'hash1',
      })

      await addTrackedFile('/path/file1.md')

      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file2.md',
        fileName: 'file2.md',
        itemCount: 3,
        contentHash: 'hash2',
      })

      await addTrackedFile('/path/file2.md')

      const files = getTrackedFiles()
      expect(files).toHaveLength(2)
      expect(files.map((f) => f.path)).toContain('/path/file1.md')
      expect(files.map((f) => f.path)).toContain('/path/file2.md')
    })
  })

  describe('getTrackedFile', () => {
    it('returns undefined for untracked file', () => {
      expect(getTrackedFile('/path/unknown.md')).toBeUndefined()
    })

    it('returns tracked file info', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'hash123',
      })

      await addTrackedFile('/path/file.md')

      const file = getTrackedFile('/path/file.md')
      expect(file).toBeDefined()
      expect(file!.path).toBe('/path/file.md')
      expect(file!.fileName).toBe('file.md')
      expect(file!.itemCount).toBe(5)
    })
  })

  describe('isFileTracked', () => {
    it('returns false for untracked file', () => {
      expect(isFileTracked('/path/unknown.md')).toBe(false)
    })

    it('returns true for tracked file', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'hash',
      })

      await addTrackedFile('/path/file.md')

      expect(isFileTracked('/path/file.md')).toBe(true)
    })
  })

  describe('getTrackedFilesCount', () => {
    it('returns 0 when no files tracked', () => {
      expect(getTrackedFilesCount()).toBe(0)
    })

    it('returns correct count', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'hash',
      })

      await addTrackedFile('/path/file1.md')
      expect(getTrackedFilesCount()).toBe(1)

      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file2.md',
        fileName: 'file2.md',
        itemCount: 5,
        contentHash: 'hash',
      })

      await addTrackedFile('/path/file2.md')
      expect(getTrackedFilesCount()).toBe(2)
    })
  })

  describe('addTrackedFile', () => {
    it('adds new file successfully', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 10,
        contentHash: 'abc123',
      })

      const result = await addTrackedFile('/path/file.md')

      expect(result.success).toBe(true)
      expect(result.alreadyTracked).toBeUndefined()
      expect(result.file).toBeDefined()
      expect(result.file!.path).toBe('/path/file.md')
      expect(result.file!.itemCount).toBe(10)
      expect(isFileTracked('/path/file.md')).toBe(true)
    })

    it('returns existing file if already tracked', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'hash',
      })

      await addTrackedFile('/path/file.md')

      // Second add should return existing
      const result = await addTrackedFile('/path/file.md')

      expect(result.success).toBe(true)
      expect(result.alreadyTracked).toBe(true)
      expect(result.file!.path).toBe('/path/file.md')
      // validateMarkdownFile should only be called once
      expect(validateMarkdownFile).toHaveBeenCalledTimes(1)
    })

    it('returns error for invalid file', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: false,
        path: '/path/invalid.md',
        fileName: 'invalid.md',
        error: 'File not found',
        errorCode: 'FILE_NOT_FOUND',
      })

      const result = await addTrackedFile('/path/invalid.md')

      expect(result.success).toBe(false)
      expect(result.error).toBe('File not found')
      expect(isFileTracked('/path/invalid.md')).toBe(false)
    })
  })

  describe('removeTrackedFile', () => {
    it('removes tracked file', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'hash',
      })

      await addTrackedFile('/path/file.md')
      expect(isFileTracked('/path/file.md')).toBe(true)

      const removed = await removeTrackedFile('/path/file.md')

      expect(removed).toBe(true)
      expect(isFileTracked('/path/file.md')).toBe(false)
      expect(deleteFileState).toHaveBeenCalledWith('/path/file.md')
    })

    it('returns false for untracked file', async () => {
      const removed = await removeTrackedFile('/path/unknown.md')

      expect(removed).toBe(false)
      expect(deleteFileState).not.toHaveBeenCalled()
    })
  })

  describe('updateLastAccessed', () => {
    it('updates last accessed time', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'hash',
      })

      await addTrackedFile('/path/file.md')
      const original = getTrackedFile('/path/file.md')!

      // Wait a bit to ensure time difference
      await new Promise((r) => setTimeout(r, 10))

      const updated = updateLastAccessed('/path/file.md')

      expect(updated).toBeDefined()
      expect(updated!.lastAccessedAt).not.toBe(original.lastAccessedAt)
    })

    it('returns undefined for untracked file', () => {
      const result = updateLastAccessed('/path/unknown.md')
      expect(result).toBeUndefined()
    })
  })

  describe('updateItemCount', () => {
    it('updates item count', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'hash',
      })

      await addTrackedFile('/path/file.md')

      const updated = updateItemCount('/path/file.md', 15)

      expect(updated).toBeDefined()
      expect(updated!.itemCount).toBe(15)
      expect(getTrackedFile('/path/file.md')!.itemCount).toBe(15)
    })

    it('returns undefined for untracked file', () => {
      const result = updateItemCount('/path/unknown.md', 10)
      expect(result).toBeUndefined()
    })
  })

  describe('updateContentHash', () => {
    it('updates content hash', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'hash1',
      })

      await addTrackedFile('/path/file.md')

      const updated = updateContentHash('/path/file.md', 'hash2')

      expect(updated).toBeDefined()
      expect(updated!.contentHash).toBe('hash2')
      expect(getTrackedFile('/path/file.md')!.contentHash).toBe('hash2')
    })

    it('returns undefined for untracked file', () => {
      const result = updateContentHash('/path/unknown.md', 'hash')
      expect(result).toBeUndefined()
    })
  })

  describe('loadTrackedFiles', () => {
    it('loads files from state', async () => {
      vi.mocked(listStateFiles).mockResolvedValue(['/path/file1.md', '/path/file2.md'])
      vi.mocked(loadFileState)
        .mockResolvedValueOnce({
          sourcePath: '/path/file1.md',
          contentHash: 'hash1',
          items: { item1: { itemId: 'item1', status: 'pending', updatedAt: '' } },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        })
        .mockResolvedValueOnce({
          sourcePath: '/path/file2.md',
          contentHash: 'hash2',
          items: {},
          createdAt: '2024-01-03T00:00:00.000Z',
          updatedAt: '2024-01-04T00:00:00.000Z',
        })

      const loaded = await loadTrackedFiles()

      expect(loaded).toHaveLength(2)
      expect(loaded[0].path).toBe('/path/file1.md')
      expect(loaded[0].itemCount).toBe(1)
      expect(loaded[1].path).toBe('/path/file2.md')
      expect(loaded[1].itemCount).toBe(0)
      expect(getTrackedFilesCount()).toBe(2)
      expect(isCacheInitialized()).toBe(true)
    })

    it('handles missing state files', async () => {
      vi.mocked(listStateFiles).mockResolvedValue(['/path/file1.md', '/path/missing.md'])
      vi.mocked(loadFileState)
        .mockResolvedValueOnce({
          sourcePath: '/path/file1.md',
          contentHash: 'hash1',
          items: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-02T00:00:00.000Z',
        })
        .mockResolvedValueOnce(null)

      const loaded = await loadTrackedFiles()

      expect(loaded).toHaveLength(1)
      expect(loaded[0].path).toBe('/path/file1.md')
    })

    it('returns empty array when no state files exist', async () => {
      vi.mocked(listStateFiles).mockResolvedValue([])

      const loaded = await loadTrackedFiles()

      expect(loaded).toEqual([])
      expect(isCacheInitialized()).toBe(true)
    })
  })

  describe('clearCache', () => {
    it('clears all tracked files from cache', async () => {
      vi.mocked(validateMarkdownFile).mockResolvedValue({
        success: true,
        path: '/path/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'hash',
      })

      await addTrackedFile('/path/file.md')
      expect(getTrackedFilesCount()).toBe(1)

      clearCache()

      expect(getTrackedFilesCount()).toBe(0)
      expect(isCacheInitialized()).toBe(false)
    })
  })

  describe('removeAllTrackedFiles', () => {
    it('removes all files and deletes state files', async () => {
      vi.mocked(validateMarkdownFile)
        .mockResolvedValueOnce({
          success: true,
          path: '/path/file1.md',
          fileName: 'file1.md',
          itemCount: 5,
          contentHash: 'hash1',
        })
        .mockResolvedValueOnce({
          success: true,
          path: '/path/file2.md',
          fileName: 'file2.md',
          itemCount: 3,
          contentHash: 'hash2',
        })

      await addTrackedFile('/path/file1.md')
      await addTrackedFile('/path/file2.md')
      expect(getTrackedFilesCount()).toBe(2)

      await removeAllTrackedFiles()

      expect(getTrackedFilesCount()).toBe(0)
      expect(deleteFileState).toHaveBeenCalledWith('/path/file1.md')
      expect(deleteFileState).toHaveBeenCalledWith('/path/file2.md')
    })
  })
})
