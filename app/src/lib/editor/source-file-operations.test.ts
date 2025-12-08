/**
 * Tests for source file write operations.
 * Uses mocked Tauri fs functions to test write, backup, and error handling.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Tauri fs APIs
vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  exists: vi.fn(),
  copyFile: vi.fn(),
  rename: vi.fn(),
  remove: vi.fn(),
}))

// Import after mocking
import { writeTextFile, exists, copyFile, rename, remove } from '@tauri-apps/plugin-fs'
import {
  isMarkdownPath,
  createBackup,
  writeSourceFileAtomic,
  writeSourceFile,
  isWriteResult,
} from './source-file-operations'

describe('Source File Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('isMarkdownPath', () => {
    it('returns true for .md files', () => {
      expect(isMarkdownPath('/path/to/file.md')).toBe(true)
    })

    it('returns true for .markdown files', () => {
      expect(isMarkdownPath('/path/to/file.markdown')).toBe(true)
    })

    it('returns true case-insensitively', () => {
      expect(isMarkdownPath('/path/to/FILE.MD')).toBe(true)
      expect(isMarkdownPath('/path/to/file.MARKDOWN')).toBe(true)
    })

    it('returns false for non-markdown files', () => {
      expect(isMarkdownPath('/path/to/file.txt')).toBe(false)
      expect(isMarkdownPath('/path/to/file.html')).toBe(false)
      expect(isMarkdownPath('/path/to/file')).toBe(false)
    })

    it('handles paths with markdown in name but wrong extension', () => {
      expect(isMarkdownPath('/path/to/markdown.txt')).toBe(false)
    })
  })

  describe('createBackup', () => {
    it('creates backup file with .bak extension', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()

      const result = await createBackup('/path/to/file.md')

      expect(result).toBe('/path/to/file.md.bak')
      expect(exists).toHaveBeenCalledWith('/path/to/file.md')
      expect(copyFile).toHaveBeenCalledWith('/path/to/file.md', '/path/to/file.md.bak')
    })

    it('works with .markdown extension', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()

      const result = await createBackup('/path/to/file.markdown')

      expect(result).toBe('/path/to/file.markdown.bak')
      expect(copyFile).toHaveBeenCalledWith('/path/to/file.markdown', '/path/to/file.markdown.bak')
    })

    it('throws error if source file does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false)

      await expect(createBackup('/path/to/missing.md')).rejects.toThrow('Source file not found')
      expect(copyFile).not.toHaveBeenCalled()
    })

    it('throws error for non-markdown files', async () => {
      await expect(createBackup('/path/to/file.txt')).rejects.toThrow('Can only backup markdown files')
      expect(exists).not.toHaveBeenCalled()
    })

    it('throws error if copy operation fails', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockRejectedValue(new Error('Permission denied'))

      await expect(createBackup('/path/to/file.md')).rejects.toThrow('Failed to create backup')
    })
  })

  describe('writeSourceFileAtomic', () => {
    it('writes to temp file then renames to target', async () => {
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockResolvedValue()

      await writeSourceFileAtomic('/path/to/file.md', '# Test Content')

      expect(writeTextFile).toHaveBeenCalledWith('/path/to/file.md.tmp', '# Test Content')
      expect(rename).toHaveBeenCalledWith('/path/to/file.md.tmp', '/path/to/file.md')
    })

    it('works with .markdown extension', async () => {
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockResolvedValue()

      await writeSourceFileAtomic('/path/to/file.markdown', '# Content')

      expect(writeTextFile).toHaveBeenCalledWith('/path/to/file.markdown.tmp', '# Content')
      expect(rename).toHaveBeenCalledWith('/path/to/file.markdown.tmp', '/path/to/file.markdown')
    })

    it('throws error for non-markdown files', async () => {
      await expect(
        writeSourceFileAtomic('/path/to/file.txt', 'content')
      ).rejects.toThrow('Can only write to markdown files')

      expect(writeTextFile).not.toHaveBeenCalled()
    })

    it('cleans up temp file if rename fails', async () => {
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockRejectedValue(new Error('Rename failed'))
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(remove).mockResolvedValue()

      await expect(
        writeSourceFileAtomic('/path/to/file.md', 'content')
      ).rejects.toThrow('Atomic write failed')

      // Verify cleanup was attempted
      expect(exists).toHaveBeenCalledWith('/path/to/file.md.tmp')
      expect(remove).toHaveBeenCalledWith('/path/to/file.md.tmp')
    })

    it('handles cleanup failure gracefully', async () => {
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockRejectedValue(new Error('Rename failed'))
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(remove).mockRejectedValue(new Error('Remove failed'))

      await expect(
        writeSourceFileAtomic('/path/to/file.md', 'content')
      ).rejects.toThrow('Atomic write failed')

      // Should not throw additional error from cleanup failure
    })

    it('throws error if write to temp fails', async () => {
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Disk full'))

      await expect(
        writeSourceFileAtomic('/path/to/file.md', 'content')
      ).rejects.toThrow('Atomic write failed')
    })
  })

  describe('writeSourceFile', () => {
    it('successfully writes file with backup', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockResolvedValue()

      const result = await writeSourceFile('/path/to/file.md', '# New Content')

      expect(result.success).toBe(true)
      expect(result.backupPath).toBe('/path/to/file.md.bak')
      expect(result.error).toBeUndefined()
      expect(copyFile).toHaveBeenCalledWith('/path/to/file.md', '/path/to/file.md.bak')
      expect(writeTextFile).toHaveBeenCalledWith('/path/to/file.md.tmp', '# New Content')
      expect(rename).toHaveBeenCalledWith('/path/to/file.md.tmp', '/path/to/file.md')
    })

    it('successfully writes file without backup when disabled', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockResolvedValue()

      const result = await writeSourceFile('/path/to/file.md', '# Content', false)

      expect(result.success).toBe(true)
      expect(result.backupPath).toBeUndefined()
      expect(copyFile).not.toHaveBeenCalled()
    })

    it('returns error for non-markdown file', async () => {
      const result = await writeSourceFile('/path/to/file.txt', 'content')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('NOT_MARKDOWN')
      expect(result.error).toContain('markdown files')
      expect(exists).not.toHaveBeenCalled()
    })

    it('returns error if file does not exist', async () => {
      vi.mocked(exists).mockResolvedValue(false)

      const result = await writeSourceFile('/path/to/missing.md', 'content')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('FILE_NOT_FOUND')
      expect(result.error).toContain('not found')
    })

    it('returns error if backup creation fails', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockRejectedValue(new Error('Permission denied'))

      const result = await writeSourceFile('/path/to/file.md', 'content')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('BACKUP_ERROR')
      expect(result.error).toContain('Backup creation failed')
      expect(writeTextFile).not.toHaveBeenCalled()
    })

    it('classifies permission denied errors', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()
      vi.mocked(writeTextFile).mockRejectedValue(new Error('EACCES: permission denied'))

      const result = await writeSourceFile('/path/to/file.md', 'content')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('PERMISSION_DENIED')
      expect(result.error).toContain('Permission denied')
      expect(result.backupPath).toBe('/path/to/file.md.bak')
    })

    it('classifies file not found errors', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockRejectedValue(new Error('ENOENT: file not found'))

      const result = await writeSourceFile('/path/to/file.md', 'content')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('FILE_NOT_FOUND')
      expect(result.error).toContain('not found')
    })

    it('classifies disk full errors', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()
      vi.mocked(writeTextFile).mockRejectedValue(new Error('ENOSPC: no space left on device'))

      const result = await writeSourceFile('/path/to/file.md', 'content')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('DISK_FULL')
      expect(result.error).toContain('Disk full')
    })

    it('returns generic write error for unclassified errors', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()
      vi.mocked(writeTextFile).mockRejectedValue(new Error('Unknown error'))

      const result = await writeSourceFile('/path/to/file.md', 'content')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('WRITE_ERROR')
      expect(result.error).toContain('Write failed')
    })

    it('handles empty content', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockResolvedValue()

      const result = await writeSourceFile('/path/to/file.md', '')

      expect(result.success).toBe(true)
      expect(writeTextFile).toHaveBeenCalledWith('/path/to/file.md.tmp', '')
    })

    it('handles very large content', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockResolvedValue()

      const largeContent = '# Heading\n'.repeat(10000)
      const result = await writeSourceFile('/path/to/file.md', largeContent)

      expect(result.success).toBe(true)
      expect(writeTextFile).toHaveBeenCalledWith('/path/to/file.md.tmp', largeContent)
    })

    it('handles special characters in content', async () => {
      vi.mocked(exists).mockResolvedValue(true)
      vi.mocked(copyFile).mockResolvedValue()
      vi.mocked(writeTextFile).mockResolvedValue()
      vi.mocked(rename).mockResolvedValue()

      const content = '# Test\n\n```javascript\nconst x = "hello";\n```\n\n- [ ] Task with émojis 🚀'
      const result = await writeSourceFile('/path/to/file.md', content)

      expect(result.success).toBe(true)
      expect(writeTextFile).toHaveBeenCalledWith('/path/to/file.md.tmp', content)
    })
  })

  describe('isWriteResult', () => {
    it('returns true for valid success result', () => {
      const result = {
        success: true,
        backupPath: '/path/to/backup.md.bak',
      }
      expect(isWriteResult(result)).toBe(true)
    })

    it('returns true for valid error result', () => {
      const result = {
        success: false,
        error: 'Write failed',
        errorCode: 'WRITE_ERROR',
      }
      expect(isWriteResult(result)).toBe(true)
    })

    it('returns true for minimal result', () => {
      const result = {
        success: true,
      }
      expect(isWriteResult(result)).toBe(true)
    })

    it('returns false for missing success field', () => {
      const result = {
        error: 'Error',
      }
      expect(isWriteResult(result)).toBe(false)
    })

    it('returns false for null', () => {
      expect(isWriteResult(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isWriteResult(undefined)).toBe(false)
    })

    it('returns false for non-object types', () => {
      expect(isWriteResult('string')).toBe(false)
      expect(isWriteResult(123)).toBe(false)
      expect(isWriteResult(true)).toBe(false)
    })

    it('returns false for array', () => {
      expect(isWriteResult([{ success: true }])).toBe(false)
    })

    it('returns false for invalid field types', () => {
      expect(isWriteResult({ success: 'true' })).toBe(false)
      expect(isWriteResult({ success: true, backupPath: 123 })).toBe(false)
      expect(isWriteResult({ success: true, error: [] })).toBe(false)
    })
  })
})
