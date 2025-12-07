/**
 * Tests for common Modal component.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Modal } from './Modal'

describe('Modal', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        Modal content
      </Modal>
    )
    expect(screen.queryByText('Modal content')).not.toBeInTheDocument()
  })

  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Modal content
      </Modal>
    )
    expect(screen.getByText('Modal content')).toBeInTheDocument()
  })

  it('renders title when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Modal Title">
        Content
      </Modal>
    )
    expect(screen.getByText('Modal Title')).toBeInTheDocument()
  })

  it('renders children in body', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Body content</p>
      </Modal>
    )
    expect(screen.getByText('Body content')).toBeInTheDocument()
    expect(document.querySelector('.modal__body')).toBeInTheDocument()
  })

  it('renders footer when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} footer={<button>Save</button>}>
        Content
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(document.querySelector('.modal__footer')).toBeInTheDocument()
  })

  it('does not render header when no title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Content
      </Modal>
    )
    expect(document.querySelector('.modal__header')).not.toBeInTheDocument()
  })

  it('does not render footer when not provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Content
      </Modal>
    )
    expect(document.querySelector('.modal__footer')).not.toBeInTheDocument()
  })

  // ==========================================================================
  // Close Button
  // ==========================================================================

  it('renders close button when title is present', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Title">
        Content
      </Modal>
    )
    expect(screen.getByRole('button', { name: 'Close modal' })).toBeInTheDocument()
  })

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} title="Title">
        Content
      </Modal>
    )
    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  // ==========================================================================
  // Backdrop Click
  // ==========================================================================

  it('calls onClose when backdrop clicked by default', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        Content
      </Modal>
    )
    // The backdrop is now a separate element, clicking it triggers onClose
    fireEvent.click(document.querySelector('.modal__backdrop')!)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when clicking modal content', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        Content
      </Modal>
    )
    fireEvent.click(document.querySelector('.modal__content')!)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not call onClose when closeOnBackdropClick is false', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} closeOnBackdropClick={false}>
        Content
      </Modal>
    )
    fireEvent.click(document.querySelector('.modal__backdrop')!)
    expect(onClose).not.toHaveBeenCalled()
  })

  // ==========================================================================
  // Escape Key
  // ==========================================================================

  it('calls onClose when Escape pressed by default', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose}>
        Content
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not call onClose when closeOnEscape is false', () => {
    const onClose = vi.fn()
    render(
      <Modal isOpen={true} onClose={onClose} closeOnEscape={false}>
        Content
      </Modal>
    )
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
  })

  // ==========================================================================
  // Size Variants
  // ==========================================================================

  it('applies medium size class by default', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Content
      </Modal>
    )
    expect(document.querySelector('.modal__content')).toHaveClass('modal__content--size-medium')
  })

  it('applies small size class', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="small">
        Content
      </Modal>
    )
    expect(document.querySelector('.modal__content')).toHaveClass('modal__content--size-small')
  })

  it('applies large size class', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} size="large">
        Content
      </Modal>
    )
    expect(document.querySelector('.modal__content')).toHaveClass('modal__content--size-large')
  })

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  it('has dialog role', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Content
      </Modal>
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('has aria-modal attribute', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Content
      </Modal>
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
  })

  it('has aria-labelledby when title provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Title">
        Content
      </Modal>
    )
    const dialog = screen.getByRole('dialog')
    const titleElement = screen.getByText('Test Title')
    expect(dialog).toHaveAttribute('aria-labelledby', titleElement.id)
  })

  it('does not have aria-labelledby when no title', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Content
      </Modal>
    )
    expect(screen.getByRole('dialog')).not.toHaveAttribute('aria-labelledby')
  })

  // ==========================================================================
  // Focus Management
  // ==========================================================================

  it('has focusable elements in modal', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Title">
        <button>First</button>
        <button>Second</button>
      </Modal>
    )

    const buttons = screen.getAllByRole('button')
    // Close button + 2 content buttons
    expect(buttons.length).toBe(3)
  })

  it('can focus elements within modal', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Title">
        <button>First</button>
        <button>Second</button>
      </Modal>
    )

    const secondButton = screen.getByRole('button', { name: 'Second' })
    secondButton.focus()
    expect(document.activeElement).toBe(secondButton)
  })

  // ==========================================================================
  // Custom Class
  // ==========================================================================

  it('applies custom className', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} className="custom-modal">
        Content
      </Modal>
    )
    expect(document.querySelector('.modal__content')).toHaveClass('custom-modal')
  })

  // ==========================================================================
  // Body Scroll Lock
  // ==========================================================================

  it('prevents body scroll when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        Content
      </Modal>
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('restores body scroll when closed', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}}>
        Content
      </Modal>
    )

    expect(document.body.style.overflow).toBe('hidden')

    rerender(
      <Modal isOpen={false} onClose={() => {}}>
        Content
      </Modal>
    )

    expect(document.body.style.overflow).toBe('')
  })
})
