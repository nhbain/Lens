/**
 * Tests for ResumeSection component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResumeSection } from './ResumeSection'
import type { InProgressItemSummary } from '@/lib/navigation/types'
import type { TrackableItem } from '@/lib/parser/types'

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
  id: string,
  overrides: Partial<InProgressItemSummary> = {}
): InProgressItemSummary => ({
  item: createMockItem({ id }),
  filePath: `/path/to/${id}.md`,
  fileName: `${id}.md`,
  lastWorkedAt: new Date().toISOString(),
  ...overrides,
})

describe('ResumeSection', () => {
  describe('rendering', () => {
    it('renders section with title', () => {
      render(<ResumeSection items={[createMockSummary('item-1')]} />)

      expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(
        'Continue Where You Left Off'
      )
    })

    it('renders all provided items', () => {
      const items = [
        createMockSummary('item-1', { item: createMockItem({ content: 'First Task' }) }),
        createMockSummary('item-2', { item: createMockItem({ content: 'Second Task' }) }),
        createMockSummary('item-3', { item: createMockItem({ content: 'Third Task' }) }),
      ]

      render(<ResumeSection items={items} />)

      expect(screen.getByText('First Task')).toBeInTheDocument()
      expect(screen.getByText('Second Task')).toBeInTheDocument()
      expect(screen.getByText('Third Task')).toBeInTheDocument()
    })

    it('renders items in a list', () => {
      const items = [
        createMockSummary('item-1'),
        createMockSummary('item-2'),
      ]

      render(<ResumeSection items={items} />)

      expect(screen.getByRole('list', { name: 'In-progress items' })).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })
  })

  describe('empty state', () => {
    it('does not render when items is empty and not loading', () => {
      const { container } = render(<ResumeSection items={[]} />)

      expect(container.firstChild).toBeNull()
    })

    it('renders loading state when loading with no items', () => {
      render(<ResumeSection items={[]} isLoading={true} />)

      expect(screen.getByRole('status', { name: 'Loading in-progress items' })).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows loading indicator when isLoading is true', () => {
      render(<ResumeSection items={[]} isLoading={true} />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
    })

    it('shows loading instead of items when loading', () => {
      const items = [createMockSummary('item-1')]

      render(<ResumeSection items={items} isLoading={true} />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.queryByText('Test Item')).not.toBeInTheDocument()
    })
  })

  describe('show all functionality', () => {
    it('shows "Show all" button when totalCount exceeds displayed items', () => {
      const items = [createMockSummary('item-1')]
      const handleShowAll = vi.fn()

      render(
        <ResumeSection
          items={items}
          totalCount={10}
          onShowAll={handleShowAll}
        />
      )

      expect(screen.getByRole('button', { name: /show all/i })).toBeInTheDocument()
      expect(screen.getByText('Show all (10)')).toBeInTheDocument()
    })

    it('does not show "Show all" when totalCount equals displayed items', () => {
      const items = [createMockSummary('item-1')]

      render(<ResumeSection items={items} totalCount={1} />)

      expect(screen.queryByRole('button', { name: /show all/i })).not.toBeInTheDocument()
    })

    it('does not show "Show all" when totalCount is undefined', () => {
      const items = [createMockSummary('item-1')]

      render(<ResumeSection items={items} />)

      expect(screen.queryByRole('button', { name: /show all/i })).not.toBeInTheDocument()
    })

    it('does not show "Show all" when onShowAll is not provided', () => {
      const items = [createMockSummary('item-1')]

      render(<ResumeSection items={items} totalCount={10} />)

      expect(screen.queryByRole('button', { name: /show all/i })).not.toBeInTheDocument()
    })

    it('calls onShowAll when "Show all" is clicked', () => {
      const items = [createMockSummary('item-1')]
      const handleShowAll = vi.fn()

      render(
        <ResumeSection
          items={items}
          totalCount={10}
          onShowAll={handleShowAll}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /show all/i }))
      expect(handleShowAll).toHaveBeenCalled()
    })
  })

  describe('item click handling', () => {
    it('calls onItemClick when an item is clicked', () => {
      const items = [createMockSummary('item-1')]
      const handleItemClick = vi.fn()

      render(<ResumeSection items={items} onItemClick={handleItemClick} />)

      fireEvent.click(screen.getByRole('button', { name: /resume/i }))
      expect(handleItemClick).toHaveBeenCalledWith(items[0])
    })

    it('does not throw when onItemClick is not provided', () => {
      const items = [createMockSummary('item-1')]

      render(<ResumeSection items={items} />)

      expect(() => {
        fireEvent.click(screen.getByRole('button', { name: /resume/i }))
      }).not.toThrow()
    })
  })

  describe('accessibility', () => {
    it('has section with aria-labelledby', () => {
      const items = [createMockSummary('item-1')]

      render(<ResumeSection items={items} />)

      const section = screen.getByRole('region')
      expect(section).toHaveAttribute('aria-labelledby', 'resume-section-title')
    })

    it('has list with aria-label', () => {
      const items = [createMockSummary('item-1')]

      render(<ResumeSection items={items} />)

      expect(screen.getByRole('list', { name: 'In-progress items' })).toBeInTheDocument()
    })

    it('has loading status with aria-label', () => {
      render(<ResumeSection items={[]} isLoading={true} />)

      expect(screen.getByRole('status', { name: 'Loading in-progress items' })).toBeInTheDocument()
    })

    it('has accessible "Show all" button with count', () => {
      const items = [createMockSummary('item-1')]
      const handleShowAll = vi.fn()

      render(
        <ResumeSection
          items={items}
          totalCount={10}
          onShowAll={handleShowAll}
        />
      )

      const button = screen.getByRole('button', { name: /show all 10/i })
      expect(button).toBeInTheDocument()
    })
  })

  describe('unique keys', () => {
    it('handles items from same file with different IDs', () => {
      const items = [
        createMockSummary('item-1', { filePath: '/same/file.md' }),
        createMockSummary('item-2', { filePath: '/same/file.md' }),
      ]

      render(<ResumeSection items={items} />)

      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })

    it('handles items with same ID from different files', () => {
      const items = [
        createMockSummary('same-id', { filePath: '/file1.md', item: createMockItem({ id: 'same-id' }) }),
        createMockSummary('same-id', { filePath: '/file2.md', item: createMockItem({ id: 'same-id' }) }),
      ]

      render(<ResumeSection items={items} />)

      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })
  })
})
