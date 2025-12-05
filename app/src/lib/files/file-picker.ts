/**
 * File picker and validation utilities for markdown file import.
 * Uses Tauri's dialog plugin for native file picker dialogs.
 */

import { open } from '@tauri-apps/plugin-dialog'
import { readTextFile } from '@tauri-apps/plugin-fs'
import { parseMarkdown, extractItems } from '../parser'
import { computeContentHash } from '../state'
import type {
  FileValidationResult,
  FileValidationErrorCode,
} from './types'

/**
 * Opens a native file picker dialog filtered for markdown files.
 * Returns null if the user cancels the dialog.
 *
 * @returns Promise resolving to the selected file path, or null if cancelled
 */
export const openMarkdownFilePicker = async (): Promise<string | null> => {
  const result = await open({
    multiple: false,
    filters: [
      {
        name: 'Markdown',
        extensions: ['md', 'markdown'],
      },
    ],
    title: 'Select Markdown File',
  })

  // User cancelled the dialog
  if (result === null) {
    return null
  }

  // Single file selection returns a string
  return result as string
}

/**
 * Opens a native file picker dialog for selecting multiple markdown files.
 * Returns empty array if the user cancels the dialog.
 *
 * @returns Promise resolving to array of selected file paths
 */
export const openMarkdownFilePickerMultiple = async (): Promise<string[]> => {
  const result = await open({
    multiple: true,
    filters: [
      {
        name: 'Markdown',
        extensions: ['md', 'markdown'],
      },
    ],
    title: 'Select Markdown Files',
  })

  // User cancelled the dialog
  if (result === null) {
    return []
  }

  // Multiple file selection returns an array
  return result as string[]
}

/**
 * Extracts the file name from a full path.
 *
 * @param path - Full file path
 * @returns File name without path
 */
export const extractFileName = (path: string): string => {
  // Handle both Unix and Windows path separators
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1] ?? ''
}

/**
 * Checks if a file path has a markdown extension.
 *
 * @param path - File path to check
 * @returns True if the file has a markdown extension
 */
export const isMarkdownFile = (path: string): boolean => {
  const fileName = extractFileName(path).toLowerCase()
  return fileName.endsWith('.md') || fileName.endsWith('.markdown')
}

/**
 * Validates a markdown file for import.
 * Reads the file, parses it, and extracts trackable items.
 *
 * @param path - Absolute path to the markdown file
 * @returns Promise resolving to validation result
 */
export const validateMarkdownFile = async (
  path: string
): Promise<FileValidationResult> => {
  const fileName = extractFileName(path)

  // Check file extension
  if (!isMarkdownFile(path)) {
    return createValidationError(
      path,
      fileName,
      'NOT_MARKDOWN',
      `File "${fileName}" is not a markdown file`
    )
  }

  // Try to read the file
  let content: string
  try {
    content = await readTextFile(path)
  } catch (error) {
    return handleFileReadError(path, fileName, error)
  }

  // Try to parse the markdown
  try {
    const ast = parseMarkdown(content)
    const items = extractItems(ast)
    const contentHash = computeContentHash(content)

    return {
      success: true,
      path,
      fileName,
      itemCount: items.length,
      contentHash,
    }
  } catch (error) {
    return createValidationError(
      path,
      fileName,
      'PARSE_ERROR',
      `Failed to parse markdown: ${getErrorMessage(error)}`
    )
  }
}

/**
 * Opens file picker and validates the selected file in one step.
 * Returns null if user cancels, or validation result otherwise.
 *
 * @returns Promise resolving to validation result or null if cancelled
 */
export const pickAndValidateMarkdownFile =
  async (): Promise<FileValidationResult | null> => {
    const path = await openMarkdownFilePicker()

    if (path === null) {
      return null
    }

    return validateMarkdownFile(path)
  }

/**
 * Creates a validation error result.
 */
const createValidationError = (
  path: string,
  fileName: string,
  errorCode: FileValidationErrorCode,
  error: string
): FileValidationResult => ({
  success: false,
  path,
  fileName,
  error,
  errorCode,
})

/**
 * Handles file read errors and maps them to appropriate error codes.
 */
const handleFileReadError = (
  path: string,
  fileName: string,
  error: unknown
): FileValidationResult => {
  const message = getErrorMessage(error)

  // Try to determine the error type from the message
  if (
    message.includes('not found') ||
    message.includes('No such file') ||
    message.includes('ENOENT')
  ) {
    return createValidationError(
      path,
      fileName,
      'FILE_NOT_FOUND',
      `File not found: "${fileName}"`
    )
  }

  if (
    message.includes('permission') ||
    message.includes('EACCES') ||
    message.includes('access denied')
  ) {
    return createValidationError(
      path,
      fileName,
      'PERMISSION_DENIED',
      `Permission denied: "${fileName}"`
    )
  }

  return createValidationError(
    path,
    fileName,
    'READ_ERROR',
    `Failed to read file: ${message}`
  )
}

/**
 * Extracts error message from unknown error type.
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'Unknown error'
}
