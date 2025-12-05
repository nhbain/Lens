/**
 * Tests for scroll-manager.ts
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveScrollPosition,
  getScrollPosition,
  clearScrollPosition,
  clearAllScrollPositions,
  getAllScrollPositions,
  getScrollPositionCount,
} from './scroll-manager'

describe('scroll-manager', () => {
  beforeEach(() => {
    // Clear all positions before each test
    clearAllScrollPositions()
  })

  describe('saveScrollPosition', () => {
    it('saves a scroll position for a document', () => {
      saveScrollPosition('/path/to/doc.md', 100)

      const position = getScrollPosition('/path/to/doc.md')
      expect(position).not.toBeNull()
      expect(position?.documentPath).toBe('/path/to/doc.md')
      expect(position?.scrollTop).toBe(100)
    })

    it('saves a scroll position with focused item ID', () => {
      saveScrollPosition('/path/to/doc.md', 200, 'item-123')

      const position = getScrollPosition('/path/to/doc.md')
      expect(position?.scrollTop).toBe(200)
      expect(position?.focusedItemId).toBe('item-123')
    })

    it('overwrites existing position for same document', () => {
      saveScrollPosition('/path/to/doc.md', 100)
      saveScrollPosition('/path/to/doc.md', 500, 'new-item')

      const position = getScrollPosition('/path/to/doc.md')
      expect(position?.scrollTop).toBe(500)
      expect(position?.focusedItemId).toBe('new-item')
      expect(getScrollPositionCount()).toBe(1)
    })

    it('sets savedAt timestamp', () => {
      const before = new Date().toISOString()
      saveScrollPosition('/path/to/doc.md', 100)
      const after = new Date().toISOString()

      const position = getScrollPosition('/path/to/doc.md')
      expect(position?.savedAt).toBeDefined()
      expect(position!.savedAt >= before).toBe(true)
      expect(position!.savedAt <= after).toBe(true)
    })

    it('handles zero scroll position', () => {
      saveScrollPosition('/path/to/doc.md', 0)

      const position = getScrollPosition('/path/to/doc.md')
      expect(position?.scrollTop).toBe(0)
    })
  })

  describe('getScrollPosition', () => {
    it('returns null for unknown document', () => {
      const position = getScrollPosition('/unknown/doc.md')
      expect(position).toBeNull()
    })

    it('returns saved position for known document', () => {
      saveScrollPosition('/path/to/doc.md', 300)

      const position = getScrollPosition('/path/to/doc.md')
      expect(position?.scrollTop).toBe(300)
    })

    it('handles multiple documents independently', () => {
      saveScrollPosition('/doc1.md', 100)
      saveScrollPosition('/doc2.md', 200)
      saveScrollPosition('/doc3.md', 300)

      expect(getScrollPosition('/doc1.md')?.scrollTop).toBe(100)
      expect(getScrollPosition('/doc2.md')?.scrollTop).toBe(200)
      expect(getScrollPosition('/doc3.md')?.scrollTop).toBe(300)
    })
  })

  describe('clearScrollPosition', () => {
    it('returns true when clearing existing position', () => {
      saveScrollPosition('/path/to/doc.md', 100)

      const result = clearScrollPosition('/path/to/doc.md')
      expect(result).toBe(true)
      expect(getScrollPosition('/path/to/doc.md')).toBeNull()
    })

    it('returns false when clearing non-existent position', () => {
      const result = clearScrollPosition('/unknown/doc.md')
      expect(result).toBe(false)
    })

    it('only clears the specified document', () => {
      saveScrollPosition('/doc1.md', 100)
      saveScrollPosition('/doc2.md', 200)

      clearScrollPosition('/doc1.md')

      expect(getScrollPosition('/doc1.md')).toBeNull()
      expect(getScrollPosition('/doc2.md')?.scrollTop).toBe(200)
    })
  })

  describe('clearAllScrollPositions', () => {
    it('clears all saved positions', () => {
      saveScrollPosition('/doc1.md', 100)
      saveScrollPosition('/doc2.md', 200)
      saveScrollPosition('/doc3.md', 300)

      clearAllScrollPositions()

      expect(getScrollPositionCount()).toBe(0)
      expect(getScrollPosition('/doc1.md')).toBeNull()
      expect(getScrollPosition('/doc2.md')).toBeNull()
      expect(getScrollPosition('/doc3.md')).toBeNull()
    })

    it('handles empty state gracefully', () => {
      clearAllScrollPositions()
      expect(getScrollPositionCount()).toBe(0)
    })
  })

  describe('getAllScrollPositions', () => {
    it('returns empty array when no positions saved', () => {
      const positions = getAllScrollPositions()
      expect(positions).toEqual([])
    })

    it('returns all saved positions', () => {
      saveScrollPosition('/doc1.md', 100)
      saveScrollPosition('/doc2.md', 200)

      const positions = getAllScrollPositions()
      expect(positions).toHaveLength(2)

      const paths = positions.map((p) => p.documentPath)
      expect(paths).toContain('/doc1.md')
      expect(paths).toContain('/doc2.md')
    })

    it('returns a new array (not internal reference)', () => {
      saveScrollPosition('/doc1.md', 100)

      const positions1 = getAllScrollPositions()
      const positions2 = getAllScrollPositions()

      expect(positions1).not.toBe(positions2)
      expect(positions1).toEqual(positions2)
    })
  })

  describe('getScrollPositionCount', () => {
    it('returns 0 when no positions saved', () => {
      expect(getScrollPositionCount()).toBe(0)
    })

    it('returns correct count after saving', () => {
      saveScrollPosition('/doc1.md', 100)
      expect(getScrollPositionCount()).toBe(1)

      saveScrollPosition('/doc2.md', 200)
      expect(getScrollPositionCount()).toBe(2)
    })

    it('returns correct count after clearing', () => {
      saveScrollPosition('/doc1.md', 100)
      saveScrollPosition('/doc2.md', 200)
      clearScrollPosition('/doc1.md')

      expect(getScrollPositionCount()).toBe(1)
    })
  })
})
