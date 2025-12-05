/**
 * DocumentView component.
 * Renders a parsed markdown document with trackable items for progress tracking.
 */

import { useRef, useEffect, useState, useMemo } from 'react'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'
import type { DocumentViewProps } from './types'
import { TrackableItemRow } from './TrackableItemRow'
import './DocumentView.css'

/**
 * Flatten a tree of trackable items into a single list while preserving order.
 * Each item in the tree is followed by its children recursively.
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
 * Renders a parsed markdown document with interactive trackable items.
 * Supports displaying headers, list items, and checkboxes with status tracking.
 */
export const DocumentView = ({
  items,
  title,
  filePath,
  itemStatuses = {},
  onItemClick,
  onItemStatusChange,
  isLoading = false,
  targetItemId,
}: DocumentViewProps) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const hasScrolledRef = useRef(false)

  // Flatten items to ensure all nested items are rendered
  const flatItems = useMemo(() => flattenItems(items), [items])

  // Scroll to target item and highlight it
  useEffect(() => {
    if (!targetItemId || !contentRef.current || hasScrolledRef.current) {
      return
    }

    // Small delay to ensure items are rendered
    const timer = setTimeout(() => {
      const targetElement = contentRef.current?.querySelector(
        `[data-item-id="${targetItemId}"]`
      )

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        setHighlightedItemId(targetItemId)
        hasScrolledRef.current = true

        // Remove highlight after animation
        setTimeout(() => {
          setHighlightedItemId(null)
        }, 2000)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [targetItemId, flatItems])

  // Reset scroll flag when targetItemId changes
  useEffect(() => {
    hasScrolledRef.current = false
  }, [targetItemId])

  const getItemStatus = (itemId: string): TrackingStatus => {
    return itemStatuses[itemId] ?? 'pending'
  }

  const handleItemClick = (item: TrackableItem) => {
    onItemClick?.(item)
  }

  const handleItemActivate = (item: TrackableItem) => {
    // For now, activation cycles through statuses
    // This will be properly implemented in Story 7
    const currentStatus = getItemStatus(item.id)
    const nextStatus: TrackingStatus =
      currentStatus === 'pending'
        ? 'in_progress'
        : currentStatus === 'in_progress'
          ? 'complete'
          : 'pending'
    onItemStatusChange?.(item.id, nextStatus)
  }

  if (isLoading) {
    return (
      <div className="document-view document-view--loading" aria-busy="true">
        <div className="document-view-loading-indicator">
          <span className="document-view-loading-spinner" aria-hidden="true" />
          <span>Loading document...</span>
        </div>
      </div>
    )
  }

  if (flatItems.length === 0) {
    return (
      <div className="document-view document-view--empty">
        <div className="document-view-empty-state">
          <p className="document-view-empty-title">No trackable items found</p>
          <p className="document-view-empty-message">
            This document doesn&apos;t contain any headers, lists, or checkboxes
            to track.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="document-view">
      {(title ?? filePath) && (
        <header className="document-view-header">
          {title && <h1 className="document-view-title">{title}</h1>}
          {filePath && (
            <p className="document-view-filepath" title={filePath}>
              {filePath}
            </p>
          )}
        </header>
      )}
      <div ref={contentRef} className="document-view-content" role="list">
        {flatItems.map((item) => (
          <TrackableItemRow
            key={item.id}
            item={item}
            status={getItemStatus(item.id)}
            isFocused={item.id === highlightedItemId}
            onClick={handleItemClick}
            onActivate={handleItemActivate}
          />
        ))}
      </div>
    </div>
  )
}
