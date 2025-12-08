/**
 * useCollapseState hook.
 * Provides state management for collapsible tree sections in DocumentView.
 * Collapse state persists per document across app restarts.
 */

import { useState, useCallback, useEffect } from 'react'
import {
  loadFileState,
  updateCollapseState as persistCollapseState,
  setAllCollapsed as persistAllCollapsed,
} from '@/lib/state'
import type { TrackableItem } from '@/lib/parser/types'

export interface UseCollapseStateOptions {
  /** Path to the markdown file */
  filePath: string
  /** Tree of trackable items (to get all header IDs for expand/collapse all) */
  tree: TrackableItem[]
}

export interface UseCollapseStateResult {
  /** Map of item IDs to their collapsed state */
  collapsedItems: Record<string, boolean>
  /** Check if a specific item is collapsed */
  isCollapsed: (itemId: string) => boolean
  /** Toggle the collapse state of an item */
  toggleCollapse: (itemId: string) => Promise<void>
  /** Collapse all collapsible items (headers with children) */
  collapseAll: () => Promise<void>
  /** Expand all collapsible items */
  expandAll: () => Promise<void>
  /** Whether collapse state is currently being loaded/saved */
  isLoading: boolean
}

/**
 * Collects all header item IDs from the tree that have children.
 * These are the items that can be collapsed/expanded.
 */
function getCollapsibleItemIds(tree: TrackableItem[]): string[] {
  const ids: string[] = []

  const traverse = (items: TrackableItem[]) => {
    for (const item of items) {
      // Only headers with children are collapsible
      if (item.type === 'header' && item.children.length > 0) {
        ids.push(item.id)
      }
      // Recurse into children
      if (item.children.length > 0) {
        traverse(item.children)
      }
    }
  }

  traverse(tree)
  return ids
}

/**
 * Hook for managing collapse state for document tree view.
 * Persists collapse state per document in FileTrackingState.
 */
export const useCollapseState = ({
  filePath,
  tree,
}: UseCollapseStateOptions): UseCollapseStateResult => {
  const [collapsedItems, setCollapsedItems] = useState<Record<string, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)

  // Load collapse state from persisted file state
  useEffect(() => {
    const loadCollapseState = async () => {
      if (!filePath) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      try {
        const fileState = await loadFileState(filePath)
        // Use collapsedItems from state, or empty object for backward compatibility
        setCollapsedItems(fileState?.collapsedItems ?? {})
      } catch (err) {
        console.error('Failed to load collapse state:', err)
        setCollapsedItems({})
      } finally {
        setIsLoading(false)
      }
    }

    loadCollapseState()
  }, [filePath])

  // Check if a specific item is collapsed
  const isCollapsed = useCallback(
    (itemId: string): boolean => {
      return collapsedItems[itemId] === true
    },
    [collapsedItems]
  )

  // Toggle the collapse state of an item
  const toggleCollapse = useCallback(
    async (itemId: string) => {
      const newCollapsed = !collapsedItems[itemId]

      // Optimistic update
      setCollapsedItems((prev) => ({
        ...prev,
        [itemId]: newCollapsed,
      }))

      // Persist to disk
      try {
        await persistCollapseState(filePath, itemId, newCollapsed)
      } catch (err) {
        // Revert on error
        console.error('Failed to persist collapse state:', err)
        setCollapsedItems((prev) => ({
          ...prev,
          [itemId]: !newCollapsed,
        }))
      }
    },
    [filePath, collapsedItems]
  )

  // Collapse all collapsible items
  const collapseAll = useCallback(async () => {
    const collapsibleIds = getCollapsibleItemIds(tree)
    if (collapsibleIds.length === 0) return

    // Build new collapsed state with all items collapsed
    const newCollapsedItems: Record<string, boolean> = {}
    for (const id of collapsibleIds) {
      newCollapsedItems[id] = true
    }

    // Optimistic update
    setCollapsedItems(newCollapsedItems)

    // Persist to disk
    try {
      await persistAllCollapsed(filePath, true, collapsibleIds)
    } catch (err) {
      // Revert on error
      console.error('Failed to persist collapse all:', err)
      const fileState = await loadFileState(filePath)
      setCollapsedItems(fileState?.collapsedItems ?? {})
    }
  }, [filePath, tree])

  // Expand all collapsible items
  const expandAll = useCallback(async () => {
    const collapsibleIds = getCollapsibleItemIds(tree)
    if (collapsibleIds.length === 0) return

    // Build new collapsed state with all items expanded (false)
    const newCollapsedItems: Record<string, boolean> = {}
    for (const id of collapsibleIds) {
      newCollapsedItems[id] = false
    }

    // Optimistic update
    setCollapsedItems(newCollapsedItems)

    // Persist to disk
    try {
      await persistAllCollapsed(filePath, false, collapsibleIds)
    } catch (err) {
      // Revert on error
      console.error('Failed to persist expand all:', err)
      const fileState = await loadFileState(filePath)
      setCollapsedItems(fileState?.collapsedItems ?? {})
    }
  }, [filePath, tree])

  return {
    collapsedItems,
    isCollapsed,
    toggleCollapse,
    collapseAll,
    expandAll,
    isLoading,
  }
}
