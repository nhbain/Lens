/**
 * Tests for useScrollPosition hook helper functions.
 * Note: The hook itself is tested indirectly through component tests
 * due to module mocking complexity with React hooks.
 *
 * These tests verify the underlying logic without React hook dependencies.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  saveScrollPosition,
  getScrollPosition,
  clearScrollPosition,
  clearAllScrollPositions,
} from '@/lib/navigation/scroll-manager'

describe('useScrollPosition helpers (via scroll-manager)', () => {
  beforeEach(() => {
    clearAllScrollPositions()
  })

  describe('scroll position persistence', () => {
    it('saves and retrieves scroll position for a document', () => {
      saveScrollPosition('/path/to/doc.md', 150)

      const position = getScrollPosition('/path/to/doc.md')
      expect(position).not.toBeNull()
      expect(position?.scrollTop).toBe(150)
      expect(position?.documentPath).toBe('/path/to/doc.md')
    })

    it('saves scroll position with focused item ID', () => {
      saveScrollPosition('/path/to/doc.md', 200, 'item-abc')

      const position = getScrollPosition('/path/to/doc.md')
      expect(position?.scrollTop).toBe(200)
      expect(position?.focusedItemId).toBe('item-abc')
    })

    it('overwrites position when same document is saved again', () => {
      saveScrollPosition('/path/to/doc.md', 100)
      saveScrollPosition('/path/to/doc.md', 500)

      const position = getScrollPosition('/path/to/doc.md')
      expect(position?.scrollTop).toBe(500)
    })

    it('returns null for unknown document', () => {
      const position = getScrollPosition('/unknown/doc.md')
      expect(position).toBeNull()
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

  describe('clearing scroll positions', () => {
    it('clears scroll position for a specific document', () => {
      saveScrollPosition('/doc1.md', 100)
      saveScrollPosition('/doc2.md', 200)

      clearScrollPosition('/doc1.md')

      expect(getScrollPosition('/doc1.md')).toBeNull()
      expect(getScrollPosition('/doc2.md')?.scrollTop).toBe(200)
    })

    it('clears all scroll positions', () => {
      saveScrollPosition('/doc1.md', 100)
      saveScrollPosition('/doc2.md', 200)

      clearAllScrollPositions()

      expect(getScrollPosition('/doc1.md')).toBeNull()
      expect(getScrollPosition('/doc2.md')).toBeNull()
    })
  })

  describe('scroll position timestamp', () => {
    it('includes savedAt timestamp', () => {
      const before = new Date().toISOString()
      saveScrollPosition('/doc.md', 100)
      const after = new Date().toISOString()

      const position = getScrollPosition('/doc.md')
      expect(position?.savedAt).toBeDefined()
      expect(position!.savedAt >= before).toBe(true)
      expect(position!.savedAt <= after).toBe(true)
    })
  })

  describe('edge cases', () => {
    it('handles zero scroll position', () => {
      saveScrollPosition('/doc.md', 0)

      const position = getScrollPosition('/doc.md')
      expect(position?.scrollTop).toBe(0)
    })

    it('handles large scroll positions', () => {
      saveScrollPosition('/doc.md', 999999)

      const position = getScrollPosition('/doc.md')
      expect(position?.scrollTop).toBe(999999)
    })

    it('handles empty focused item ID', () => {
      saveScrollPosition('/doc.md', 100, '')

      const position = getScrollPosition('/doc.md')
      expect(position?.focusedItemId).toBe('')
    })

    it('handles paths with special characters', () => {
      saveScrollPosition('/path with spaces/doc (1).md', 100)

      const position = getScrollPosition('/path with spaces/doc (1).md')
      expect(position?.scrollTop).toBe(100)
    })
  })
})

/**
 * Test scrollToItem behavior simulation.
 * Tests the DOM manipulation pattern used by the hook.
 */
describe('scrollToItem DOM behavior', () => {
  it('can find element by data-item-id attribute', () => {
    const container = document.createElement('div')
    const item = document.createElement('div')
    item.setAttribute('data-item-id', 'test-item-123')
    container.appendChild(item)

    const found = container.querySelector('[data-item-id="test-item-123"]')
    expect(found).toBe(item)
  })

  it('returns null when item not found', () => {
    const container = document.createElement('div')

    const found = container.querySelector('[data-item-id="nonexistent"]')
    expect(found).toBeNull()
  })

  it('finds correct item among multiple', () => {
    const container = document.createElement('div')

    const item1 = document.createElement('div')
    item1.setAttribute('data-item-id', 'item-1')
    item1.textContent = 'First'
    container.appendChild(item1)

    const item2 = document.createElement('div')
    item2.setAttribute('data-item-id', 'item-2')
    item2.textContent = 'Second'
    container.appendChild(item2)

    const found = container.querySelector('[data-item-id="item-2"]')
    expect(found?.textContent).toBe('Second')
  })
})

/**
 * Test debounce behavior simulation.
 * Verifies the debounce pattern used for scroll events.
 */
describe('debounce behavior', () => {
  it('debounce helper delays execution', async () => {
    let callCount = 0
    const debounce = (fn: () => void, ms: number) => {
      let timer: ReturnType<typeof setTimeout> | null = null
      return () => {
        if (timer) clearTimeout(timer)
        timer = setTimeout(fn, ms)
      }
    }

    const debouncedFn = debounce(() => callCount++, 50)

    // Call multiple times rapidly
    debouncedFn()
    debouncedFn()
    debouncedFn()

    // Should not have called yet
    expect(callCount).toBe(0)

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 60))

    // Should have called once
    expect(callCount).toBe(1)
  })
})
