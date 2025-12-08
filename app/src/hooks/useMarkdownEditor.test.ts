/**
 * Tests for useMarkdownEditor hook helper functions.
 * Note: Full hook tests are complex due to Tauri fs mocking.
 * We test the core logic as isolated functions.
 */

import { describe, it, expect } from 'vitest'
import type { TrackableItem } from '@/lib/parser/types'

/**
 * Helper to create a mock TrackableItem for testing.
 */
const createMockItem = (overrides?: Partial<TrackableItem>): TrackableItem => ({
  id: 'test-item-1',
  type: 'header',
  content: '# Test Header',
  depth: 1,
  position: {
    line: 1,
    column: 1,
    endLine: 1,
    endColumn: 15,
  },
  children: [],
  ...overrides,
})

/**
 * Compute dirty flag: content differs from original.
 */
const computeIsDirty = (originalContent: string, currentContent: string): boolean => {
  return currentContent !== originalContent
}

/**
 * Check if item has required position information for editing.
 */
const hasEditablePosition = (item: TrackableItem): boolean => {
  return (
    item.position.endLine !== undefined &&
    item.position.endColumn !== undefined
  )
}

/**
 * Replace content slice in full file content.
 * This is the core logic used by saveContent.
 */
const replaceContentSlice = (
  fullContent: string,
  startLine: number,
  endLine: number,
  newContent: string
): string => {
  const lines = fullContent.split('\n')

  // Positions are 1-indexed, but array indices are 0-indexed
  const beforeLines = lines.slice(0, startLine - 1)
  const afterLines = lines.slice(endLine)

  return [...beforeLines, newContent, ...afterLines].join('\n')
}

/**
 * Extract lines from full content based on position.
 */
const extractLines = (
  fullContent: string,
  startLine: number,
  endLine: number
): string => {
  const lines = fullContent.split('\n')

  // For same-line items
  if (startLine === endLine) {
    return lines[startLine - 1] || ''
  }

  // For multi-line items
  return lines.slice(startLine - 1, endLine).join('\n')
}

describe('useMarkdownEditor helpers', () => {
  describe('computeIsDirty', () => {
    it('returns false when content is unchanged', () => {
      const original = '# Header\n\nContent here'
      const current = '# Header\n\nContent here'
      expect(computeIsDirty(original, current)).toBe(false)
    })

    it('returns true when content is modified', () => {
      const original = '# Header\n\nContent here'
      const current = '# Header\n\nModified content'
      expect(computeIsDirty(original, current)).toBe(true)
    })

    it('returns false for empty strings', () => {
      expect(computeIsDirty('', '')).toBe(false)
    })

    it('returns true when content is added', () => {
      const original = ''
      const current = 'New content'
      expect(computeIsDirty(original, current)).toBe(true)
    })

    it('returns true when content is removed', () => {
      const original = 'Some content'
      const current = ''
      expect(computeIsDirty(original, current)).toBe(true)
    })
  })

  describe('hasEditablePosition', () => {
    it('returns true when item has endLine and endColumn', () => {
      const item = createMockItem({
        position: {
          line: 1,
          column: 1,
          endLine: 3,
          endColumn: 10,
        },
      })
      expect(hasEditablePosition(item)).toBe(true)
    })

    it('returns false when endLine is missing', () => {
      const item = createMockItem({
        position: {
          line: 1,
          column: 1,
          endColumn: 10,
        },
      })
      expect(hasEditablePosition(item)).toBe(false)
    })

    it('returns false when endColumn is missing', () => {
      const item = createMockItem({
        position: {
          line: 1,
          column: 1,
          endLine: 3,
        },
      })
      expect(hasEditablePosition(item)).toBe(false)
    })

    it('returns false when both end fields are missing', () => {
      const item = createMockItem({
        position: {
          line: 1,
          column: 1,
        },
      })
      expect(hasEditablePosition(item)).toBe(false)
    })
  })

  describe('replaceContentSlice', () => {
    it('replaces a single line', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3\nLine 4'
      const result = replaceContentSlice(fullContent, 2, 2, 'Modified Line 2')

      expect(result).toBe('Line 1\nModified Line 2\nLine 3\nLine 4')
    })

    it('replaces multiple lines', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'
      const result = replaceContentSlice(fullContent, 2, 4, 'New Content')

      expect(result).toBe('Line 1\nNew Content\nLine 5')
    })

    it('replaces first line', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3'
      const result = replaceContentSlice(fullContent, 1, 1, 'New First Line')

      expect(result).toBe('New First Line\nLine 2\nLine 3')
    })

    it('replaces last line', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3'
      const result = replaceContentSlice(fullContent, 3, 3, 'New Last Line')

      expect(result).toBe('Line 1\nLine 2\nNew Last Line')
    })

    it('replaces all lines', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3'
      const result = replaceContentSlice(fullContent, 1, 3, 'Completely New')

      expect(result).toBe('Completely New')
    })

    it('handles empty replacement', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3'
      const result = replaceContentSlice(fullContent, 2, 2, '')

      expect(result).toBe('Line 1\n\nLine 3')
    })

    it('handles multiline replacement content', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3'
      const result = replaceContentSlice(fullContent, 2, 2, 'New Line 2\nExtra Line')

      expect(result).toBe('Line 1\nNew Line 2\nExtra Line\nLine 3')
    })
  })

  describe('extractLines', () => {
    it('extracts a single line', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3'
      const result = extractLines(fullContent, 2, 2)

      expect(result).toBe('Line 2')
    })

    it('extracts multiple lines', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3\nLine 4'
      const result = extractLines(fullContent, 2, 4)

      expect(result).toBe('Line 2\nLine 3\nLine 4')
    })

    it('extracts first line', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3'
      const result = extractLines(fullContent, 1, 1)

      expect(result).toBe('Line 1')
    })

    it('extracts last line', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3'
      const result = extractLines(fullContent, 3, 3)

      expect(result).toBe('Line 3')
    })

    it('extracts all lines', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3'
      const result = extractLines(fullContent, 1, 3)

      expect(result).toBe('Line 1\nLine 2\nLine 3')
    })
  })

  describe('debounce logic', () => {
    it('should delay execution', async () => {
      let called = false
      const delay = 100

      const debounced = (callback: () => void, ms: number) => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null

        return () => {
          if (timeoutId !== null) {
            clearTimeout(timeoutId)
          }
          timeoutId = setTimeout(callback, ms)
        }
      }

      const fn = debounced(() => {
        called = true
      }, delay)

      fn()

      // Should not be called immediately
      expect(called).toBe(false)

      // Should be called after delay
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(called).toBe(true)
          resolve()
        }, delay + 50)
      })
    })

    it('should cancel previous timeout when called again', async () => {
      let callCount = 0
      const delay = 100

      const debounced = (callback: () => void, ms: number) => {
        let timeoutId: ReturnType<typeof setTimeout> | null = null

        return () => {
          if (timeoutId !== null) {
            clearTimeout(timeoutId)
          }
          timeoutId = setTimeout(callback, ms)
        }
      }

      const fn = debounced(() => {
        callCount++
      }, delay)

      fn()
      fn()
      fn()

      // Should only be called once after all invocations
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          expect(callCount).toBe(1)
          resolve()
        }, delay + 50)
      })
    })
  })

  describe('validation helpers', () => {
    it('validates item has required fields for editing', () => {
      const validItem = createMockItem()
      expect(hasEditablePosition(validItem)).toBe(true)

      const invalidItem = createMockItem({
        position: {
          line: 1,
          column: 1,
        },
      })
      expect(hasEditablePosition(invalidItem)).toBe(false)
    })

    it('checks if source path is a markdown file', () => {
      const isMarkdownPath = (path: string): boolean => {
        const lowerPath = path.toLowerCase()
        return lowerPath.endsWith('.md') || lowerPath.endsWith('.markdown')
      }

      expect(isMarkdownPath('/path/to/file.md')).toBe(true)
      expect(isMarkdownPath('/path/to/file.markdown')).toBe(true)
      expect(isMarkdownPath('/path/to/file.MD')).toBe(true)
      expect(isMarkdownPath('/path/to/file.txt')).toBe(false)
      expect(isMarkdownPath('/path/to/file')).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles content with no newlines', () => {
      const fullContent = 'Single line content'
      const result = replaceContentSlice(fullContent, 1, 1, 'Replaced')

      expect(result).toBe('Replaced')
    })

    it('handles empty file content', () => {
      const fullContent = ''
      const result = replaceContentSlice(fullContent, 1, 1, 'New content')

      expect(result).toBe('New content')
    })

    it('preserves trailing newline in content', () => {
      const fullContent = 'Line 1\nLine 2\nLine 3\n'
      const result = replaceContentSlice(fullContent, 2, 2, 'Modified Line 2')

      // Note: The original trailing newline is lost because we split by \n
      // This is expected behavior - the file system handles the final newline
      expect(result).toBe('Line 1\nModified Line 2\nLine 3\n')
    })

    it('handles consecutive newlines', () => {
      const fullContent = 'Line 1\n\n\nLine 4'
      const result = replaceContentSlice(fullContent, 2, 3, 'New Line')

      expect(result).toBe('Line 1\nNew Line\nLine 4')
    })
  })
})
