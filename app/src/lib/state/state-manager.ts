/**
 * State manager for persisting tracking state to disk.
 * Provides CRUD operations for file tracking state.
 */

import type { FileTrackingState, ItemTrackingState } from './types'
import {
  isFileTrackingState,
  createFileTrackingState,
  createItemTrackingState,
} from './types'
import type { TrackingStatus } from '../parser/types'
import {
  readStateFile,
  writeStateFileAtomic,
  removeStateFile,
  listStateFiles,
  stateFileExists,
  backupStateFile,
  restoreFromBackup,
} from './file-system'

/** State file extension */
const STATE_FILE_EXTENSION = '.json'

/**
 * Generates a state filename from a source file path.
 * Uses a hash of the path to create a unique, filesystem-safe name.
 *
 * @param sourcePath - Absolute path to the source markdown file
 * @returns Filename for the state file (without directory)
 */
export function generateStateFilename(sourcePath: string): string {
  // Simple hash function for creating filesystem-safe filenames
  let hash = 0
  for (let i = 0; i < sourcePath.length; i++) {
    const char = sourcePath.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  const hashStr = Math.abs(hash).toString(36)
  return `state-${hashStr}${STATE_FILE_EXTENSION}`
}

/**
 * Saves file tracking state to disk.
 * Creates a backup of the existing state before overwriting.
 *
 * @param fileState - The file tracking state to save
 * @throws Error if serialization fails
 */
export async function saveFileState(fileState: FileTrackingState): Promise<void> {
  const filename = generateStateFilename(fileState.sourcePath)

  // Validate state before saving
  if (!isFileTrackingState(fileState)) {
    throw new Error('Invalid FileTrackingState: validation failed')
  }

  // Create backup if file exists
  const exists = await stateFileExists(filename)
  if (exists) {
    await backupStateFile(filename)
  }

  // Update the updatedAt timestamp
  const stateToSave: FileTrackingState = {
    ...fileState,
    updatedAt: new Date().toISOString(),
  }

  // Serialize and write atomically
  const content = JSON.stringify(stateToSave, null, 2)
  await writeStateFileAtomic(filename, content)
}

/**
 * Loads file tracking state from disk.
 *
 * @param sourcePath - Absolute path to the source markdown file
 * @returns The file tracking state, or null if not found
 * @throws Error if file exists but contains invalid JSON or state
 */
export async function loadFileState(
  sourcePath: string
): Promise<FileTrackingState | null> {
  const filename = generateStateFilename(sourcePath)
  const content = await readStateFile(filename)

  if (content === null) {
    return null
  }

  try {
    const parsed = JSON.parse(content)

    if (!isFileTrackingState(parsed)) {
      // Try to recover from backup
      const restored = await restoreFromBackup(filename)
      if (restored) {
        const backupContent = await readStateFile(filename)
        if (backupContent) {
          const backupParsed = JSON.parse(backupContent)
          if (isFileTrackingState(backupParsed)) {
            return backupParsed
          }
        }
      }
      throw new Error('Invalid state file structure and backup recovery failed')
    }

    return parsed
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Try to recover from backup on parse error
      const restored = await restoreFromBackup(filename)
      if (restored) {
        const backupContent = await readStateFile(filename)
        if (backupContent) {
          try {
            const backupParsed = JSON.parse(backupContent)
            if (isFileTrackingState(backupParsed)) {
              return backupParsed
            }
          } catch {
            // Backup also corrupted
          }
        }
      }
      throw new Error(`Failed to parse state file: ${error.message}`)
    }
    throw error
  }
}

/**
 * Deletes file tracking state from disk.
 *
 * @param sourcePath - Absolute path to the source markdown file
 */
export async function deleteFileState(sourcePath: string): Promise<void> {
  const filename = generateStateFilename(sourcePath)
  await removeStateFile(filename)
  // Also remove backup if it exists
  await removeStateFile(`${filename}.bak`)
}

/**
 * Lists all tracked files by reading state files from disk.
 *
 * @returns Array of source file paths that have tracking state
 */
export async function listTrackedFiles(): Promise<string[]> {
  const files = await listStateFiles()
  const trackedPaths: string[] = []

  for (const file of files) {
    // Skip backup files and non-state files
    if (file.endsWith('.bak') || file.endsWith('.tmp')) {
      continue
    }
    if (!file.startsWith('state-') || !file.endsWith(STATE_FILE_EXTENSION)) {
      continue
    }

    // Load the state to get the source path
    const content = await readStateFile(file)
    if (content) {
      try {
        const parsed = JSON.parse(content)
        if (isFileTrackingState(parsed)) {
          trackedPaths.push(parsed.sourcePath)
        }
      } catch {
        // Skip invalid files
      }
    }
  }

  return trackedPaths
}

/**
 * Checks if a file has tracking state.
 *
 * @param sourcePath - Absolute path to the source markdown file
 * @returns True if tracking state exists for this file
 */
export async function hasTrackingState(sourcePath: string): Promise<boolean> {
  const filename = generateStateFilename(sourcePath)
  return stateFileExists(filename)
}

/**
 * Gets or creates tracking state for a file.
 *
 * @param sourcePath - Absolute path to the source markdown file
 * @param contentHash - Hash of the source file content
 * @returns Existing state or newly created state
 */
export async function getOrCreateFileState(
  sourcePath: string,
  contentHash: string
): Promise<FileTrackingState> {
  const existingState = await loadFileState(sourcePath)

  if (existingState) {
    return existingState
  }

  const newState = createFileTrackingState(sourcePath, contentHash)
  await saveFileState(newState)
  return newState
}

/**
 * Updates the status of a single item within a file's tracking state.
 *
 * @param sourcePath - Absolute path to the source markdown file
 * @param itemId - ID of the item to update
 * @param status - New status for the item
 * @returns The updated file state, or null if file state doesn't exist
 */
export async function updateItemStatus(
  sourcePath: string,
  itemId: string,
  status: TrackingStatus
): Promise<FileTrackingState | null> {
  const fileState = await loadFileState(sourcePath)

  if (!fileState) {
    return null
  }

  // Create or update the item tracking state
  const itemState: ItemTrackingState = createItemTrackingState(itemId, status)

  const updatedState: FileTrackingState = {
    ...fileState,
    items: {
      ...fileState.items,
      [itemId]: itemState,
    },
  }

  await saveFileState(updatedState)
  return updatedState
}

/**
 * Updates the content hash for a file's tracking state.
 * Called when the source file has been modified.
 *
 * @param sourcePath - Absolute path to the source markdown file
 * @param newHash - New content hash
 * @returns The updated file state, or null if file state doesn't exist
 */
export async function updateContentHash(
  sourcePath: string,
  newHash: string
): Promise<FileTrackingState | null> {
  const fileState = await loadFileState(sourcePath)

  if (!fileState) {
    return null
  }

  const updatedState: FileTrackingState = {
    ...fileState,
    contentHash: newHash,
  }

  await saveFileState(updatedState)
  return updatedState
}

/**
 * Loads all file tracking states from disk.
 *
 * @returns Map of source paths to file tracking states
 */
export async function loadAllFileStates(): Promise<Map<string, FileTrackingState>> {
  const trackedPaths = await listTrackedFiles()
  const stateMap = new Map<string, FileTrackingState>()

  for (const sourcePath of trackedPaths) {
    const state = await loadFileState(sourcePath)
    if (state) {
      stateMap.set(sourcePath, state)
    }
  }

  return stateMap
}
