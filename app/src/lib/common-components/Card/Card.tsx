/**
 * Common Card component for content containers.
 * Follows Dark OLED Luxury theme from ui-update.md.
 */

import './Card.css'

export interface CardProps {
  /** Card content */
  children: React.ReactNode
  /** Optional header content */
  header?: React.ReactNode
  /** Optional footer content */
  footer?: React.ReactNode
  /** Additional CSS class names */
  className?: string
  /** Whether the card has hover effects */
  hoverable?: boolean
}

/**
 * Reusable card component for grouping related content.
 * Supports optional header and footer sections with hover effects.
 */
export const Card = ({
  children,
  header,
  footer,
  className = '',
  hoverable = false,
}: CardProps) => {
  const classNames = [
    'card',
    hoverable ? 'card--hoverable' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classNames}>
      {header && <div className="card__header">{header}</div>}
      <div className="card__body">{children}</div>
      {footer && <div className="card__footer">{footer}</div>}
    </div>
  )
}
