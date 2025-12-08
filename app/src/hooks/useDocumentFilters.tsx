/**
 * useDocumentFilters hook.
 * Provides filtering and search functionality for document items.
 */

import { useState, useCallback, useMemo } from 'react'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'

export type StatusFilter = 'all' | 'pending' | 'in_progress' | 'complete'

export interface UseDocumentFiltersOptions {
  /** Initial status filter */
  initialFilter?: StatusFilter
  /** Initial search query */
  initialSearch?: string
}

export interface StatusCounts {
  /** Total items in document */
  all: number
  /** Items with pending status */
  pending: number
  /** Items with in_progress status */
  in_progress: number
  /** Items with complete status */
  complete: number
}

export interface UseDocumentFiltersResult {
  /** Current active status filter */
  activeFilter: StatusFilter
  /** Current search query */
  searchQuery: string
  /** Set the active status filter */
  setFilter: (filter: StatusFilter) => void
  /** Set the search query */
  setSearchQuery: (query: string) => void
  /** Clear the search query */
  clearSearch: () => void
  /** Filter items based on current filter and search */
  filterItems: (items: TrackableItem[], itemStatuses: Record<string, TrackingStatus>) => TrackableItem[]
  /** Count items by status */
  countByStatus: (items: TrackableItem[], itemStatuses: Record<string, TrackingStatus>) => StatusCounts
  /** Check if any filter is active */
  isFiltered: boolean
}

/**
 * Check if an item matches the current filter and search criteria.
 */
function itemMatchesFilter(
  item: TrackableItem,
  itemStatuses: Record<string, TrackingStatus>,
  filter: StatusFilter,
  searchQuery: string
): boolean {
  const status = itemStatuses[item.id] ?? 'pending'

  // Check status filter
  const matchesStatus = filter === 'all' || status === filter

  // Check search query (case-insensitive)
  const matchesSearch =
    searchQuery === '' ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())

  return matchesStatus && matchesSearch
}

/**
 * Check if an item or any of its descendants match the filter.
 * Used to keep parent items visible when children match.
 */
function itemOrDescendantMatches(
  item: TrackableItem,
  itemStatuses: Record<string, TrackingStatus>,
  filter: StatusFilter,
  searchQuery: string
): boolean {
  // Check if this item matches
  if (itemMatchesFilter(item, itemStatuses, filter, searchQuery)) {
    return true
  }

  // Check if any descendant matches
  for (const child of item.children) {
    if (itemOrDescendantMatches(child, itemStatuses, filter, searchQuery)) {
      return true
    }
  }

  return false
}

/**
 * Recursively filter a tree of items.
 * Preserves tree structure: if any descendant matches, all ancestors remain visible.
 */
function filterTree(
  items: TrackableItem[],
  itemStatuses: Record<string, TrackingStatus>,
  filter: StatusFilter,
  searchQuery: string
): TrackableItem[] {
  const result: TrackableItem[] = []

  for (const item of items) {
    // Check if this item or any descendant matches
    if (itemOrDescendantMatches(item, itemStatuses, filter, searchQuery)) {
      // Recursively filter children
      const filteredChildren = filterTree(item.children, itemStatuses, filter, searchQuery)

      // Include item with filtered children
      result.push({
        ...item,
        children: filteredChildren,
      })
    }
  }

  return result
}

/**
 * Count all items in a tree by status.
 */
function countAllItems(
  items: TrackableItem[],
  itemStatuses: Record<string, TrackingStatus>
): StatusCounts {
  const counts: StatusCounts = {
    all: 0,
    pending: 0,
    in_progress: 0,
    complete: 0,
  }

  const traverse = (itemList: TrackableItem[]) => {
    for (const item of itemList) {
      counts.all++
      const status = itemStatuses[item.id] ?? 'pending'
      counts[status]++

      if (item.children.length > 0) {
        traverse(item.children)
      }
    }
  }

  traverse(items)
  return counts
}

/**
 * Hook for managing document filter and search state.
 */
export function useDocumentFilters({
  initialFilter = 'all',
  initialSearch = '',
}: UseDocumentFiltersOptions = {}): UseDocumentFiltersResult {
  const [activeFilter, setActiveFilter] = useState<StatusFilter>(initialFilter)
  const [searchQuery, setSearchQuery] = useState(initialSearch)

  const setFilter = useCallback((filter: StatusFilter) => {
    setActiveFilter(filter)
  }, [])

  const setSearch = useCallback((query: string) => {
    setSearchQuery(query)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery('')
  }, [])

  const filterItems = useCallback(
    (items: TrackableItem[], itemStatuses: Record<string, TrackingStatus>): TrackableItem[] => {
      // If no filter applied, return original items
      if (activeFilter === 'all' && searchQuery === '') {
        return items
      }

      return filterTree(items, itemStatuses, activeFilter, searchQuery)
    },
    [activeFilter, searchQuery]
  )

  const countByStatus = useCallback(
    (items: TrackableItem[], itemStatuses: Record<string, TrackingStatus>): StatusCounts => {
      return countAllItems(items, itemStatuses)
    },
    []
  )

  const isFiltered = useMemo(() => {
    return activeFilter !== 'all' || searchQuery !== ''
  }, [activeFilter, searchQuery])

  return {
    activeFilter,
    searchQuery,
    setFilter,
    setSearchQuery: setSearch,
    clearSearch,
    filterItems,
    countByStatus,
    isFiltered,
  }
}

/**
 * Highlight matching search text by wrapping in strong tags.
 * Returns an array of React nodes with matching text wrapped.
 */
export function highlightSearchText(
  text: string,
  searchQuery: string
): React.ReactNode[] {
  if (!searchQuery) {
    return [text]
  }

  const parts: React.ReactNode[] = []
  const lowerText = text.toLowerCase()
  const lowerQuery = searchQuery.toLowerCase()
  let lastIndex = 0
  let index = lowerText.indexOf(lowerQuery)
  let keyIndex = 0

  while (index !== -1) {
    // Add text before match
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index))
    }

    // Add highlighted match
    const matchText = text.slice(index, index + searchQuery.length)
    parts.push(
      <strong key={keyIndex++} className="search-highlight">
        {matchText}
      </strong>
    )

    lastIndex = index + searchQuery.length
    index = lowerText.indexOf(lowerQuery, lastIndex)
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts
}
