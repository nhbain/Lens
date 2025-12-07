/**
 * WatchedDirectoriesSection component.
 * Displays and manages watched directories for auto-discovery.
 */

import { Button } from '../../lib/common-components'
import type { WatchedDirectoriesSectionProps } from './types'

/**
 * Truncates a path to fit within a maximum length.
 */
const truncatePath = (path: string, maxLength: number = 40): string => {
  if (path.length <= maxLength) return path

  const parts = path.split('/')
  if (parts.length <= 2) return path

  // Keep first and last parts
  const first = parts[0] === '' ? '/' : parts[0]
  const last = parts[parts.length - 1]

  // Build truncated path
  const truncated = `${first}/.../${last}`
  if (truncated.length <= maxLength) return truncated

  // If still too long, just truncate from the start
  return '...' + path.slice(-(maxLength - 3))
}

/**
 * Formats a relative time string from an ISO timestamp.
 */
const formatRelativeTime = (isoTimestamp: string): string => {
  const date = new Date(isoTimestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

/**
 * Component for managing watched directories.
 */
export const WatchedDirectoriesSection = ({
  directories,
  onAddDirectory,
  onRemoveDirectory,
  onToggleEnabled,
  isLoading = false,
  error,
}: WatchedDirectoriesSectionProps) => {
  const handleAddClick = async () => {
    await onAddDirectory()
  }

  const handleRemoveClick = async (path: string) => {
    await onRemoveDirectory(path)
  }

  const handleToggleClick = async (path: string, currentEnabled: boolean) => {
    await onToggleEnabled(path, !currentEnabled)
  }

  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">Watched Directories</h2>
        <p className="settings-section__description">
          Directories to monitor for new markdown files
        </p>
      </div>

      {error && (
        <div className="settings-section__error" role="alert">
          {error}
        </div>
      )}

      <div className="watched-directories">
        {directories.length === 0 ? (
          <div className="watched-directories__empty">
            <p>No directories are being watched.</p>
            <p className="watched-directories__hint">
              Add a directory to automatically track markdown files within it.
            </p>
          </div>
        ) : (
          <ul className="watched-directories__list" role="list">
            {directories.map((directory) => (
              <li
                key={directory.path}
                className={`watched-directory ${!directory.enabled ? 'watched-directory--disabled' : ''}`}
              >
                <div className="watched-directory__info">
                  <span
                    className="watched-directory__path"
                    title={directory.path}
                  >
                    {truncatePath(directory.path)}
                  </span>
                  <span className="watched-directory__meta">
                    Added {formatRelativeTime(directory.addedAt)}
                  </span>
                </div>
                <div className="watched-directory__actions">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() =>
                      handleToggleClick(directory.path, directory.enabled)
                    }
                    disabled={isLoading}
                    aria-label={
                      directory.enabled
                        ? 'Disable watching'
                        : 'Enable watching'
                    }
                    className={`watched-directory__toggle ${directory.enabled ? 'watched-directory__toggle--enabled' : ''}`}
                  >
                    {directory.enabled ? 'Enabled' : 'Disabled'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => handleRemoveClick(directory.path)}
                    disabled={isLoading}
                    aria-label={`Remove ${truncatePath(directory.path, 20)}`}
                    className="watched-directory__remove"
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <Button
          variant="outline"
          onClick={handleAddClick}
          disabled={isLoading}
          isLoading={isLoading}
        >
          Add Directory
        </Button>
      </div>
    </section>
  )
}
