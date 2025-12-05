/**
 * Progress tracking types.
 * Defines types for status changes and parent progress calculation.
 */

// Re-export TrackingStatus from parser for convenience
export type { TrackingStatus } from '@/lib/parser/types'

/**
 * Event emitted when an item's status changes.
 */
export interface StatusChangeEvent {
  /** ID of the item whose status changed */
  itemId: string
  /** Previous status before the change */
  oldStatus: TrackingStatus
  /** New status after the change */
  newStatus: TrackingStatus
  /** ISO timestamp when the change occurred */
  timestamp: string
}

/**
 * Progress information for a parent item based on its children.
 */
export interface ParentProgress {
  /** Total number of child items */
  total: number
  /** Number of complete child items */
  complete: number
  /** Number of in-progress child items */
  inProgress: number
  /** Number of pending child items */
  pending: number
  /** Completion percentage (0-100) */
  percentage: number
}

/**
 * Import the actual type for the helper function
 */
import type { TrackingStatus } from '@/lib/parser/types'

/**
 * Status cycle order for toggling through statuses.
 * pending → in_progress → complete → pending
 */
const STATUS_CYCLE: TrackingStatus[] = ['pending', 'in_progress', 'complete']

/**
 * Gets the next status in the cycle.
 *
 * @param current - Current status
 * @returns Next status in the cycle
 *
 * @example
 * ```ts
 * getNextStatus('pending')     // 'in_progress'
 * getNextStatus('in_progress') // 'complete'
 * getNextStatus('complete')    // 'pending'
 * ```
 */
export const getNextStatus = (current: TrackingStatus): TrackingStatus => {
  const currentIndex = STATUS_CYCLE.indexOf(current)
  const nextIndex = (currentIndex + 1) % STATUS_CYCLE.length
  return STATUS_CYCLE[nextIndex]
}

/**
 * Gets the previous status in the cycle.
 *
 * @param current - Current status
 * @returns Previous status in the cycle
 *
 * @example
 * ```ts
 * getPreviousStatus('pending')     // 'complete'
 * getPreviousStatus('in_progress') // 'pending'
 * getPreviousStatus('complete')    // 'in_progress'
 * ```
 */
export const getPreviousStatus = (current: TrackingStatus): TrackingStatus => {
  const currentIndex = STATUS_CYCLE.indexOf(current)
  const prevIndex = (currentIndex - 1 + STATUS_CYCLE.length) % STATUS_CYCLE.length
  return STATUS_CYCLE[prevIndex]
}

/**
 * Type guard to check if a value is a valid StatusChangeEvent.
 */
export const isStatusChangeEvent = (value: unknown): value is StatusChangeEvent => {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.itemId === 'string' &&
    typeof obj.oldStatus === 'string' &&
    typeof obj.newStatus === 'string' &&
    typeof obj.timestamp === 'string'
  )
}

/**
 * Type guard to check if a value is a valid ParentProgress.
 */
export const isParentProgress = (value: unknown): value is ParentProgress => {
  if (typeof value !== 'object' || value === null) return false
  const obj = value as Record<string, unknown>
  return (
    typeof obj.total === 'number' &&
    typeof obj.complete === 'number' &&
    typeof obj.inProgress === 'number' &&
    typeof obj.pending === 'number' &&
    typeof obj.percentage === 'number'
  )
}

/**
 * Creates an empty ParentProgress object.
 */
export const createEmptyProgress = (): ParentProgress => ({
  total: 0,
  complete: 0,
  inProgress: 0,
  pending: 0,
  percentage: 0,
})
