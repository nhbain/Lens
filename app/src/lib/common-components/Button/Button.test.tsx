/**
 * Tests for common Button component.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('button', 'button--primary', 'button--size-medium')
  })

  it('renders children content', () => {
    render(<Button>Test Content</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Test Content')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Button</Button>)
    expect(screen.getByRole('button')).toHaveClass('custom-class')
  })

  // ==========================================================================
  // Variant Tests
  // ==========================================================================

  it('renders primary variant by default', () => {
    render(<Button>Primary</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--primary')
  })

  it('renders secondary variant', () => {
    render(<Button variant="secondary">Secondary</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--secondary')
  })

  it('renders danger variant', () => {
    render(<Button variant="danger">Danger</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--danger')
  })

  it('renders ghost variant', () => {
    render(<Button variant="ghost">Ghost</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--ghost')
  })

  it('renders outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--outline')
  })

  it('renders link variant', () => {
    render(<Button variant="link">Link</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--link')
  })

  // ==========================================================================
  // Size Tests
  // ==========================================================================

  it('renders medium size by default', () => {
    render(<Button>Medium</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--size-medium')
  })

  it('renders small size', () => {
    render(<Button size="small">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--size-small')
  })

  it('renders large size', () => {
    render(<Button size="large">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--size-large')
  })

  // ==========================================================================
  // Interaction Tests
  // ==========================================================================

  it('calls onClick when clicked and not disabled', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick} disabled>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not call onClick when loading', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick} isLoading>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('does not throw when onClick is not provided', () => {
    render(<Button>Click</Button>)
    expect(() => fireEvent.click(screen.getByRole('button'))).not.toThrow()
  })

  // ==========================================================================
  // Disabled State
  // ==========================================================================

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('is disabled when isLoading is true', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('has aria-disabled when disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true')
  })

  // ==========================================================================
  // Loading State
  // ==========================================================================

  it('shows loading text when isLoading is true', () => {
    render(<Button isLoading>Original</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Loading...')
  })

  it('has loading class when isLoading', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toHaveClass('button--loading')
  })

  it('has aria-busy when loading', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })

  it('renders spinner when loading', () => {
    render(<Button isLoading>Loading</Button>)
    expect(screen.getByRole('button').querySelector('.button__spinner')).toBeInTheDocument()
  })

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  it('applies aria-label when provided', () => {
    render(<Button aria-label="Custom label">Button</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Custom label')
  })

  it('has correct button type by default', () => {
    render(<Button>Button</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('accepts submit type', () => {
    render(<Button type="submit">Submit</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('accepts reset type', () => {
    render(<Button type="reset">Reset</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'reset')
  })
})
