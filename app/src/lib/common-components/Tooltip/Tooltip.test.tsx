/**
 * Tests for common Tooltip component.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  it('renders trigger element', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByRole('button', { name: 'Hover me' })).toBeInTheDocument()
  })

  it('does not render tooltip by default', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('has trigger wrapper class', () => {
    render(
      <Tooltip content="Tooltip text">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(document.querySelector('.tooltip__trigger')).toBeInTheDocument()
  })

  // ==========================================================================
  // Show/Hide Behavior
  // ==========================================================================

  it('shows tooltip on hover after delay', async () => {
    render(
      <Tooltip content="Tooltip text" delay={200}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!
    fireEvent.mouseEnter(trigger)

    // Tooltip should not be visible immediately
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    // Advance timers past delay
    act(() => {
      vi.advanceTimersByTime(250)
    })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
    expect(screen.getByText('Tooltip text')).toBeInTheDocument()
  })

  it('hides tooltip on mouse leave', async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!

    // Show tooltip
    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    // Hide tooltip
    fireEvent.mouseLeave(trigger)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('cancels tooltip if mouse leaves before delay', () => {
    render(
      <Tooltip content="Tooltip text" delay={500}>
        <button>Hover me</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!

    fireEvent.mouseEnter(trigger)

    // Leave before delay completes
    act(() => {
      vi.advanceTimersByTime(200)
    })
    fireEvent.mouseLeave(trigger)

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Tooltip should not appear
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  // ==========================================================================
  // Position Variants
  // ==========================================================================

  it('applies top position class by default', async () => {
    render(
      <Tooltip content="Tooltip" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!
    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(document.querySelector('.tooltip')).toHaveClass('tooltip--top')
  })

  it('applies bottom position class', async () => {
    render(
      <Tooltip content="Tooltip" position="bottom" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!
    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(document.querySelector('.tooltip')).toHaveClass('tooltip--bottom')
  })

  it('applies left position class', async () => {
    render(
      <Tooltip content="Tooltip" position="left" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!
    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(document.querySelector('.tooltip')).toHaveClass('tooltip--left')
  })

  it('applies right position class', async () => {
    render(
      <Tooltip content="Tooltip" position="right" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!
    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(document.querySelector('.tooltip')).toHaveClass('tooltip--right')
  })

  // ==========================================================================
  // Focus Handling
  // ==========================================================================

  it('shows tooltip on focus', async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!
    fireEvent.focus(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('hides tooltip on blur', async () => {
    render(
      <Tooltip content="Tooltip text" delay={0}>
        <button>Focus me</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!

    fireEvent.focus(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.blur(trigger)

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  it('has tooltip role', async () => {
    render(
      <Tooltip content="Accessible tooltip" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!
    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('connects trigger to tooltip via aria-describedby', async () => {
    render(
      <Tooltip content="Description" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!

    // Before showing, no aria-describedby
    expect(trigger).not.toHaveAttribute('aria-describedby')

    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    // After showing, has aria-describedby matching tooltip id
    const tooltip = screen.getByRole('tooltip')
    expect(trigger).toHaveAttribute('aria-describedby', tooltip.id)
  })

  // ==========================================================================
  // Arrow Element
  // ==========================================================================

  it('has arrow element', async () => {
    render(
      <Tooltip content="Tooltip" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!
    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(document.querySelector('.tooltip__arrow')).toBeInTheDocument()
  })

  // ==========================================================================
  // Custom Class
  // ==========================================================================

  it('applies custom className', async () => {
    render(
      <Tooltip content="Tooltip" className="custom-tooltip" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    )

    const trigger = document.querySelector('.tooltip__trigger')!
    fireEvent.mouseEnter(trigger)
    act(() => {
      vi.advanceTimersByTime(10)
    })

    expect(document.querySelector('.tooltip')).toHaveClass('custom-tooltip')
  })
})
