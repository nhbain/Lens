/**
 * useInProgressItems hook.
 * Aggregates in-progress items across all tracked files for display
 * in the dashboard's resume section.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getTrackedFiles, loadTrackedFiles } from '@/lib/files'
import { loadAllFileStates } from '@/lib/state'
import { parseMarkdown, parseDocument } from '@/lib/parser'
import { readTextFile } from '@tauri-apps/plugin-fs'
import type { TrackableItem } from '@/lib/parser/types'
import type { InProgressItemSummary } from '@/lib/navigation/types'

export interface UseInProgressItemsOptions {
  /** Maximum number of items to return (default: 5) */
  limit?: number
  /** Whether to automatically refresh on mount (default: true) */
  autoRefresh?: boolean
}

export interface UseInProgressItemsResult {
  /** Array of in-progress item summaries, sorted by most recent first */
  items: InProgressItemSummary[]
  /** Whether data is currently loading */
  isLoading: boolean
  /** Error message if loading failed */
  error: string | null
  /** Total count of in-progress items (before limit applied) */
  totalCount: number
  /** Manually refresh the data */
  refresh: () => Promise<void>
}

/**
 * Flattens a tree of trackable items into a flat array.
 */
const flattenItems = (items: TrackableItem[]): TrackableItem[] => {
  const result: TrackableItem[] = []

  const traverse = (itemList: TrackableItem[]) => {
    for (const item of itemList) {
      result.push(item)
      if (item.children.length > 0) {
        traverse(item.children)
      }
    }
  }

  traverse(items)
  return result
}

/**
 * Creates an item ID to TrackableItem map from parsed items.
 */
const createItemMap = (items: TrackableItem[]): Map<string, TrackableItem> => {
  const map = new Map<string, TrackableItem>()
  const flatItems = flattenItems(items)
  for (const item of flatItems) {
    map.set(item.id, item)
  }
  return map
}

/**
 * Hook for aggregating in-progress items across all tracked files.
 *
 * Features:
 * - Loads all tracked files and their tracking states
 * - Parses each file to get item details
 * - Filters for items with 'in_progress' status
 * - Sorts by last-worked timestamp (most recent first)
 * - Limits results for dashboard display
 */
export const useInProgressItems = ({
  limit = 5,
  autoRefresh = true,
}: UseInProgressItemsOptions = {}): UseInProgressItemsResult => {
  const [allItems, setAllItems] = useState<InProgressItemSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load all tracked files, their states, and extract in-progress items.
   */
  const loadInProgressItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load tracked files list
      await loadTrackedFiles()
      const trackedFiles = getTrackedFiles()

      // Load tracking states for all files
      const statesMap = await loadAllFileStates()

      // Collect all in-progress items
      const inProgressItems: InProgressItemSummary[] = []

      // Process each tracked file
      for (const file of trackedFiles) {
        const state = statesMap.get(file.path)
        if (!state) continue

        // Find items with in_progress status
        const inProgressStates = Object.values(state.items).filter(
          (itemState) => itemState.status === 'in_progress'
        )

        if (inProgressStates.length === 0) continue

        // Parse the file to get item details
        try {
          const content = await readTextFile(file.path)
          const ast = parseMarkdown(content)
          const parsed = parseDocument(ast, file.path)
          const itemMap = createItemMap(parsed.items)

          // Create summaries for each in-progress item
          for (const itemState of inProgressStates) {
            const item = itemMap.get(itemState.itemId)
            if (item) {
              inProgressItems.push({
                item,
                filePath: file.path,
                fileName: file.fileName,
                lastWorkedAt: itemState.updatedAt,
              })
            }
          }
        } catch (parseError) {
          // Skip files that can't be parsed/read - don't fail entire operation
          console.warn(`Could not parse file ${file.path}:`, parseError)
        }
      }

      // Sort by lastWorkedAt descending (most recent first)
      inProgressItems.sort((a, b) => b.lastWorkedAt.localeCompare(a.lastWorkedAt))

      setAllItems(inProgressItems)
    } catch (err) {
      let message: string
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'string') {
        message = err
      } else {
        message = 'Failed to load in-progress items'
      }
      console.error('useInProgressItems error:', err)
      setError(message)
      setAllItems([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load on mount if autoRefresh is enabled
  useEffect(() => {
    if (autoRefresh) {
      loadInProgressItems()
    }
  }, [autoRefresh, loadInProgressItems])

  // Apply limit to items
  const items = useMemo(() => {
    return allItems.slice(0, limit)
  }, [allItems, limit])

  return {
    items,
    isLoading,
    error,
    totalCount: allItems.length,
    refresh: loadInProgressItems,
  }
}
