/**
 * InProgressItem component.
 * Displays a single in-progress item in a compact format for the resume section.
 */

import type { InProgressItemSummary } from '@/lib/navigation/types'
import './InProgressItem.css'

export interface InProgressItemProps {
  /** The in-progress item summary to display */
  item: InProgressItemSummary
  /** Callback when the item is clicked */
  onClick?: (item: InProgressItemSummary) => void
}

/**
 * Format a relative time string from an ISO timestamp.
 * Returns human-readable strings like "2 hours ago", "3 days ago".
 */
const formatRelativeTime = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return 'Just now'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays < 30) {
    return `${diffDays}d ago`
  }

  // Fall back to date for older timestamps
  return date.toLocaleDateString()
}

/**
 * Truncate text to a maximum length with ellipsis.
 */
const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) {
    return text
  }
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Get a type indicator for the item.
 */
const getTypeIndicator = (type: string): string => {
  switch (type) {
    case 'header':
      return '#'
    case 'checkbox':
      return '☐'
    case 'listItem':
      return '•'
    default:
      return '·'
  }
}

/**
 * Renders a compact in-progress item for the resume section.
 * Shows item text, source file, and relative timestamp.
 */
export const InProgressItem = ({
  item,
  onClick,
}: InProgressItemProps) => {
  const handleClick = () => {
    onClick?.(item)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.(item)
    }
  }

  const typeIndicator = getTypeIndicator(item.item.type)
  const truncatedContent = truncateText(item.item.content)
  const relativeTime = formatRelativeTime(item.lastWorkedAt)

  return (
    <div
      className="in-progress-item"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Resume "${truncatedContent}" in ${item.fileName}`}
    >
      <div className="in-progress-item__content">
        <span className="in-progress-item__type" aria-hidden="true">
          {typeIndicator}
        </span>
        <span className="in-progress-item__text" title={item.item.content}>
          {truncatedContent}
        </span>
      </div>
      <div className="in-progress-item__meta">
        <span className="in-progress-item__file" title={item.filePath}>
          {item.fileName}
        </span>
        <span className="in-progress-item__time">{relativeTime}</span>
      </div>
    </div>
  )
}
