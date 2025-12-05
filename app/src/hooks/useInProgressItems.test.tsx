/**
 * Tests for useInProgressItems hook helper functions.
 * Note: The hook itself relies on Tauri file system APIs that require mocking.
 * These tests verify the underlying logic patterns.
 */

import { describe, it, expect } from 'vitest'
import type { TrackableItem } from '@/lib/parser/types'
import type { InProgressItemSummary } from '@/lib/navigation/types'

/**
 * Flattens a tree of trackable items into a flat array.
 * Duplicates the logic from the hook for testing.
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
 * Creates an item ID to TrackableItem map.
 */
const createItemMap = (items: TrackableItem[]): Map<string, TrackableItem> => {
  const map = new Map<string, TrackableItem>()
  const flatItems = flattenItems(items)
  for (const item of flatItems) {
    map.set(item.id, item)
  }
  return map
}

/**
 * Sorts in-progress items by lastWorkedAt descending.
 */
const sortByLastWorked = (
  items: InProgressItemSummary[]
): InProgressItemSummary[] => {
  return [...items].sort((a, b) => b.lastWorkedAt.localeCompare(a.lastWorkedAt))
}

/**
 * Helper to create a mock trackable item.
 */
const createMockItem = (overrides: Partial<TrackableItem> = {}): TrackableItem => ({
  id: 'item-1',
  type: 'header',
  content: 'Test Item',
  depth: 1,
  position: { line: 1, column: 1 },
  children: [],
  ...overrides,
})

/**
 * Helper to create a mock in-progress item summary.
 */
const createMockSummary = (
  overrides: Partial<InProgressItemSummary> = {}
): InProgressItemSummary => ({
  item: createMockItem(),
  filePath: '/path/to/file.md',
  fileName: 'file.md',
  lastWorkedAt: '2025-01-01T12:00:00Z',
  ...overrides,
})

describe('useInProgressItems helpers', () => {
  describe('flattenItems', () => {
    it('returns empty array for empty input', () => {
      expect(flattenItems([])).toEqual([])
    })

    it('flattens single level items', () => {
      const items = [
        createMockItem({ id: 'item-1' }),
        createMockItem({ id: 'item-2' }),
      ]

      const result = flattenItems(items)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('item-1')
      expect(result[1].id).toBe('item-2')
    })

    it('flattens nested items', () => {
      const items = [
        createMockItem({
          id: 'parent',
          children: [
            createMockItem({ id: 'child-1' }),
            createMockItem({ id: 'child-2' }),
          ],
        }),
      ]

      const result = flattenItems(items)
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe('parent')
      expect(result[1].id).toBe('child-1')
      expect(result[2].id).toBe('child-2')
    })

    it('flattens deeply nested items', () => {
      const items = [
        createMockItem({
          id: 'level-1',
          children: [
            createMockItem({
              id: 'level-2',
              children: [
                createMockItem({
                  id: 'level-3',
                  children: [createMockItem({ id: 'level-4' })],
                }),
              ],
            }),
          ],
        }),
      ]

      const result = flattenItems(items)
      expect(result).toHaveLength(4)
      expect(result.map((i) => i.id)).toEqual([
        'level-1',
        'level-2',
        'level-3',
        'level-4',
      ])
    })

    it('preserves item order with mixed nesting', () => {
      const items = [
        createMockItem({
          id: 'a',
          children: [createMockItem({ id: 'a-1' })],
        }),
        createMockItem({ id: 'b' }),
        createMockItem({
          id: 'c',
          children: [
            createMockItem({ id: 'c-1' }),
            createMockItem({ id: 'c-2' }),
          ],
        }),
      ]

      const result = flattenItems(items)
      expect(result.map((i) => i.id)).toEqual([
        'a',
        'a-1',
        'b',
        'c',
        'c-1',
        'c-2',
      ])
    })
  })

  describe('createItemMap', () => {
    it('returns empty map for empty input', () => {
      const map = createItemMap([])
      expect(map.size).toBe(0)
    })

    it('maps items by ID', () => {
      const items = [
        createMockItem({ id: 'item-1', content: 'First' }),
        createMockItem({ id: 'item-2', content: 'Second' }),
      ]

      const map = createItemMap(items)
      expect(map.size).toBe(2)
      expect(map.get('item-1')?.content).toBe('First')
      expect(map.get('item-2')?.content).toBe('Second')
    })

    it('includes nested items in map', () => {
      const items = [
        createMockItem({
          id: 'parent',
          children: [
            createMockItem({ id: 'child-1' }),
            createMockItem({ id: 'child-2' }),
          ],
        }),
      ]

      const map = createItemMap(items)
      expect(map.size).toBe(3)
      expect(map.has('parent')).toBe(true)
      expect(map.has('child-1')).toBe(true)
      expect(map.has('child-2')).toBe(true)
    })

    it('returns undefined for non-existent ID', () => {
      const items = [createMockItem({ id: 'item-1' })]

      const map = createItemMap(items)
      expect(map.get('nonexistent')).toBeUndefined()
    })
  })

  describe('sortByLastWorked', () => {
    it('returns empty array for empty input', () => {
      expect(sortByLastWorked([])).toEqual([])
    })

    it('sorts by lastWorkedAt descending (most recent first)', () => {
      const items = [
        createMockSummary({ lastWorkedAt: '2025-01-01T08:00:00Z' }),
        createMockSummary({ lastWorkedAt: '2025-01-01T12:00:00Z' }),
        createMockSummary({ lastWorkedAt: '2025-01-01T10:00:00Z' }),
      ]

      const result = sortByLastWorked(items)
      expect(result[0].lastWorkedAt).toBe('2025-01-01T12:00:00Z')
      expect(result[1].lastWorkedAt).toBe('2025-01-01T10:00:00Z')
      expect(result[2].lastWorkedAt).toBe('2025-01-01T08:00:00Z')
    })

    it('handles same timestamps', () => {
      const items = [
        createMockSummary({
          item: createMockItem({ id: 'a' }),
          lastWorkedAt: '2025-01-01T12:00:00Z',
        }),
        createMockSummary({
          item: createMockItem({ id: 'b' }),
          lastWorkedAt: '2025-01-01T12:00:00Z',
        }),
      ]

      const result = sortByLastWorked(items)
      expect(result).toHaveLength(2)
    })

    it('does not mutate original array', () => {
      const items = [
        createMockSummary({ lastWorkedAt: '2025-01-01T08:00:00Z' }),
        createMockSummary({ lastWorkedAt: '2025-01-01T12:00:00Z' }),
      ]

      const originalFirst = items[0]
      sortByLastWorked(items)

      expect(items[0]).toBe(originalFirst)
    })

    it('handles different date formats', () => {
      const items = [
        createMockSummary({ lastWorkedAt: '2024-12-31T23:59:59Z' }),
        createMockSummary({ lastWorkedAt: '2025-01-01T00:00:00Z' }),
      ]

      const result = sortByLastWorked(items)
      expect(result[0].lastWorkedAt).toBe('2025-01-01T00:00:00Z')
    })
  })

  describe('limit behavior', () => {
    it('applies limit correctly', () => {
      const items = Array.from({ length: 10 }, (_, i) =>
        createMockSummary({
          item: createMockItem({ id: `item-${i}` }),
          lastWorkedAt: `2025-01-01T${String(i).padStart(2, '0')}:00:00Z`,
        })
      )

      // Simulate limit logic
      const limited = items.slice(0, 5)
      expect(limited).toHaveLength(5)
    })

    it('returns all items when under limit', () => {
      const items = [
        createMockSummary(),
        createMockSummary(),
      ]

      const limited = items.slice(0, 5)
      expect(limited).toHaveLength(2)
    })
  })

  describe('InProgressItemSummary structure', () => {
    it('contains required fields', () => {
      const summary = createMockSummary({
        item: createMockItem({ id: 'test-id', content: 'Test Content' }),
        filePath: '/documents/test.md',
        fileName: 'test.md',
        lastWorkedAt: '2025-01-01T15:30:00Z',
      })

      expect(summary.item.id).toBe('test-id')
      expect(summary.item.content).toBe('Test Content')
      expect(summary.filePath).toBe('/documents/test.md')
      expect(summary.fileName).toBe('test.md')
      expect(summary.lastWorkedAt).toBe('2025-01-01T15:30:00Z')
    })
  })
})

describe('aggregation logic', () => {
  /**
   * Simulates the aggregation logic from the hook.
   */
  const aggregateInProgressItems = (
    files: Array<{
      path: string
      fileName: string
      states: Array<{ itemId: string; status: string; updatedAt: string }>
      items: TrackableItem[]
    }>
  ): InProgressItemSummary[] => {
    const result: InProgressItemSummary[] = []

    for (const file of files) {
      const itemMap = createItemMap(file.items)

      for (const state of file.states) {
        if (state.status !== 'in_progress') continue

        const item = itemMap.get(state.itemId)
        if (item) {
          result.push({
            item,
            filePath: file.path,
            fileName: file.fileName,
            lastWorkedAt: state.updatedAt,
          })
        }
      }
    }

    return result
  }

  it('aggregates in-progress items from multiple files', () => {
    const files = [
      {
        path: '/file1.md',
        fileName: 'file1.md',
        states: [
          { itemId: 'item-1', status: 'in_progress', updatedAt: '2025-01-01T10:00:00Z' },
          { itemId: 'item-2', status: 'complete', updatedAt: '2025-01-01T09:00:00Z' },
        ],
        items: [
          createMockItem({ id: 'item-1' }),
          createMockItem({ id: 'item-2' }),
        ],
      },
      {
        path: '/file2.md',
        fileName: 'file2.md',
        states: [
          { itemId: 'item-3', status: 'in_progress', updatedAt: '2025-01-01T11:00:00Z' },
        ],
        items: [createMockItem({ id: 'item-3' })],
      },
    ]

    const result = aggregateInProgressItems(files)
    expect(result).toHaveLength(2)
    expect(result.some((r) => r.item.id === 'item-1')).toBe(true)
    expect(result.some((r) => r.item.id === 'item-3')).toBe(true)
    expect(result.some((r) => r.item.id === 'item-2')).toBe(false)
  })

  it('handles files with no in-progress items', () => {
    const files = [
      {
        path: '/file1.md',
        fileName: 'file1.md',
        states: [
          { itemId: 'item-1', status: 'complete', updatedAt: '2025-01-01T10:00:00Z' },
          { itemId: 'item-2', status: 'pending', updatedAt: '2025-01-01T09:00:00Z' },
        ],
        items: [
          createMockItem({ id: 'item-1' }),
          createMockItem({ id: 'item-2' }),
        ],
      },
    ]

    const result = aggregateInProgressItems(files)
    expect(result).toHaveLength(0)
  })

  it('skips items not found in parsed document', () => {
    const files = [
      {
        path: '/file1.md',
        fileName: 'file1.md',
        states: [
          { itemId: 'nonexistent', status: 'in_progress', updatedAt: '2025-01-01T10:00:00Z' },
        ],
        items: [createMockItem({ id: 'item-1' })],
      },
    ]

    const result = aggregateInProgressItems(files)
    expect(result).toHaveLength(0)
  })

  it('preserves file context in summaries', () => {
    const files = [
      {
        path: '/documents/project/tasks.md',
        fileName: 'tasks.md',
        states: [
          { itemId: 'task-1', status: 'in_progress', updatedAt: '2025-01-01T10:00:00Z' },
        ],
        items: [createMockItem({ id: 'task-1', content: 'Important Task' })],
      },
    ]

    const result = aggregateInProgressItems(files)
    expect(result[0].filePath).toBe('/documents/project/tasks.md')
    expect(result[0].fileName).toBe('tasks.md')
    expect(result[0].item.content).toBe('Important Task')
  })
})
