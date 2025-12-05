/**
 * useScrollPosition hook.
 * Tracks and restores scroll position for document views.
 * Enables seamless resume when returning to a previously viewed document.
 */

import { useEffect, useCallback, useRef, useState, useMemo, RefObject } from 'react'
import {
  saveScrollPosition,
  getScrollPosition,
} from '@/lib/navigation/scroll-manager'
import type { ScrollPosition } from '@/lib/navigation/types'

export interface UseScrollPositionOptions {
  /** Absolute path to the document being viewed */
  documentPath: string
  /** Ref to the scrollable container element */
  containerRef: RefObject<HTMLElement | null>
  /** Optional ID of the item to scroll to on mount */
  targetItemId?: string
  /** Debounce delay for scroll event handling in milliseconds */
  debounceMs?: number
  /** Whether scroll position tracking is enabled */
  enabled?: boolean
}

export interface UseScrollPositionResult {
  /** Saved scroll position for the current document, or null if none */
  savedPosition: ScrollPosition | null
  /** Manually save the current scroll position */
  saveCurrentPosition: (focusedItemId?: string) => void
  /** Scroll to a specific item by ID */
  scrollToItem: (itemId: string) => void
  /** Restore the saved scroll position */
  restorePosition: () => void
}

/**
 * Hook for managing scroll position in document views.
 *
 * Features:
 * - Automatically saves scroll position on scroll (debounced)
 * - Saves position when component unmounts
 * - Restores saved position on mount
 * - Supports scrolling to specific items by ID
 *
 * @param options - Configuration options
 * @returns Scroll position management functions and state
 */
export const useScrollPosition = ({
  documentPath,
  containerRef,
  targetItemId,
  debounceMs = 100,
  enabled = true,
}: UseScrollPositionOptions): UseScrollPositionResult => {
  // Use a version counter to trigger re-computation of saved position
  const [version, setVersion] = useState(0)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasRestoredRef = useRef(false)

  // Compute saved position from the scroll manager
  // useMemo ensures we only recompute when deps change
  const savedPosition = useMemo(() => {
    // version is in deps to allow forcing re-computation
    void version
    if (!enabled || !documentPath) return null
    return getScrollPosition(documentPath)
  }, [enabled, documentPath, version])

  /**
   * Save the current scroll position.
   */
  const saveCurrentPosition = useCallback(
    (focusedItemId?: string) => {
      if (!enabled || !containerRef.current || !documentPath) return

      const scrollTop = containerRef.current.scrollTop
      saveScrollPosition(documentPath, scrollTop, focusedItemId)
      // Increment version to trigger re-computation of savedPosition
      setVersion((v) => v + 1)
    },
    [containerRef, documentPath, enabled]
  )

  /**
   * Scroll to a specific item by ID.
   */
  const scrollToItem = useCallback(
    (itemId: string) => {
      if (!containerRef.current) return

      const itemElement = containerRef.current.querySelector(
        `[data-item-id="${itemId}"]`
      )

      if (itemElement) {
        itemElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    },
    [containerRef]
  )

  /**
   * Restore the saved scroll position.
   */
  const restorePosition = useCallback(() => {
    if (!containerRef.current || !savedPosition) return

    containerRef.current.scrollTop = savedPosition.scrollTop
  }, [containerRef, savedPosition])

  // Handle scroll events with debouncing
  useEffect(() => {
    if (!enabled || !containerRef.current || !documentPath) return

    const container = containerRef.current

    const handleScroll = () => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        saveCurrentPosition()
      }, debounceMs)
    }

    container.addEventListener('scroll', handleScroll)

    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [containerRef, documentPath, debounceMs, enabled, saveCurrentPosition])

  // Restore position or scroll to target item on mount
  useEffect(() => {
    if (!enabled || !containerRef.current || hasRestoredRef.current) return

    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      if (targetItemId) {
        // Scroll to specific target item
        scrollToItem(targetItemId)
      } else if (savedPosition) {
        // Restore saved scroll position
        restorePosition()
      }
      hasRestoredRef.current = true
    }, 50)

    return () => clearTimeout(timer)
  }, [
    containerRef,
    enabled,
    targetItemId,
    savedPosition,
    scrollToItem,
    restorePosition,
  ])

  // Save position on unmount
  useEffect(() => {
    if (!enabled || !documentPath) return

    // Copy ref value to local variable for cleanup (ESLint rule)
    const container = containerRef.current
    return () => {
      if (container) {
        saveCurrentPosition()
      }
    }
  }, [containerRef, documentPath, enabled, saveCurrentPosition])

  return {
    savedPosition,
    saveCurrentPosition,
    scrollToItem,
    restorePosition,
  }
}
