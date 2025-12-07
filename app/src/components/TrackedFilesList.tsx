/**
 * Component for displaying the list of tracked markdown files.
 */

import { Button } from '../lib/common-components'
import type { TrackedFile } from '../lib/files/types'

export interface TrackedFilesListProps {
  /** List of tracked files to display */
  files: TrackedFile[]
  /** Callback when remove button is clicked */
  onRemove?: (path: string) => void
  /** Callback when a file is selected */
  onSelect?: (file: TrackedFile) => void
  /** Path of currently selected file */
  selectedPath?: string
}

/**
 * Truncates a file path to show only the last N characters.
 */
const truncatePath = (path: string, maxLength: number = 40): string => {
  if (path.length <= maxLength) return path
  return '...' + path.slice(-(maxLength - 3))
}

/**
 * Displays a list of tracked markdown files with remove functionality.
 */
export const TrackedFilesList = ({
  files,
  onRemove,
  onSelect,
  selectedPath,
}: TrackedFilesListProps) => {
  if (files.length === 0) {
    return (
      <div className="tracked-files-empty">
        <p>No files tracked yet.</p>
        <p className="tracked-files-hint">
          Click "Add File" to start tracking a markdown file.
        </p>
      </div>
    )
  }

  return (
    <ul className="tracked-files-list" role="list">
      {files.map((file) => (
        <li
          key={file.path}
          className={`tracked-file-item ${selectedPath === file.path ? 'selected' : ''}`}
        >
          <Button
            variant="ghost"
            className="tracked-file-info"
            onClick={() => onSelect?.(file)}
            aria-label={`Select ${file.fileName}`}
          >
            <span className="tracked-file-name">{file.fileName}</span>
            <span className="tracked-file-path" title={file.path}>
              {truncatePath(file.path)}
            </span>
            <span className="tracked-file-items">
              {file.itemCount} {file.itemCount === 1 ? 'item' : 'items'}
            </span>
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="small"
              className="tracked-file-remove"
              onClick={() => onRemove(file.path)}
              aria-label={`Remove ${file.fileName}`}
            >
              &times;
            </Button>
          )}
        </li>
      ))}
    </ul>
  )
}

export interface MessageProps {
  /** Message type for styling */
  type: 'error' | 'info' | 'success'
  /** Message content */
  message: string
  /** Callback to dismiss the message */
  onDismiss?: () => void
}

/**
 * Displays a dismissible message.
 */
export const Message = ({ type, message, onDismiss }: MessageProps) => {
  return (
    <div className={`message message-${type}`} role="alert">
      <span className="message-text">{message}</span>
      {onDismiss && (
        <Button
          variant="ghost"
          size="small"
          className="message-dismiss"
          onClick={onDismiss}
          aria-label="Dismiss message"
        >
          &times;
        </Button>
      )}
    </div>
  )
}
