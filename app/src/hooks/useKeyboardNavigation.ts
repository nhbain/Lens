/**
 * useKeyboardNavigation hook.
 * Provides keyboard navigation for lists of focusable items.
 */

import { useState, useCallback, useRef, useEffect, RefObject } from 'react'

export interface KeyboardNavigationOptions {
  /** Callback when an item should be activated (Enter/Space) */
  onActivate?: (itemId: string) => void
  /** Whether navigation wraps from last to first item and vice versa */
  wrap?: boolean
}

export interface KeyboardNavigationResult {
  /** Currently focused item ID (null if no focus) */
  focusedId: string | null
  /** Set the focused item ID manually */
  setFocusedId: (id: string | null) => void
  /** Keyboard event handler to attach to the container */
  handleKeyDown: (event: React.KeyboardEvent) => void
  /** Focus a specific item by ID and scroll it into view */
  focusItem: (itemId: string) => void
  /** Clear focus */
  clearFocus: () => void
}

/**
 * Hook for keyboard navigation through a list of items.
 *
 * Supports:
 * - Arrow Up/Down: Navigate between items
 * - Home/End: Jump to first/last item
 * - Enter/Space: Activate focused item
 * - Escape: Clear focus
 *
 * @param itemIds - Array of item IDs in display order
 * @param containerRef - Ref to the scrollable container element
 * @param options - Additional configuration options
 */
export const useKeyboardNavigation = (
  itemIds: string[],
  containerRef: RefObject<HTMLElement | null>,
  options: KeyboardNavigationOptions = {}
): KeyboardNavigationResult => {
  const { onActivate, wrap = false } = options
  const [focusedId, setFocusedId] = useState<string | null>(null)
  const focusedIndexRef = useRef<number>(-1)

  // Update focused index when focusedId changes
  useEffect(() => {
    focusedIndexRef.current = focusedId ? itemIds.indexOf(focusedId) : -1
  }, [focusedId, itemIds])

  /**
   * Scroll the focused item into view.
   */
  const scrollToItem = useCallback(
    (itemId: string) => {
      if (!containerRef.current) return

      const itemElement = containerRef.current.querySelector(
        `[data-item-id="${itemId}"]`
      )
      if (itemElement) {
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    },
    [containerRef]
  )

  /**
   * Move focus to a specific item.
   */
  const focusItem = useCallback(
    (itemId: string) => {
      if (itemIds.includes(itemId)) {
        setFocusedId(itemId)
        scrollToItem(itemId)
      }
    },
    [itemIds, scrollToItem]
  )

  /**
   * Clear focus.
   */
  const clearFocus = useCallback(() => {
    setFocusedId(null)
  }, [])

  /**
   * Move focus to the previous item.
   */
  const moveToPrevious = useCallback(() => {
    if (itemIds.length === 0) return

    const currentIndex = focusedIndexRef.current
    let nextIndex: number

    if (currentIndex <= 0) {
      // At start or no focus
      nextIndex = wrap ? itemIds.length - 1 : 0
    } else {
      nextIndex = currentIndex - 1
    }

    const nextId = itemIds[nextIndex]
    setFocusedId(nextId)
    scrollToItem(nextId)
  }, [itemIds, wrap, scrollToItem])

  /**
   * Move focus to the next item.
   */
  const moveToNext = useCallback(() => {
    if (itemIds.length === 0) return

    const currentIndex = focusedIndexRef.current
    let nextIndex: number

    if (currentIndex < 0) {
      // No focus, start at first
      nextIndex = 0
    } else if (currentIndex >= itemIds.length - 1) {
      // At end
      nextIndex = wrap ? 0 : itemIds.length - 1
    } else {
      nextIndex = currentIndex + 1
    }

    const nextId = itemIds[nextIndex]
    setFocusedId(nextId)
    scrollToItem(nextId)
  }, [itemIds, wrap, scrollToItem])

  /**
   * Move focus to the first item.
   */
  const moveToFirst = useCallback(() => {
    if (itemIds.length === 0) return
    const firstId = itemIds[0]
    setFocusedId(firstId)
    scrollToItem(firstId)
  }, [itemIds, scrollToItem])

  /**
   * Move focus to the last item.
   */
  const moveToLast = useCallback(() => {
    if (itemIds.length === 0) return
    const lastId = itemIds[itemIds.length - 1]
    setFocusedId(lastId)
    scrollToItem(lastId)
  }, [itemIds, scrollToItem])

  /**
   * Handle keyboard events for navigation.
   */
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          moveToPrevious()
          break
        case 'ArrowDown':
          event.preventDefault()
          moveToNext()
          break
        case 'Home':
          event.preventDefault()
          moveToFirst()
          break
        case 'End':
          event.preventDefault()
          moveToLast()
          break
        case 'Enter':
        case ' ':
          if (focusedId) {
            event.preventDefault()
            onActivate?.(focusedId)
          }
          break
        case 'Escape':
          event.preventDefault()
          clearFocus()
          break
      }
    },
    [
      focusedId,
      moveToPrevious,
      moveToNext,
      moveToFirst,
      moveToLast,
      clearFocus,
      onActivate,
    ]
  )

  return {
    focusedId,
    setFocusedId,
    handleKeyDown,
    focusItem,
    clearFocus,
  }
}
