/**
 * Tests for ColorPicker component.
 * Uses react-colorful for cross-platform color picking with popover UI.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ColorPicker } from './ColorPicker'

/**
 * Helper to get the swatch button element.
 */
const getSwatchButton = () => {
  return document.querySelector('.color-picker__swatch') as HTMLButtonElement
}

/**
 * Helper to get the popover element.
 */
const getPopover = () => {
  return document.querySelector('.color-picker__popover') as HTMLDivElement
}

describe('ColorPicker', () => {
  const defaultProps = {
    value: '#00F0F4',
    defaultColor: '#FFFFFF',
    onChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ==========================================================================
  // Basic Rendering
  // ==========================================================================

  it('renders with required props', () => {
    render(<ColorPicker {...defaultProps} />)
    expect(getSwatchButton()).toBeInTheDocument()
  })

  it('renders color swatch with current value', () => {
    render(<ColorPicker {...defaultProps} value="#FF0000" />)
    const swatch = getSwatchButton()
    expect(swatch).toHaveStyle({ backgroundColor: '#FF0000' })
  })

  it('renders hex input by default', () => {
    render(<ColorPicker {...defaultProps} />)
    const hexInput = screen.getByRole('textbox')
    expect(hexInput).toBeInTheDocument()
    expect(hexInput).toHaveValue('#00F0F4')
  })

  it('applies custom className', () => {
    render(<ColorPicker {...defaultProps} className="custom-class" />)
    const container = getSwatchButton().closest('.color-picker')
    expect(container).toHaveClass('custom-class')
  })

  // ==========================================================================
  // Label
  // ==========================================================================

  it('renders label when provided', () => {
    render(<ColorPicker {...defaultProps} label="Accent Color" />)
    expect(screen.getByText('Accent Color')).toBeInTheDocument()
  })

  it('connects label to color picker', () => {
    render(<ColorPicker {...defaultProps} label="Accent Color" id="accent" />)
    const label = screen.getByText('Accent Color')
    expect(label).toHaveAttribute('for', 'accent')
  })

  // ==========================================================================
  // Size Variants
  // ==========================================================================

  it('renders medium size by default', () => {
    render(<ColorPicker {...defaultProps} />)
    const container = getSwatchButton().closest('.color-picker')
    expect(container).toHaveClass('color-picker--size-medium')
  })

  it('renders small size', () => {
    render(<ColorPicker {...defaultProps} size="small" />)
    const container = getSwatchButton().closest('.color-picker')
    expect(container).toHaveClass('color-picker--size-small')
  })

  it('renders large size', () => {
    render(<ColorPicker {...defaultProps} size="large" />)
    const container = getSwatchButton().closest('.color-picker')
    expect(container).toHaveClass('color-picker--size-large')
  })

  // ==========================================================================
  // Default Color Handling
  // ==========================================================================

  it('displays default color when value is null', () => {
    render(<ColorPicker {...defaultProps} value={null} defaultColor="#AABBCC" />)
    const swatch = getSwatchButton()
    expect(swatch).toHaveStyle({ backgroundColor: '#AABBCC' })
  })

  it('shows "Using default" hint when value is null', () => {
    render(<ColorPicker {...defaultProps} value={null} />)
    expect(screen.getByText('Using default')).toBeInTheDocument()
  })

  it('does not show "Using default" hint when value is set', () => {
    render(<ColorPicker {...defaultProps} value="#FF0000" />)
    expect(screen.queryByText('Using default')).not.toBeInTheDocument()
  })

  it('applies dashed border style when using default', () => {
    render(<ColorPicker {...defaultProps} value={null} />)
    const swatch = getSwatchButton()
    expect(swatch).toHaveClass('color-picker__swatch--default')
  })

  // ==========================================================================
  // Reset Button
  // ==========================================================================

  it('shows reset button when value differs from default', () => {
    render(<ColorPicker {...defaultProps} value="#FF0000" />)
    expect(screen.getByRole('button', { name: /reset/i })).toBeInTheDocument()
  })

  it('hides reset button when value is null (using default)', () => {
    render(<ColorPicker {...defaultProps} value={null} />)
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
  })

  it('calls onChange with null when reset clicked', () => {
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} value="#FF0000" onChange={onChange} />)

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))

    expect(onChange).toHaveBeenCalledWith(null)
  })

  it('can hide reset button via showReset prop', () => {
    render(<ColorPicker {...defaultProps} showReset={false} />)
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
  })

  it('uses custom reset label', () => {
    render(<ColorPicker {...defaultProps} resetLabel="Clear" />)
    expect(screen.getByText('Clear')).toBeInTheDocument()
  })

  // ==========================================================================
  // Hex Input Behavior
  // ==========================================================================

  it('calls onChange when valid hex entered', () => {
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} onChange={onChange} />)

    const hexInput = screen.getByRole('textbox')
    fireEvent.change(hexInput, { target: { value: '#FF0000' } })

    expect(onChange).toHaveBeenCalledWith('#FF0000')
  })

  it('normalizes hex to uppercase', () => {
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} onChange={onChange} />)

    const hexInput = screen.getByRole('textbox')
    fireEvent.change(hexInput, { target: { value: '#ff0000' } })

    expect(onChange).toHaveBeenCalledWith('#FF0000')
  })

  it('adds # prefix if missing', () => {
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} onChange={onChange} />)

    const hexInput = screen.getByRole('textbox')
    fireEvent.change(hexInput, { target: { value: 'FF0000' } })

    expect(onChange).toHaveBeenCalledWith('#FF0000')
  })

  it('expands 3-char hex to 6-char', () => {
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} onChange={onChange} />)

    const hexInput = screen.getByRole('textbox')
    fireEvent.change(hexInput, { target: { value: '#F00' } })

    expect(onChange).toHaveBeenCalledWith('#FF0000')
  })

  it('shows error state for invalid hex', () => {
    render(<ColorPicker {...defaultProps} />)

    const hexInput = screen.getByRole('textbox')
    fireEvent.change(hexInput, { target: { value: '#GGGGGG' } })

    expect(hexInput).toHaveClass('color-picker__hex-input--error')
    expect(hexInput).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not call onChange for invalid hex', () => {
    const onChange = vi.fn()
    render(<ColorPicker {...defaultProps} onChange={onChange} />)

    const hexInput = screen.getByRole('textbox')
    onChange.mockClear()
    fireEvent.change(hexInput, { target: { value: '#GGGGGG' } })

    expect(onChange).not.toHaveBeenCalled()
  })

  it('reverts to valid value on blur with invalid input', () => {
    render(<ColorPicker {...defaultProps} value="#00F0F4" />)

    const hexInput = screen.getByRole('textbox')
    fireEvent.change(hexInput, { target: { value: '#INVALID' } })
    fireEvent.blur(hexInput)

    expect(hexInput).toHaveValue('#00F0F4')
  })

  it('can hide hex input via showHexInput prop', () => {
    render(<ColorPicker {...defaultProps} showHexInput={false} />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  // ==========================================================================
  // Popover Behavior
  // ==========================================================================

  it('does not show popover by default', () => {
    render(<ColorPicker {...defaultProps} />)
    expect(getPopover()).not.toBeInTheDocument()
  })

  it('opens popover when swatch is clicked', () => {
    render(<ColorPicker {...defaultProps} />)

    fireEvent.click(getSwatchButton())

    expect(getPopover()).toBeInTheDocument()
  })

  it('closes popover when swatch is clicked again', () => {
    render(<ColorPicker {...defaultProps} />)

    fireEvent.click(getSwatchButton())
    expect(getPopover()).toBeInTheDocument()

    fireEvent.click(getSwatchButton())
    expect(getPopover()).not.toBeInTheDocument()
  })

  it('closes popover when clicking outside', () => {
    render(<ColorPicker {...defaultProps} />)

    fireEvent.click(getSwatchButton())
    expect(getPopover()).toBeInTheDocument()

    fireEvent.mouseDown(document.body)
    expect(getPopover()).not.toBeInTheDocument()
  })

  it('closes popover on Escape key', () => {
    render(<ColorPicker {...defaultProps} />)

    fireEvent.click(getSwatchButton())
    expect(getPopover()).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(getPopover()).not.toBeInTheDocument()
  })

  it('adds active class to swatch when popover is open', () => {
    render(<ColorPicker {...defaultProps} />)

    const swatch = getSwatchButton()
    expect(swatch).not.toHaveClass('color-picker__swatch--active')

    fireEvent.click(swatch)
    expect(swatch).toHaveClass('color-picker__swatch--active')
  })

  it('popover has dialog role and aria-label', () => {
    render(<ColorPicker {...defaultProps} />)

    fireEvent.click(getSwatchButton())
    const popover = getPopover()

    expect(popover).toHaveAttribute('role', 'dialog')
    expect(popover).toHaveAttribute('aria-label', 'Color picker')
  })

  it('does not open popover when disabled', () => {
    render(<ColorPicker {...defaultProps} disabled />)

    fireEvent.click(getSwatchButton())

    expect(getPopover()).not.toBeInTheDocument()
  })

  it('closes popover when reset is clicked', () => {
    render(<ColorPicker {...defaultProps} value="#FF0000" />)

    fireEvent.click(getSwatchButton())
    expect(getPopover()).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /reset/i }))
    expect(getPopover()).not.toBeInTheDocument()
  })

  // ==========================================================================
  // Disabled State
  // ==========================================================================

  it('applies disabled class when disabled', () => {
    render(<ColorPicker {...defaultProps} disabled />)
    const container = getSwatchButton().closest('.color-picker')
    expect(container).toHaveClass('color-picker--disabled')
  })

  it('disables all interactive elements when disabled', () => {
    render(<ColorPicker {...defaultProps} disabled />)

    expect(getSwatchButton()).toBeDisabled()
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  // ==========================================================================
  // Accessibility
  // ==========================================================================

  it('swatch button has accessible attributes', () => {
    render(<ColorPicker {...defaultProps} value="#FF0000" showReset={false} />)
    const swatch = getSwatchButton()
    expect(swatch).toHaveAttribute('aria-label')
    expect(swatch.getAttribute('aria-label')).toContain('#FF0000')
    expect(swatch).toHaveAttribute('aria-haspopup', 'dialog')
    expect(swatch).toHaveAttribute('aria-expanded', 'false')
  })

  it('swatch aria-expanded updates when popover opens', () => {
    render(<ColorPicker {...defaultProps} />)
    const swatch = getSwatchButton()

    expect(swatch).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(swatch)
    expect(swatch).toHaveAttribute('aria-expanded', 'true')
  })

  it('uses provided aria-label for swatch', () => {
    render(<ColorPicker {...defaultProps} aria-label="Choose primary color" showReset={false} />)
    const swatch = getSwatchButton()
    expect(swatch).toHaveAttribute('aria-label', 'Choose primary color')
  })

  it('hex input has aria-label', () => {
    render(<ColorPicker {...defaultProps} label="Primary" />)
    const hexInput = screen.getByRole('textbox')
    expect(hexInput).toHaveAttribute('aria-label')
    expect(hexInput.getAttribute('aria-label')).toContain('Primary')
  })

  it('reset button has aria-label', () => {
    render(<ColorPicker {...defaultProps} label="Primary" value="#FF0000" />)
    const resetBtn = screen.getByRole('button', { name: /reset/i })
    expect(resetBtn.getAttribute('aria-label')).toContain('Primary')
  })

  // ==========================================================================
  // Keyboard Interaction
  // ==========================================================================

  it('swatch button is focusable for keyboard access', () => {
    render(<ColorPicker {...defaultProps} showReset={false} />)
    const swatch = getSwatchButton()

    swatch.focus()
    expect(document.activeElement).toBe(swatch)
  })

  it('swatch button is not focusable when disabled', () => {
    render(<ColorPicker {...defaultProps} disabled showReset={false} />)
    const swatch = getSwatchButton()

    expect(swatch).toBeDisabled()
  })

  it('returns focus to swatch when popover closes via Escape', () => {
    render(<ColorPicker {...defaultProps} />)
    const swatch = getSwatchButton()

    fireEvent.click(swatch)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(document.activeElement).toBe(swatch)
  })
})
