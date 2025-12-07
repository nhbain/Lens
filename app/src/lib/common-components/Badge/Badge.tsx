/**
 * Common Badge component for status indicators.
 * Follows Dark OLED Luxury theme from ui-update.md.
 */

import './Badge.css'

export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'small' | 'medium'

export interface BadgeProps {
  /** Badge variant - controls color scheme */
  variant?: BadgeVariant
  /** Badge size */
  size?: BadgeSize
  /** Badge content */
  children: React.ReactNode
  /** Additional CSS class names */
  className?: string
}

/**
 * Reusable badge component for displaying status indicators and labels.
 * Supports 5 color variants and 2 sizes.
 */
export const Badge = ({
  variant = 'default',
  size = 'medium',
  children,
  className = '',
}: BadgeProps) => {
  const classNames = [
    'badge',
    `badge--${variant}`,
    `badge--size-${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return <span className={classNames}>{children}</span>
}
