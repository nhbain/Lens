/**
 * DocumentView component.
 * Renders a parsed markdown document with trackable items for progress tracking.
 * Supports collapsible tree view for hierarchical navigation.
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'
import type { DocumentViewProps } from './types'
import { TrackableItemRow } from './TrackableItemRow'
import { DocumentHeader } from './DocumentHeader'
import { useCollapseState } from '@/hooks/useCollapseState'
import { useDocumentFilters } from '@/hooks/useDocumentFilters'
import { useTreeKeyboardNavigation } from '@/hooks/useTreeKeyboardNavigation'
import { calculateSectionProgress, calculateDocumentProgress, type SectionProgress } from '@/lib/progress'
import './DocumentView.css'

/**
 * Count total items in a tree (for empty check).
 */
const countItems = (items: TrackableItem[]): number => {
  let count = 0
  const traverse = (itemList: TrackableItem[]) => {
    for (const item of itemList) {
      count++
      if (item.children.length > 0) {
        traverse(item.children)
      }
    }
  }
  traverse(items)
  return count
}

/**
 * Renders a parsed markdown document with interactive trackable items.
 * Supports displaying headers, list items, and checkboxes with status tracking.
 * Features collapsible tree structure for headers with children.
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
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [highlightedItemId, setHighlightedItemId] = useState<string | null>(null)
  const hasScrolledRef = useRef(false)

  // Collapse state management
  const {
    isCollapsed,
    toggleCollapse,
    collapseAll,
    expandAll,
    collapsedItems,
  } = useCollapseState({
    filePath: filePath ?? '',
    tree: items,
  })

  // Filter and search state
  const {
    activeFilter,
    searchQuery,
    setFilter,
    setSearchQuery,
    clearSearch,
    filterItems,
    countByStatus,
    isFiltered,
  } = useDocumentFilters()

  // Count total items for empty check
  const totalItems = useMemo(() => countItems(items), [items])

  // Filter items based on current filter and search
  const filteredItems = useMemo(() => {
    return filterItems(items, itemStatuses)
  }, [filterItems, items, itemStatuses])

  // Calculate status counts (from original items, not filtered)
  const statusCounts = useMemo(() => {
    return countByStatus(items, itemStatuses)
  }, [countByStatus, items, itemStatuses])

  // Calculate overall document progress
  const documentProgress = useMemo(() => {
    return calculateDocumentProgress(items, itemStatuses)
  }, [items, itemStatuses])

  // Keyboard navigation
  const {
    focusedItemId,
    handleKeyDown,
    containerRef: keyboardContainerRef,
  } = useTreeKeyboardNavigation({
    items: filteredItems,
    collapsedItems,
    itemStatuses,
    onToggleCollapse: toggleCollapse,
    onExpandAll: expandAll,
    onCollapseAll: collapseAll,
    onStatusChange: onItemStatusChange,
    searchInputRef,
    onClearSearch: clearSearch,
  })

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
  }, [targetItemId, items])

  // Reset scroll flag when targetItemId changes
  useEffect(() => {
    hasScrolledRef.current = false
  }, [targetItemId])

  const getItemStatus = useCallback((itemId: string): TrackingStatus => {
    return itemStatuses[itemId] ?? 'pending'
  }, [itemStatuses])

  // Calculate progress for headers with children
  const getItemProgress = useCallback((item: TrackableItem): SectionProgress | undefined => {
    if (item.type !== 'header' || item.children.length === 0) {
      return undefined
    }
    return calculateSectionProgress(item, itemStatuses)
  }, [itemStatuses])

  const handleItemClick = useCallback((item: TrackableItem) => {
    onItemClick?.(item)
  }, [onItemClick])

  const handleItemActivate = useCallback((item: TrackableItem) => {
    // Activation cycles through statuses
    const currentStatus = getItemStatus(item.id)
    const nextStatus: TrackingStatus =
      currentStatus === 'pending'
        ? 'in_progress'
        : currentStatus === 'in_progress'
          ? 'complete'
          : 'pending'
    onItemStatusChange?.(item.id, nextStatus)
  }, [getItemStatus, onItemStatusChange])

  const handleToggleCollapse = useCallback((item: TrackableItem) => {
    toggleCollapse(item.id)
  }, [toggleCollapse])

  // Combine focused item from keyboard navigation and highlighted from scroll-to-target
  const activeFocusId = focusedItemId ?? highlightedItemId

  /**
   * Recursively render tree items with collapse/expand support.
   * Note: Not wrapped in useCallback because recursive functions can't reference themselves in the deps array.
   */
  function renderTreeItems(treeItems: TrackableItem[], depth: number = 0): React.ReactNode {
    return treeItems.map((item) => {
      const hasChildren = item.children.length > 0
      const collapsed = isCollapsed(item.id)
      const showChildren = hasChildren && !collapsed

      return (
        <div key={item.id} className="tree-node" style={{ '--tree-depth': depth } as React.CSSProperties}>
          <TrackableItemRow
            item={item}
            status={getItemStatus(item.id)}
            isFocused={item.id === activeFocusId}
            hasChildren={hasChildren}
            isCollapsed={collapsed}
            onToggleCollapse={handleToggleCollapse}
            onClick={handleItemClick}
            onActivate={handleItemActivate}
            progress={getItemProgress(item)}
            searchQuery={searchQuery}
          />
          {hasChildren && (
            <div
              className={`tree-children ${collapsed ? 'tree-children--collapsed' : 'tree-children--expanded'}`}
              aria-hidden={collapsed}
            >
              {showChildren && renderTreeItems(item.children, depth + 1)}
            </div>
          )}
        </div>
      )
    })
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

  if (totalItems === 0) {
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

  // Show empty state for filtered results
  const filteredCount = countItems(filteredItems)
  const showNoResults = isFiltered && filteredCount === 0

  return (
    <div className="document-view">
      <DocumentHeader
        title={title}
        filePath={filePath}
        progress={documentProgress}
        activeFilter={activeFilter}
        onFilterChange={setFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchClear={clearSearch}
        statusCounts={statusCounts}
        onExpandAll={expandAll}
        onCollapseAll={collapseAll}
        searchInputRef={searchInputRef}
      />
      {showNoResults ? (
        <div className="document-view-no-results">
          <p className="document-view-no-results-text">
            No items match your filter
          </p>
          <button
            type="button"
            className="document-view-clear-filter"
            onClick={() => {
              setFilter('all')
              clearSearch()
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div
          ref={(el) => {
            // Combine refs
            contentRef.current = el
            if (keyboardContainerRef) {
              keyboardContainerRef.current = el
            }
          }}
          className="document-view-content"
          role="tree"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-activedescendant={activeFocusId ?? undefined}
        >
          {renderTreeItems(filteredItems)}
        </div>
      )}
    </div>
  )
}
