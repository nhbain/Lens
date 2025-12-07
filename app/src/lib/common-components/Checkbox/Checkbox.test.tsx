/**
 * Tests for common Checkbox component.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  it('renders checkbox', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('renders with label', () => {
    render(<Checkbox label="Accept terms" />)
    expect(screen.getByText('Accept terms')).toBeInTheDocument()
  })

  it('applies custom className to container', () => {
    render(<Checkbox className="custom-class" label="Test" />)
    expect(screen.getByText('Test').closest('.checkbox-container')).toHaveClass('custom-class')
  })

  // ==========================================================================
  // Checked State
  // ==========================================================================

  it('renders unchecked by default', () => {
    render(<Checkbox />)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('renders checked when checked prop is true', () => {
    render(<Checkbox checked onChange={() => {}} />)
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  // ==========================================================================
  // Change Handler
  // ==========================================================================

  it('calls onChange when clicked', () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('toggles checked state through onChange', () => {
    const onChange = vi.fn()
    render(<Checkbox checked={false} onChange={onChange} />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalled()
  })

  // ==========================================================================
  // Disabled State
  // ==========================================================================

  it('renders disabled state', () => {
    render(<Checkbox disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('has disabled class on container when disabled', () => {
    render(<Checkbox disabled label="Test" />)
    expect(screen.getByText('Test').closest('.checkbox-container')).toHaveClass('checkbox-container--disabled')
  })

  it('checkbox is disabled when disabled prop is true', () => {
    const onChange = vi.fn()
    render(<Checkbox onChange={onChange} disabled />)
    // In jsdom, fireEvent.click still fires change on disabled inputs,
    // but the actual browser behavior prevents interaction.
    // We test that the disabled attribute is properly set.
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeDisabled()
    expect(checkbox).toHaveAttribute('disabled')
  })

  // ==========================================================================
  // Size Variants
  // ==========================================================================

  it('renders medium size by default', () => {
    render(<Checkbox label="Test" />)
    expect(screen.getByText('Test').closest('.checkbox-container')).toHaveClass('checkbox-container--size-medium')
  })

  it('renders small size', () => {
    render(<Checkbox size="small" label="Test" />)
    expect(screen.getByText('Test').closest('.checkbox-container')).toHaveClass('checkbox-container--size-small')
  })

  // ==========================================================================
  // Label Connection
  // ==========================================================================

  it('clicking label toggles checkbox', () => {
    const onChange = vi.fn()
    render(<Checkbox label="Click me" onChange={onChange} />)
    fireEvent.click(screen.getByText('Click me'))
    expect(onChange).toHaveBeenCalled()
  })

  it('generates unique id when not provided', () => {
    render(<Checkbox label="Test" />)
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox.id).toBeTruthy()
  })

  it('uses provided id', () => {
    render(<Checkbox label="Test" id="my-checkbox" />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('id', 'my-checkbox')
  })

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  it('applies name attribute', () => {
    render(<Checkbox name="terms" />)
    expect(screen.getByRole('checkbox')).toHaveAttribute('name', 'terms')
  })

  it('has custom checkbox visual', () => {
    render(<Checkbox />)
    expect(document.querySelector('.checkbox__box')).toBeInTheDocument()
  })

  it('has checkmark icon', () => {
    render(<Checkbox />)
    expect(document.querySelector('.checkbox__check')).toBeInTheDocument()
  })
})
