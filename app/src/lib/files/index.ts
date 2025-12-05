/**
 * File import and tracking module.
 *
 * This module provides functionality for:
 * - Opening native file picker dialogs for markdown files
 * - Validating markdown files for import
 * - Managing a list of tracked files
 * - Persisting tracked file state
 *
 * @module files
 */

// Types
export type {
  FileValidationResult,
  FileValidationErrorCode,
  TrackedFile,
  AddFileResult,
} from './types'

export {
  isFileValidationResult,
  isTrackedFile,
  isAddFileResult,
  createTrackedFile,
} from './types'

// File picker and validation
export {
  openMarkdownFilePicker,
  openMarkdownFilePickerMultiple,
  extractFileName,
  isMarkdownFile,
  validateMarkdownFile,
  pickAndValidateMarkdownFile,
} from './file-picker'

// Tracked files management
export {
  getTrackedFiles,
  getTrackedFile,
  isFileTracked,
  getTrackedFilesCount,
  addTrackedFile,
  removeTrackedFile,
  updateLastAccessed,
  updateItemCount,
  updateContentHash,
  loadTrackedFiles,
  isCacheInitialized,
  clearCache,
  removeAllTrackedFiles,
} from './tracked-files'
