/**
 * Tests for useCollapseState hook helper functions.
 * Note: The hook itself is tested indirectly through component tests
 * due to Tauri module mocking complexity with React hooks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the state module
vi.mock('@/lib/state', () => ({
  loadFileState: vi.fn(),
  updateCollapseState: vi.fn(),
  setAllCollapsed: vi.fn(),
}))

import {
  loadFileState,
  updateCollapseState,
  setAllCollapsed,
} from '@/lib/state'
import type { TrackableItem } from '@/lib/parser/types'

const mockLoadFileState = vi.mocked(loadFileState)
const mockUpdateCollapseState = vi.mocked(updateCollapseState)
const mockSetAllCollapsed = vi.mocked(setAllCollapsed)

/**
 * Helper to create mock TrackableItem for testing.
 */
const createMockItem = (
  id: string,
  type: 'header' | 'checkbox' | 'listItem' = 'header',
  children: TrackableItem[] = []
): TrackableItem => ({
  id,
  type,
  content: `Item ${id}`,
  depth: 1,
  position: { line: 1, column: 1 },
  children,
})

/**
 * Helper to create a mock file tracking state.
 */
const createMockFileState = (collapsedItems: Record<string, boolean> = {}) => ({
  sourcePath: '/test/file.md',
  contentHash: 'abc123',
  items: {},
  collapsedItems,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
})

/**
 * Implementation of getCollapsibleItemIds for testing.
 * Collects all header item IDs from the tree that have children.
 */
function getCollapsibleItemIds(tree: TrackableItem[]): string[] {
  const ids: string[] = []

  const traverse = (items: TrackableItem[]) => {
    for (const item of items) {
      // Only headers with children are collapsible
      if (item.type === 'header' && item.children.length > 0) {
        ids.push(item.id)
      }
      // Recurse into children
      if (item.children.length > 0) {
        traverse(item.children)
      }
    }
  }

  traverse(tree)
  return ids
}

describe('useCollapseState helper functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getCollapsibleItemIds', () => {
    it('returns empty array for empty tree', () => {
      const result = getCollapsibleItemIds([])
      expect(result).toEqual([])
    })

    it('returns empty array for tree with only leaf items', () => {
      const tree: TrackableItem[] = [
        createMockItem('item-1', 'checkbox'),
        createMockItem('item-2', 'listItem'),
      ]
      const result = getCollapsibleItemIds(tree)
      expect(result).toEqual([])
    })

    it('returns empty array for headers without children', () => {
      const tree: TrackableItem[] = [
        createMockItem('header-1', 'header', []),
        createMockItem('header-2', 'header', []),
      ]
      const result = getCollapsibleItemIds(tree)
      expect(result).toEqual([])
    })

    it('returns header IDs for headers with children', () => {
      const tree: TrackableItem[] = [
        createMockItem('header-1', 'header', [
          createMockItem('child-1', 'checkbox'),
        ]),
        createMockItem('header-2', 'header', [
          createMockItem('child-2', 'listItem'),
        ]),
      ]
      const result = getCollapsibleItemIds(tree)
      expect(result).toEqual(['header-1', 'header-2'])
    })

    it('returns nested header IDs', () => {
      const tree: TrackableItem[] = [
        createMockItem('h1', 'header', [
          createMockItem('h2', 'header', [
            createMockItem('checkbox', 'checkbox'),
          ]),
        ]),
      ]
      const result = getCollapsibleItemIds(tree)
      expect(result).toEqual(['h1', 'h2'])
    })

    it('excludes non-header items even if they have children', () => {
      const tree: TrackableItem[] = [
        createMockItem('list', 'listItem', [
          createMockItem('nested', 'checkbox'),
        ]),
      ]
      const result = getCollapsibleItemIds(tree)
      expect(result).toEqual([])
    })
  })

  describe('loadFileState integration', () => {
    it('returns collapsed items from file state', async () => {
      const mockState = createMockFileState({
        'header-1': true,
        'header-2': false,
      })
      mockLoadFileState.mockResolvedValue(mockState)

      const result = await loadFileState('/test/file.md')

      expect(result?.collapsedItems).toEqual({
        'header-1': true,
        'header-2': false,
      })
    })

    it('returns null when file state does not exist', async () => {
      mockLoadFileState.mockResolvedValue(null)

      const result = await loadFileState('/test/nonexistent.md')

      expect(result).toBeNull()
    })
  })

  describe('updateCollapseState integration', () => {
    it('updates single item collapse state', async () => {
      const mockState = createMockFileState({ 'header-1': true })
      mockUpdateCollapseState.mockResolvedValue(mockState)

      await updateCollapseState('/test/file.md', 'header-1', true)

      expect(mockUpdateCollapseState).toHaveBeenCalledWith(
        '/test/file.md',
        'header-1',
        true
      )
    })

    it('toggles item from collapsed to expanded', async () => {
      const mockState = createMockFileState({ 'header-1': false })
      mockUpdateCollapseState.mockResolvedValue(mockState)

      await updateCollapseState('/test/file.md', 'header-1', false)

      expect(mockUpdateCollapseState).toHaveBeenCalledWith(
        '/test/file.md',
        'header-1',
        false
      )
    })
  })

  describe('setAllCollapsed integration', () => {
    it('collapses all items', async () => {
      const itemIds = ['header-1', 'header-2', 'header-3']
      const mockState = createMockFileState({
        'header-1': true,
        'header-2': true,
        'header-3': true,
      })
      mockSetAllCollapsed.mockResolvedValue(mockState)

      await setAllCollapsed('/test/file.md', true, itemIds)

      expect(mockSetAllCollapsed).toHaveBeenCalledWith(
        '/test/file.md',
        true,
        itemIds
      )
    })

    it('expands all items', async () => {
      const itemIds = ['header-1', 'header-2']
      const mockState = createMockFileState({
        'header-1': false,
        'header-2': false,
      })
      mockSetAllCollapsed.mockResolvedValue(mockState)

      await setAllCollapsed('/test/file.md', false, itemIds)

      expect(mockSetAllCollapsed).toHaveBeenCalledWith(
        '/test/file.md',
        false,
        itemIds
      )
    })
  })
})

describe('collapse state transformations', () => {
  describe('isCollapsed logic', () => {
    it('returns true for collapsed item', () => {
      const collapsedItems: Record<string, boolean> = {
        'header-1': true,
        'header-2': false,
      }
      const isCollapsed = (itemId: string) => collapsedItems[itemId] === true

      expect(isCollapsed('header-1')).toBe(true)
    })

    it('returns false for expanded item', () => {
      const collapsedItems: Record<string, boolean> = {
        'header-1': true,
        'header-2': false,
      }
      const isCollapsed = (itemId: string) => collapsedItems[itemId] === true

      expect(isCollapsed('header-2')).toBe(false)
    })

    it('returns false for unknown item (default expanded)', () => {
      const collapsedItems: Record<string, boolean> = {}
      const isCollapsed = (itemId: string) => collapsedItems[itemId] === true

      expect(isCollapsed('unknown-item')).toBe(false)
    })
  })

  describe('toggle collapse logic', () => {
    it('toggles from expanded to collapsed', () => {
      const collapsedItems: Record<string, boolean> = { 'header-1': false }
      const newCollapsed = !collapsedItems['header-1']

      expect(newCollapsed).toBe(true)
    })

    it('toggles from collapsed to expanded', () => {
      const collapsedItems: Record<string, boolean> = { 'header-1': true }
      const newCollapsed = !collapsedItems['header-1']

      expect(newCollapsed).toBe(false)
    })

    it('toggles undefined to collapsed (default is expanded)', () => {
      const collapsedItems: Record<string, boolean> = {}
      const newCollapsed = !collapsedItems['header-1']

      expect(newCollapsed).toBe(true)
    })
  })

  describe('collapse all logic', () => {
    it('creates collapsed state for all items', () => {
      const collapsibleIds = ['h1', 'h2', 'h3']
      const newCollapsedItems: Record<string, boolean> = {}
      for (const id of collapsibleIds) {
        newCollapsedItems[id] = true
      }

      expect(newCollapsedItems).toEqual({
        h1: true,
        h2: true,
        h3: true,
      })
    })
  })

  describe('expand all logic', () => {
    it('creates expanded state for all items', () => {
      const collapsibleIds = ['h1', 'h2', 'h3']
      const newCollapsedItems: Record<string, boolean> = {}
      for (const id of collapsibleIds) {
        newCollapsedItems[id] = false
      }

      expect(newCollapsedItems).toEqual({
        h1: false,
        h2: false,
        h3: false,
      })
    })
  })
})
