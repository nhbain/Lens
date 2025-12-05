/**
 * Navigation and resume functionality types.
 * Defines data structures for scroll position persistence and in-progress item tracking.
 */

import type { TrackableItem } from '../parser/types'

/**
 * Stored scroll position for a document.
 * Enables restoring scroll position when returning to a previously viewed document.
 */
export interface ScrollPosition {
  /** Absolute path to the document */
  documentPath: string
  /** Scroll offset from top in pixels */
  scrollTop: number
  /** Optional ID of the item that was focused/selected */
  focusedItemId?: string
  /** ISO timestamp when this position was saved */
  savedAt: string
}

/**
 * Summary of an in-progress item for display in the resume section.
 * Combines item data with file context for navigation.
 */
export interface InProgressItemSummary {
  /** The trackable item that is in progress */
  item: TrackableItem
  /** Absolute path to the file containing this item */
  filePath: string
  /** Display name of the file */
  fileName: string
  /** ISO timestamp when this item's status was last updated */
  lastWorkedAt: string
}

/**
 * Target for navigation to a specific item in a document.
 * Used when clicking on an in-progress item to jump to its location.
 */
export interface NavigationTarget {
  /** Absolute path to the file to navigate to */
  filePath: string
  /** Optional ID of the specific item to scroll to and highlight */
  targetItemId?: string
  /** Optional saved scroll position to restore */
  scrollPosition?: ScrollPosition
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard for ScrollPosition.
 */
export function isScrollPosition(value: unknown): value is ScrollPosition {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    typeof obj.documentPath === 'string' &&
    typeof obj.scrollTop === 'number' &&
    typeof obj.savedAt === 'string' &&
    (obj.focusedItemId === undefined || typeof obj.focusedItemId === 'string')
  )
}

/**
 * Type guard for InProgressItemSummary.
 */
export function isInProgressItemSummary(value: unknown): value is InProgressItemSummary {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    typeof obj.item === 'object' &&
    obj.item !== null &&
    typeof obj.filePath === 'string' &&
    typeof obj.fileName === 'string' &&
    typeof obj.lastWorkedAt === 'string'
  )
}

/**
 * Type guard for NavigationTarget.
 */
export function isNavigationTarget(value: unknown): value is NavigationTarget {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    typeof obj.filePath === 'string' &&
    (obj.targetItemId === undefined || typeof obj.targetItemId === 'string') &&
    (obj.scrollPosition === undefined || isScrollPosition(obj.scrollPosition))
  )
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a new ScrollPosition for a document.
 */
export function createScrollPosition(
  documentPath: string,
  scrollTop: number,
  focusedItemId?: string
): ScrollPosition {
  return {
    documentPath,
    scrollTop,
    focusedItemId,
    savedAt: new Date().toISOString(),
  }
}

/**
 * Creates a NavigationTarget for navigating to a specific item.
 */
export function createNavigationTarget(
  filePath: string,
  targetItemId?: string
): NavigationTarget {
  return {
    filePath,
    targetItemId,
  }
}
