/**
 * Tests for TrackableItemRow component.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TrackableItemRow } from './TrackableItemRow'
import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'

const createMockItem = (
  overrides: Partial<TrackableItem> = {}
): TrackableItem => ({
  id: 'test-item-1',
  type: 'header',
  content: 'Test Content',
  depth: 1,
  position: { line: 1, column: 1 },
  children: [],
  ...overrides,
})

const defaultProps = {
  item: createMockItem(),
  status: 'pending' as TrackingStatus,
  isFocused: false,
}

describe('TrackableItemRow', () => {
  describe('rendering', () => {
    it('renders item content', () => {
      render(<TrackableItemRow {...defaultProps} />)

      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders with correct data-item-id attribute', () => {
      render(<TrackableItemRow {...defaultProps} />)

      expect(screen.getByRole('button')).toHaveAttribute(
        'data-item-id',
        'test-item-1'
      )
    })

    it('is focusable with tabIndex', () => {
      render(<TrackableItemRow {...defaultProps} />)

      expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0')
    })
  })

  describe('header items', () => {
    it('displays H1 badge for level 1 header', () => {
      const item = createMockItem({ type: 'header', depth: 1 })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByText('H1')).toBeInTheDocument()
    })

    it('displays H6 badge for level 6 header', () => {
      const item = createMockItem({ type: 'header', depth: 6 })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByText('H6')).toBeInTheDocument()
    })

    it('applies header-specific class', () => {
      const item = createMockItem({ type: 'header', depth: 2 })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByRole('button')).toHaveClass('trackable-item-row--h2')
    })

    it('includes heading level in aria-label', () => {
      const item = createMockItem({
        type: 'header',
        depth: 3,
        content: 'Section Title',
      })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Heading level 3: Section Title'
      )
    })
  })

  describe('list items', () => {
    it('displays bullet for unordered list item', () => {
      const item = createMockItem({ type: 'listItem', ordered: false })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByText('•')).toBeInTheDocument()
    })

    it('displays number sign for ordered list item', () => {
      const item = createMockItem({ type: 'listItem', ordered: true })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByText('#')).toBeInTheDocument()
    })

    it('applies listItem class', () => {
      const item = createMockItem({ type: 'listItem' })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByRole('button')).toHaveClass(
        'trackable-item-row--listItem'
      )
    })
  })

  describe('checkbox items', () => {
    it('displays unchecked box for unchecked checkbox', () => {
      const item = createMockItem({ type: 'checkbox', checked: false })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByText('☐')).toBeInTheDocument()
    })

    it('displays checked box for checked checkbox', () => {
      const item = createMockItem({ type: 'checkbox', checked: true })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByText('☑')).toBeInTheDocument()
    })

    it('applies checkbox class', () => {
      const item = createMockItem({ type: 'checkbox' })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByRole('button')).toHaveClass(
        'trackable-item-row--checkbox'
      )
    })
  })

  describe('status styling', () => {
    it('applies pending status class', () => {
      render(<TrackableItemRow {...defaultProps} status="pending" />)

      expect(screen.getByRole('button')).toHaveClass(
        'trackable-item-row--pending'
      )
    })

    it('applies in-progress status class', () => {
      render(<TrackableItemRow {...defaultProps} status="in_progress" />)

      expect(screen.getByRole('button')).toHaveClass(
        'trackable-item-row--in-progress'
      )
    })

    it('applies complete status class', () => {
      render(<TrackableItemRow {...defaultProps} status="complete" />)

      expect(screen.getByRole('button')).toHaveClass(
        'trackable-item-row--complete'
      )
    })

    it('sets aria-pressed true for complete status', () => {
      render(<TrackableItemRow {...defaultProps} status="complete" />)

      expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
    })

    it('sets aria-pressed false for pending status', () => {
      render(<TrackableItemRow {...defaultProps} status="pending" />)

      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-pressed',
        'false'
      )
    })
  })

  describe('focus state', () => {
    it('applies focused class when isFocused is true', () => {
      render(<TrackableItemRow {...defaultProps} isFocused={true} />)

      expect(screen.getByRole('button')).toHaveClass(
        'trackable-item-row--focused'
      )
    })

    it('does not apply focused class when isFocused is false', () => {
      render(<TrackableItemRow {...defaultProps} isFocused={false} />)

      expect(screen.getByRole('button')).not.toHaveClass(
        'trackable-item-row--focused'
      )
    })
  })

  describe('indentation', () => {
    it('sets indent level 0 for headers', () => {
      const item = createMockItem({ type: 'header', depth: 3 })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByRole('button')).toHaveStyle('--indent-level: 0')
    })

    it('sets indent level based on depth for list items', () => {
      const item = createMockItem({ type: 'listItem', depth: 2 })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByRole('button')).toHaveStyle('--indent-level: 2')
    })

    it('sets indent level based on depth for checkboxes', () => {
      const item = createMockItem({ type: 'checkbox', depth: 1 })
      render(<TrackableItemRow {...defaultProps} item={item} />)

      expect(screen.getByRole('button')).toHaveStyle('--indent-level: 1')
    })
  })

  describe('interactions', () => {
    it('calls onClick when clicked', () => {
      const onClick = vi.fn()
      const item = createMockItem()
      render(<TrackableItemRow {...defaultProps} item={item} onClick={onClick} />)

      fireEvent.click(screen.getByRole('button'))

      expect(onClick).toHaveBeenCalledWith(item)
    })

    it('does not throw when clicked without onClick handler', () => {
      render(<TrackableItemRow {...defaultProps} />)

      expect(() => {
        fireEvent.click(screen.getByRole('button'))
      }).not.toThrow()
    })

    it('calls onActivate when Enter key pressed', () => {
      const onActivate = vi.fn()
      const item = createMockItem()
      render(
        <TrackableItemRow {...defaultProps} item={item} onActivate={onActivate} />
      )

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })

      expect(onActivate).toHaveBeenCalledWith(item)
    })

    it('calls onActivate when Space key pressed', () => {
      const onActivate = vi.fn()
      const item = createMockItem()
      render(
        <TrackableItemRow {...defaultProps} item={item} onActivate={onActivate} />
      )

      fireEvent.keyDown(screen.getByRole('button'), { key: ' ' })

      expect(onActivate).toHaveBeenCalledWith(item)
    })

    it('does not call onActivate for other keys', () => {
      const onActivate = vi.fn()
      render(<TrackableItemRow {...defaultProps} onActivate={onActivate} />)

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Tab' })

      expect(onActivate).not.toHaveBeenCalled()
    })
  })

  describe('disabled state', () => {
    it('applies disabled class when disabled', () => {
      render(<TrackableItemRow {...defaultProps} disabled={true} />)

      expect(screen.getByRole('button')).toHaveClass('trackable-item-row--disabled')
    })

    it('sets tabIndex to -1 when disabled', () => {
      render(<TrackableItemRow {...defaultProps} disabled={true} />)

      expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '-1')
    })

    it('sets aria-disabled when disabled', () => {
      render(<TrackableItemRow {...defaultProps} disabled={true} />)

      expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
    })

    it('does not call onClick when disabled', () => {
      const onClick = vi.fn()
      render(<TrackableItemRow {...defaultProps} onClick={onClick} disabled={true} />)

      fireEvent.click(screen.getByRole('button'))

      expect(onClick).not.toHaveBeenCalled()
    })

    it('does not call onActivate when disabled', () => {
      const onActivate = vi.fn()
      render(<TrackableItemRow {...defaultProps} onActivate={onActivate} disabled={true} />)

      fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' })

      expect(onActivate).not.toHaveBeenCalled()
    })

    it('does not apply disabled class when not disabled', () => {
      render(<TrackableItemRow {...defaultProps} disabled={false} />)

      expect(screen.getByRole('button')).not.toHaveClass('trackable-item-row--disabled')
    })

    it('defaults to not disabled', () => {
      render(<TrackableItemRow {...defaultProps} />)

      expect(screen.getByRole('button')).not.toHaveClass('trackable-item-row--disabled')
      expect(screen.getByRole('button')).toHaveAttribute('tabIndex', '0')
    })
  })
})
