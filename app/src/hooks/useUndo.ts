/**
 * useUndo hook.
 * Provides undo functionality for status changes with timeout-based expiration.
 */

import { useState, useCallback, useEffect, useRef } from 'react'
import type { StatusChangeEvent } from '@/lib/progress/types'

/** Default timeout in milliseconds before undo expires */
const DEFAULT_UNDO_TIMEOUT_MS = 5000

export interface UndoableChange {
  /** The status change event */
  event: StatusChangeEvent
  /** Timestamp when the change was recorded */
  recordedAt: number
}

export interface UseUndoOptions {
  /** Timeout in milliseconds before undo expires (default: 5000) */
  timeoutMs?: number
  /** Callback when undo is invoked */
  onUndo?: (event: StatusChangeEvent) => void
}

export interface UseUndoResult {
  /** The last undoable change, or null if none */
  lastChange: UndoableChange | null
  /** Whether an undo action is available */
  canUndo: boolean
  /** Remaining time in milliseconds before undo expires */
  remainingTimeMs: number
  /** Record a new status change for potential undo */
  recordChange: (event: StatusChangeEvent) => void
  /** Execute the undo action */
  undo: () => void
  /** Clear the undo state */
  clearUndo: () => void
}

/**
 * Hook for providing undo functionality for status changes.
 *
 * Features:
 * - Tracks last status change for undo
 * - Auto-expires after timeout (default: 5 seconds)
 * - Provides remaining time for UI countdown
 * - Supports Ctrl+Z keyboard shortcut (when enabled externally)
 *
 * @example
 * ```tsx
 * const { canUndo, remainingTimeMs, recordChange, undo } = useUndo({
 *   onUndo: (event) => {
 *     // Revert the status change
 *     setStatus(event.itemId, event.oldStatus)
 *   },
 * })
 *
 * // After a status change
 * recordChange(changeEvent)
 *
 * // Show undo toast if available
 * {canUndo && (
 *   <Toast onUndo={undo}>
 *     Undo ({Math.ceil(remainingTimeMs / 1000)}s)
 *   </Toast>
 * )}
 * ```
 */
export const useUndo = ({
  timeoutMs = DEFAULT_UNDO_TIMEOUT_MS,
  onUndo,
}: UseUndoOptions = {}): UseUndoResult => {
  const [lastChange, setLastChange] = useState<UndoableChange | null>(null)
  const [remainingTimeMs, setRemainingTimeMs] = useState(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timers
  const clearTimers = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  // Clear undo state
  const clearUndo = useCallback(() => {
    clearTimers()
    setLastChange(null)
    setRemainingTimeMs(0)
  }, [clearTimers])

  // Record a new status change
  const recordChange = useCallback(
    (event: StatusChangeEvent) => {
      clearTimers()

      const change: UndoableChange = {
        event,
        recordedAt: Date.now(),
      }

      setLastChange(change)
      setRemainingTimeMs(timeoutMs)

      // Set expiration timeout
      timeoutRef.current = setTimeout(() => {
        setLastChange(null)
        setRemainingTimeMs(0)
      }, timeoutMs)

      // Update remaining time every 100ms
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - change.recordedAt
        const remaining = Math.max(0, timeoutMs - elapsed)
        setRemainingTimeMs(remaining)

        if (remaining <= 0) {
          clearTimers()
        }
      }, 100)
    },
    [timeoutMs, clearTimers]
  )

  // Execute undo
  const undo = useCallback(() => {
    if (!lastChange) return

    const event = lastChange.event
    clearUndo()

    // Invoke callback with the original status to revert to
    onUndo?.({
      itemId: event.itemId,
      oldStatus: event.newStatus, // Current status (to be reverted from)
      newStatus: event.oldStatus, // Original status (to revert to)
      timestamp: new Date().toISOString(),
    })
  }, [lastChange, clearUndo, onUndo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
    }
  }, [clearTimers])

  return {
    lastChange,
    canUndo: lastChange !== null,
    remainingTimeMs,
    recordChange,
    undo,
    clearUndo,
  }
}
