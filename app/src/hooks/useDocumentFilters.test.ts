/**
 * Tests for useDocumentFilters hook.
 */

import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDocumentFilters, highlightSearchText } from './useDocumentFilters'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'

// Helper to create test items
function createItem(
  id: string,
  content: string,
  type: TrackableItem['type'] = 'listItem',
  children: TrackableItem[] = []
): TrackableItem {
  return {
    id,
    type,
    content,
    children,
    depth: 1,
    position: { line: 1, column: 1 },
  }
}

describe('useDocumentFilters', () => {
  describe('initial state', () => {
    it('starts with default filter and empty search', () => {
      const { result } = renderHook(() => useDocumentFilters())

      expect(result.current.activeFilter).toBe('all')
      expect(result.current.searchQuery).toBe('')
      expect(result.current.isFiltered).toBe(false)
    })

    it('accepts initial filter', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialFilter: 'complete' })
      )

      expect(result.current.activeFilter).toBe('complete')
      expect(result.current.isFiltered).toBe(true)
    })

    it('accepts initial search query', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialSearch: 'test' })
      )

      expect(result.current.searchQuery).toBe('test')
      expect(result.current.isFiltered).toBe(true)
    })
  })

  describe('setFilter', () => {
    it('changes active filter', () => {
      const { result } = renderHook(() => useDocumentFilters())

      act(() => {
        result.current.setFilter('pending')
      })

      expect(result.current.activeFilter).toBe('pending')
    })

    it('marks as filtered when not "all"', () => {
      const { result } = renderHook(() => useDocumentFilters())

      act(() => {
        result.current.setFilter('in_progress')
      })

      expect(result.current.isFiltered).toBe(true)
    })
  })

  describe('setSearchQuery', () => {
    it('sets search query', () => {
      const { result } = renderHook(() => useDocumentFilters())

      act(() => {
        result.current.setSearchQuery('hello')
      })

      expect(result.current.searchQuery).toBe('hello')
    })

    it('marks as filtered when query is non-empty', () => {
      const { result } = renderHook(() => useDocumentFilters())

      act(() => {
        result.current.setSearchQuery('test')
      })

      expect(result.current.isFiltered).toBe(true)
    })
  })

  describe('clearSearch', () => {
    it('clears search query', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialSearch: 'test' })
      )

      expect(result.current.searchQuery).toBe('test')

      act(() => {
        result.current.clearSearch()
      })

      expect(result.current.searchQuery).toBe('')
    })
  })

  describe('filterItems - status filter', () => {
    const items: TrackableItem[] = [
      createItem('1', 'Item 1'),
      createItem('2', 'Item 2'),
      createItem('3', 'Item 3'),
    ]

    const statuses: Record<string, TrackingStatus> = {
      '1': 'pending',
      '2': 'in_progress',
      '3': 'complete',
    }

    it('returns all items when filter is "all"', () => {
      const { result } = renderHook(() => useDocumentFilters())

      const filtered = result.current.filterItems(items, statuses)

      expect(filtered).toHaveLength(3)
    })

    it('filters by pending status', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialFilter: 'pending' })
      )

      const filtered = result.current.filterItems(items, statuses)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1')
    })

    it('filters by in_progress status', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialFilter: 'in_progress' })
      )

      const filtered = result.current.filterItems(items, statuses)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('2')
    })

    it('filters by complete status', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialFilter: 'complete' })
      )

      const filtered = result.current.filterItems(items, statuses)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('3')
    })

    it('treats missing status as pending', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialFilter: 'pending' })
      )

      const filtered = result.current.filterItems(items, {})

      expect(filtered).toHaveLength(3) // All treated as pending
    })
  })

  describe('filterItems - search filter', () => {
    const items: TrackableItem[] = [
      createItem('1', 'Hello World'),
      createItem('2', 'Goodbye'),
      createItem('3', 'Hello Again'),
    ]

    it('filters by search query (case-insensitive)', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialSearch: 'hello' })
      )

      const filtered = result.current.filterItems(items, {})

      expect(filtered).toHaveLength(2)
      expect(filtered[0].content).toBe('Hello World')
      expect(filtered[1].content).toBe('Hello Again')
    })

    it('matches partial text', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialSearch: 'ood' })
      )

      const filtered = result.current.filterItems(items, {})

      expect(filtered).toHaveLength(1)
      expect(filtered[0].content).toBe('Goodbye')
    })

    it('returns all items when search is empty', () => {
      const { result } = renderHook(() => useDocumentFilters())

      const filtered = result.current.filterItems(items, {})

      expect(filtered).toHaveLength(3)
    })
  })

  describe('filterItems - combined filter and search', () => {
    const items: TrackableItem[] = [
      createItem('1', 'Hello World'),
      createItem('2', 'Hello Again'),
      createItem('3', 'Goodbye'),
    ]

    const statuses: Record<string, TrackingStatus> = {
      '1': 'pending',
      '2': 'complete',
      '3': 'pending',
    }

    it('applies both filter and search (AND logic)', () => {
      const { result } = renderHook(() =>
        useDocumentFilters({ initialFilter: 'pending', initialSearch: 'Hello' })
      )

      const filtered = result.current.filterItems(items, statuses)

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('1') // Only "Hello World" with pending status
    })
  })

  describe('filterItems - tree preservation', () => {
    it('preserves parent when child matches', () => {
      const items: TrackableItem[] = [
        createItem('parent', 'Parent Header', 'header', [
          createItem('child1', 'Matching Child'),
          createItem('child2', 'Other Child'),
        ]),
      ]

      const { result } = renderHook(() =>
        useDocumentFilters({ initialSearch: 'Matching' })
      )

      const filtered = result.current.filterItems(items, {})

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('parent')
      expect(filtered[0].children).toHaveLength(1)
      expect(filtered[0].children[0].id).toBe('child1')
    })

    it('preserves grandparent when grandchild matches', () => {
      const items: TrackableItem[] = [
        createItem('grandparent', 'Grandparent', 'header', [
          createItem('parent', 'Parent', 'header', [
            createItem('child', 'Target Item'),
          ]),
        ]),
      ]

      const { result } = renderHook(() =>
        useDocumentFilters({ initialSearch: 'Target' })
      )

      const filtered = result.current.filterItems(items, {})

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('grandparent')
      expect(filtered[0].children[0].id).toBe('parent')
      expect(filtered[0].children[0].children[0].id).toBe('child')
    })

    it('removes subtree when no match', () => {
      const items: TrackableItem[] = [
        createItem('parent1', 'Parent 1', 'header', [
          createItem('child1', 'No Match'),
        ]),
        createItem('parent2', 'Parent 2', 'header', [
          createItem('child2', 'Has Target'),
        ]),
      ]

      const { result } = renderHook(() =>
        useDocumentFilters({ initialSearch: 'Target' })
      )

      const filtered = result.current.filterItems(items, {})

      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe('parent2')
    })
  })

  describe('countByStatus', () => {
    it('counts items by status', () => {
      const items: TrackableItem[] = [
        createItem('1', 'Item 1'),
        createItem('2', 'Item 2'),
        createItem('3', 'Item 3'),
        createItem('4', 'Item 4'),
      ]

      const statuses: Record<string, TrackingStatus> = {
        '1': 'pending',
        '2': 'in_progress',
        '3': 'complete',
        '4': 'complete',
      }

      const { result } = renderHook(() => useDocumentFilters())

      const counts = result.current.countByStatus(items, statuses)

      expect(counts.all).toBe(4)
      expect(counts.pending).toBe(1)
      expect(counts.in_progress).toBe(1)
      expect(counts.complete).toBe(2)
    })

    it('counts nested items', () => {
      const items: TrackableItem[] = [
        createItem('1', 'Parent', 'header', [
          createItem('1.1', 'Child 1'),
          createItem('1.2', 'Child 2'),
        ]),
      ]

      const statuses: Record<string, TrackingStatus> = {
        '1': 'complete',
        '1.1': 'complete',
        '1.2': 'pending',
      }

      const { result } = renderHook(() => useDocumentFilters())

      const counts = result.current.countByStatus(items, statuses)

      expect(counts.all).toBe(3)
      expect(counts.complete).toBe(2)
      expect(counts.pending).toBe(1)
    })

    it('treats missing status as pending', () => {
      const items: TrackableItem[] = [
        createItem('1', 'Item 1'),
        createItem('2', 'Item 2'),
      ]

      const { result } = renderHook(() => useDocumentFilters())

      const counts = result.current.countByStatus(items, {})

      expect(counts.pending).toBe(2)
    })
  })
})

describe('highlightSearchText', () => {
  it('returns original text when no query', () => {
    const result = highlightSearchText('Hello World', '')

    expect(result).toHaveLength(1)
    expect(result[0]).toBe('Hello World')
  })

  it('highlights matching text', () => {
    const result = highlightSearchText('Hello World', 'World')

    expect(result).toHaveLength(2)
    expect(result[0]).toBe('Hello ')
    expect(result[1]).toMatchObject({
      type: 'strong',
      props: { className: 'search-highlight', children: 'World' },
    })
  })

  it('highlights case-insensitively', () => {
    const result = highlightSearchText('Hello World', 'hello')

    expect(result).toHaveLength(2)
    // Preserves original case in highlight
    expect(result[0]).toMatchObject({
      type: 'strong',
      props: { className: 'search-highlight', children: 'Hello' },
    })
    expect(result[1]).toBe(' World')
  })

  it('highlights multiple matches', () => {
    const result = highlightSearchText('one two one three one', 'one')

    expect(result).toHaveLength(5)
    expect(result[0]).toMatchObject({
      type: 'strong',
      props: { children: 'one' },
    })
    expect(result[1]).toBe(' two ')
    expect(result[2]).toMatchObject({
      type: 'strong',
      props: { children: 'one' },
    })
    expect(result[3]).toBe(' three ')
    expect(result[4]).toMatchObject({
      type: 'strong',
      props: { children: 'one' },
    })
  })

  it('handles match at start', () => {
    const result = highlightSearchText('test string', 'test')

    expect(result).toHaveLength(2)
    expect(result[0]).toMatchObject({
      type: 'strong',
      props: { children: 'test' },
    })
    expect(result[1]).toBe(' string')
  })

  it('handles match at end', () => {
    const result = highlightSearchText('string test', 'test')

    expect(result).toHaveLength(2)
    expect(result[0]).toBe('string ')
    expect(result[1]).toMatchObject({
      type: 'strong',
      props: { children: 'test' },
    })
  })

  it('handles full string match', () => {
    const result = highlightSearchText('test', 'test')

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({
      type: 'strong',
      props: { children: 'test' },
    })
  })

  it('returns original when no match', () => {
    const result = highlightSearchText('Hello World', 'xyz')

    expect(result).toHaveLength(1)
    expect(result[0]).toBe('Hello World')
  })
})
