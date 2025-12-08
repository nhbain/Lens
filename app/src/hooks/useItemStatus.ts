/**
 * useItemStatus hook.
 * Provides state management for item status changes with optimistic updates.
 */

import { useState, useCallback } from 'react'
import type { TrackingStatus } from '@/lib/parser/types'
import { getNextStatus, type StatusChangeEvent } from '@/lib/progress/types'
import { saveFileState } from '@/lib/state'
import type { FileTrackingState, ItemTrackingState } from '@/lib/state/types'

export interface UseItemStatusOptions {
  /** Path to the source markdown file */
  filePath: string
  /** Initial tracking state (loaded from disk) */
  initialState: FileTrackingState | null
  /** Callback when status changes (for parent notification) */
  onStatusChange?: (event: StatusChangeEvent) => void
  /** Callback when an error occurs */
  onError?: (error: Error) => void
}

export interface UseItemStatusResult {
  /** Map of item IDs to their current status */
  statuses: Record<string, TrackingStatus>
  /** Whether a save operation is in progress */
  isSaving: boolean
  /** Last error that occurred, or null */
  lastError: Error | null
  /** Toggle an item's status to the next in the cycle */
  toggleStatus: (itemId: string) => Promise<void>
  /** Set a specific status for an item */
  setStatus: (itemId: string, status: TrackingStatus) => Promise<void>
  /** Get the current status of an item */
  getStatus: (itemId: string) => TrackingStatus
  /** Update the internal state (for external sync) */
  syncState: (state: FileTrackingState | null) => void
}

/**
 * Extracts statuses from file tracking state.
 */
const extractStatuses = (state: FileTrackingState | null): Record<string, TrackingStatus> => {
  if (!state) return {}

  const statuses: Record<string, TrackingStatus> = {}
  for (const [itemId, itemState] of Object.entries(state.items)) {
    statuses[itemId] = itemState.status
  }
  return statuses
}

/**
 * Hook for managing item status changes with optimistic updates.
 *
 * Features:
 * - Optimistic UI updates (UI updates immediately, persists in background)
 * - Automatic rollback on persistence failure
 * - Status cycling (pending → in_progress → complete → pending)
 * - Error handling with callbacks
 *
 * @example
 * ```tsx
 * const { statuses, toggleStatus, getStatus, isSaving } = useItemStatus({
 *   filePath: '/path/to/file.md',
 *   initialState: loadedState,
 *   onStatusChange: (event) => console.log('Status changed:', event),
 * })
 *
 * // In a click handler
 * const handleClick = (itemId: string) => {
 *   toggleStatus(itemId)
 * }
 * ```
 */
export const useItemStatus = ({
  filePath,
  initialState,
  onStatusChange,
  onError,
}: UseItemStatusOptions): UseItemStatusResult => {
  const [trackingState, setTrackingState] = useState<FileTrackingState | null>(initialState)
  const [isSaving, setIsSaving] = useState(false)
  const [lastError, setLastError] = useState<Error | null>(null)

  // Derive statuses from tracking state
  const statuses = extractStatuses(trackingState)

  /**
   * Gets the current status of an item.
   */
  const getStatus = useCallback(
    (itemId: string): TrackingStatus => {
      return trackingState?.items[itemId]?.status ?? 'pending'
    },
    [trackingState]
  )

  /**
   * Sets a specific status for an item with optimistic update.
   */
  const setStatus = useCallback(
    async (itemId: string, newStatus: TrackingStatus): Promise<void> => {
      const oldStatus = getStatus(itemId)

      // Skip if status is the same
      if (oldStatus === newStatus) return

      const timestamp = new Date().toISOString()

      // Create new item state
      const newItemState: ItemTrackingState = {
        itemId,
        status: newStatus,
        updatedAt: timestamp,
      }

      // Optimistic update
      const previousState = trackingState
      const updatedState: FileTrackingState = trackingState
        ? {
            ...trackingState,
            items: {
              ...trackingState.items,
              [itemId]: newItemState,
            },
            updatedAt: timestamp,
          }
        : {
            sourcePath: filePath,
            contentHash: '',
            items: {
              [itemId]: newItemState,
            },
            collapsedItems: {},
            createdAt: timestamp,
            updatedAt: timestamp,
          }

      setTrackingState(updatedState)
      setLastError(null)
      setIsSaving(true)

      // Emit status change event
      const event: StatusChangeEvent = {
        itemId,
        oldStatus,
        newStatus,
        timestamp,
      }
      onStatusChange?.(event)

      // Persist to disk
      try {
        await saveFileState(updatedState)
      } catch (err) {
        // Rollback on error
        setTrackingState(previousState)
        const error = err instanceof Error ? err : new Error('Failed to save status')
        setLastError(error)
        onError?.(error)
      } finally {
        setIsSaving(false)
      }
    },
    [filePath, trackingState, getStatus, onStatusChange, onError]
  )

  /**
   * Toggles an item's status to the next in the cycle.
   */
  const toggleStatus = useCallback(
    async (itemId: string): Promise<void> => {
      const currentStatus = getStatus(itemId)
      const nextStatus = getNextStatus(currentStatus)
      await setStatus(itemId, nextStatus)
    },
    [getStatus, setStatus]
  )

  /**
   * Syncs the internal state with external state (for external sync).
   */
  const syncState = useCallback((state: FileTrackingState | null) => {
    setTrackingState(state)
  }, [])

  return {
    statuses,
    isSaving,
    lastError,
    toggleStatus,
    setStatus,
    getStatus,
    syncState,
  }
}
