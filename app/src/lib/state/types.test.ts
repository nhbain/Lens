import { describe, it, expect } from 'vitest'
import {
  isItemTrackingState,
  isFileTrackingState,
  isAppState,
  createEmptyAppState,
  createFileTrackingState,
  createItemTrackingState,
  CURRENT_STATE_VERSION,
} from './types'

describe('isItemTrackingState', () => {
  it('returns true for valid ItemTrackingState', () => {
    const valid = {
      itemId: 'abc123',
      status: 'pending',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isItemTrackingState(valid)).toBe(true)
  })

  it('returns true for all valid status values', () => {
    const statuses = ['pending', 'in_progress', 'complete']
    for (const status of statuses) {
      const item = {
        itemId: 'test',
        status,
        updatedAt: '2024-01-01T00:00:00.000Z',
      }
      expect(isItemTrackingState(item)).toBe(true)
    }
  })

  it('returns false for null', () => {
    expect(isItemTrackingState(null)).toBe(false)
  })

  it('returns false for undefined', () => {
    expect(isItemTrackingState(undefined)).toBe(false)
  })

  it('returns false for non-object values', () => {
    expect(isItemTrackingState('string')).toBe(false)
    expect(isItemTrackingState(123)).toBe(false)
    expect(isItemTrackingState(true)).toBe(false)
  })

  it('returns false when itemId is missing', () => {
    const invalid = {
      status: 'pending',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isItemTrackingState(invalid)).toBe(false)
  })

  it('returns false when status is missing', () => {
    const invalid = {
      itemId: 'abc123',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isItemTrackingState(invalid)).toBe(false)
  })

  it('returns false when status is invalid', () => {
    const invalid = {
      itemId: 'abc123',
      status: 'invalid_status',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isItemTrackingState(invalid)).toBe(false)
  })

  it('returns false when updatedAt is missing', () => {
    const invalid = {
      itemId: 'abc123',
      status: 'pending',
    }
    expect(isItemTrackingState(invalid)).toBe(false)
  })

  it('returns false when itemId is not a string', () => {
    const invalid = {
      itemId: 123,
      status: 'pending',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isItemTrackingState(invalid)).toBe(false)
  })
})

describe('isFileTrackingState', () => {
  it('returns true for valid FileTrackingState with empty items', () => {
    const valid = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123hash',
      totalItemCount: 0,
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isFileTrackingState(valid)).toBe(true)
  })

  it('returns true for valid FileTrackingState with items', () => {
    const valid = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123hash',
      totalItemCount: 10,
      items: {
        item1: {
          itemId: 'item1',
          status: 'pending',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
        item2: {
          itemId: 'item2',
          status: 'complete',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isFileTrackingState(valid)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isFileTrackingState(null)).toBe(false)
  })

  it('returns false when sourcePath is missing', () => {
    const invalid = {
      contentHash: 'abc123hash',
      totalItemCount: 5,
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isFileTrackingState(invalid)).toBe(false)
  })

  it('returns false when contentHash is missing', () => {
    const invalid = {
      sourcePath: '/path/to/file.md',
      totalItemCount: 5,
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isFileTrackingState(invalid)).toBe(false)
  })

  it('returns false when items is not an object', () => {
    const invalid = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123hash',
      totalItemCount: 5,
      items: 'not an object',
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isFileTrackingState(invalid)).toBe(false)
  })

  it('returns false when items is null', () => {
    const invalid = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123hash',
      totalItemCount: 5,
      items: null,
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isFileTrackingState(invalid)).toBe(false)
  })

  it('returns false when an item is invalid', () => {
    const invalid = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123hash',
      totalItemCount: 5,
      items: {
        item1: {
          itemId: 'item1',
          // missing status and updatedAt
        },
      },
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isFileTrackingState(invalid)).toBe(false)
  })

  it('returns false when createdAt is missing', () => {
    const invalid = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123hash',
      totalItemCount: 5,
      items: {},
      collapsedItems: {},
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isFileTrackingState(invalid)).toBe(false)
  })

  it('returns false when updatedAt is missing', () => {
    const invalid = {
      sourcePath: '/path/to/file.md',
      contentHash: 'abc123hash',
      totalItemCount: 5,
      items: {},
      collapsedItems: {},
      createdAt: '2024-01-01T00:00:00.000Z',
    }
    expect(isFileTrackingState(invalid)).toBe(false)
  })
})

describe('isAppState', () => {
  it('returns true for valid AppState with empty files', () => {
    const valid = {
      version: 1,
      files: {},
    }
    expect(isAppState(valid)).toBe(true)
  })

  it('returns true for valid AppState with files', () => {
    const valid = {
      version: 1,
      files: {
        '/path/to/file.md': {
          sourcePath: '/path/to/file.md',
          contentHash: 'abc123hash',
          totalItemCount: 5,
          items: {},
          collapsedItems: {},
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
        },
      },
    }
    expect(isAppState(valid)).toBe(true)
  })

  it('returns false for null', () => {
    expect(isAppState(null)).toBe(false)
  })

  it('returns false when version is missing', () => {
    const invalid = {
      files: {},
    }
    expect(isAppState(invalid)).toBe(false)
  })

  it('returns false when version is not a number', () => {
    const invalid = {
      version: '1',
      files: {},
    }
    expect(isAppState(invalid)).toBe(false)
  })

  it('returns false when files is missing', () => {
    const invalid = {
      version: 1,
    }
    expect(isAppState(invalid)).toBe(false)
  })

  it('returns false when files is null', () => {
    const invalid = {
      version: 1,
      files: null,
    }
    expect(isAppState(invalid)).toBe(false)
  })

  it('returns false when a file entry is invalid', () => {
    const invalid = {
      version: 1,
      files: {
        '/path/to/file.md': {
          sourcePath: '/path/to/file.md',
          // missing other required fields (contentHash, totalItemCount, items, etc.)
        },
      },
    }
    expect(isAppState(invalid)).toBe(false)
  })
})

describe('createEmptyAppState', () => {
  it('creates AppState with current version', () => {
    const state = createEmptyAppState()
    expect(state.version).toBe(CURRENT_STATE_VERSION)
  })

  it('creates AppState with empty files map', () => {
    const state = createEmptyAppState()
    expect(state.files).toEqual({})
  })

  it('creates valid AppState', () => {
    const state = createEmptyAppState()
    expect(isAppState(state)).toBe(true)
  })
})

describe('createFileTrackingState', () => {
  it('creates FileTrackingState with given values', () => {
    const state = createFileTrackingState('/path/to/file.md', 'hash123', 10)
    expect(state.sourcePath).toBe('/path/to/file.md')
    expect(state.contentHash).toBe('hash123')
    expect(state.totalItemCount).toBe(10)
  })

  it('creates FileTrackingState with empty items', () => {
    const state = createFileTrackingState('/path/to/file.md', 'hash123', 5)
    expect(state.items).toEqual({})
  })

  it('creates FileTrackingState with timestamps', () => {
    const before = new Date().toISOString()
    const state = createFileTrackingState('/path/to/file.md', 'hash123', 5)
    const after = new Date().toISOString()

    expect(state.createdAt >= before).toBe(true)
    expect(state.createdAt <= after).toBe(true)
    expect(state.createdAt).toBe(state.updatedAt)
  })

  it('creates valid FileTrackingState', () => {
    const state = createFileTrackingState('/path/to/file.md', 'hash123', 5)
    expect(isFileTrackingState(state)).toBe(true)
  })
})

describe('createItemTrackingState', () => {
  it('creates ItemTrackingState with given itemId', () => {
    const state = createItemTrackingState('item123')
    expect(state.itemId).toBe('item123')
  })

  it('creates ItemTrackingState with pending status by default', () => {
    const state = createItemTrackingState('item123')
    expect(state.status).toBe('pending')
  })

  it('creates ItemTrackingState with specified status', () => {
    const state = createItemTrackingState('item123', 'complete')
    expect(state.status).toBe('complete')
  })

  it('creates ItemTrackingState with timestamp', () => {
    const before = new Date().toISOString()
    const state = createItemTrackingState('item123')
    const after = new Date().toISOString()

    expect(state.updatedAt >= before).toBe(true)
    expect(state.updatedAt <= after).toBe(true)
  })

  it('creates valid ItemTrackingState', () => {
    const state = createItemTrackingState('item123')
    expect(isItemTrackingState(state)).toBe(true)
  })
})
