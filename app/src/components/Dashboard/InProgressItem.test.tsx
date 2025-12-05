/**
 * Tests for InProgressItem component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InProgressItem } from './InProgressItem'
import type { InProgressItemSummary } from '@/lib/navigation/types'
import type { TrackableItem } from '@/lib/parser/types'

/**
 * Helper to create a mock trackable item.
 */
const createMockItem = (overrides: Partial<TrackableItem> = {}): TrackableItem => ({
  id: 'item-1',
  type: 'header',
  content: 'Test Item Content',
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
  lastWorkedAt: new Date().toISOString(),
  ...overrides,
})

describe('InProgressItem', () => {
  describe('rendering', () => {
    it('renders item content', () => {
      const summary = createMockSummary({
        item: createMockItem({ content: 'Important Task' }),
      })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText('Important Task')).toBeInTheDocument()
    })

    it('renders file name', () => {
      const summary = createMockSummary({ fileName: 'my-tasks.md' })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText('my-tasks.md')).toBeInTheDocument()
    })

    it('renders type indicator for header', () => {
      const summary = createMockSummary({
        item: createMockItem({ type: 'header' }),
      })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText('#')).toBeInTheDocument()
    })

    it('renders type indicator for checkbox', () => {
      const summary = createMockSummary({
        item: createMockItem({ type: 'checkbox' }),
      })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText('☐')).toBeInTheDocument()
    })

    it('renders type indicator for list item', () => {
      const summary = createMockSummary({
        item: createMockItem({ type: 'listItem' }),
      })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText('•')).toBeInTheDocument()
    })
  })

  describe('text truncation', () => {
    it('truncates long content', () => {
      const longContent = 'A'.repeat(100)
      const summary = createMockSummary({
        item: createMockItem({ content: longContent }),
      })

      render(<InProgressItem item={summary} />)

      const textElement = screen.getByTitle(longContent)
      expect(textElement).toBeInTheDocument()
      expect(textElement.textContent?.length).toBeLessThan(100)
      expect(textElement.textContent?.endsWith('...')).toBe(true)
    })

    it('does not truncate short content', () => {
      const shortContent = 'Short task'
      const summary = createMockSummary({
        item: createMockItem({ content: shortContent }),
      })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText(shortContent)).toBeInTheDocument()
    })
  })

  describe('relative time', () => {
    it('shows "Just now" for recent timestamps', () => {
      const summary = createMockSummary({
        lastWorkedAt: new Date().toISOString(),
      })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText('Just now')).toBeInTheDocument()
    })

    it('shows minutes for recent timestamps', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      const summary = createMockSummary({ lastWorkedAt: fiveMinutesAgo })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText('5m ago')).toBeInTheDocument()
    })

    it('shows hours for older timestamps', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      const summary = createMockSummary({ lastWorkedAt: threeHoursAgo })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText('3h ago')).toBeInTheDocument()
    })

    it('shows days for older timestamps', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      const summary = createMockSummary({ lastWorkedAt: twoDaysAgo })

      render(<InProgressItem item={summary} />)

      expect(screen.getByText('2d ago')).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      const summary = createMockSummary()

      render(<InProgressItem item={summary} onClick={handleClick} />)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledWith(summary)
    })

    it('calls onClick on Enter key', () => {
      const handleClick = vi.fn()
      const summary = createMockSummary()

      render(<InProgressItem item={summary} onClick={handleClick} />)

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledWith(summary)
    })

    it('calls onClick on Space key', () => {
      const handleClick = vi.fn()
      const summary = createMockSummary()

      render(<InProgressItem item={summary} onClick={handleClick} />)

      fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
      expect(handleClick).toHaveBeenCalledWith(summary)
    })

    it('does not throw when onClick is not provided', () => {
      const summary = createMockSummary()

      render(<InProgressItem item={summary} />)

      expect(() => {
        fireEvent.click(screen.getByRole('button'))
      }).not.toThrow()
    })
  })

  describe('accessibility', () => {
    it('has button role', () => {
      const summary = createMockSummary()

      render(<InProgressItem item={summary} />)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('has aria-label with item content and file name', () => {
      const summary = createMockSummary({
        item: createMockItem({ content: 'Task Name' }),
        fileName: 'tasks.md',
      })

      render(<InProgressItem item={summary} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Task Name')
      )
      expect(button).toHaveAttribute(
        'aria-label',
        expect.stringContaining('tasks.md')
      )
    })

    it('is focusable', () => {
      const summary = createMockSummary()

      render(<InProgressItem item={summary} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('tabIndex', '0')
    })

    it('has title on file name for full path', () => {
      const summary = createMockSummary({
        filePath: '/very/long/path/to/file.md',
        fileName: 'file.md',
      })

      render(<InProgressItem item={summary} />)

      const fileElement = screen.getByTitle('/very/long/path/to/file.md')
      expect(fileElement).toBeInTheDocument()
    })
  })
})
