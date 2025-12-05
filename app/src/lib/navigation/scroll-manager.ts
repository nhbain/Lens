/**
 * Scroll position manager.
 * Provides in-memory storage for document scroll positions to enable
 * seamless resume when returning to a previously viewed document.
 */

import type { ScrollPosition } from './types'
import { createScrollPosition } from './types'

/**
 * In-memory storage for scroll positions.
 * Keyed by document path for O(1) lookup.
 */
const scrollPositions = new Map<string, ScrollPosition>()

/**
 * Saves the scroll position for a document.
 * Overwrites any existing position for the same document.
 *
 * @param documentPath - Absolute path to the document
 * @param scrollTop - Scroll offset from top in pixels
 * @param focusedItemId - Optional ID of the focused item
 */
export function saveScrollPosition(
  documentPath: string,
  scrollTop: number,
  focusedItemId?: string
): void {
  const position = createScrollPosition(documentPath, scrollTop, focusedItemId)
  scrollPositions.set(documentPath, position)
}

/**
 * Retrieves the saved scroll position for a document.
 *
 * @param documentPath - Absolute path to the document
 * @returns The saved scroll position, or null if none exists
 */
export function getScrollPosition(documentPath: string): ScrollPosition | null {
  return scrollPositions.get(documentPath) ?? null
}

/**
 * Clears the saved scroll position for a document.
 * Called when a file is removed from tracking.
 *
 * @param documentPath - Absolute path to the document
 * @returns True if a position was cleared, false if none existed
 */
export function clearScrollPosition(documentPath: string): boolean {
  return scrollPositions.delete(documentPath)
}

/**
 * Clears all saved scroll positions.
 * Useful for testing or when resetting app state.
 */
export function clearAllScrollPositions(): void {
  scrollPositions.clear()
}

/**
 * Gets all saved scroll positions.
 * Useful for debugging or persistence.
 *
 * @returns Array of all saved scroll positions
 */
export function getAllScrollPositions(): ScrollPosition[] {
  return Array.from(scrollPositions.values())
}

/**
 * Gets the count of saved scroll positions.
 *
 * @returns Number of documents with saved scroll positions
 */
export function getScrollPositionCount(): number {
  return scrollPositions.size
}
