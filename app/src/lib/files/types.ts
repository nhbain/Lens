/**
 * Type definitions for file import and tracking management.
 */

/**
 * Result of validating a markdown file for import.
 */
export interface FileValidationResult {
  /** Whether the file is valid and can be tracked */
  success: boolean
  /** Path to the validated file */
  path: string
  /** File name without path */
  fileName: string
  /** Number of trackable items found in the file */
  itemCount?: number
  /** Content hash of the file */
  contentHash?: string
  /** Error message if validation failed */
  error?: string
  /** Error code for programmatic handling */
  errorCode?: FileValidationErrorCode
}

/**
 * Error codes for file validation failures.
 */
export type FileValidationErrorCode =
  | 'FILE_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'NOT_MARKDOWN'
  | 'READ_ERROR'
  | 'PARSE_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Information about a tracked markdown file.
 */
export interface TrackedFile {
  /** Absolute path to the markdown file */
  path: string
  /** File name without path */
  fileName: string
  /** Number of trackable items in the file */
  itemCount: number
  /** Content hash for change detection */
  contentHash: string
  /** When the file was added to tracking */
  addedAt: string
  /** Last time the file was accessed/updated */
  lastAccessedAt: string
}

/**
 * Result of attempting to add a file to tracking.
 */
export interface AddFileResult {
  /** Whether the file was successfully added */
  success: boolean
  /** The tracked file info if successful */
  file?: TrackedFile
  /** Whether this file was already being tracked */
  alreadyTracked?: boolean
  /** Error message if failed */
  error?: string
}

/**
 * Type guard for FileValidationResult.
 *
 * @param value - Value to check
 * @returns True if value is a FileValidationResult
 */
export const isFileValidationResult = (
  value: unknown
): value is FileValidationResult => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.success === 'boolean' &&
    typeof obj.path === 'string' &&
    typeof obj.fileName === 'string' &&
    (obj.itemCount === undefined || typeof obj.itemCount === 'number') &&
    (obj.contentHash === undefined || typeof obj.contentHash === 'string') &&
    (obj.error === undefined || typeof obj.error === 'string') &&
    (obj.errorCode === undefined || typeof obj.errorCode === 'string')
  )
}

/**
 * Type guard for TrackedFile.
 *
 * @param value - Value to check
 * @returns True if value is a TrackedFile
 */
export const isTrackedFile = (value: unknown): value is TrackedFile => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.path === 'string' &&
    typeof obj.fileName === 'string' &&
    typeof obj.itemCount === 'number' &&
    typeof obj.contentHash === 'string' &&
    typeof obj.addedAt === 'string' &&
    typeof obj.lastAccessedAt === 'string'
  )
}

/**
 * Type guard for AddFileResult.
 *
 * @param value - Value to check
 * @returns True if value is an AddFileResult
 */
export const isAddFileResult = (value: unknown): value is AddFileResult => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.success === 'boolean' &&
    (obj.file === undefined || isTrackedFile(obj.file)) &&
    (obj.alreadyTracked === undefined ||
      typeof obj.alreadyTracked === 'boolean') &&
    (obj.error === undefined || typeof obj.error === 'string')
  )
}

/**
 * Creates a TrackedFile from validation result.
 *
 * @param validation - Successful validation result
 * @returns TrackedFile object
 */
export const createTrackedFile = (
  validation: FileValidationResult
): TrackedFile => {
  if (!validation.success) {
    throw new Error('Cannot create TrackedFile from failed validation')
  }

  const now = new Date().toISOString()

  return {
    path: validation.path,
    fileName: validation.fileName,
    itemCount: validation.itemCount ?? 0,
    contentHash: validation.contentHash ?? '',
    addedAt: now,
    lastAccessedAt: now,
  }
}
