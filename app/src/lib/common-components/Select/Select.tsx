/**
 * Common Select component with label support.
 * Follows Dark OLED Luxury theme from ui-update.md.
 */

import { useId } from 'react'
import './Select.css'

export type SelectSize = 'small' | 'medium' | 'large'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  /** Array of options */
  options: SelectOption[]
  /** Select size */
  size?: SelectSize
  /** Label text displayed above select */
  label?: string
  /** Current value */
  value?: string
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  /** Whether the select is disabled */
  disabled?: boolean
  /** Placeholder option text */
  placeholder?: string
  /** Whether to take full width of container */
  fullWidth?: boolean
  /** Select element id */
  id?: string
  /** Select element name */
  name?: string
  /** Additional CSS class names */
  className?: string
}

/**
 * Reusable select component with consistent styling across the app.
 * Supports label and multiple sizes.
 */
export const Select = ({
  options,
  size = 'medium',
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  fullWidth = false,
  id: providedId,
  name,
  className = '',
}: SelectProps) => {
  const generatedId = useId()
  const selectId = providedId || generatedId

  const containerClassNames = [
    'select-container',
    fullWidth ? 'select-container--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const selectClassNames = [
    'select',
    `select--size-${size}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassNames}>
      {label && (
        <label htmlFor={selectId} className="select__label">
          {label}
        </label>
      )}
      <div className="select__wrapper">
        <select
          id={selectId}
          name={name}
          className={selectClassNames}
          value={value}
          onChange={onChange}
          disabled={disabled}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="select__arrow" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </div>
    </div>
  )
}
