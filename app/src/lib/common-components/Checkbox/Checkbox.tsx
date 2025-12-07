/**
 * Common Checkbox component with label support.
 * Follows Dark OLED Luxury theme from ui-update.md.
 */

import { useId } from 'react'
import './Checkbox.css'

export type CheckboxSize = 'small' | 'medium'

export interface CheckboxProps {
  /** Label text displayed next to checkbox */
  label?: string
  /** Whether the checkbox is checked */
  checked?: boolean
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Whether the checkbox is disabled */
  disabled?: boolean
  /** Checkbox size */
  size?: CheckboxSize
  /** Checkbox element id */
  id?: string
  /** Checkbox element name */
  name?: string
  /** Additional CSS class names */
  className?: string
}

/**
 * Reusable checkbox component with consistent styling across the app.
 * Supports label and custom styling with accent color for checked state.
 */
export const Checkbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  size = 'medium',
  id: providedId,
  name,
  className = '',
}: CheckboxProps) => {
  const generatedId = useId()
  const checkboxId = providedId || generatedId

  const containerClassNames = [
    'checkbox-container',
    `checkbox-container--size-${size}`,
    disabled ? 'checkbox-container--disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <label htmlFor={checkboxId} className={containerClassNames}>
      <input
        type="checkbox"
        id={checkboxId}
        name={name}
        className="checkbox__input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="checkbox__box" aria-hidden="true">
        <svg
          className="checkbox__check"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {label && <span className="checkbox__label">{label}</span>}
    </label>
  )
}
