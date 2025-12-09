/**
 * Tests for the FileCard component.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileCard } from './FileCard'
import type { DashboardFile } from './types'

const createMockFile = (overrides: Partial<DashboardFile> = {}): DashboardFile => ({
  path: '/path/to/test-file.md',
  fileName: 'test-file.md',
  itemCount: 10,
  contentHash: 'abc123',
  addedAt: '2025-01-01T00:00:00Z',
  lastAccessedAt: '2025-01-02T00:00:00Z',
  progress: {
    total: 10,
    complete: 5,
    inProgress: 2,
    pending: 3,
    percentage: 50,
  },
  hasInProgress: true,
  lastWorkedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  ...overrides,
})

describe('FileCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('rendering', () => {
    it('renders file name', () => {
      render(<FileCard file={createMockFile()} />)
      expect(screen.getByText('test-file.md')).toBeInTheDocument()
    })

    it('renders file path', () => {
      render(<FileCard file={createMockFile()} />)
      expect(screen.getByText('/path/to/test-file.md')).toBeInTheDocument()
    })

    it('renders progress bar', () => {
      render(<FileCard file={createMockFile()} />)
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })

    it('renders progress text', () => {
      render(<FileCard file={createMockFile()} />)
      expect(screen.getByText('5 of 10 complete')).toBeInTheDocument()
    })

    it('renders remaining items count', () => {
      // Mock has total: 10, complete: 5, so 5 remaining
      render(<FileCard file={createMockFile()} />)
      expect(screen.getByText('5 remaining')).toBeInTheDocument()
    })

    it('renders zero remaining when all complete', () => {
      render(<FileCard file={createMockFile({
        progress: {
          total: 10,
          complete: 10,
          inProgress: 0,
          pending: 0,
          percentage: 100,
        },
      })} />)
      expect(screen.getByText('0 remaining')).toBeInTheDocument()
    })

    it('displays remaining as total minus complete (spec scenario)', () => {
      // Spec scenario: total=10, complete=3, inProgress=2, pending=5
      // Remaining should be 7 (10 - 3), not 5 (pending only)
      render(<FileCard file={createMockFile({
        progress: {
          total: 10,
          complete: 3,
          inProgress: 2,
          pending: 5,
          percentage: 30,
        },
      })} />)
      expect(screen.getByText('7 remaining')).toBeInTheDocument()
    })

    it('renders in-progress badge when file has in-progress items', () => {
      render(<FileCard file={createMockFile({ hasInProgress: true })} />)
      expect(screen.getByText('In Progress')).toBeInTheDocument()
    })

    it('does not render in-progress badge when no in-progress items', () => {
      render(<FileCard file={createMockFile({ hasInProgress: false })} />)
      expect(screen.queryByText('In Progress')).not.toBeInTheDocument()
    })
  })

  describe('path truncation', () => {
    it('shows full path when short', () => {
      render(<FileCard file={createMockFile({ path: '/short/path.md' })} />)
      expect(screen.getByText('/short/path.md')).toBeInTheDocument()
    })

    it('truncates long paths with ellipsis', () => {
      const longPath = '/very/long/path/to/some/deeply/nested/directory/structure/file.md'
      render(<FileCard file={createMockFile({ path: longPath })} />)
      const pathElement = screen.getByText(/\.\.\./)
      expect(pathElement).toBeInTheDocument()
      // Should keep the end of the path visible
      expect(pathElement.textContent).toContain('file.md')
    })

    it('shows full path in title attribute', () => {
      const longPath = '/very/long/path/to/some/deeply/nested/directory/structure/file.md'
      render(<FileCard file={createMockFile({ path: longPath })} />)
      const pathElement = screen.getByTitle(longPath)
      expect(pathElement).toBeInTheDocument()
    })
  })

  describe('relative time formatting', () => {
    it('shows "Just now" for recent timestamps', () => {
      const recentTime = new Date(Date.now() - 30 * 1000).toISOString() // 30 seconds ago
      render(<FileCard file={createMockFile({ lastWorkedAt: recentTime })} />)
      expect(screen.getByText('Just now')).toBeInTheDocument()
    })

    it('shows minutes for timestamps within an hour', () => {
      const time = new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutes ago
      render(<FileCard file={createMockFile({ lastWorkedAt: time })} />)
      expect(screen.getByText('15 minutes ago')).toBeInTheDocument()
    })

    it('shows singular minute', () => {
      const time = new Date(Date.now() - 1 * 60 * 1000).toISOString() // 1 minute ago
      render(<FileCard file={createMockFile({ lastWorkedAt: time })} />)
      expect(screen.getByText('1 minute ago')).toBeInTheDocument()
    })

    it('shows hours for timestamps within a day', () => {
      const time = new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
      render(<FileCard file={createMockFile({ lastWorkedAt: time })} />)
      expect(screen.getByText('5 hours ago')).toBeInTheDocument()
    })

    it('shows singular hour', () => {
      const time = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      render(<FileCard file={createMockFile({ lastWorkedAt: time })} />)
      expect(screen.getByText('1 hour ago')).toBeInTheDocument()
    })

    it('shows days for timestamps within a month', () => {
      const time = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      render(<FileCard file={createMockFile({ lastWorkedAt: time })} />)
      expect(screen.getByText('3 days ago')).toBeInTheDocument()
    })

    it('shows singular day', () => {
      const time = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      render(<FileCard file={createMockFile({ lastWorkedAt: time })} />)
      expect(screen.getByText('1 day ago')).toBeInTheDocument()
    })

    it('shows "Never" when lastWorkedAt is null', () => {
      render(<FileCard file={createMockFile({ lastWorkedAt: null })} />)
      expect(screen.getByText('Never')).toBeInTheDocument()
    })
  })

  describe('interaction', () => {
    it('calls onClick when clicked', () => {
      const handleClick = vi.fn()
      const file = createMockFile()
      render(<FileCard file={file} onClick={handleClick} />)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledWith(file)
    })

    it('calls onClick when Enter is pressed', () => {
      const handleClick = vi.fn()
      const file = createMockFile()
      render(<FileCard file={file} onClick={handleClick} />)

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })
      expect(handleClick).toHaveBeenCalledWith(file)
    })

    it('calls onClick when Space is pressed', () => {
      const handleClick = vi.fn()
      const file = createMockFile()
      render(<FileCard file={file} onClick={handleClick} />)

      fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })
      expect(handleClick).toHaveBeenCalledWith(file)
    })

    it('does not call onClick for other keys', () => {
      const handleClick = vi.fn()
      render(<FileCard file={createMockFile()} onClick={handleClick} />)

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Escape' })
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('styling', () => {
    it('applies selected class when isSelected is true', () => {
      render(<FileCard file={createMockFile()} isSelected />)
      const card = screen.getByRole('button')
      expect(card).toHaveClass('file-card--selected')
    })

    it('does not apply selected class when isSelected is false', () => {
      render(<FileCard file={createMockFile()} isSelected={false} />)
      const card = screen.getByRole('button')
      expect(card).not.toHaveClass('file-card--selected')
    })

    it('applies in-progress class when file has in-progress items', () => {
      render(<FileCard file={createMockFile({ hasInProgress: true })} />)
      const card = screen.getByRole('button')
      expect(card).toHaveClass('file-card--in-progress')
    })

    it('does not apply in-progress class when no in-progress items', () => {
      render(<FileCard file={createMockFile({ hasInProgress: false })} />)
      const card = screen.getByRole('button')
      expect(card).not.toHaveClass('file-card--in-progress')
    })
  })

  describe('accessibility', () => {
    it('has button role', () => {
      render(<FileCard file={createMockFile()} />)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('has appropriate aria-label', () => {
      render(<FileCard file={createMockFile({ fileName: 'my-doc.md' })} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Open my-doc.md')
    })

    it('has aria-pressed reflecting selection state', () => {
      const { rerender } = render(<FileCard file={createMockFile()} isSelected={false} />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')

      rerender(<FileCard file={createMockFile()} isSelected />)
      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })

    it('is focusable', () => {
      render(<FileCard file={createMockFile()} />)
      expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0')
    })
  })
})
