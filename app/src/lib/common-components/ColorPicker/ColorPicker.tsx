/**
 * ColorPicker component for selecting accent colors.
 * Uses react-colorful for cross-platform color picking with popover UI.
 */

import { useId, useRef, useState, useCallback, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import './ColorPicker.css'

export type ColorPickerSize = 'small' | 'medium' | 'large'

export interface ColorPickerProps {
  /** Label text displayed above picker */
  label?: string
  /** Current hex color value (e.g., "#00F0F4") */
  value: string | null
  /** Default color shown when value is null */
  defaultColor: string
  /** Change handler called with new hex value or null for reset */
  onChange: (value: string | null) => void
  /** Whether the picker is disabled */
  disabled?: boolean
  /** Picker size variant */
  size?: ColorPickerSize
  /** Whether to show the hex input field */
  showHexInput?: boolean
  /** Whether to show reset button */
  showReset?: boolean
  /** Text for reset button */
  resetLabel?: string
  /** Additional CSS class names */
  className?: string
  /** Input element id */
  id?: string
  /** Accessible label for screen readers */
  'aria-label'?: string
}

/**
 * Normalizes a hex color to uppercase with # prefix.
 */
const normalizeHex = (hex: string): string => {
  let normalized = hex.trim()
  if (!normalized.startsWith('#')) {
    normalized = '#' + normalized
  }
  return normalized.toUpperCase()
}

/**
 * Validates and formats hex input.
 * Returns null if invalid.
 */
const validateHexInput = (input: string): string | null => {
  const normalized = normalizeHex(input)
  // Check for valid 3 or 6 character hex
  if (/^#[0-9A-F]{3}$/i.test(normalized)) {
    // Expand 3-char to 6-char
    const [, r, g, b] = normalized.match(/^#(.)(.)(.)$/) || []
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  if (/^#[0-9A-F]{6}$/i.test(normalized)) {
    return normalized.toUpperCase()
  }
  return null
}

/**
 * ColorPicker component for theme color customization.
 * Uses react-colorful's HexColorPicker in a popover for cross-platform support.
 */
export const ColorPicker = ({
  label,
  value,
  defaultColor,
  onChange,
  disabled = false,
  size = 'medium',
  showHexInput = true,
  showReset = true,
  resetLabel = 'Reset',
  className = '',
  id: providedId,
  'aria-label': ariaLabel,
}: ColorPickerProps) => {
  const generatedId = useId()
  const pickerId = providedId || generatedId
  const popoverRef = useRef<HTMLDivElement>(null)
  const swatchButtonRef = useRef<HTMLButtonElement>(null)

  // Popover open state
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Track if user is currently editing the hex input
  const [isEditing, setIsEditing] = useState(false)
  // Local editing state (only used while focused)
  const [editValue, setEditValue] = useState('')
  const [hasError, setHasError] = useState(false)

  // Effective display color (use default if value is null)
  const displayColor = value ?? defaultColor
  const isUsingDefault = value === null

  // The value shown in the hex input
  const hexInputDisplayValue = isEditing ? editValue : displayColor

  // Toggle popover
  const togglePopover = useCallback(() => {
    if (!disabled) {
      setIsPopoverOpen((prev) => !prev)
    }
  }, [disabled])

  // Close popover
  const closePopover = useCallback(() => {
    setIsPopoverOpen(false)
  }, [])

  // Handle color change from react-colorful picker
  const handlePickerChange = useCallback(
    (newColor: string) => {
      onChange(newColor.toUpperCase())
    },
    [onChange]
  )

  // Handle hex text input focus - start editing
  const handleHexInputFocus = useCallback(() => {
    setIsEditing(true)
    setEditValue(displayColor)
    setHasError(false)
  }, [displayColor])

  // Handle hex text input change
  const handleHexInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const input = event.target.value
      setEditValue(input)

      // Validate on each change but only call onChange for valid values
      const validated = validateHexInput(input)
      if (validated) {
        setHasError(false)
        onChange(validated)
      } else {
        setHasError(input.length > 0)
      }
    },
    [onChange]
  )

  // Handle hex input blur - finalize editing
  const handleHexInputBlur = useCallback(() => {
    // If there's an error or invalid input, the parent's value hasn't changed
    // so displayColor still has the valid value
    setIsEditing(false)
    setHasError(false)
  }, [])

  // Handle reset button click
  const handleReset = useCallback(() => {
    onChange(null)
    setIsEditing(false)
    setHasError(false)
    closePopover()
  }, [onChange, closePopover])

  // Close popover on click outside
  useEffect(() => {
    if (!isPopoverOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        popoverRef.current &&
        !popoverRef.current.contains(target) &&
        swatchButtonRef.current &&
        !swatchButtonRef.current.contains(target)
      ) {
        closePopover()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPopoverOpen, closePopover])

  // Close popover on Escape key
  useEffect(() => {
    if (!isPopoverOpen) return

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePopover()
        swatchButtonRef.current?.focus()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isPopoverOpen, closePopover])

  const containerClassNames = [
    'color-picker',
    `color-picker--size-${size}`,
    disabled ? 'color-picker--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const swatchClassNames = [
    'color-picker__swatch',
    isUsingDefault ? 'color-picker__swatch--default' : '',
    isPopoverOpen ? 'color-picker__swatch--active' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const hexInputClassNames = [
    'color-picker__hex-input',
    hasError ? 'color-picker__hex-input--error' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassNames}>
      {label && (
        <label htmlFor={pickerId} className="color-picker__label">
          {label}
        </label>
      )}

      <div className="color-picker__controls">
        {/* Color swatch button that opens popover */}
        <div className="color-picker__swatch-wrapper">
          <button
            ref={swatchButtonRef}
            type="button"
            id={pickerId}
            className={swatchClassNames}
            style={{ backgroundColor: displayColor }}
            onClick={togglePopover}
            disabled={disabled}
            aria-label={ariaLabel || `Select color, current: ${displayColor}`}
            aria-expanded={isPopoverOpen}
            aria-haspopup="dialog"
            title={`Click to pick color: ${displayColor}`}
          />

          {/* Popover with react-colorful picker */}
          {isPopoverOpen && (
            <div
              ref={popoverRef}
              className="color-picker__popover"
              role="dialog"
              aria-label="Color picker"
            >
              <HexColorPicker
                color={displayColor.toLowerCase()}
                onChange={handlePickerChange}
              />
            </div>
          )}
        </div>

        {/* Hex text input */}
        {showHexInput && (
          <input
            type="text"
            className={hexInputClassNames}
            value={hexInputDisplayValue}
            onFocus={handleHexInputFocus}
            onChange={handleHexInputChange}
            onBlur={handleHexInputBlur}
            disabled={disabled}
            placeholder="#000000"
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
            aria-label={`Hex color value for ${label || 'color picker'}`}
            aria-invalid={hasError}
          />
        )}

        {/* Reset button */}
        {showReset && !isUsingDefault && (
          <button
            type="button"
            className="color-picker__reset"
            onClick={handleReset}
            disabled={disabled}
            aria-label={`Reset ${label || 'color'} to default`}
          >
            {resetLabel}
          </button>
        )}
      </div>

      {/* Default indicator */}
      {isUsingDefault && (
        <span className="color-picker__default-hint">Using default</span>
      )}
    </div>
  )
}
