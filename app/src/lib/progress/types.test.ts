/**
 * Tests for progress tracking types.
 */

import { describe, it, expect } from 'vitest'
import {
  getNextStatus,
  getPreviousStatus,
  isStatusChangeEvent,
  isParentProgress,
  createEmptyProgress,
} from './types'
import type { StatusChangeEvent, ParentProgress } from './types'

describe('getNextStatus', () => {
  it('cycles pending to in_progress', () => {
    expect(getNextStatus('pending')).toBe('in_progress')
  })

  it('cycles in_progress to complete', () => {
    expect(getNextStatus('in_progress')).toBe('complete')
  })

  it('cycles complete to pending', () => {
    expect(getNextStatus('complete')).toBe('pending')
  })
})

describe('getPreviousStatus', () => {
  it('cycles pending to complete', () => {
    expect(getPreviousStatus('pending')).toBe('complete')
  })

  it('cycles in_progress to pending', () => {
    expect(getPreviousStatus('in_progress')).toBe('pending')
  })

  it('cycles complete to in_progress', () => {
    expect(getPreviousStatus('complete')).toBe('in_progress')
  })
})

describe('isStatusChangeEvent', () => {
  it('returns true for valid StatusChangeEvent', () => {
    const event: StatusChangeEvent = {
      itemId: 'item-1',
      oldStatus: 'pending',
      newStatus: 'in_progress',
      timestamp: new Date().toISOString(),
    }
    expect(isStatusChangeEvent(event)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isStatusChangeEvent(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isStatusChangeEvent(undefined)).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isStatusChangeEvent('string')).toBe(false)
    expect(isStatusChangeEvent(123)).toBe(false)
  })

  it('returns false for missing itemId', () => {
    expect(
      isStatusChangeEvent({
        oldStatus: 'pending',
        newStatus: 'in_progress',
        timestamp: new Date().toISOString(),
      })
    ).toBe(false)
  })

  it('returns false for missing oldStatus', () => {
    expect(
      isStatusChangeEvent({
        itemId: 'item-1',
        newStatus: 'in_progress',
        timestamp: new Date().toISOString(),
      })
    ).toBe(false)
  })

  it('returns false for missing newStatus', () => {
    expect(
      isStatusChangeEvent({
        itemId: 'item-1',
        oldStatus: 'pending',
        timestamp: new Date().toISOString(),
      })
    ).toBe(false)
  })

  it('returns false for missing timestamp', () => {
    expect(
      isStatusChangeEvent({
        itemId: 'item-1',
        oldStatus: 'pending',
        newStatus: 'in_progress',
      })
    ).toBe(false)
  })

  it('returns false for wrong type itemId', () => {
    expect(
      isStatusChangeEvent({
        itemId: 123,
        oldStatus: 'pending',
        newStatus: 'in_progress',
        timestamp: new Date().toISOString(),
      })
    ).toBe(false)
  })
})

describe('isParentProgress', () => {
  it('returns true for valid ParentProgress', () => {
    const progress: ParentProgress = {
      total: 5,
      complete: 2,
      inProgress: 1,
      pending: 2,
      percentage: 40,
    }
    expect(isParentProgress(progress)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isParentProgress(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isParentProgress(undefined)).toBe(false)
  })

  it('returns false for non-object', () => {
    expect(isParentProgress('string')).toBe(false)
    expect(isParentProgress(123)).toBe(false)
  })

  it('returns false for missing total', () => {
    expect(
      isParentProgress({
        complete: 2,
        inProgress: 1,
        pending: 2,
        percentage: 40,
      })
    ).toBe(false)
  })

  it('returns false for missing complete', () => {
    expect(
      isParentProgress({
        total: 5,
        inProgress: 1,
        pending: 2,
        percentage: 40,
      })
    ).toBe(false)
  })

  it('returns false for missing inProgress', () => {
    expect(
      isParentProgress({
        total: 5,
        complete: 2,
        pending: 2,
        percentage: 40,
      })
    ).toBe(false)
  })

  it('returns false for missing pending', () => {
    expect(
      isParentProgress({
        total: 5,
        complete: 2,
        inProgress: 1,
        percentage: 40,
      })
    ).toBe(false)
  })

  it('returns false for missing percentage', () => {
    expect(
      isParentProgress({
        total: 5,
        complete: 2,
        inProgress: 1,
        pending: 2,
      })
    ).toBe(false)
  })

  it('returns false for wrong type values', () => {
    expect(
      isParentProgress({
        total: '5',
        complete: 2,
        inProgress: 1,
        pending: 2,
        percentage: 40,
      })
    ).toBe(false)
  })
})

describe('createEmptyProgress', () => {
  it('creates an empty progress object with all zeros', () => {
    const progress = createEmptyProgress()
    expect(progress).toEqual({
      total: 0,
      complete: 0,
      inProgress: 0,
      pending: 0,
      percentage: 0,
    })
  })

  it('returns a new object each time', () => {
    const progress1 = createEmptyProgress()
    const progress2 = createEmptyProgress()
    expect(progress1).not.toBe(progress2)
    expect(progress1).toEqual(progress2)
  })
})
