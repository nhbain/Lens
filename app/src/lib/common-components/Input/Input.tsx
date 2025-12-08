/**
 * Common Input component with label and error state support.
 * Follows Dark OLED Luxury theme from ui-update.md.
 */

import { useId, forwardRef } from 'react'
import './Input.css'

export type InputType = 'text' | 'search' | 'number' | 'password'
export type InputSize = 'small' | 'medium' | 'large'

export interface InputProps {
  /** Input type */
  type?: InputType
  /** Input size */
  size?: InputSize
  /** Label text displayed above input */
  label?: string
  /** Placeholder text */
  placeholder?: string
  /** Current value */
  value?: string
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  /** Whether the input is disabled */
  disabled?: boolean
  /** Whether the input has an error */
  error?: boolean
  /** Error message to display */
  errorMessage?: string
  /** Whether to take full width of container */
  fullWidth?: boolean
  /** Input element id */
  id?: string
  /** Input element name */
  name?: string
  /** Accessible label for screen readers */
  'aria-label'?: string
  /** ID of element describing the input */
  'aria-describedby'?: string
  /** Additional CSS class names */
  className?: string
  /** Key down handler */
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

/**
 * Reusable input component with consistent styling across the app.
 * Supports label, error state, and multiple sizes.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  size = 'medium',
  label,
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  errorMessage,
  fullWidth = false,
  id: providedId,
  name,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  className = '',
  onKeyDown,
}, ref) => {
  const generatedId = useId()
  const inputId = providedId || generatedId
  const errorId = `${inputId}-error`

  const containerClassNames = [
    'input-container',
    fullWidth ? 'input-container--full-width' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const inputClassNames = [
    'input',
    `input--size-${size}`,
    error ? 'input--error' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassNames}>
      {label && (
        <label htmlFor={inputId} className="input__label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        id={inputId}
        name={name}
        className={inputClassNames}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-invalid={error}
        aria-describedby={error && errorMessage ? errorId : ariaDescribedBy}
      />
      {error && errorMessage && (
        <span id={errorId} className="input__error" role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  )
})

Input.displayName = 'Input'
