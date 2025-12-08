/**
 * Progress calculation logic.
 * Calculates parent progress based on children's statuses.
 */

import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'
import { createEmptyProgress, type ParentProgress } from './types'

/**
 * Calculates progress for a parent item based on its children's statuses.
 *
 * @param children - Array of child items
 * @param statuses - Map of item IDs to their tracking status
 * @returns ParentProgress with counts and percentage
 *
 * @example
 * ```ts
 * const progress = calculateChildrenProgress(item.children, itemStatuses)
 * console.log(`${progress.complete}/${progress.total} complete (${progress.percentage}%)`)
 * ```
 */
export const calculateChildrenProgress = (
  children: TrackableItem[],
  statuses: Record<string, TrackingStatus>
): ParentProgress => {
  if (children.length === 0) {
    return createEmptyProgress()
  }

  let complete = 0
  let inProgress = 0
  let pending = 0

  for (const child of children) {
    const status = statuses[child.id] ?? 'pending'
    switch (status) {
      case 'complete':
        complete++
        break
      case 'in_progress':
        inProgress++
        break
      case 'pending':
      default:
        pending++
        break
    }
  }

  const total = children.length
  const percentage = total > 0 ? Math.round((complete / total) * 100) : 0

  return {
    total,
    complete,
    inProgress,
    pending,
    percentage,
  }
}

/**
 * Calculates progress recursively including all nested descendants.
 *
 * @param item - Parent item with children
 * @param statuses - Map of item IDs to their tracking status
 * @returns ParentProgress with counts and percentage for all descendants
 *
 * @example
 * ```ts
 * const progress = calculateDeepProgress(rootItem, itemStatuses)
 * // Includes all nested items, not just direct children
 * ```
 */
export const calculateDeepProgress = (
  item: TrackableItem,
  statuses: Record<string, TrackingStatus>
): ParentProgress => {
  const progress = createEmptyProgress()

  const traverse = (items: TrackableItem[]) => {
    for (const child of items) {
      const status = statuses[child.id] ?? 'pending'
      progress.total++
      switch (status) {
        case 'complete':
          progress.complete++
          break
        case 'in_progress':
          progress.inProgress++
          break
        case 'pending':
        default:
          progress.pending++
          break
      }

      // Recurse into children
      if (child.children.length > 0) {
        traverse(child.children)
      }
    }
  }

  traverse(item.children)

  progress.percentage = progress.total > 0 ? Math.round((progress.complete / progress.total) * 100) : 0

  return progress
}

/**
 * Determines what status a parent should have based on its children.
 *
 * Rules:
 * - All children complete → parent complete
 * - Any children in_progress → parent in_progress
 * - Otherwise → parent pending
 *
 * @param children - Array of child items
 * @param statuses - Map of item IDs to their tracking status
 * @returns Recommended status for the parent
 *
 * @example
 * ```ts
 * const parentStatus = deriveParentStatus(item.children, itemStatuses)
 * if (parentStatus !== currentStatus) {
 *   updateStatus(item.id, parentStatus)
 * }
 * ```
 */
export const deriveParentStatus = (
  children: TrackableItem[],
  statuses: Record<string, TrackingStatus>
): TrackingStatus => {
  if (children.length === 0) {
    return 'pending'
  }

  let allComplete = true
  let anyInProgress = false

  for (const child of children) {
    const status = statuses[child.id] ?? 'pending'
    if (status !== 'complete') {
      allComplete = false
    }
    if (status === 'in_progress') {
      anyInProgress = true
    }
  }

  if (allComplete) {
    return 'complete'
  }
  if (anyInProgress) {
    return 'in_progress'
  }
  return 'pending'
}

/**
 * Derives parent status recursively, considering all nested descendants.
 *
 * Transition rules:
 * - All descendants complete → parent complete
 * - Any descendant in_progress → parent in_progress
 * - Parent was in_progress AND any progress made (complete > 0) → parent stays in_progress
 * - All descendants pending → parent pending
 *
 * @param item - Parent item with children
 * @param statuses - Map of item IDs to their tracking status
 * @param currentParentStatus - The current status of the parent (for transition rules)
 * @returns Recommended status for the parent based on all descendants
 */
export const deriveDeepParentStatus = (
  item: TrackableItem,
  statuses: Record<string, TrackingStatus>,
  currentParentStatus: TrackingStatus = 'pending'
): TrackingStatus => {
  const progress = calculateDeepProgress(item, statuses)

  if (progress.total === 0) {
    return 'pending'
  }

  // All descendants complete → parent complete
  if (progress.complete === progress.total) {
    return 'complete'
  }

  // Any descendant in_progress → parent in_progress
  if (progress.inProgress > 0) {
    return 'in_progress'
  }

  // If parent was in_progress and some work has been done (not all pending),
  // keep it in_progress until all complete or all reset to pending
  if (currentParentStatus === 'in_progress' && progress.complete > 0) {
    return 'in_progress'
  }

  // All descendants pending → parent pending
  return 'pending'
}

/**
 * Finds all ancestor items that need their status updated when a child changes.
 *
 * @param itemId - ID of the item that changed
 * @param items - Flat list of all items
 * @returns Array of ancestor item IDs from child to root
 */
export const findAncestors = (
  itemId: string,
  items: TrackableItem[]
): string[] => {
  const ancestors: string[] = []
  const itemMap = new Map<string, TrackableItem>()
  const parentMap = new Map<string, string>()

  // Build maps for quick lookup
  const buildMaps = (itemList: TrackableItem[], parentId?: string) => {
    for (const item of itemList) {
      itemMap.set(item.id, item)
      if (parentId) {
        parentMap.set(item.id, parentId)
      }
      if (item.children.length > 0) {
        buildMaps(item.children, item.id)
      }
    }
  }

  buildMaps(items)

  // Walk up the tree
  let currentId = itemId
  while (parentMap.has(currentId)) {
    const parentId = parentMap.get(currentId)!
    ancestors.push(parentId)
    currentId = parentId
  }

  return ancestors
}

/**
 * Calculates which parent statuses need to be updated when a child status changes.
 *
 * @param changedItemId - ID of the item that changed
 * @param items - Hierarchical list of items (tree structure)
 * @param statuses - Current statuses (including the changed item's new status)
 * @returns Map of item IDs to their new derived statuses
 *
 * @example
 * ```ts
 * const updates = propagateStatusChange('item-5', rootItems, newStatuses)
 * for (const [id, status] of updates) {
 *   await setStatus(id, status)
 * }
 * ```
 */
export const propagateStatusChange = (
  changedItemId: string,
  items: TrackableItem[],
  statuses: Record<string, TrackingStatus>
): Map<string, TrackingStatus> => {
  const updates = new Map<string, TrackingStatus>()
  const ancestors = findAncestors(changedItemId, items)

  // Build item lookup map
  const itemMap = new Map<string, TrackableItem>()
  const buildMap = (itemList: TrackableItem[]) => {
    for (const item of itemList) {
      itemMap.set(item.id, item)
      if (item.children.length > 0) {
        buildMap(item.children)
      }
    }
  }
  buildMap(items)

  // Check each ancestor for status changes
  // Use deriveDeepParentStatus to check ALL descendants, not just direct children
  for (const ancestorId of ancestors) {
    const ancestor = itemMap.get(ancestorId)
    if (!ancestor) continue

    const currentStatus = statuses[ancestorId] ?? 'pending'
    const derivedStatus = deriveDeepParentStatus(ancestor, statuses, currentStatus)

    if (derivedStatus !== currentStatus) {
      updates.set(ancestorId, derivedStatus)
      // Update statuses for subsequent ancestor calculations
      statuses[ancestorId] = derivedStatus
    }
  }

  return updates
}
