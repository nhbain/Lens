/**
 * File system utilities for state persistence.
 * Wraps Tauri's fs plugin APIs for reading/writing state files
 * in the platform-appropriate app data directory.
 */

import { appDataDir, join } from '@tauri-apps/api/path'
import {
  readTextFile,
  writeTextFile,
  remove,
  rename,
  mkdir,
  readDir,
  exists,
  BaseDirectory,
} from '@tauri-apps/plugin-fs'

/** Name of the subdirectory within app data for storing state files */
const STATE_DIR_NAME = 'lens-state'

/** Cached state directory path */
let stateDirPath: string | null = null

/**
 * Gets the path to the state directory.
 * Creates the directory if it doesn't exist.
 *
 * @returns Promise resolving to the absolute path of the state directory
 */
export async function getStateDirectory(): Promise<string> {
  if (stateDirPath) {
    return stateDirPath
  }

  const appData = await appDataDir()
  stateDirPath = await join(appData, STATE_DIR_NAME)

  // Ensure the directory exists
  await ensureStateDirectory()

  return stateDirPath
}

/**
 * Ensures the state directory exists, creating it if necessary.
 */
export async function ensureStateDirectory(): Promise<void> {
  const dir = stateDirPath ?? (await getStateDirectory())
  const dirExists = await exists(dir)
  if (!dirExists) {
    await mkdir(dir, { recursive: true })
  }
}

/**
 * Reads a text file from the state directory.
 *
 * @param filename - Name of the file to read (relative to state directory)
 * @returns Promise resolving to file contents, or null if file doesn't exist
 */
export async function readStateFile(filename: string): Promise<string | null> {
  const stateDir = await getStateDirectory()
  const filePath = await join(stateDir, filename)

  const fileExists = await exists(filePath)
  if (!fileExists) {
    return null
  }

  return readTextFile(filePath)
}

/**
 * Writes a text file to the state directory.
 *
 * @param filename - Name of the file to write (relative to state directory)
 * @param content - Content to write to the file
 */
export async function writeStateFile(
  filename: string,
  content: string
): Promise<void> {
  const stateDir = await getStateDirectory()
  const filePath = await join(stateDir, filename)
  await writeTextFile(filePath, content)
}

/**
 * Writes a file atomically by writing to a temp file first, then renaming.
 * This prevents corruption if the app crashes during write.
 *
 * @param filename - Name of the file to write (relative to state directory)
 * @param content - Content to write to the file
 */
export async function writeStateFileAtomic(
  filename: string,
  content: string
): Promise<void> {
  const stateDir = await getStateDirectory()
  const filePath = await join(stateDir, filename)
  const tempPath = await join(stateDir, `${filename}.tmp`)

  // Write to temp file first
  await writeTextFile(tempPath, content)

  // Rename temp to final (atomic operation on most file systems)
  await rename(tempPath, filePath)
}

/**
 * Removes a file from the state directory.
 *
 * @param filename - Name of the file to remove (relative to state directory)
 */
export async function removeStateFile(filename: string): Promise<void> {
  const stateDir = await getStateDirectory()
  const filePath = await join(stateDir, filename)

  const fileExists = await exists(filePath)
  if (fileExists) {
    await remove(filePath)
  }
}

/**
 * Checks if a file exists in the state directory.
 *
 * @param filename - Name of the file to check (relative to state directory)
 * @returns Promise resolving to true if file exists
 */
export async function stateFileExists(filename: string): Promise<boolean> {
  const stateDir = await getStateDirectory()
  const filePath = await join(stateDir, filename)
  return exists(filePath)
}

/**
 * Lists all files in the state directory.
 *
 * @returns Promise resolving to array of filenames
 */
export async function listStateFiles(): Promise<string[]> {
  const stateDir = await getStateDirectory()

  const dirExists = await exists(stateDir)
  if (!dirExists) {
    return []
  }

  const entries = await readDir(stateDir)
  return entries
    .filter((entry) => entry.isFile)
    .map((entry) => entry.name)
}

/**
 * Gets the full path to a file in the state directory.
 *
 * @param filename - Name of the file
 * @returns Promise resolving to the full file path
 */
export async function getStateFilePath(filename: string): Promise<string> {
  const stateDir = await getStateDirectory()
  return join(stateDir, filename)
}

/**
 * Creates a backup of a state file.
 *
 * @param filename - Name of the file to back up
 * @returns Promise resolving to true if backup was created
 */
export async function backupStateFile(filename: string): Promise<boolean> {
  const stateDir = await getStateDirectory()
  const filePath = await join(stateDir, filename)
  const backupPath = await join(stateDir, `${filename}.bak`)

  const fileExists = await exists(filePath)
  if (!fileExists) {
    return false
  }

  // Read and write instead of copy (Tauri fs plugin doesn't have copy)
  const content = await readTextFile(filePath)
  await writeTextFile(backupPath, content)
  return true
}

/**
 * Restores a state file from its backup.
 *
 * @param filename - Name of the file to restore
 * @returns Promise resolving to true if backup was restored
 */
export async function restoreFromBackup(filename: string): Promise<boolean> {
  const stateDir = await getStateDirectory()
  const filePath = await join(stateDir, filename)
  const backupPath = await join(stateDir, `${filename}.bak`)

  const backupExists = await exists(backupPath)
  if (!backupExists) {
    return false
  }

  const content = await readTextFile(backupPath)
  await writeTextFile(filePath, content)
  return true
}

// Re-export types that consumers might need
export { BaseDirectory }
