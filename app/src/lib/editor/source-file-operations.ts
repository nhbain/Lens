/**
 * Source file write operations for markdown editor.
 * Provides atomic write, backup, and validation capabilities.
 */

import { writeTextFile, exists, copyFile, rename, remove } from '@tauri-apps/plugin-fs'

/**
 * Result type for write operations.
 */
export interface WriteResult {
  /** Whether the write operation succeeded */
  success: boolean
  /** Path to the backup file if one was created */
  backupPath?: string
  /** Error message if the operation failed */
  error?: string
  /** Error code for programmatic error handling */
  errorCode?: 'NOT_MARKDOWN' | 'FILE_NOT_FOUND' | 'PERMISSION_DENIED' | 'DISK_FULL' | 'WRITE_ERROR' | 'BACKUP_ERROR'
}

/**
 * Validates that a file path is a markdown file.
 * Checks for .md or .markdown extension.
 */
export function isMarkdownPath(path: string): boolean {
  const lowerPath = path.toLowerCase()
  return lowerPath.endsWith('.md') || lowerPath.endsWith('.markdown')
}

/**
 * Creates a backup of a source file by copying it to .md.bak or .markdown.bak
 *
 * @param sourcePath - Path to the file to backup
 * @returns Promise resolving to the backup file path
 * @throws Error if backup creation fails
 */
export async function createBackup(sourcePath: string): Promise<string> {
  if (!isMarkdownPath(sourcePath)) {
    throw new Error('Can only backup markdown files (.md or .markdown)')
  }

  // Check if source file exists
  const fileExists = await exists(sourcePath)
  if (!fileExists) {
    throw new Error(`Source file not found: ${sourcePath}`)
  }

  // Create backup path
  const backupPath = `${sourcePath}.bak`

  try {
    // Copy the file to backup location
    await copyFile(sourcePath, backupPath)
    return backupPath
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to create backup: ${message}`)
  }
}

/**
 * Writes content to a file atomically by writing to a temp file first,
 * then renaming it to the target path. This prevents partial writes.
 *
 * @param path - Target file path
 * @param content - Content to write
 * @throws Error if write operation fails
 */
export async function writeSourceFileAtomic(path: string, content: string): Promise<void> {
  if (!isMarkdownPath(path)) {
    throw new Error('Can only write to markdown files (.md or .markdown)')
  }

  const tempPath = `${path}.tmp`

  try {
    // Write to temporary file first
    await writeTextFile(tempPath, content)

    // Rename temp file to final path (atomic operation)
    await rename(tempPath, path)
  } catch (error) {
    // Clean up temp file if it exists
    try {
      const tempExists = await exists(tempPath)
      if (tempExists) {
        await remove(tempPath)
      }
    } catch {
      // Ignore cleanup errors
    }

    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Atomic write failed: ${message}`)
  }
}

/**
 * Main API for writing content to a source markdown file.
 * Provides optional backup creation and comprehensive error handling.
 *
 * @param path - Path to the markdown file
 * @param content - Content to write
 * @param createBackupFlag - Whether to create a backup before writing (default: true)
 * @returns Promise resolving to WriteResult with operation status
 */
export async function writeSourceFile(
  path: string,
  content: string,
  createBackupFlag: boolean = true
): Promise<WriteResult> {
  // Validate markdown file extension
  if (!isMarkdownPath(path)) {
    return {
      success: false,
      error: 'Can only write to markdown files (.md or .markdown)',
      errorCode: 'NOT_MARKDOWN',
    }
  }

  let backupPath: string | undefined

  try {
    // Check if file exists
    const fileExists = await exists(path)
    if (!fileExists) {
      return {
        success: false,
        error: `File not found: ${path}`,
        errorCode: 'FILE_NOT_FOUND',
      }
    }

    // Create backup if requested
    if (createBackupFlag) {
      try {
        backupPath = await createBackup(path)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return {
          success: false,
          error: `Backup creation failed: ${message}`,
          errorCode: 'BACKUP_ERROR',
        }
      }
    }

    // Perform atomic write
    await writeSourceFileAtomic(path, content)

    return {
      success: true,
      backupPath,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    const lowerMessage = message.toLowerCase()

    // Classify error types
    if (lowerMessage.includes('permission') || lowerMessage.includes('eacces')) {
      return {
        success: false,
        error: `Permission denied: ${message}`,
        errorCode: 'PERMISSION_DENIED',
        backupPath,
      }
    }

    if (lowerMessage.includes('not found') || lowerMessage.includes('enoent')) {
      return {
        success: false,
        error: `File not found: ${message}`,
        errorCode: 'FILE_NOT_FOUND',
        backupPath,
      }
    }

    if (lowerMessage.includes('disk') || lowerMessage.includes('space') || lowerMessage.includes('enospc')) {
      return {
        success: false,
        error: `Disk full: ${message}`,
        errorCode: 'DISK_FULL',
        backupPath,
      }
    }

    // Generic write error
    return {
      success: false,
      error: `Write failed: ${message}`,
      errorCode: 'WRITE_ERROR',
      backupPath,
    }
  }
}

/**
 * Type guard for WriteResult.
 */
export function isWriteResult(value: unknown): value is WriteResult {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.success === 'boolean' &&
    (obj.backupPath === undefined || typeof obj.backupPath === 'string') &&
    (obj.error === undefined || typeof obj.error === 'string') &&
    (obj.errorCode === undefined || typeof obj.errorCode === 'string')
  )
}
