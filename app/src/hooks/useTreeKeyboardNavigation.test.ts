/**
 * Tests for useTreeKeyboardNavigation hook.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTreeKeyboardNavigation } from './useTreeKeyboardNavigation'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'
import React from 'react'

// Helper to create test items
function createItem(
  id: string,
  type: TrackableItem['type'] = 'listItem',
  children: TrackableItem[] = []
): TrackableItem {
  return {
    id,
    type,
    content: `Item ${id}`,
    children,
    depth: 1,
    position: { line: 1, column: 1 },
  }
}

// Helper to create keyboard event
function createKeyboardEvent(key: string, options: Partial<KeyboardEvent> = {}): React.KeyboardEvent {
  return {
    key,
    preventDefault: vi.fn(),
    ctrlKey: options.ctrlKey ?? false,
    metaKey: options.metaKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
  } as unknown as React.KeyboardEvent
}

describe('useTreeKeyboardNavigation', () => {
  const defaultItems: TrackableItem[] = [
    createItem('1', 'header', [
      createItem('1.1', 'listItem'),
      createItem('1.2', 'listItem'),
    ]),
    createItem('2', 'header', [
      createItem('2.1', 'listItem'),
    ]),
    createItem('3', 'listItem'),
  ]

  const defaultProps = {
    items: defaultItems,
    collapsedItems: {},
    itemStatuses: {} as Record<string, TrackingStatus>,
    onToggleCollapse: vi.fn(),
    onExpandAll: vi.fn(),
    onCollapseAll: vi.fn(),
    onStatusChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('starts with no focused item', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      expect(result.current.focusedItemId).toBeNull()
    })

    it('provides setFocusedItemId function', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.setFocusedItemId('1')
      })

      expect(result.current.focusedItemId).toBe('1')
    })
  })

  describe('Arrow Down', () => {
    it('focuses first item when none focused', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })

      expect(result.current.focusedItemId).toBe('1')
    })

    it('moves to next visible item', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })

      expect(result.current.focusedItemId).toBe('1.1')
    })

    it('does not go past last item', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.setFocusedItemId('3')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })

      expect(result.current.focusedItemId).toBe('3')
    })

    it('skips collapsed children', () => {
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          collapsedItems: { '1': true },
        })
      )

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })

      expect(result.current.focusedItemId).toBe('2')
    })
  })

  describe('Arrow Up', () => {
    it('focuses last item when none focused', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'))
      })

      expect(result.current.focusedItemId).toBe('3')
    })

    it('moves to previous visible item', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.setFocusedItemId('1.2')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'))
      })

      expect(result.current.focusedItemId).toBe('1.1')
    })

    it('does not go before first item', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowUp'))
      })

      expect(result.current.focusedItemId).toBe('1')
    })
  })

  describe('Arrow Left', () => {
    it('collapses expanded header', () => {
      const onToggleCollapse = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onToggleCollapse,
        })
      )

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowLeft'))
      })

      expect(onToggleCollapse).toHaveBeenCalledWith('1')
    })

    it('moves to parent on collapsed header', () => {
      const items: TrackableItem[] = [
        createItem('parent', 'header', [
          createItem('child', 'header', []),
        ]),
      ]

      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          items,
          collapsedItems: { child: true },
        })
      )

      act(() => {
        result.current.setFocusedItemId('child')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowLeft'))
      })

      expect(result.current.focusedItemId).toBe('parent')
    })

    it('moves to parent on non-header item', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.setFocusedItemId('1.1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowLeft'))
      })

      expect(result.current.focusedItemId).toBe('1')
    })
  })

  describe('Arrow Right', () => {
    it('expands collapsed header', () => {
      const onToggleCollapse = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onToggleCollapse,
          collapsedItems: { '1': true },
        })
      )

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'))
      })

      expect(onToggleCollapse).toHaveBeenCalledWith('1')
    })

    it('moves to first child on expanded header', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'))
      })

      expect(result.current.focusedItemId).toBe('1.1')
    })

    it('does nothing on non-header item', () => {
      const onToggleCollapse = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onToggleCollapse,
        })
      )

      act(() => {
        result.current.setFocusedItemId('1.1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowRight'))
      })

      expect(onToggleCollapse).not.toHaveBeenCalled()
      expect(result.current.focusedItemId).toBe('1.1')
    })
  })

  describe('Home', () => {
    it('jumps to first visible item', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.setFocusedItemId('3')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Home'))
      })

      expect(result.current.focusedItemId).toBe('1')
    })
  })

  describe('End', () => {
    it('jumps to last visible item', () => {
      const { result } = renderHook(() => useTreeKeyboardNavigation(defaultProps))

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('End'))
      })

      expect(result.current.focusedItemId).toBe('3')
    })
  })

  describe('Enter/Space', () => {
    it('calls onOpenEditor when Enter pressed', () => {
      const onOpenEditor = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onOpenEditor,
        })
      )

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Enter'))
      })

      expect(onOpenEditor).toHaveBeenCalledWith('1')
    })

    it('cycles item status from pending to in_progress with Space', () => {
      const onStatusChange = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onStatusChange,
          itemStatuses: { '1': 'pending' },
        })
      )

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent(' '))
      })

      expect(onStatusChange).toHaveBeenCalledWith('1', 'in_progress')
    })

    it('cycles item status from in_progress to complete with Space', () => {
      const onStatusChange = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onStatusChange,
          itemStatuses: { '1': 'in_progress' },
        })
      )

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent(' '))
      })

      expect(onStatusChange).toHaveBeenCalledWith('1', 'complete')
    })

    it('cycles item status from complete to pending with Space', () => {
      const onStatusChange = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onStatusChange,
          itemStatuses: { '1': 'complete' },
        })
      )

      act(() => {
        result.current.setFocusedItemId('1')
      })

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent(' '))
      })

      expect(onStatusChange).toHaveBeenCalledWith('1', 'pending')
    })

    it('does nothing without focused item', () => {
      const onStatusChange = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onStatusChange,
        })
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('Enter'))
      })

      expect(onStatusChange).not.toHaveBeenCalled()
    })
  })

  describe('Ctrl/Cmd+E', () => {
    it('expands all when some are collapsed', () => {
      const onExpandAll = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onExpandAll,
          collapsedItems: { '1': true },
        })
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('e', { ctrlKey: true }))
      })

      expect(onExpandAll).toHaveBeenCalled()
    })

    it('collapses all when all expanded', () => {
      const onCollapseAll = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onCollapseAll,
          collapsedItems: {},
        })
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('e', { metaKey: true }))
      })

      expect(onCollapseAll).toHaveBeenCalled()
    })
  })

  describe('Ctrl/Cmd+F', () => {
    it('focuses search input', () => {
      const searchInput = { current: { focus: vi.fn() } } as unknown as React.RefObject<HTMLInputElement>
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          searchInputRef: searchInput,
        })
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('f', { ctrlKey: true }))
      })

      expect(searchInput.current?.focus).toHaveBeenCalled()
    })
  })

  describe('empty items', () => {
    it('handles empty item list gracefully', () => {
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          items: [],
        })
      )

      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })

      expect(result.current.focusedItemId).toBeNull()
    })
  })

  describe('spacebar after external focus restoration (modal close scenario)', () => {
    /**
     * These tests verify that spacebar status cycling works correctly after
     * the focused item is set externally (e.g., when externalFocusedItemId
     * is set after closing the editor modal).
     */

    it('cycles status with spacebar after setFocusedItemId is called externally', () => {
      // Simulate: modal was open, now closed, externalFocusedItemId restores focus
      const onStatusChange = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onStatusChange,
          itemStatuses: { '1': 'pending' },
        })
      )

      // Simulate external focus restoration (what happens when modal closes)
      act(() => {
        result.current.setFocusedItemId('1')
      })

      // Now spacebar should work
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent(' '))
      })

      expect(onStatusChange).toHaveBeenCalledWith('1', 'in_progress')
    })

    it('maintains handleKeyDown binding after focus restoration', () => {
      const onStatusChange = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onStatusChange,
          itemStatuses: { '1': 'pending', '2': 'pending' },
        })
      )

      // Initial navigation
      act(() => {
        result.current.setFocusedItemId('1')
      })

      // Change focus externally (simulating modal open/close cycle)
      act(() => {
        result.current.setFocusedItemId(null) // Modal opens, focus lost
      })
      act(() => {
        result.current.setFocusedItemId('2') // Modal closes, focus restored
      })

      // Handler should still work after multiple focus changes
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent(' '))
      })

      expect(onStatusChange).toHaveBeenCalledWith('2', 'in_progress')
    })

    it('cycles status correctly with full status cycle after focus restoration', () => {
      const onStatusChange = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onStatusChange,
          itemStatuses: { '1': 'complete' },
        })
      )

      // Simulate modal open/close cycle
      act(() => {
        result.current.setFocusedItemId('1')
      })

      // Press spacebar - should cycle complete -> pending
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent(' '))
      })

      expect(onStatusChange).toHaveBeenCalledWith('1', 'pending')
    })

    it('preserves focus after multiple navigation then external focus reset', () => {
      const onStatusChange = vi.fn()
      const { result } = renderHook(() =>
        useTreeKeyboardNavigation({
          ...defaultProps,
          onStatusChange,
          itemStatuses: {},
        })
      )

      // Navigate down to item 1
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })
      expect(result.current.focusedItemId).toBe('1')

      // Navigate down to item 1.1
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent('ArrowDown'))
      })
      expect(result.current.focusedItemId).toBe('1.1')

      // Simulate modal open (focus lost)
      act(() => {
        result.current.setFocusedItemId(null)
      })

      // Simulate modal close (focus restored to 1.1)
      act(() => {
        result.current.setFocusedItemId('1.1')
      })

      // Spacebar should work on restored item
      act(() => {
        result.current.handleKeyDown(createKeyboardEvent(' '))
      })

      expect(onStatusChange).toHaveBeenCalledWith('1.1', 'in_progress')
    })
  })
})
