/**
 * Tests for progress calculation logic.
 */

import { describe, it, expect } from 'vitest'
import {
  calculateChildrenProgress,
  calculateDeepProgress,
  deriveParentStatus,
  deriveDeepParentStatus,
  findAncestors,
  propagateStatusChange,
} from './calculator'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'

/**
 * Helper to create a mock trackable item.
 */
const createItem = (
  id: string,
  children: TrackableItem[] = []
): TrackableItem => ({
  id,
  type: 'listItem',
  content: `Item ${id}`,
  depth: 0,
  position: { line: 1, column: 1 },
  children,
})

describe('calculateChildrenProgress', () => {
  it('returns empty progress for no children', () => {
    const progress = calculateChildrenProgress([], {})

    expect(progress).toEqual({
      total: 0,
      complete: 0,
      inProgress: 0,
      pending: 0,
      percentage: 0,
    })
  })

  it('counts all as pending when no statuses set', () => {
    const children = [createItem('1'), createItem('2'), createItem('3')]
    const progress = calculateChildrenProgress(children, {})

    expect(progress).toEqual({
      total: 3,
      complete: 0,
      inProgress: 0,
      pending: 3,
      percentage: 0,
    })
  })

  it('counts statuses correctly', () => {
    const children = [
      createItem('1'),
      createItem('2'),
      createItem('3'),
      createItem('4'),
      createItem('5'),
    ]
    const statuses: Record<string, TrackingStatus> = {
      '1': 'complete',
      '2': 'complete',
      '3': 'in_progress',
      '4': 'pending',
      // '5' is undefined, should count as pending
    }

    const progress = calculateChildrenProgress(children, statuses)

    expect(progress).toEqual({
      total: 5,
      complete: 2,
      inProgress: 1,
      pending: 2,
      percentage: 40,
    })
  })

  it('calculates percentage correctly', () => {
    const children = [createItem('1'), createItem('2'), createItem('3'), createItem('4')]
    const statuses: Record<string, TrackingStatus> = {
      '1': 'complete',
      '2': 'complete',
      '3': 'complete',
      '4': 'pending',
    }

    const progress = calculateChildrenProgress(children, statuses)

    expect(progress.percentage).toBe(75) // 3/4 = 75%
  })

  it('returns 100% when all complete', () => {
    const children = [createItem('1'), createItem('2')]
    const statuses: Record<string, TrackingStatus> = {
      '1': 'complete',
      '2': 'complete',
    }

    const progress = calculateChildrenProgress(children, statuses)

    expect(progress.percentage).toBe(100)
  })

  it('rounds percentage to nearest integer', () => {
    const children = [createItem('1'), createItem('2'), createItem('3')]
    const statuses: Record<string, TrackingStatus> = {
      '1': 'complete',
      '2': 'pending',
      '3': 'pending',
    }

    const progress = calculateChildrenProgress(children, statuses)

    expect(progress.percentage).toBe(33) // 1/3 ≈ 33%
  })
})

describe('calculateDeepProgress', () => {
  it('returns empty progress for item with no children', () => {
    const item = createItem('parent')
    const progress = calculateDeepProgress(item, {})

    expect(progress).toEqual({
      total: 0,
      complete: 0,
      inProgress: 0,
      pending: 0,
      percentage: 0,
    })
  })

  it('counts nested children recursively', () => {
    const item = createItem('parent', [
      createItem('child-1', [
        createItem('grandchild-1'),
        createItem('grandchild-2'),
      ]),
      createItem('child-2'),
    ])

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'in_progress',
      'grandchild-1': 'complete',
      'grandchild-2': 'pending',
      'child-2': 'complete',
    }

    const progress = calculateDeepProgress(item, statuses)

    expect(progress.total).toBe(4) // 2 children + 2 grandchildren
    expect(progress.complete).toBe(2) // grandchild-1 + child-2
    expect(progress.inProgress).toBe(1) // child-1
    expect(progress.pending).toBe(1) // grandchild-2
    expect(progress.percentage).toBe(50) // 2/4 = 50%
  })
})

describe('deriveParentStatus', () => {
  it('returns pending for no children', () => {
    expect(deriveParentStatus([], {})).toBe('pending')
  })

  it('returns complete when all children complete', () => {
    const children = [createItem('1'), createItem('2'), createItem('3')]
    const statuses: Record<string, TrackingStatus> = {
      '1': 'complete',
      '2': 'complete',
      '3': 'complete',
    }

    expect(deriveParentStatus(children, statuses)).toBe('complete')
  })

  it('returns in_progress when any child in_progress', () => {
    const children = [createItem('1'), createItem('2'), createItem('3')]
    const statuses: Record<string, TrackingStatus> = {
      '1': 'complete',
      '2': 'in_progress',
      '3': 'pending',
    }

    expect(deriveParentStatus(children, statuses)).toBe('in_progress')
  })

  it('returns pending when mixed but no in_progress', () => {
    const children = [createItem('1'), createItem('2'), createItem('3')]
    const statuses: Record<string, TrackingStatus> = {
      '1': 'complete',
      '2': 'pending',
      '3': 'pending',
    }

    expect(deriveParentStatus(children, statuses)).toBe('pending')
  })

  it('returns pending when all children pending', () => {
    const children = [createItem('1'), createItem('2')]
    const statuses: Record<string, TrackingStatus> = {}

    expect(deriveParentStatus(children, statuses)).toBe('pending')
  })
})

describe('deriveDeepParentStatus', () => {
  it('returns pending for item with no children', () => {
    const item = createItem('parent')
    expect(deriveDeepParentStatus(item, {})).toBe('pending')
  })

  it('returns complete when all descendants complete', () => {
    const item = createItem('parent', [
      createItem('child-1', [createItem('grandchild-1')]),
      createItem('child-2'),
    ])

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete',
      'grandchild-1': 'complete',
      'child-2': 'complete',
    }

    expect(deriveDeepParentStatus(item, statuses)).toBe('complete')
  })

  it('returns in_progress when any descendant in_progress', () => {
    const item = createItem('parent', [
      createItem('child-1', [createItem('grandchild-1')]),
      createItem('child-2'),
    ])

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete',
      'grandchild-1': 'in_progress',
      'child-2': 'complete',
    }

    expect(deriveDeepParentStatus(item, statuses)).toBe('in_progress')
  })

  it('stays in_progress when some children complete and others pending (was in_progress)', () => {
    const item = createItem('parent', [
      createItem('child-1'),
      createItem('child-2'),
      createItem('child-3'),
    ])

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete',
      'child-2': 'pending',
      'child-3': 'pending',
    }

    // Parent was in_progress, should stay in_progress since work has been done
    expect(deriveDeepParentStatus(item, statuses, 'in_progress')).toBe('in_progress')
  })

  it('returns to pending when all children reset to pending (was in_progress)', () => {
    const item = createItem('parent', [
      createItem('child-1'),
      createItem('child-2'),
    ])

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'pending',
      'child-2': 'pending',
    }

    // Parent was in_progress, but all children reset to pending
    expect(deriveDeepParentStatus(item, statuses, 'in_progress')).toBe('pending')
  })

  it('stays pending when some children complete but was never in_progress', () => {
    const item = createItem('parent', [
      createItem('child-1'),
      createItem('child-2'),
    ])

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete',
      'child-2': 'pending',
    }

    // Parent was pending, with no in_progress children, stays pending
    expect(deriveDeepParentStatus(item, statuses, 'pending')).toBe('pending')
  })
})

describe('findAncestors', () => {
  it('returns empty array for root item', () => {
    const items = [createItem('root', [createItem('child')])]
    const ancestors = findAncestors('root', items)

    expect(ancestors).toEqual([])
  })

  it('returns parent for direct child', () => {
    const items = [createItem('parent', [createItem('child')])]
    const ancestors = findAncestors('child', items)

    expect(ancestors).toEqual(['parent'])
  })

  it('returns ancestors from child to root', () => {
    const items = [
      createItem('grandparent', [
        createItem('parent', [createItem('child')]),
      ]),
    ]

    const ancestors = findAncestors('child', items)

    expect(ancestors).toEqual(['parent', 'grandparent'])
  })

  it('handles multiple root items', () => {
    const items = [
      createItem('root-1', [createItem('child-1')]),
      createItem('root-2', [createItem('child-2')]),
    ]

    expect(findAncestors('child-1', items)).toEqual(['root-1'])
    expect(findAncestors('child-2', items)).toEqual(['root-2'])
  })

  it('returns empty array for non-existent item', () => {
    const items = [createItem('parent', [createItem('child')])]
    const ancestors = findAncestors('non-existent', items)

    expect(ancestors).toEqual([])
  })
})

describe('propagateStatusChange', () => {
  it('returns empty map when no parents need updates', () => {
    const items = [createItem('item-1')]
    const statuses: Record<string, TrackingStatus> = {
      'item-1': 'complete',
    }

    const updates = propagateStatusChange('item-1', items, statuses)

    expect(updates.size).toBe(0)
  })

  it('updates parent when child completes and all siblings complete', () => {
    const items = [
      createItem('parent', [
        createItem('child-1'),
        createItem('child-2'),
      ]),
    ]

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete',
      'child-2': 'complete',
      'parent': 'pending',
    }

    const updates = propagateStatusChange('child-2', items, statuses)

    expect(updates.get('parent')).toBe('complete')
  })

  it('updates parent to in_progress when child goes in_progress', () => {
    const items = [
      createItem('parent', [
        createItem('child-1'),
        createItem('child-2'),
      ]),
    ]

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'in_progress',
      'child-2': 'pending',
      'parent': 'pending',
    }

    const updates = propagateStatusChange('child-1', items, statuses)

    expect(updates.get('parent')).toBe('in_progress')
  })

  it('propagates updates up multiple levels', () => {
    const items = [
      createItem('grandparent', [
        createItem('parent', [
          createItem('child-1'),
          createItem('child-2'),
        ]),
      ]),
    ]

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete',
      'child-2': 'complete',
      'parent': 'pending',
      'grandparent': 'pending',
    }

    const updates = propagateStatusChange('child-2', items, statuses)

    expect(updates.get('parent')).toBe('complete')
    expect(updates.get('grandparent')).toBe('complete')
  })

  it('does not update parent when status already correct', () => {
    const items = [
      createItem('parent', [
        createItem('child-1'),
        createItem('child-2'),
      ]),
    ]

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete',
      'child-2': 'pending',
      'parent': 'pending', // Already correct
    }

    const updates = propagateStatusChange('child-1', items, statuses)

    expect(updates.has('parent')).toBe(false)
  })

  it('updates parent from complete to pending when child unchecked', () => {
    const items = [
      createItem('parent', [
        createItem('child-1'),
        createItem('child-2'),
      ]),
    ]

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'pending', // Was complete, now pending
      'child-2': 'complete',
      'parent': 'complete',
    }

    const updates = propagateStatusChange('child-1', items, statuses)

    expect(updates.get('parent')).toBe('pending')
  })

  it('does not mark grandparent complete when sibling branch has incomplete nested children', () => {
    // grandparent
    //   ├─ parent (children all complete)
    //   │    ├─ child-1 (complete)
    //   │    └─ child-2 (complete)
    //   └─ aunt (has incomplete nested children)
    //        └─ cousin (pending)
    const items = [
      createItem('grandparent', [
        createItem('parent', [
          createItem('child-1'),
          createItem('child-2'),
        ]),
        createItem('aunt', [
          createItem('cousin'),
        ]),
      ]),
    ]

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete',
      'child-2': 'complete',
      'parent': 'pending',
      'cousin': 'pending', // Still pending
      'aunt': 'pending',
      'grandparent': 'pending',
    }

    const updates = propagateStatusChange('child-2', items, statuses)

    // parent should become complete (all its children are complete)
    expect(updates.get('parent')).toBe('complete')
    // grandparent should NOT become complete (cousin is still pending)
    expect(updates.has('grandparent')).toBe(false)
  })

  it('marks grandparent complete only when all nested descendants are complete', () => {
    const items = [
      createItem('grandparent', [
        createItem('parent', [
          createItem('child-1'),
          createItem('child-2'),
        ]),
        createItem('aunt', [
          createItem('cousin'),
        ]),
      ]),
    ]

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete',
      'child-2': 'complete',
      'parent': 'complete',
      'cousin': 'complete', // Now complete too
      'aunt': 'complete',
      'grandparent': 'pending',
    }

    const updates = propagateStatusChange('cousin', items, statuses)

    // grandparent should now become complete (all descendants are complete)
    expect(updates.get('grandparent')).toBe('complete')
  })

  it('keeps parent in_progress when child completes but siblings are pending', () => {
    const items = [
      createItem('parent', [
        createItem('child-1'),
        createItem('child-2'),
        createItem('child-3'),
      ]),
    ]

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'complete', // Just completed
      'child-2': 'pending',
      'child-3': 'pending',
      'parent': 'in_progress', // Was already in_progress
    }

    const updates = propagateStatusChange('child-1', items, statuses)

    // Parent should NOT be updated (stays in_progress)
    expect(updates.has('parent')).toBe(false)
  })

  it('resets parent to pending when all children reset to pending', () => {
    const items = [
      createItem('parent', [
        createItem('child-1'),
        createItem('child-2'),
      ]),
    ]

    const statuses: Record<string, TrackingStatus> = {
      'child-1': 'pending', // Reset to pending
      'child-2': 'pending', // Reset to pending
      'parent': 'in_progress', // Was in_progress
    }

    const updates = propagateStatusChange('child-1', items, statuses)

    // Parent should go back to pending
    expect(updates.get('parent')).toBe('pending')
  })
})
