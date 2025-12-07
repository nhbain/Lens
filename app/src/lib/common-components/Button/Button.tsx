/**
 * Common Button component with multiple variants and sizes.
 * Follows Dark OLED Luxury theme from ui-update.md.
 */

import './Button.css'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'ghost-danger' | 'outline' | 'link'
export type ButtonSize = 'small' | 'medium' | 'large'

export interface ButtonProps {
  /** Button variant - controls color scheme */
  variant?: ButtonVariant
  /** Button size */
  size?: ButtonSize
  /** Whether the button is disabled */
  disabled?: boolean
  /** Whether the button is in a loading state */
  isLoading?: boolean
  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset'
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  /** Button content */
  children: React.ReactNode
  /** Additional CSS class names */
  className?: string
  /** Accessible label for screen readers */
  'aria-label'?: string
}

/**
 * Reusable button component with consistent styling across the app.
 * Supports 6 variants and 3 sizes with proper accessibility attributes.
 */
export const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  isLoading = false,
  type = 'button',
  onClick,
  children,
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isLoading && onClick) {
      onClick(event)
    }
  }

  const classNames = [
    'button',
    `button--${variant}`,
    `button--size-${size}`,
    isLoading ? 'button--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={classNames}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      aria-disabled={disabled || isLoading}
    >
      {isLoading ? (
        <>
          <span className="button__spinner" aria-hidden="true" />
          <span className="button__text">Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  )
}
