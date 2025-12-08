/**
 * Tests for section progress calculation utilities.
 */

import { describe, it, expect } from 'vitest'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'
import {
  countDescendants,
  countCompletedDescendants,
  calculateSectionProgress,
  calculateSectionProgressMemoized,
  calculateDocumentProgress,
} from './section-progress'

// Helper to create test items
function createItem(
  id: string,
  type: TrackableItem['type'] = 'listItem',
  children: TrackableItem[] = []
): TrackableItem {
  return {
    id,
    type,
    content: `Item ${id}`,
    children,
    depth: 1,
    position: { line: 1, column: 1 },
  }
}

describe('countDescendants', () => {
  it('returns 0 for item with no children', () => {
    const item = createItem('1')
    expect(countDescendants(item)).toBe(0)
  })

  it('counts direct children', () => {
    const item = createItem('1', 'header', [
      createItem('1.1'),
      createItem('1.2'),
      createItem('1.3'),
    ])
    expect(countDescendants(item)).toBe(3)
  })

  it('counts nested children (2 levels)', () => {
    const item = createItem('1', 'header', [
      createItem('1.1', 'header', [
        createItem('1.1.1'),
        createItem('1.1.2'),
      ]),
      createItem('1.2'),
    ])
    // 1.1 + 1.1.1 + 1.1.2 + 1.2 = 4
    expect(countDescendants(item)).toBe(4)
  })

  it('counts deeply nested children (3+ levels)', () => {
    const item = createItem('1', 'header', [
      createItem('1.1', 'header', [
        createItem('1.1.1', 'header', [
          createItem('1.1.1.1'),
          createItem('1.1.1.2'),
        ]),
      ]),
      createItem('1.2'),
    ])
    // 1.1 + 1.1.1 + 1.1.1.1 + 1.1.1.2 + 1.2 = 5
    expect(countDescendants(item)).toBe(5)
  })

  it('does not count the item itself', () => {
    const item = createItem('root', 'header', [createItem('child')])
    expect(countDescendants(item)).toBe(1)
  })
})

describe('countCompletedDescendants', () => {
  it('returns 0 when no descendants', () => {
    const item = createItem('1')
    expect(countCompletedDescendants(item, {})).toBe(0)
  })

  it('returns 0 when all descendants are pending', () => {
    const item = createItem('1', 'header', [
      createItem('1.1'),
      createItem('1.2'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'pending',
      '1.2': 'pending',
    }
    expect(countCompletedDescendants(item, statuses)).toBe(0)
  })

  it('counts completed descendants only', () => {
    const item = createItem('1', 'header', [
      createItem('1.1'),
      createItem('1.2'),
      createItem('1.3'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'complete',
      '1.2': 'pending',
      '1.3': 'complete',
    }
    expect(countCompletedDescendants(item, statuses)).toBe(2)
  })

  it('does not count in_progress as complete', () => {
    const item = createItem('1', 'header', [
      createItem('1.1'),
      createItem('1.2'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'in_progress',
      '1.2': 'complete',
    }
    expect(countCompletedDescendants(item, statuses)).toBe(1)
  })

  it('counts nested completed items', () => {
    const item = createItem('1', 'header', [
      createItem('1.1', 'header', [
        createItem('1.1.1'),
        createItem('1.1.2'),
      ]),
      createItem('1.2'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'complete',
      '1.1.1': 'complete',
      '1.1.2': 'pending',
      '1.2': 'complete',
    }
    // 1.1 + 1.1.1 + 1.2 = 3 complete
    expect(countCompletedDescendants(item, statuses)).toBe(3)
  })

  it('treats missing status as pending', () => {
    const item = createItem('1', 'header', [
      createItem('1.1'),
      createItem('1.2'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'complete',
      // 1.2 not in statuses - should be treated as pending
    }
    expect(countCompletedDescendants(item, statuses)).toBe(1)
  })
})

describe('calculateSectionProgress', () => {
  it('returns zero progress for item with no children', () => {
    const item = createItem('1')
    const result = calculateSectionProgress(item, {})
    expect(result).toEqual({
      completed: 0,
      total: 0,
      percentage: 0,
    })
  })

  it('calculates percentage correctly', () => {
    const item = createItem('1', 'header', [
      createItem('1.1'),
      createItem('1.2'),
      createItem('1.3'),
      createItem('1.4'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'complete',
      '1.2': 'complete',
      '1.3': 'pending',
      '1.4': 'pending',
    }
    const result = calculateSectionProgress(item, statuses)
    expect(result).toEqual({
      completed: 2,
      total: 4,
      percentage: 50,
    })
  })

  it('returns 100% when all complete', () => {
    const item = createItem('1', 'header', [
      createItem('1.1'),
      createItem('1.2'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'complete',
      '1.2': 'complete',
    }
    const result = calculateSectionProgress(item, statuses)
    expect(result.percentage).toBe(100)
  })

  it('rounds percentage to nearest integer', () => {
    const item = createItem('1', 'header', [
      createItem('1.1'),
      createItem('1.2'),
      createItem('1.3'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'complete',
      '1.2': 'pending',
      '1.3': 'pending',
    }
    const result = calculateSectionProgress(item, statuses)
    // 1/3 = 33.33% -> rounds to 33
    expect(result.percentage).toBe(33)
  })

  it('counts nested items in total and completed', () => {
    const item = createItem('1', 'header', [
      createItem('1.1', 'header', [
        createItem('1.1.1'),
        createItem('1.1.2'),
      ]),
      createItem('1.2'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'complete',
      '1.1.1': 'complete',
      '1.1.2': 'complete',
      '1.2': 'pending',
    }
    const result = calculateSectionProgress(item, statuses)
    expect(result).toEqual({
      completed: 3, // 1.1, 1.1.1, 1.1.2
      total: 4,     // 1.1, 1.1.1, 1.1.2, 1.2
      percentage: 75,
    })
  })
})

describe('calculateSectionProgressMemoized', () => {
  it('returns same result as non-memoized version', () => {
    const item = createItem('1', 'header', [
      createItem('1.1'),
      createItem('1.2'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      '1.1': 'complete',
      '1.2': 'pending',
    }

    const memoized = calculateSectionProgressMemoized(item, statuses)
    const regular = calculateSectionProgress(item, statuses)

    expect(memoized).toEqual(regular)
  })

  it('returns cached result for same inputs', () => {
    const item = createItem('memo-test', 'header', [
      createItem('memo-1'),
      createItem('memo-2'),
    ])
    const statuses: Record<string, TrackingStatus> = {
      'memo-1': 'complete',
      'memo-2': 'pending',
    }

    const first = calculateSectionProgressMemoized(item, statuses)
    const second = calculateSectionProgressMemoized(item, statuses)

    // Should return the exact same object reference (cached)
    expect(first).toBe(second)
  })

  it('recalculates when status changes', () => {
    const item = createItem('cache-test', 'header', [
      createItem('cache-1'),
      createItem('cache-2'),
    ])

    const statuses1: Record<string, TrackingStatus> = {
      'cache-1': 'complete',
      'cache-2': 'pending',
    }

    const statuses2: Record<string, TrackingStatus> = {
      'cache-1': 'complete',
      'cache-2': 'complete',
    }

    const first = calculateSectionProgressMemoized(item, statuses1)
    const second = calculateSectionProgressMemoized(item, statuses2)

    expect(first.percentage).toBe(50)
    expect(second.percentage).toBe(100)
  })
})

describe('calculateDocumentProgress', () => {
  it('returns zero progress for empty document', () => {
    const result = calculateDocumentProgress([], {})
    expect(result).toEqual({
      completed: 0,
      total: 0,
      percentage: 0,
    })
  })

  it('counts all items in document tree', () => {
    const items: TrackableItem[] = [
      createItem('1', 'header', [
        createItem('1.1'),
        createItem('1.2'),
      ]),
      createItem('2'),
    ]
    const result = calculateDocumentProgress(items, {})
    // 1 + 1.1 + 1.2 + 2 = 4
    expect(result.total).toBe(4)
  })

  it('calculates document-level completion', () => {
    const items: TrackableItem[] = [
      createItem('1', 'header', [
        createItem('1.1'),
        createItem('1.2'),
      ]),
      createItem('2'),
    ]
    const statuses: Record<string, TrackingStatus> = {
      '1': 'complete',
      '1.1': 'complete',
      '1.2': 'pending',
      '2': 'complete',
    }
    const result = calculateDocumentProgress(items, statuses)
    expect(result).toEqual({
      completed: 3, // 1, 1.1, 2
      total: 4,
      percentage: 75,
    })
  })

  it('handles deeply nested items', () => {
    const items: TrackableItem[] = [
      createItem('1', 'header', [
        createItem('1.1', 'header', [
          createItem('1.1.1', 'header', [
            createItem('1.1.1.1'),
          ]),
        ]),
      ]),
    ]
    const statuses: Record<string, TrackingStatus> = {
      '1': 'complete',
      '1.1': 'complete',
      '1.1.1': 'complete',
      '1.1.1.1': 'complete',
    }
    const result = calculateDocumentProgress(items, statuses)
    expect(result.percentage).toBe(100)
  })
})
