/**
 * FileCard component.
 * Displays a single tracked file with progress information and metadata.
 */

import { ProgressBar } from './ProgressBar'
import type { FileCardProps } from './types'

/**
 * Format a relative time string from an ISO timestamp.
 * Returns human-readable strings like "2 hours ago", "3 days ago".
 */
const formatRelativeTime = (isoTimestamp: string | null): string => {
  if (!isoTimestamp) {
    return 'Never'
  }

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
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`
  }
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  }
  if (diffDays < 30) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  // Fall back to date for older timestamps
  return date.toLocaleDateString()
}

/**
 * Truncate a file path for display, keeping the end visible.
 * Shows ".../" prefix if truncated.
 */
const truncatePath = (path: string, maxLength: number = 50): string => {
  if (path.length <= maxLength) {
    return path
  }
  return '...' + path.slice(-(maxLength - 3))
}

/**
 * Renders a card displaying file information, progress, and metadata.
 * Clickable to open the document view.
 */
export const FileCard = ({
  file,
  isSelected = false,
  onClick,
}: FileCardProps) => {
  const handleClick = () => {
    onClick?.(file)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.(file)
    }
  }

  const selectedClass = isSelected ? 'file-card--selected' : ''
  const inProgressClass = file.hasInProgress ? 'file-card--in-progress' : ''

  return (
    <article
      className={`file-card ${selectedClass} ${inProgressClass}`.trim()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Open ${file.fileName}`}
      aria-pressed={isSelected}
    >
      <header className="file-card__header">
        <h3 className="file-card__name">{file.fileName}</h3>
        {file.hasInProgress && (
          <span className="file-card__badge file-card__badge--in-progress">
            In Progress
          </span>
        )}
      </header>

      <p className="file-card__path" title={file.path}>
        {truncatePath(file.path)}
      </p>

      <div className="file-card__progress">
        <ProgressBar percentage={file.progress.percentage} size="small" />
        <span className="file-card__progress-text">
          {file.progress.complete} of {file.progress.total} complete
        </span>
      </div>

      <footer className="file-card__footer">
        <span className="file-card__meta">
          {file.itemCount} item{file.itemCount === 1 ? '' : 's'}
        </span>
        <span className="file-card__meta">
          {formatRelativeTime(file.lastWorkedAt)}
        </span>
      </footer>
    </article>
  )
}
