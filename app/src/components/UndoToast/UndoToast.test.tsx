/**
 * Tests for UndoToast component.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UndoToast } from './UndoToast'

describe('UndoToast', () => {
  const defaultProps = {
    message: 'Status changed',
    remainingMs: 5000,
    onUndo: vi.fn(),
    onDismiss: vi.fn(),
  }

  it('renders the message', () => {
    render(<UndoToast {...defaultProps} />)

    expect(screen.getByText('Status changed')).toBeInTheDocument()
  })

  it('displays remaining time in seconds', () => {
    render(<UndoToast {...defaultProps} remainingMs={3500} />)

    expect(screen.getByText('Undo (4s)')).toBeInTheDocument()
  })

  it('rounds up remaining time', () => {
    render(<UndoToast {...defaultProps} remainingMs={1100} />)

    expect(screen.getByText('Undo (2s)')).toBeInTheDocument()
  })

  it('shows 1s when less than 1 second remaining', () => {
    render(<UndoToast {...defaultProps} remainingMs={500} />)

    expect(screen.getByText('Undo (1s)')).toBeInTheDocument()
  })

  it('calls onUndo when undo button clicked', () => {
    const onUndo = vi.fn()
    render(<UndoToast {...defaultProps} onUndo={onUndo} />)

    fireEvent.click(screen.getByRole('button', { name: /undo/i }))

    expect(onUndo).toHaveBeenCalledTimes(1)
  })

  it('calls onDismiss when dismiss button clicked', () => {
    const onDismiss = vi.fn()
    render(<UndoToast {...defaultProps} onDismiss={onDismiss} />)

    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }))

    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('has alert role for accessibility', () => {
    render(<UndoToast {...defaultProps} />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('has aria-live polite for screen readers', () => {
    render(<UndoToast {...defaultProps} />)

    expect(screen.getByRole('alert')).toHaveAttribute('aria-live', 'polite')
  })

  it('undo button has descriptive aria-label', () => {
    render(<UndoToast {...defaultProps} remainingMs={3000} />)

    const undoButton = screen.getByRole('button', { name: /undo/i })
    expect(undoButton).toHaveAttribute(
      'aria-label',
      'Undo, 3 seconds remaining'
    )
  })
})
