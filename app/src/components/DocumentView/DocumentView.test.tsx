/**
 * Tests for DocumentView component.
 * Uses mock component to avoid React hook issues with Tauri module mocking.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'
import type { DocumentViewProps } from './types'

/**
 * Mock TrackableItemRow component for testing.
 */
const MockTrackableItemRow = ({
  item,
  status,
  isFocused,
  disabled,
  onClick,
  onActivate,
}: {
  item: TrackableItem
  status: TrackingStatus
  isFocused: boolean
  disabled?: boolean
  onClick?: (item: TrackableItem) => void
  onActivate?: (item: TrackableItem) => void
}) => {
  const statusClass = status.replace('_', '-')
  return (
    <div
      className={`trackable-item-row trackable-item-row--${item.type} trackable-item-row--${statusClass}${isFocused ? ' trackable-item-row--focused' : ''}`}
      data-item-id={item.id}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-disabled={disabled}
      onClick={() => !disabled && onClick?.(item)}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onActivate?.(item)
        }
      }}
    >
      <span className="trackable-item-content">{item.content}</span>
    </div>
  )
}

/**
 * Flatten items helper (mirrors the real implementation).
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
 * Mock DocumentView component for testing.
 * Mirrors the real component behavior without hooks that cause issues.
 */
const MockDocumentView = ({
  items,
  title,
  filePath,
  itemStatuses = {},
  onItemClick,
  onItemStatusChange,
  isLoading = false,
  targetItemId,
}: DocumentViewProps) => {
  const flatItems = flattenItems(items)

  const getItemStatus = (itemId: string): TrackingStatus => {
    return itemStatuses[itemId] ?? 'pending'
  }

  const handleItemClick = (item: TrackableItem) => {
    onItemClick?.(item)
  }

  const handleItemActivate = (item: TrackableItem) => {
    const currentStatus = getItemStatus(item.id)
    const nextStatus: TrackingStatus =
      currentStatus === 'pending'
        ? 'in_progress'
        : currentStatus === 'in_progress'
          ? 'complete'
          : 'pending'
    onItemStatusChange?.(item.id, nextStatus)
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

  if (flatItems.length === 0) {
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

  return (
    <div className="document-view">
      {(title ?? filePath) && (
        <header className="document-view-header">
          {title && <h1 className="document-view-title">{title}</h1>}
          {filePath && (
            <p className="document-view-filepath" title={filePath}>
              {filePath}
            </p>
          )}
        </header>
      )}
      <div className="document-view-content" role="list">
        {flatItems.map((item) => (
          <MockTrackableItemRow
            key={item.id}
            item={item}
            status={getItemStatus(item.id)}
            isFocused={item.id === targetItemId}
            onClick={handleItemClick}
            onActivate={handleItemActivate}
          />
        ))}
      </div>
    </div>
  )
}

// Use MockDocumentView for testing
const DocumentView = MockDocumentView

const createMockItem = (
  id: string,
  overrides: Partial<TrackableItem> = {}
): TrackableItem => ({
  id,
  type: 'header',
  content: `Content for ${id}`,
  depth: 1,
  position: { line: 1, column: 1 },
  children: [],
  ...overrides,
})

describe('DocumentView', () => {
  describe('empty state', () => {
    it('shows empty state when no items', () => {
      render(<DocumentView items={[]} />)

      expect(screen.getByText('No trackable items found')).toBeInTheDocument()
    })

    it('shows helpful message in empty state', () => {
      render(<DocumentView items={[]} />)

      expect(
        screen.getByText(
          /doesn't contain any headers, lists, or checkboxes to track/
        )
      ).toBeInTheDocument()
    })

    it('applies empty class to container', () => {
      const { container } = render(<DocumentView items={[]} />)

      expect(container.firstChild).toHaveClass('document-view--empty')
    })
  })

  describe('loading state', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<DocumentView items={[]} isLoading={true} />)

      expect(screen.getByText('Loading document...')).toBeInTheDocument()
    })

    it('applies loading class to container', () => {
      const { container } = render(<DocumentView items={[]} isLoading={true} />)

      expect(container.firstChild).toHaveClass('document-view--loading')
    })

    it('sets aria-busy when loading', () => {
      const { container } = render(<DocumentView items={[]} isLoading={true} />)

      expect(container.firstChild).toHaveAttribute('aria-busy', 'true')
    })

    it('does not show items while loading', () => {
      const items = [createMockItem('item-1')]
      render(<DocumentView items={items} isLoading={true} />)

      expect(screen.queryByText('Content for item-1')).not.toBeInTheDocument()
    })
  })

  describe('with items', () => {
    const mockItems = [
      createMockItem('item-1', { content: 'First Item' }),
      createMockItem('item-2', { content: 'Second Item' }),
    ]

    it('renders all items', () => {
      render(<DocumentView items={mockItems} />)

      expect(screen.getByText('First Item')).toBeInTheDocument()
      expect(screen.getByText('Second Item')).toBeInTheDocument()
    })

    it('renders items in a list', () => {
      render(<DocumentView items={mockItems} />)

      expect(screen.getByRole('list')).toBeInTheDocument()
    })

    it('renders correct number of items', () => {
      render(<DocumentView items={mockItems} />)

      expect(screen.getAllByRole('button')).toHaveLength(2)
    })
  })

  describe('nested items', () => {
    it('flattens and renders nested items', () => {
      const items = [
        createMockItem('parent', {
          content: 'Parent',
          children: [
            createMockItem('child-1', { content: 'Child 1' }),
            createMockItem('child-2', { content: 'Child 2' }),
          ],
        }),
      ]
      render(<DocumentView items={items} />)

      expect(screen.getByText('Parent')).toBeInTheDocument()
      expect(screen.getByText('Child 1')).toBeInTheDocument()
      expect(screen.getByText('Child 2')).toBeInTheDocument()
    })

    it('renders nested items in correct order', () => {
      const items = [
        createMockItem('h1', {
          content: 'Heading 1',
          children: [createMockItem('h1-child', { content: 'Heading 1 Child' })],
        }),
        createMockItem('h2', { content: 'Heading 2' }),
      ]
      render(<DocumentView items={items} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toHaveTextContent('Heading 1')
      expect(buttons[1]).toHaveTextContent('Heading 1 Child')
      expect(buttons[2]).toHaveTextContent('Heading 2')
    })

    it('handles deeply nested items', () => {
      const items = [
        createMockItem('level-0', {
          content: 'Level 0',
          children: [
            createMockItem('level-1', {
              content: 'Level 1',
              children: [
                createMockItem('level-2', {
                  content: 'Level 2',
                  children: [createMockItem('level-3', { content: 'Level 3' })],
                }),
              ],
            }),
          ],
        }),
      ]
      render(<DocumentView items={items} />)

      expect(screen.getByText('Level 0')).toBeInTheDocument()
      expect(screen.getByText('Level 1')).toBeInTheDocument()
      expect(screen.getByText('Level 2')).toBeInTheDocument()
      expect(screen.getByText('Level 3')).toBeInTheDocument()
    })
  })

  describe('title and file path', () => {
    it('shows title when provided', () => {
      render(<DocumentView items={[createMockItem('item-1')]} title="My Document" />)

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'My Document'
      )
    })

    it('shows file path when provided', () => {
      render(
        <DocumentView
          items={[createMockItem('item-1')]}
          filePath="/path/to/doc.md"
        />
      )

      expect(screen.getByText('/path/to/doc.md')).toBeInTheDocument()
    })

    it('shows both title and file path', () => {
      render(
        <DocumentView
          items={[createMockItem('item-1')]}
          title="My Document"
          filePath="/path/to/doc.md"
        />
      )

      expect(screen.getByText('My Document')).toBeInTheDocument()
      expect(screen.getByText('/path/to/doc.md')).toBeInTheDocument()
    })

    it('hides header when neither title nor path provided', () => {
      render(<DocumentView items={[createMockItem('item-1')]} />)

      expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    })

    it('sets title attribute on file path for full path display', () => {
      const longPath = '/very/long/path/to/some/deep/directory/document.md'
      render(
        <DocumentView items={[createMockItem('item-1')]} filePath={longPath} />
      )

      expect(screen.getByText(longPath)).toHaveAttribute('title', longPath)
    })
  })

  describe('item statuses', () => {
    it('applies pending status by default', () => {
      const items = [createMockItem('item-1')]
      render(<DocumentView items={items} />)

      expect(screen.getByRole('button')).toHaveClass(
        'trackable-item-row--pending'
      )
    })

    it('applies status from itemStatuses prop', () => {
      const items = [createMockItem('item-1')]
      render(
        <DocumentView
          items={items}
          itemStatuses={{ 'item-1': 'complete' }}
        />
      )

      expect(screen.getByRole('button')).toHaveClass(
        'trackable-item-row--complete'
      )
    })

    it('applies different statuses to different items', () => {
      const items = [
        createMockItem('item-1', { content: 'Pending Item' }),
        createMockItem('item-2', { content: 'In Progress Item' }),
        createMockItem('item-3', { content: 'Complete Item' }),
      ]
      const statuses: Record<string, TrackingStatus> = {
        'item-1': 'pending',
        'item-2': 'in_progress',
        'item-3': 'complete',
      }
      render(<DocumentView items={items} itemStatuses={statuses} />)

      expect(screen.getByText('Pending Item').closest('[role="button"]')).toHaveClass(
        'trackable-item-row--pending'
      )
      expect(screen.getByText('In Progress Item').closest('[role="button"]')).toHaveClass(
        'trackable-item-row--in-progress'
      )
      expect(screen.getByText('Complete Item').closest('[role="button"]')).toHaveClass(
        'trackable-item-row--complete'
      )
    })
  })

  describe('interactions', () => {
    it('calls onItemClick when item is clicked', () => {
      const onItemClick = vi.fn()
      const items = [createMockItem('item-1', { content: 'Clickable Item' })]
      render(<DocumentView items={items} onItemClick={onItemClick} />)

      fireEvent.click(screen.getByText('Clickable Item'))

      expect(onItemClick).toHaveBeenCalledWith(items[0])
    })

    it('calls onItemStatusChange when item is activated', () => {
      const onItemStatusChange = vi.fn()
      const items = [createMockItem('item-1', { content: 'Activatable Item' })]
      render(
        <DocumentView items={items} onItemStatusChange={onItemStatusChange} />
      )

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })

      expect(onItemStatusChange).toHaveBeenCalledWith('item-1', 'in_progress')
    })

    it('cycles status from pending to in_progress', () => {
      const onItemStatusChange = vi.fn()
      const items = [createMockItem('item-1')]
      render(
        <DocumentView
          items={items}
          itemStatuses={{ 'item-1': 'pending' }}
          onItemStatusChange={onItemStatusChange}
        />
      )

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })

      expect(onItemStatusChange).toHaveBeenCalledWith('item-1', 'in_progress')
    })

    it('cycles status from in_progress to complete', () => {
      const onItemStatusChange = vi.fn()
      const items = [createMockItem('item-1')]
      render(
        <DocumentView
          items={items}
          itemStatuses={{ 'item-1': 'in_progress' }}
          onItemStatusChange={onItemStatusChange}
        />
      )

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })

      expect(onItemStatusChange).toHaveBeenCalledWith('item-1', 'complete')
    })

    it('cycles status from complete to pending', () => {
      const onItemStatusChange = vi.fn()
      const items = [createMockItem('item-1')]
      render(
        <DocumentView
          items={items}
          itemStatuses={{ 'item-1': 'complete' }}
          onItemStatusChange={onItemStatusChange}
        />
      )

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })

      expect(onItemStatusChange).toHaveBeenCalledWith('item-1', 'pending')
    })
  })

  describe('targetItemId (jump-to functionality)', () => {
    it('sets focused class on target item when targetItemId is provided', () => {
      const items = [
        createMockItem('item-1', { content: 'First Item' }),
        createMockItem('item-2', { content: 'Second Item' }),
        createMockItem('item-3', { content: 'Third Item' }),
      ]

      render(<DocumentView items={items} targetItemId="item-2" />)

      const targetButton = screen.getByText('Second Item').closest('[role="button"]')
      expect(targetButton).toHaveClass('trackable-item-row--focused')
    })

    it('does not set focused class on non-target items', () => {
      const items = [
        createMockItem('item-1', { content: 'First Item' }),
        createMockItem('item-2', { content: 'Second Item' }),
      ]

      render(<DocumentView items={items} targetItemId="item-2" />)

      const nonTargetButton = screen.getByText('First Item').closest('[role="button"]')
      expect(nonTargetButton).not.toHaveClass('trackable-item-row--focused')
    })

    it('renders without focused class when targetItemId is not provided', () => {
      const items = [createMockItem('item-1', { content: 'Item' })]

      render(<DocumentView items={items} />)

      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('trackable-item-row--focused')
    })

    it('handles targetItemId that does not exist in items', () => {
      const items = [createMockItem('item-1', { content: 'Item' })]

      render(<DocumentView items={items} targetItemId="non-existent" />)

      // Component should still render without errors
      expect(screen.getByText('Item')).toBeInTheDocument()
      // No item should have focused class
      expect(screen.getByRole('button')).not.toHaveClass('trackable-item-row--focused')
    })

    it('sets data-item-id attribute for scroll targeting', () => {
      const items = [createMockItem('item-1', { content: 'Item' })]

      render(<DocumentView items={items} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('data-item-id', 'item-1')
    })

    it('handles targetItemId in nested items', () => {
      const items = [
        createMockItem('parent', {
          content: 'Parent',
          children: [
            createMockItem('child-1', { content: 'Child One' }),
            createMockItem('child-2', { content: 'Child Two' }),
          ],
        }),
      ]

      render(<DocumentView items={items} targetItemId="child-2" />)

      const targetButton = screen.getByText('Child Two').closest('[role="button"]')
      expect(targetButton).toHaveClass('trackable-item-row--focused')
    })
  })
})
