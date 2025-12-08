/**
 * useDocumentView hook.
 * Provides state management for viewing and tracking a markdown document.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { parseMarkdown, parseDocument } from '@/lib/parser'
import { loadFileState, saveFileState } from '@/lib/state'
import { propagateStatusChange } from '@/lib/progress'
import type { TrackingStatus, ParsedDocument } from '@/lib/parser/types'
import type { FileTrackingState, ItemTrackingState } from '@/lib/state/types'

export interface UseDocumentViewOptions {
  /** Path to the markdown file to load */
  filePath: string
  /** Raw content of the file (if already loaded) */
  content?: string
}

export interface UseDocumentViewResult {
  /** Parsed document with trackable items */
  document: ParsedDocument | null
  /** Map of item IDs to their tracking status */
  itemStatuses: Record<string, TrackingStatus>
  /** Whether the document is currently loading */
  isLoading: boolean
  /** Error message if loading failed */
  error: string | null
  /** Update the status of a specific item */
  updateItemStatus: (itemId: string, status: TrackingStatus) => Promise<void>
  /** Reload the document from disk */
  reload: () => Promise<void>
}

/**
 * Hook for loading and managing state for a document view.
 * Handles parsing, state loading, and status updates.
 */
export const useDocumentView = ({
  filePath,
  content,
}: UseDocumentViewOptions): UseDocumentViewResult => {
  const [document, setDocument] = useState<ParsedDocument | null>(null)
  const [trackingState, setTrackingState] = useState<FileTrackingState | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Compute item statuses from tracking state
  const itemStatuses = useMemo(() => {
    if (!trackingState) return {}

    const statuses: Record<string, TrackingStatus> = {}
    for (const [itemId, itemState] of Object.entries(trackingState.items)) {
      statuses[itemId] = itemState.status
    }
    return statuses
  }, [trackingState])

  // Load document and state
  const loadDocument = useCallback(async () => {
    if (!content) {
      setIsLoading(false)
      setError('No content provided')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Parse the markdown content
      const ast = parseMarkdown(content)
      const parsed = parseDocument(ast, filePath)
      setDocument(parsed)

      // Load tracking state
      const state = await loadFileState(filePath)
      setTrackingState(state)
    } catch (err) {
      let message: string
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'string') {
        message = err
      } else if (err && typeof err === 'object' && 'message' in err) {
        message = String((err as { message: unknown }).message)
      } else {
        message = `Failed to load document: ${String(err)}`
      }
      console.error('useDocumentView error:', err)
      setError(message)
      setDocument(null)
      setTrackingState(null)
    } finally {
      setIsLoading(false)
    }
  }, [filePath, content])

  // Load on mount and when content changes
  useEffect(() => {
    loadDocument()
  }, [loadDocument])

  // Update item status with parent propagation
  const updateItemStatus = useCallback(
    async (itemId: string, status: TrackingStatus) => {
      if (!document || !filePath) return

      const now = new Date().toISOString()

      // Build updated statuses including the changed item
      const currentStatuses: Record<string, TrackingStatus> = { ...itemStatuses }
      currentStatuses[itemId] = status

      // Calculate parent status updates using the tree structure
      const parentUpdates = propagateStatusChange(itemId, document.tree, currentStatuses)

      // Build all item updates (changed item + affected parents)
      const allUpdates: Record<string, ItemTrackingState> = {
        [itemId]: {
          itemId,
          status,
          updatedAt: now,
        },
      }

      for (const [parentId, parentStatus] of parentUpdates) {
        allUpdates[parentId] = {
          itemId: parentId,
          status: parentStatus,
          updatedAt: now,
        }
      }

      // Optimistic update
      setTrackingState((prev) => {
        if (!prev) {
          return {
            sourcePath: filePath,
            contentHash: '',
            items: allUpdates,
            collapsedItems: {},
            createdAt: now,
            updatedAt: now,
          }
        }

        return {
          ...prev,
          items: {
            ...prev.items,
            ...allUpdates,
          },
          updatedAt: now,
        }
      })

      // Persist to disk
      try {
        const currentState = trackingState ?? {
          sourcePath: filePath,
          contentHash: '',
          items: {},
          collapsedItems: {},
          createdAt: now,
          updatedAt: now,
        }

        const updatedState: FileTrackingState = {
          ...currentState,
          items: {
            ...currentState.items,
            ...allUpdates,
          },
          updatedAt: now,
        }

        await saveFileState(updatedState)
      } catch (err) {
        // Revert optimistic update on error
        setTrackingState(trackingState)
        throw err
      }
    },
    [document, filePath, trackingState, itemStatuses]
  )

  // Reload function
  const reload = useCallback(async () => {
    await loadDocument()
  }, [loadDocument])

  return {
    document,
    itemStatuses,
    isLoading,
    error,
    updateItemStatus,
    reload,
  }
}
