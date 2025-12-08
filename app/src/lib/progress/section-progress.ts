/**
 * Section progress calculation utilities.
 * Provides functions to calculate progress for sections with descendants.
 */

import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'

export interface SectionProgress {
  /** Number of completed descendants */
  completed: number
  /** Total number of descendants */
  total: number
  /** Completion percentage (0-100) */
  percentage: number
}

/**
 * Count total descendants of an item (all nested children).
 * Does not include the item itself in the count.
 */
export function countDescendants(item: TrackableItem): number {
  let count = 0

  const traverse = (children: TrackableItem[]) => {
    for (const child of children) {
      count++
      if (child.children.length > 0) {
        traverse(child.children)
      }
    }
  }

  traverse(item.children)
  return count
}

/**
 * Count completed descendants of an item.
 * A descendant is considered complete if its status is 'complete'.
 */
export function countCompletedDescendants(
  item: TrackableItem,
  itemStatuses: Record<string, TrackingStatus>
): number {
  let count = 0

  const traverse = (children: TrackableItem[]) => {
    for (const child of children) {
      const status = itemStatuses[child.id] ?? 'pending'
      if (status === 'complete') {
        count++
      }
      if (child.children.length > 0) {
        traverse(child.children)
      }
    }
  }

  traverse(item.children)
  return count
}

/**
 * Calculate section progress for an item.
 * Returns completed count, total count, and percentage.
 */
export function calculateSectionProgress(
  item: TrackableItem,
  itemStatuses: Record<string, TrackingStatus>
): SectionProgress {
  const total = countDescendants(item)
  const completed = countCompletedDescendants(item, itemStatuses)
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  return {
    completed,
    total,
    percentage,
  }
}

// Cache for memoization
const progressCache = new WeakMap<TrackableItem, Map<string, SectionProgress>>()

/**
 * Calculate section progress with memoization.
 * Uses a cache keyed by item and status snapshot to avoid recalculation.
 */
export function calculateSectionProgressMemoized(
  item: TrackableItem,
  itemStatuses: Record<string, TrackingStatus>
): SectionProgress {
  // Create a cache key from relevant statuses
  const relevantIds = collectDescendantIds(item)
  const statusKey = relevantIds
    .map(id => `${id}:${itemStatuses[id] ?? 'pending'}`)
    .join('|')

  // Check cache
  let itemCache = progressCache.get(item)
  if (!itemCache) {
    itemCache = new Map()
    progressCache.set(item, itemCache)
  }

  const cached = itemCache.get(statusKey)
  if (cached) {
    return cached
  }

  // Calculate and cache
  const progress = calculateSectionProgress(item, itemStatuses)
  itemCache.set(statusKey, progress)

  return progress
}

/**
 * Collect all descendant IDs for cache key generation.
 */
function collectDescendantIds(item: TrackableItem): string[] {
  const ids: string[] = []

  const traverse = (children: TrackableItem[]) => {
    for (const child of children) {
      ids.push(child.id)
      if (child.children.length > 0) {
        traverse(child.children)
      }
    }
  }

  traverse(item.children)
  return ids.sort()
}

/**
 * Clear the progress cache.
 * Call this when item structure changes significantly.
 */
export function clearProgressCache(): void {
  // WeakMap automatically clears when items are garbage collected
  // This function exists for explicit cache invalidation if needed
}

/**
 * Calculate document-level progress (progress across all root items).
 */
export function calculateDocumentProgress(
  items: TrackableItem[],
  itemStatuses: Record<string, TrackingStatus>
): SectionProgress {
  let total = 0
  let completed = 0

  const traverse = (itemList: TrackableItem[]) => {
    for (const item of itemList) {
      total++
      const status = itemStatuses[item.id] ?? 'pending'
      if (status === 'complete') {
        completed++
      }
      if (item.children.length > 0) {
        traverse(item.children)
      }
    }
  }

  traverse(items)
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100)

  return {
    completed,
    total,
    percentage,
  }
}
