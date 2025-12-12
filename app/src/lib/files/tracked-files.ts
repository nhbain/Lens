/**
 * Tracked files management.
 * Maintains a list of markdown files being tracked for progress.
 * Persists tracked files via the state management module.
 */

import {
  listTrackedFiles as listStateFiles,
  loadFileState,
  deleteFileState,
  createFileTrackingState,
  saveFileState,
  updateTotalItemCount as updateStateItemCount,
} from '../state'
import { validateMarkdownFile } from './file-picker'
import { createTrackedFile } from './types'
import type { TrackedFile, AddFileResult } from './types'

/**
 * In-memory cache of tracked files.
 * Maps file path to TrackedFile object.
 */
const trackedFilesCache = new Map<string, TrackedFile>()

/**
 * Whether the cache has been initialized from disk.
 */
let cacheInitialized = false

/**
 * Gets all currently tracked files.
 *
 * @returns Array of tracked files
 */
export const getTrackedFiles = (): TrackedFile[] => {
  return Array.from(trackedFilesCache.values())
}

/**
 * Gets a specific tracked file by path.
 *
 * @param path - Absolute path to the file
 * @returns TrackedFile if found, undefined otherwise
 */
export const getTrackedFile = (path: string): TrackedFile | undefined => {
  return trackedFilesCache.get(path)
}

/**
 * Checks if a file is currently being tracked.
 *
 * @param path - Absolute path to check
 * @returns True if the file is tracked
 */
export const isFileTracked = (path: string): boolean => {
  return trackedFilesCache.has(path)
}

/**
 * Gets the number of tracked files.
 *
 * @returns Number of tracked files
 */
export const getTrackedFilesCount = (): number => {
  return trackedFilesCache.size
}

/**
 * Adds a file to tracking.
 * Validates the file first, then creates state if valid.
 * Returns existing file info if already tracked (not an error).
 *
 * @param path - Absolute path to the markdown file
 * @returns Result indicating success, already tracked, or error
 */
export const addTrackedFile = async (path: string): Promise<AddFileResult> => {
  // Check if already tracked
  const existing = trackedFilesCache.get(path)
  if (existing) {
    return {
      success: true,
      alreadyTracked: true,
      file: existing,
    }
  }

  // Validate the file
  const validation = await validateMarkdownFile(path)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error,
    }
  }

  // Create tracked file from validation result
  const trackedFile = createTrackedFile(validation)

  // Add to cache
  trackedFilesCache.set(path, trackedFile)

  // Create and save initial state file for persistence
  const initialState = createFileTrackingState(path, trackedFile.contentHash, trackedFile.itemCount)
  await saveFileState(initialState)

  return {
    success: true,
    file: trackedFile,
  }
}

/**
 * Removes a file from tracking.
 * Also deletes the associated state file.
 *
 * @param path - Absolute path to the file to remove
 * @returns True if file was removed, false if it wasn't tracked
 */
export const removeTrackedFile = async (path: string): Promise<boolean> => {
  const existed = trackedFilesCache.delete(path)

  if (existed) {
    // Also delete the state file
    await deleteFileState(path)
  }

  return existed
}

/**
 * Updates the last accessed time for a tracked file.
 *
 * @param path - Path to the tracked file
 * @returns Updated TrackedFile, or undefined if not tracked
 */
export const updateLastAccessed = (path: string): TrackedFile | undefined => {
  const file = trackedFilesCache.get(path)
  if (!file) {
    return undefined
  }

  const updated: TrackedFile = {
    ...file,
    lastAccessedAt: new Date().toISOString(),
  }

  trackedFilesCache.set(path, updated)
  return updated
}

/**
 * Updates the item count for a tracked file.
 * Also updates the totalItemCount in the persisted state file.
 *
 * @param path - Path to the tracked file
 * @param itemCount - New item count
 * @returns Updated TrackedFile, or undefined if not tracked
 */
export const updateItemCount = async (
  path: string,
  itemCount: number
): Promise<TrackedFile | undefined> => {
  const file = trackedFilesCache.get(path)
  if (!file) {
    return undefined
  }

  const updated: TrackedFile = {
    ...file,
    itemCount,
    lastAccessedAt: new Date().toISOString(),
  }

  trackedFilesCache.set(path, updated)

  // Also update the totalItemCount in the state file
  await updateStateItemCount(path, itemCount)

  return updated
}

/**
 * Updates the content hash for a tracked file.
 *
 * @param path - Path to the tracked file
 * @param contentHash - New content hash
 * @returns Updated TrackedFile, or undefined if not tracked
 */
export const updateContentHash = (
  path: string,
  contentHash: string
): TrackedFile | undefined => {
  const file = trackedFilesCache.get(path)
  if (!file) {
    return undefined
  }

  const updated: TrackedFile = {
    ...file,
    contentHash,
    lastAccessedAt: new Date().toISOString(),
  }

  trackedFilesCache.set(path, updated)
  return updated
}

/**
 * Loads tracked files from persisted state files.
 * This should be called on app startup to restore the list.
 *
 * @returns Array of loaded tracked files
 */
export const loadTrackedFiles = async (): Promise<TrackedFile[]> => {
  // Get list of source paths from state files
  const sourcePaths = await listStateFiles()

  const loadedFiles: TrackedFile[] = []

  for (const sourcePath of sourcePaths) {
    const state = await loadFileState(sourcePath)
    if (state) {
      // Extract file name from path
      const parts = sourcePath.split(/[/\\]/)
      const fileName = parts[parts.length - 1] ?? ''

      const trackedFile: TrackedFile = {
        path: state.sourcePath,
        fileName,
        itemCount: state.totalItemCount,
        contentHash: state.contentHash,
        addedAt: state.createdAt,
        lastAccessedAt: state.updatedAt,
      }

      trackedFilesCache.set(sourcePath, trackedFile)
      loadedFiles.push(trackedFile)
    }
  }

  cacheInitialized = true
  return loadedFiles
}

/**
 * Checks if the cache has been initialized.
 *
 * @returns True if loadTrackedFiles has been called
 */
export const isCacheInitialized = (): boolean => {
  return cacheInitialized
}

/**
 * Clears the tracked files cache.
 * Useful for testing or resetting state.
 * Does NOT delete state files from disk.
 */
export const clearCache = (): void => {
  trackedFilesCache.clear()
  cacheInitialized = false
}

/**
 * Removes all tracked files and their state files.
 * Use with caution - this deletes all tracking data.
 */
export const removeAllTrackedFiles = async (): Promise<void> => {
  const paths = Array.from(trackedFilesCache.keys())

  for (const path of paths) {
    await deleteFileState(path)
  }

  trackedFilesCache.clear()
}
