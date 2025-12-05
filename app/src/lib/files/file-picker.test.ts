/**
 * Tests for file picker and validation utilities.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Tauri APIs
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
}))

// Import after mocking
import { open } from '@tauri-apps/plugin-dialog'
import { readTextFile } from '@tauri-apps/plugin-fs'
import {
  openMarkdownFilePicker,
  openMarkdownFilePickerMultiple,
  extractFileName,
  isMarkdownFile,
  validateMarkdownFile,
  pickAndValidateMarkdownFile,
} from './file-picker'

describe('File Picker', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('openMarkdownFilePicker', () => {
    it('returns selected file path', async () => {
      vi.mocked(open).mockResolvedValue('/path/to/file.md')

      const result = await openMarkdownFilePicker()

      expect(result).toBe('/path/to/file.md')
      expect(open).toHaveBeenCalledWith({
        multiple: false,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        title: 'Select Markdown File',
      })
    })

    it('returns null when user cancels', async () => {
      vi.mocked(open).mockResolvedValue(null)

      const result = await openMarkdownFilePicker()

      expect(result).toBeNull()
    })
  })

  describe('openMarkdownFilePickerMultiple', () => {
    it('returns array of selected file paths', async () => {
      vi.mocked(open).mockResolvedValue(['/path/file1.md', '/path/file2.md'])

      const result = await openMarkdownFilePickerMultiple()

      expect(result).toEqual(['/path/file1.md', '/path/file2.md'])
      expect(open).toHaveBeenCalledWith({
        multiple: true,
        filters: [{ name: 'Markdown', extensions: ['md', 'markdown'] }],
        title: 'Select Markdown Files',
      })
    })

    it('returns empty array when user cancels', async () => {
      vi.mocked(open).mockResolvedValue(null)

      const result = await openMarkdownFilePickerMultiple()

      expect(result).toEqual([])
    })
  })

  describe('extractFileName', () => {
    it('extracts file name from Unix path', () => {
      expect(extractFileName('/Users/test/documents/file.md')).toBe('file.md')
    })

    it('extracts file name from Windows path', () => {
      expect(extractFileName('C:\\Users\\test\\documents\\file.md')).toBe(
        'file.md'
      )
    })

    it('handles file name without path', () => {
      expect(extractFileName('file.md')).toBe('file.md')
    })

    it('handles paths with mixed separators', () => {
      expect(extractFileName('/Users/test\\docs/file.md')).toBe('file.md')
    })

    it('returns empty string for empty path', () => {
      expect(extractFileName('')).toBe('')
    })
  })

  describe('isMarkdownFile', () => {
    it('returns true for .md files', () => {
      expect(isMarkdownFile('/path/to/file.md')).toBe(true)
    })

    it('returns true for .markdown files', () => {
      expect(isMarkdownFile('/path/to/file.markdown')).toBe(true)
    })

    it('returns true case-insensitively', () => {
      expect(isMarkdownFile('/path/to/FILE.MD')).toBe(true)
      expect(isMarkdownFile('/path/to/file.MARKDOWN')).toBe(true)
    })

    it('returns false for non-markdown files', () => {
      expect(isMarkdownFile('/path/to/file.txt')).toBe(false)
      expect(isMarkdownFile('/path/to/file.html')).toBe(false)
      expect(isMarkdownFile('/path/to/file')).toBe(false)
    })
  })
})

describe('File Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('validateMarkdownFile', () => {
    it('returns success for valid markdown file', async () => {
      const content = `# Title\n\n- [ ] Task 1\n- [ ] Task 2`
      vi.mocked(readTextFile).mockResolvedValue(content)

      const result = await validateMarkdownFile('/path/to/file.md')

      expect(result.success).toBe(true)
      expect(result.path).toBe('/path/to/file.md')
      expect(result.fileName).toBe('file.md')
      expect(result.itemCount).toBe(3) // 1 header + 2 checkboxes
      expect(result.contentHash).toBeDefined()
      expect(result.error).toBeUndefined()
    })

    it('returns error for non-markdown file extension', async () => {
      const result = await validateMarkdownFile('/path/to/file.txt')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('NOT_MARKDOWN')
      expect(result.error).toContain('not a markdown file')
      expect(readTextFile).not.toHaveBeenCalled()
    })

    it('returns error when file not found', async () => {
      vi.mocked(readTextFile).mockRejectedValue(new Error('ENOENT: not found'))

      const result = await validateMarkdownFile('/path/to/missing.md')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('FILE_NOT_FOUND')
      expect(result.error).toContain('File not found')
    })

    it('returns error when permission denied', async () => {
      vi.mocked(readTextFile).mockRejectedValue(
        new Error('EACCES: permission denied')
      )

      const result = await validateMarkdownFile('/path/to/protected.md')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('PERMISSION_DENIED')
      expect(result.error).toContain('Permission denied')
    })

    it('returns generic read error for other failures', async () => {
      vi.mocked(readTextFile).mockRejectedValue(new Error('Unknown error'))

      const result = await validateMarkdownFile('/path/to/file.md')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('READ_ERROR')
      expect(result.error).toContain('Failed to read file')
    })

    it('counts items correctly for complex markdown', async () => {
      const content = `# Title

## Section 1

- Item 1
- Item 2
  - Nested item

## Section 2

1. Ordered item 1
2. Ordered item 2

- [x] Done task
- [ ] Pending task
`
      vi.mocked(readTextFile).mockResolvedValue(content)

      const result = await validateMarkdownFile('/path/to/complex.md')

      expect(result.success).toBe(true)
      // 1 h1 + 2 h2 + 2 list items + 1 nested + 2 ordered + 2 checkboxes = 10
      expect(result.itemCount).toBeGreaterThan(5)
    })

    it('handles empty file', async () => {
      vi.mocked(readTextFile).mockResolvedValue('')

      const result = await validateMarkdownFile('/path/to/empty.md')

      expect(result.success).toBe(true)
      expect(result.itemCount).toBe(0)
    })

    it('generates consistent content hash', async () => {
      const content = '# Test\n\n- Item'
      vi.mocked(readTextFile).mockResolvedValue(content)

      const result1 = await validateMarkdownFile('/path/to/file.md')
      const result2 = await validateMarkdownFile('/path/to/file.md')

      expect(result1.contentHash).toBe(result2.contentHash)
    })
  })

  describe('pickAndValidateMarkdownFile', () => {
    it('returns null when user cancels file picker', async () => {
      vi.mocked(open).mockResolvedValue(null)

      const result = await pickAndValidateMarkdownFile()

      expect(result).toBeNull()
      expect(readTextFile).not.toHaveBeenCalled()
    })

    it('returns validation result for selected file', async () => {
      vi.mocked(open).mockResolvedValue('/path/to/file.md')
      vi.mocked(readTextFile).mockResolvedValue('# Title')

      const result = await pickAndValidateMarkdownFile()

      expect(result).not.toBeNull()
      expect(result!.success).toBe(true)
      expect(result!.path).toBe('/path/to/file.md')
    })

    it('returns error result for invalid file', async () => {
      vi.mocked(open).mockResolvedValue('/path/to/file.md')
      vi.mocked(readTextFile).mockRejectedValue(new Error('ENOENT'))

      const result = await pickAndValidateMarkdownFile()

      expect(result).not.toBeNull()
      expect(result!.success).toBe(false)
      expect(result!.errorCode).toBe('FILE_NOT_FOUND')
    })
  })
})

// Import type utilities
import {
  isFileValidationResult,
  isTrackedFile,
  isAddFileResult,
  createTrackedFile,
} from './types'

describe('Type Guards', () => {

  describe('isFileValidationResult', () => {
    it('returns true for valid success result', () => {
      const result = {
        success: true,
        path: '/path/to/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'abc123',
      }
      expect(isFileValidationResult(result)).toBe(true)
    })

    it('returns true for valid error result', () => {
      const result = {
        success: false,
        path: '/path/to/file.md',
        fileName: 'file.md',
        error: 'File not found',
        errorCode: 'FILE_NOT_FOUND',
      }
      expect(isFileValidationResult(result)).toBe(true)
    })

    it('returns false for invalid object', () => {
      expect(isFileValidationResult(null)).toBe(false)
      expect(isFileValidationResult({})).toBe(false)
      expect(isFileValidationResult({ success: true })).toBe(false)
    })
  })

  describe('isTrackedFile', () => {
    it('returns true for valid tracked file', () => {
      const file = {
        path: '/path/to/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'abc123',
        addedAt: '2024-01-01T00:00:00.000Z',
        lastAccessedAt: '2024-01-01T00:00:00.000Z',
      }
      expect(isTrackedFile(file)).toBe(true)
    })

    it('returns false for missing required fields', () => {
      expect(isTrackedFile({ path: '/path' })).toBe(false)
      expect(isTrackedFile(null)).toBe(false)
    })
  })

  describe('isAddFileResult', () => {
    it('returns true for success result', () => {
      const result = {
        success: true,
        file: {
          path: '/path/to/file.md',
          fileName: 'file.md',
          itemCount: 5,
          contentHash: 'abc123',
          addedAt: '2024-01-01T00:00:00.000Z',
          lastAccessedAt: '2024-01-01T00:00:00.000Z',
        },
      }
      expect(isAddFileResult(result)).toBe(true)
    })

    it('returns true for already tracked result', () => {
      const result = {
        success: true,
        alreadyTracked: true,
        file: {
          path: '/path/to/file.md',
          fileName: 'file.md',
          itemCount: 5,
          contentHash: 'abc123',
          addedAt: '2024-01-01T00:00:00.000Z',
          lastAccessedAt: '2024-01-01T00:00:00.000Z',
        },
      }
      expect(isAddFileResult(result)).toBe(true)
    })

    it('returns true for error result', () => {
      const result = {
        success: false,
        error: 'Validation failed',
      }
      expect(isAddFileResult(result)).toBe(true)
    })
  })

  describe('createTrackedFile', () => {
    it('creates tracked file from validation result', () => {
      const validation = {
        success: true,
        path: '/path/to/file.md',
        fileName: 'file.md',
        itemCount: 5,
        contentHash: 'abc123',
      }
      const tracked = createTrackedFile(validation)

      expect(tracked.path).toBe('/path/to/file.md')
      expect(tracked.fileName).toBe('file.md')
      expect(tracked.itemCount).toBe(5)
      expect(tracked.contentHash).toBe('abc123')
      expect(tracked.addedAt).toBeDefined()
      expect(tracked.lastAccessedAt).toBeDefined()
    })

    it('throws for failed validation', () => {
      const validation = {
        success: false,
        path: '/path/to/file.md',
        fileName: 'file.md',
        error: 'Failed',
      }
      expect(() => createTrackedFile(validation)).toThrow()
    })

    it('uses defaults for optional fields', () => {
      const validation = {
        success: true,
        path: '/path/to/file.md',
        fileName: 'file.md',
      }
      const tracked = createTrackedFile(validation)

      expect(tracked.itemCount).toBe(0)
      expect(tracked.contentHash).toBe('')
    })
  })
})
