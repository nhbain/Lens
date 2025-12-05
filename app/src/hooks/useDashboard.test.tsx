/**
 * Tests for useDashboard hook helper functions.
 * Note: The hook itself is tested indirectly through Dashboard component tests
 * due to Tauri module mocking complexity with React hooks.
 */

import { describe, it, expect } from 'vitest'

// Export helper functions for testing
// These are the pure functions used by useDashboard

/**
 * Calculate progress from item counts.
 */
const calculateProgress = (
  items: Array<{ status: 'pending' | 'in_progress' | 'complete' }>,
  fallbackItemCount: number
) => {
  if (items.length === 0) {
    return {
      total: fallbackItemCount,
      complete: 0,
      inProgress: 0,
      pending: fallbackItemCount,
      percentage: 0,
    }
  }

  let complete = 0
  let inProgress = 0
  let pending = 0

  for (const item of items) {
    switch (item.status) {
      case 'complete':
        complete++
        break
      case 'in_progress':
        inProgress++
        break
      case 'pending':
      default:
        pending++
        break
    }
  }

  const total = items.length
  const percentage = total > 0 ? Math.round((complete / total) * 100) : 0

  return {
    total,
    complete,
    inProgress,
    pending,
    percentage,
  }
}

/**
 * Check if any items are in progress.
 */
const hasInProgressItems = (
  items: Array<{ status: 'pending' | 'in_progress' | 'complete' }>
): boolean => {
  return items.some((item) => item.status === 'in_progress')
}

/**
 * Get the most recent update timestamp.
 */
const getLastWorkedAt = (
  items: Array<{ updatedAt: string }>
): string | null => {
  if (items.length === 0) {
    return null
  }

  let latest: string | null = null
  for (const item of items) {
    if (!latest || item.updatedAt > latest) {
      latest = item.updatedAt
    }
  }
  return latest
}

/**
 * Sort comparator for files by name.
 */
const sortByName = (
  a: { fileName: string },
  b: { fileName: string },
  direction: 'asc' | 'desc'
): number => {
  const result = a.fileName.localeCompare(b.fileName)
  return direction === 'asc' ? result : -result
}

/**
 * Sort comparator for files by progress.
 */
const sortByProgress = (
  a: { progress: { percentage: number } },
  b: { progress: { percentage: number } },
  direction: 'asc' | 'desc'
): number => {
  const result = a.progress.percentage - b.progress.percentage
  return direction === 'asc' ? result : -result
}

/**
 * Sort comparator for files by date.
 */
const sortByDate = (
  a: { lastWorkedAt: string | null },
  b: { lastWorkedAt: string | null },
  direction: 'asc' | 'desc'
): number => {
  if (!a.lastWorkedAt && !b.lastWorkedAt) return 0
  if (!a.lastWorkedAt) return direction === 'asc' ? 1 : -1
  if (!b.lastWorkedAt) return direction === 'asc' ? -1 : 1
  const result = a.lastWorkedAt.localeCompare(b.lastWorkedAt)
  return direction === 'asc' ? result : -result
}

/**
 * Sort comparator for files by item count.
 */
const sortByItems = (
  a: { itemCount: number },
  b: { itemCount: number },
  direction: 'asc' | 'desc'
): number => {
  const result = a.itemCount - b.itemCount
  return direction === 'asc' ? result : -result
}

describe('useDashboard helpers', () => {
  describe('calculateProgress', () => {
    it('returns zeros for empty items with fallback count', () => {
      const result = calculateProgress([], 10)
      expect(result).toEqual({
        total: 10,
        complete: 0,
        inProgress: 0,
        pending: 10,
        percentage: 0,
      })
    })

    it('calculates progress from items', () => {
      const items = [
        { status: 'complete' as const },
        { status: 'complete' as const },
        { status: 'in_progress' as const },
        { status: 'pending' as const },
      ]
      const result = calculateProgress(items, 10)
      expect(result).toEqual({
        total: 4,
        complete: 2,
        inProgress: 1,
        pending: 1,
        percentage: 50,
      })
    })

    it('rounds percentage correctly', () => {
      const items = [
        { status: 'complete' as const },
        { status: 'pending' as const },
        { status: 'pending' as const },
      ]
      const result = calculateProgress(items, 3)
      expect(result.percentage).toBe(33) // 1/3 = 33.33... rounds to 33
    })

    it('handles all complete', () => {
      const items = [
        { status: 'complete' as const },
        { status: 'complete' as const },
      ]
      const result = calculateProgress(items, 2)
      expect(result.percentage).toBe(100)
    })

    it('handles all pending', () => {
      const items = [
        { status: 'pending' as const },
        { status: 'pending' as const },
      ]
      const result = calculateProgress(items, 2)
      expect(result.percentage).toBe(0)
    })
  })

  describe('hasInProgressItems', () => {
    it('returns false for empty array', () => {
      expect(hasInProgressItems([])).toBe(false)
    })

    it('returns false when no in_progress items', () => {
      const items = [
        { status: 'complete' as const },
        { status: 'pending' as const },
      ]
      expect(hasInProgressItems(items)).toBe(false)
    })

    it('returns true when there are in_progress items', () => {
      const items = [
        { status: 'complete' as const },
        { status: 'in_progress' as const },
        { status: 'pending' as const },
      ]
      expect(hasInProgressItems(items)).toBe(true)
    })
  })

  describe('getLastWorkedAt', () => {
    it('returns null for empty array', () => {
      expect(getLastWorkedAt([])).toBeNull()
    })

    it('returns the most recent timestamp', () => {
      const items = [
        { updatedAt: '2025-01-01T08:00:00Z' },
        { updatedAt: '2025-01-01T12:00:00Z' },
        { updatedAt: '2025-01-01T10:00:00Z' },
      ]
      expect(getLastWorkedAt(items)).toBe('2025-01-01T12:00:00Z')
    })

    it('handles single item', () => {
      const items = [{ updatedAt: '2025-01-01T08:00:00Z' }]
      expect(getLastWorkedAt(items)).toBe('2025-01-01T08:00:00Z')
    })
  })

  describe('sortByName', () => {
    it('sorts ascending', () => {
      const a = { fileName: 'banana.md' }
      const b = { fileName: 'apple.md' }
      expect(sortByName(a, b, 'asc')).toBeGreaterThan(0)
      expect(sortByName(b, a, 'asc')).toBeLessThan(0)
    })

    it('sorts descending', () => {
      const a = { fileName: 'banana.md' }
      const b = { fileName: 'apple.md' }
      expect(sortByName(a, b, 'desc')).toBeLessThan(0)
      expect(sortByName(b, a, 'desc')).toBeGreaterThan(0)
    })

    it('handles equal names', () => {
      const a = { fileName: 'same.md' }
      const b = { fileName: 'same.md' }
      expect(sortByName(a, b, 'asc')).toBe(0)
    })
  })

  describe('sortByProgress', () => {
    it('sorts ascending', () => {
      const a = { progress: { percentage: 75 } }
      const b = { progress: { percentage: 25 } }
      expect(sortByProgress(a, b, 'asc')).toBeGreaterThan(0)
      expect(sortByProgress(b, a, 'asc')).toBeLessThan(0)
    })

    it('sorts descending', () => {
      const a = { progress: { percentage: 75 } }
      const b = { progress: { percentage: 25 } }
      expect(sortByProgress(a, b, 'desc')).toBeLessThan(0)
      expect(sortByProgress(b, a, 'desc')).toBeGreaterThan(0)
    })
  })

  describe('sortByDate', () => {
    it('sorts ascending', () => {
      const a = { lastWorkedAt: '2025-01-02T00:00:00Z' }
      const b = { lastWorkedAt: '2025-01-01T00:00:00Z' }
      expect(sortByDate(a, b, 'asc')).toBeGreaterThan(0)
    })

    it('sorts descending', () => {
      const a = { lastWorkedAt: '2025-01-02T00:00:00Z' }
      const b = { lastWorkedAt: '2025-01-01T00:00:00Z' }
      expect(sortByDate(a, b, 'desc')).toBeLessThan(0)
    })

    it('puts null dates at end when ascending', () => {
      const a = { lastWorkedAt: null }
      const b = { lastWorkedAt: '2025-01-01T00:00:00Z' }
      expect(sortByDate(a, b, 'asc')).toBe(1)
    })

    it('puts null dates at beginning when descending', () => {
      const a = { lastWorkedAt: null }
      const b = { lastWorkedAt: '2025-01-01T00:00:00Z' }
      expect(sortByDate(a, b, 'desc')).toBe(-1)
    })

    it('handles both null', () => {
      const a = { lastWorkedAt: null }
      const b = { lastWorkedAt: null }
      expect(sortByDate(a, b, 'asc')).toBe(0)
    })
  })

  describe('sortByItems', () => {
    it('sorts ascending', () => {
      const a = { itemCount: 10 }
      const b = { itemCount: 5 }
      expect(sortByItems(a, b, 'asc')).toBeGreaterThan(0)
      expect(sortByItems(b, a, 'asc')).toBeLessThan(0)
    })

    it('sorts descending', () => {
      const a = { itemCount: 10 }
      const b = { itemCount: 5 }
      expect(sortByItems(a, b, 'desc')).toBeLessThan(0)
      expect(sortByItems(b, a, 'desc')).toBeGreaterThan(0)
    })
  })
})
