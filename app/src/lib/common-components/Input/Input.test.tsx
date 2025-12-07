/**
 * Tests for common Input component.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Input } from './Input'

describe('Input', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  it('renders with default props', () => {
    render(<Input />)
    const input = screen.getByRole('textbox')
    expect(input).toBeInTheDocument()
    expect(input).toHaveClass('input', 'input--size-medium')
  })

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter text" />)
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('applies custom className to container', () => {
    render(<Input className="custom-class" />)
    expect(screen.getByRole('textbox').closest('.input-container')).toHaveClass('custom-class')
  })

  // ==========================================================================
  // Label
  // ==========================================================================

  it('renders label when provided', () => {
    render(<Input label="Email" />)
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('connects label to input via htmlFor', () => {
    render(<Input label="Email" id="email-input" />)
    const label = screen.getByText('Email')
    expect(label).toHaveAttribute('for', 'email-input')
  })

  it('generates unique id when not provided', () => {
    render(<Input label="Email" />)
    const input = screen.getByRole('textbox')
    const label = screen.getByText('Email')
    expect(label.getAttribute('for')).toBe(input.id)
  })

  // ==========================================================================
  // Size Variants
  // ==========================================================================

  it('renders medium size by default', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toHaveClass('input--size-medium')
  })

  it('renders small size', () => {
    render(<Input size="small" />)
    expect(screen.getByRole('textbox')).toHaveClass('input--size-small')
  })

  it('renders large size', () => {
    render(<Input size="large" />)
    expect(screen.getByRole('textbox')).toHaveClass('input--size-large')
  })

  // ==========================================================================
  // Input Types
  // ==========================================================================

  it('renders text type by default', () => {
    render(<Input />)
    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text')
  })

  it('renders password type', () => {
    render(<Input type="password" aria-label="Password" />)
    const input = document.querySelector('input[type="password"]')
    expect(input).toBeInTheDocument()
  })

  it('renders search type', () => {
    render(<Input type="search" />)
    expect(screen.getByRole('searchbox')).toBeInTheDocument()
  })

  // ==========================================================================
  // Value and Change
  // ==========================================================================

  it('displays value', () => {
    render(<Input value="test value" onChange={() => {}} />)
    expect(screen.getByRole('textbox')).toHaveValue('test value')
  })

  it('calls onChange when value changes', () => {
    const onChange = vi.fn()
    render(<Input onChange={onChange} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'new value' } })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  // ==========================================================================
  // Disabled State
  // ==========================================================================

  it('renders disabled state', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  // ==========================================================================
  // Error State
  // ==========================================================================

  it('renders error state', () => {
    render(<Input error />)
    expect(screen.getByRole('textbox')).toHaveClass('input--error')
  })

  it('renders error message when error is true', () => {
    render(<Input error errorMessage="This field is required" />)
    expect(screen.getByText('This field is required')).toBeInTheDocument()
  })

  it('does not render error message when error is false', () => {
    render(<Input error={false} errorMessage="This field is required" />)
    expect(screen.queryByText('This field is required')).not.toBeInTheDocument()
  })

  it('has aria-invalid when error', () => {
    render(<Input error />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('has aria-describedby pointing to error message', () => {
    render(<Input error errorMessage="Error" id="test-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
  })

  it('error message has role alert', () => {
    render(<Input error errorMessage="Error" />)
    expect(screen.getByRole('alert')).toHaveTextContent('Error')
  })

  // ==========================================================================
  // Full Width
  // ==========================================================================

  it('renders full width when fullWidth is true', () => {
    render(<Input fullWidth />)
    expect(screen.getByRole('textbox').closest('.input-container')).toHaveClass('input-container--full-width')
  })

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  it('applies aria-label when provided', () => {
    render(<Input aria-label="Custom label" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-label', 'Custom label')
  })

  it('applies name attribute', () => {
    render(<Input name="email" />)
    expect(screen.getByRole('textbox')).toHaveAttribute('name', 'email')
  })
})
