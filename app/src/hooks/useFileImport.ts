/**
 * Hook for handling file import logic.
 */

import { useState, useCallback } from 'react'
import { pickAndValidateMarkdownFile } from '../lib/files/file-picker'
import { addTrackedFile } from '../lib/files/tracked-files'
import type { AddFileResult } from '../lib/files/types'

export interface UseFileImportOptions {
  /** Callback when a file is successfully added */
  onFileAdded?: (result: AddFileResult) => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
  /** Callback when a duplicate file is selected */
  onDuplicate?: (result: AddFileResult) => void
}

export interface UseFileImportReturn {
  /** Whether the import is currently in progress */
  isLoading: boolean
  /** Function to trigger file import */
  importFile: () => Promise<void>
}

/**
 * Hook that handles file import logic.
 * Separates the stateful logic from the presentational component.
 */
export const useFileImport = ({
  onFileAdded,
  onError,
  onDuplicate,
}: UseFileImportOptions = {}): UseFileImportReturn => {
  const [isLoading, setIsLoading] = useState(false)

  const importFile = useCallback(async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      // Open file picker and validate
      const validation = await pickAndValidateMarkdownFile()

      // User cancelled
      if (validation === null) {
        return
      }

      // Validation failed
      if (!validation.success) {
        onError?.(validation.error ?? 'Unknown error')
        return
      }

      // Add to tracking
      const result = await addTrackedFile(validation.path)

      if (!result.success) {
        onError?.(result.error ?? 'Failed to add file')
        return
      }

      if (result.alreadyTracked) {
        onDuplicate?.(result)
      } else {
        onFileAdded?.(result)
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'An unexpected error occurred'
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, onFileAdded, onError, onDuplicate])

  return {
    isLoading,
    importFile,
  }
}
