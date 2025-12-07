/**
 * Button component for importing markdown files.
 */

import { Button } from '../lib/common-components'
import type { AddFileResult } from '../lib/files/types'

export interface FileImportButtonProps {
  /** Callback when button is clicked - handles the file picking logic */
  onClick?: () => Promise<void>
  /** Whether the button is currently loading */
  isLoading?: boolean
  /** Callback when a file is successfully added */
  onFileAdded?: (result: AddFileResult) => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
  /** Callback when a duplicate file is selected */
  onDuplicate?: (result: AddFileResult) => void
  /** Optional custom button text */
  buttonText?: string
  /** Whether the button is disabled */
  disabled?: boolean
}

/**
 * Button that triggers file import when clicked.
 * This is a pure presentational component - the parent handles the file picking logic.
 */
export const FileImportButton = ({
  onClick,
  isLoading = false,
  buttonText = 'Add File',
  disabled = false,
}: FileImportButtonProps) => {
  const handleClick = () => {
    if (!isLoading && !disabled && onClick) {
      onClick()
    }
  }

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      disabled={disabled}
      isLoading={isLoading}
      className="file-import-button"
    >
      {buttonText}
    </Button>
  )
}
