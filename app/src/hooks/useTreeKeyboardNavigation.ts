/**
 * useTreeKeyboardNavigation hook.
 * Provides comprehensive keyboard navigation for tree views.
 */

import { useState, useCallback, useRef, useEffect } from 'react'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'

export interface UseTreeKeyboardNavigationOptions {
  /** The tree of items to navigate */
  items: TrackableItem[]
  /** Map of collapsed item IDs */
  collapsedItems: Record<string, boolean>
  /** Item statuses for cycling */
  itemStatuses: Record<string, TrackingStatus>
  /** Callback to toggle collapse state */
  onToggleCollapse: (itemId: string) => void
  /** Callback to expand all items */
  onExpandAll: () => void
  /** Callback to collapse all items */
  onCollapseAll: () => void
  /** Callback to change item status */
  onStatusChange?: (itemId: string, status: TrackingStatus) => void
  /** Callback to open editor for an item */
  onOpenEditor?: (itemId: string) => void
  /** Reference to the search input element */
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  /** Callback when search should be cleared */
  onClearSearch?: () => void
}

export interface UseTreeKeyboardNavigationResult {
  /** Currently focused item ID */
  focusedItemId: string | null
  /** Set the focused item */
  setFocusedItemId: (itemId: string | null) => void
  /** Handle keyboard events on the container */
  handleKeyDown: (event: React.KeyboardEvent) => void
  /** Reference for the container element */
  containerRef: React.RefObject<HTMLDivElement | null>
}

/**
 * Get a flat list of visible (non-collapsed) items.
 */
function getVisibleItems(
  items: TrackableItem[],
  collapsedItems: Record<string, boolean>
): TrackableItem[] {
  const result: TrackableItem[] = []

  const traverse = (itemList: TrackableItem[]) => {
    for (const item of itemList) {
      result.push(item)

      // Only include children if not collapsed
      if (item.children.length > 0 && !collapsedItems[item.id]) {
        traverse(item.children)
      }
    }
  }

  traverse(items)
  return result
}

/**
 * Find the index of an item in a list.
 */
function findItemIndex(items: TrackableItem[], itemId: string): number {
  return items.findIndex(item => item.id === itemId)
}

/**
 * Find the parent header of an item.
 */
function findParentHeader(
  items: TrackableItem[],
  targetId: string,
  parentId: string | null = null
): string | null {
  for (const item of items) {
    if (item.id === targetId) {
      return parentId
    }

    if (item.children.length > 0) {
      const foundParent = findParentHeader(
        item.children,
        targetId,
        item.type === 'header' ? item.id : parentId
      )
      if (foundParent !== null) {
        return foundParent
      }
    }
  }

  return null
}

/**
 * Find an item by ID in the tree.
 */
function findItemById(items: TrackableItem[], id: string): TrackableItem | null {
  for (const item of items) {
    if (item.id === id) {
      return item
    }
    if (item.children.length > 0) {
      const found = findItemById(item.children, id)
      if (found) {
        return found
      }
    }
  }
  return null
}

/**
 * Get the next status in the cycle.
 */
function getNextStatus(current: TrackingStatus): TrackingStatus {
  switch (current) {
    case 'pending':
      return 'in_progress'
    case 'in_progress':
      return 'complete'
    case 'complete':
      return 'pending'
    default:
      return 'pending'
  }
}

/**
 * Hook for comprehensive keyboard navigation in tree views.
 */
export function useTreeKeyboardNavigation({
  items,
  collapsedItems,
  itemStatuses,
  onToggleCollapse,
  onExpandAll,
  onCollapseAll,
  onStatusChange,
  onOpenEditor,
  searchInputRef,
  onClearSearch,
}: UseTreeKeyboardNavigationOptions): UseTreeKeyboardNavigationResult {
  const [focusedItemId, setFocusedItemId] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Get visible items for navigation
  const visibleItems = getVisibleItems(items, collapsedItems)

  // Focus first item if none focused and items exist
  useEffect(() => {
    if (focusedItemId === null && visibleItems.length > 0) {
      // Don't auto-focus - let user initiate keyboard navigation
    }
  }, [focusedItemId, visibleItems])

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key, ctrlKey, metaKey } = event

    // Ctrl/Cmd+F: Focus search
    if ((ctrlKey || metaKey) && key === 'f') {
      event.preventDefault()
      searchInputRef?.current?.focus()
      return
    }

    // Ctrl/Cmd+E: Toggle expand/collapse all
    if ((ctrlKey || metaKey) && key === 'e') {
      event.preventDefault()
      // If any are collapsed, expand all; otherwise collapse all
      const hasCollapsed = items.some(item =>
        item.type === 'header' && item.children.length > 0 && collapsedItems[item.id]
      )
      if (hasCollapsed) {
        onExpandAll()
      } else {
        onCollapseAll()
      }
      return
    }

    // Escape: Clear search and return focus
    if (key === 'Escape') {
      if (document.activeElement === searchInputRef?.current) {
        onClearSearch?.()
        containerRef.current?.focus()
      }
      return
    }

    // Navigation keys require focused item context
    const currentIndex = focusedItemId
      ? findItemIndex(visibleItems, focusedItemId)
      : -1

    switch (key) {
      case 'ArrowDown': {
        event.preventDefault()
        if (visibleItems.length === 0) return

        if (currentIndex === -1) {
          // No item focused, focus first
          setFocusedItemId(visibleItems[0].id)
        } else if (currentIndex < visibleItems.length - 1) {
          // Move to next item
          setFocusedItemId(visibleItems[currentIndex + 1].id)
        }
        break
      }

      case 'ArrowUp': {
        event.preventDefault()
        if (visibleItems.length === 0) return

        if (currentIndex === -1) {
          // No item focused, focus last
          setFocusedItemId(visibleItems[visibleItems.length - 1].id)
        } else if (currentIndex > 0) {
          // Move to previous item
          setFocusedItemId(visibleItems[currentIndex - 1].id)
        }
        break
      }

      case 'ArrowLeft': {
        event.preventDefault()
        if (!focusedItemId) return

        const item = findItemById(items, focusedItemId)
        if (!item) return

        // If expanded header, collapse it
        if (item.type === 'header' && item.children.length > 0 && !collapsedItems[item.id]) {
          onToggleCollapse(item.id)
          return
        }

        // Otherwise, move to parent header
        const parentId = findParentHeader(items, focusedItemId)
        if (parentId) {
          setFocusedItemId(parentId)
        }
        break
      }

      case 'ArrowRight': {
        event.preventDefault()
        if (!focusedItemId) return

        const item = findItemById(items, focusedItemId)
        if (!item) return

        // Only applies to headers with children
        if (item.type === 'header' && item.children.length > 0) {
          if (collapsedItems[item.id]) {
            // Collapsed: expand it
            onToggleCollapse(item.id)
          } else {
            // Expanded: move to first child
            setFocusedItemId(item.children[0].id)
          }
        }
        break
      }

      case 'Home': {
        event.preventDefault()
        if (visibleItems.length > 0) {
          setFocusedItemId(visibleItems[0].id)
        }
        break
      }

      case 'End': {
        event.preventDefault()
        if (visibleItems.length > 0) {
          setFocusedItemId(visibleItems[visibleItems.length - 1].id)
        }
        break
      }

      case 'Enter': {
        // Enter opens editor
        event.preventDefault()
        if (!focusedItemId || !onOpenEditor) return
        onOpenEditor(focusedItemId)
        break
      }

      case ' ': {
        // Space cycles status (for accessibility)
        event.preventDefault()
        if (!focusedItemId || !onStatusChange) return

        const currentStatus = itemStatuses[focusedItemId] ?? 'pending'
        const nextStatus = getNextStatus(currentStatus)
        onStatusChange(focusedItemId, nextStatus)
        break
      }
    }
  }, [
    focusedItemId,
    items,
    visibleItems,
    collapsedItems,
    itemStatuses,
    onToggleCollapse,
    onExpandAll,
    onCollapseAll,
    onStatusChange,
    onOpenEditor,
    searchInputRef,
    onClearSearch,
  ])

  // Scroll focused item into view
  useEffect(() => {
    if (focusedItemId && containerRef.current) {
      const element = containerRef.current.querySelector(
        `[data-item-id="${focusedItemId}"]`
      )
      if (element) {
        element.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    }
  }, [focusedItemId])

  return {
    focusedItemId,
    setFocusedItemId,
    handleKeyDown,
    containerRef,
  }
}
