/**
 * Tests for common Select component.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Select } from './Select'

const mockOptions = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
]

describe('Select', () => {
  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  it('renders with options', () => {
    render(<Select options={mockOptions} />)
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(select).toHaveClass('select', 'select--size-medium')
  })

  it('renders all options', () => {
    render(<Select options={mockOptions} />)
    expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument()
  })

  it('applies custom className to container', () => {
    render(<Select options={mockOptions} className="custom-class" />)
    expect(screen.getByRole('combobox').closest('.select-container')).toHaveClass('custom-class')
  })

  // ==========================================================================
  // Label
  // ==========================================================================

  it('renders label when provided', () => {
    render(<Select options={mockOptions} label="Select Option" />)
    expect(screen.getByText('Select Option')).toBeInTheDocument()
  })

  it('connects label to select via htmlFor', () => {
    render(<Select options={mockOptions} label="Select Option" id="my-select" />)
    const label = screen.getByText('Select Option')
    expect(label).toHaveAttribute('for', 'my-select')
  })

  it('generates unique id when not provided', () => {
    render(<Select options={mockOptions} label="Select Option" />)
    const select = screen.getByRole('combobox')
    const label = screen.getByText('Select Option')
    expect(label.getAttribute('for')).toBe(select.id)
  })

  // ==========================================================================
  // Placeholder
  // ==========================================================================

  it('renders placeholder option when provided', () => {
    render(<Select options={mockOptions} placeholder="Choose an option" />)
    expect(screen.getByRole('option', { name: 'Choose an option' })).toBeInTheDocument()
  })

  it('placeholder option is disabled', () => {
    render(<Select options={mockOptions} placeholder="Choose an option" />)
    expect(screen.getByRole('option', { name: 'Choose an option' })).toBeDisabled()
  })

  // ==========================================================================
  // Size Variants
  // ==========================================================================

  it('renders medium size by default', () => {
    render(<Select options={mockOptions} />)
    expect(screen.getByRole('combobox')).toHaveClass('select--size-medium')
  })

  it('renders small size', () => {
    render(<Select options={mockOptions} size="small" />)
    expect(screen.getByRole('combobox')).toHaveClass('select--size-small')
  })

  it('renders large size', () => {
    render(<Select options={mockOptions} size="large" />)
    expect(screen.getByRole('combobox')).toHaveClass('select--size-large')
  })

  // ==========================================================================
  // Value and Change
  // ==========================================================================

  it('displays selected value', () => {
    render(<Select options={mockOptions} value="option2" onChange={() => {}} />)
    expect(screen.getByRole('combobox')).toHaveValue('option2')
  })

  it('calls onChange when selection changes', () => {
    const onChange = vi.fn()
    render(<Select options={mockOptions} onChange={onChange} />)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'option2' } })
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  // ==========================================================================
  // Disabled State
  // ==========================================================================

  it('renders disabled state', () => {
    render(<Select options={mockOptions} disabled />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  // ==========================================================================
  // Full Width
  // ==========================================================================

  it('renders full width when fullWidth is true', () => {
    render(<Select options={mockOptions} fullWidth />)
    expect(screen.getByRole('combobox').closest('.select-container')).toHaveClass('select-container--full-width')
  })

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  it('applies name attribute', () => {
    render(<Select options={mockOptions} name="my-select" />)
    expect(screen.getByRole('combobox')).toHaveAttribute('name', 'my-select')
  })

  it('has custom arrow icon', () => {
    render(<Select options={mockOptions} />)
    expect(document.querySelector('.select__arrow')).toBeInTheDocument()
  })
})
