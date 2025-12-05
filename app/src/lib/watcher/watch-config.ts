/**
 * Watch configuration management.
 * Stores and persists configuration for watched directories.
 */

import { readStateFile, writeStateFileAtomic } from '../state/file-system'
import {
  createEmptyWatchConfig,
  createWatchedDirectory,
  isWatchConfig,
  DEFAULT_PATTERNS,
} from './types'
import type {
  WatchConfig,
  WatchedDirectory,
  AddWatchedDirectoryResult,
} from './types'

/** Filename for persisted watch configuration */
const WATCH_CONFIG_FILENAME = 'watch-config.json'

/** In-memory cache of watch configuration */
let watchConfig: WatchConfig | null = null

/** Whether the config has been loaded from disk */
let configInitialized = false

/**
 * Loads watch configuration from disk.
 * Should be called on app startup.
 *
 * @returns Promise resolving to the loaded configuration
 *
 * @example
 * ```ts
 * const config = await loadWatchConfig()
 * console.log('Watched directories:', Object.keys(config.directories))
 * ```
 */
export const loadWatchConfig = async (): Promise<WatchConfig> => {
  const content = await readStateFile(WATCH_CONFIG_FILENAME)

  if (content === null) {
    // No config file exists, create empty config
    watchConfig = createEmptyWatchConfig()
    configInitialized = true
    return watchConfig
  }

  try {
    const parsed = JSON.parse(content)

    if (!isWatchConfig(parsed)) {
      // Invalid config, reset to empty
      console.warn('Invalid watch config found, resetting to empty')
      watchConfig = createEmptyWatchConfig()
    } else {
      watchConfig = parsed
    }
  } catch {
    // JSON parse error, reset to empty
    console.warn('Failed to parse watch config, resetting to empty')
    watchConfig = createEmptyWatchConfig()
  }

  configInitialized = true
  return watchConfig
}

/**
 * Saves watch configuration to disk.
 *
 * @returns Promise resolving when save is complete
 */
export const saveWatchConfig = async (): Promise<void> => {
  if (!watchConfig) {
    watchConfig = createEmptyWatchConfig()
  }

  const content = JSON.stringify(watchConfig, null, 2)
  await writeStateFileAtomic(WATCH_CONFIG_FILENAME, content)
}

/**
 * Gets all watched directories.
 *
 * @returns Array of watched directories
 *
 * @example
 * ```ts
 * const directories = getWatchedDirectories()
 * for (const dir of directories) {
 *   console.log(`Watching: ${dir.path} with patterns: ${dir.patterns.join(', ')}`)
 * }
 * ```
 */
export const getWatchedDirectories = (): WatchedDirectory[] => {
  if (!watchConfig) {
    return []
  }

  return Object.values(watchConfig.directories)
}

/**
 * Gets a specific watched directory by path.
 *
 * @param path - Absolute path to the directory
 * @returns WatchedDirectory if found, undefined otherwise
 */
export const getWatchedDirectory = (
  path: string
): WatchedDirectory | undefined => {
  if (!watchConfig) {
    return undefined
  }

  return watchConfig.directories[path]
}

/**
 * Checks if a directory is currently being watched.
 *
 * @param path - Absolute path to check
 * @returns True if the directory is being watched
 */
export const isDirectoryWatched = (path: string): boolean => {
  if (!watchConfig) {
    return false
  }

  return path in watchConfig.directories
}

/**
 * Checks if a path is nested within any watched directory.
 * Used to prevent double-watching.
 *
 * @param path - Absolute path to check
 * @returns The parent watched directory path if nested, undefined otherwise
 */
export const getParentWatchedDirectory = (
  path: string
): string | undefined => {
  if (!watchConfig) {
    return undefined
  }

  // Normalize path for comparison (remove trailing slash)
  const normalizedPath = path.replace(/[/\\]$/, '')

  for (const dirPath of Object.keys(watchConfig.directories)) {
    const normalizedDirPath = dirPath.replace(/[/\\]$/, '')

    // Check if path is a subdirectory of an existing watched directory
    if (
      normalizedPath !== normalizedDirPath &&
      normalizedPath.startsWith(normalizedDirPath + '/')
    ) {
      return dirPath
    }
  }

  return undefined
}

/**
 * Gets any watched directories that are children of the given path.
 * Used when adding a parent directory - child watches may need to be removed.
 *
 * @param path - Absolute path to check
 * @returns Array of child watched directory paths
 */
export const getChildWatchedDirectories = (path: string): string[] => {
  if (!watchConfig) {
    return []
  }

  // Normalize path for comparison (remove trailing slash)
  const normalizedPath = path.replace(/[/\\]$/, '')

  const children: string[] = []

  for (const dirPath of Object.keys(watchConfig.directories)) {
    const normalizedDirPath = dirPath.replace(/[/\\]$/, '')

    // Check if existing watched directory is a subdirectory of the new path
    if (
      normalizedDirPath !== normalizedPath &&
      normalizedDirPath.startsWith(normalizedPath + '/')
    ) {
      children.push(dirPath)
    }
  }

  return children
}

/**
 * Adds a directory to the watch list.
 *
 * @param path - Absolute path to the directory
 * @param patterns - Optional glob patterns (defaults to DEFAULT_PATTERNS)
 * @returns Result indicating success, already watched, or error
 *
 * @example
 * ```ts
 * const result = await addWatchedDirectory('/path/to/dir')
 * if (result.success) {
 *   console.log('Now watching:', result.directory?.path)
 * }
 * ```
 */
export const addWatchedDirectory = async (
  path: string,
  patterns: string[] = [...DEFAULT_PATTERNS]
): Promise<AddWatchedDirectoryResult> => {
  if (!watchConfig) {
    await loadWatchConfig()
  }

  // Check if already watching this exact directory
  if (isDirectoryWatched(path)) {
    return {
      success: true,
      alreadyWatched: true,
      directory: watchConfig!.directories[path],
    }
  }

  // Check if this path is nested within an existing watched directory
  const parentDir = getParentWatchedDirectory(path)
  if (parentDir) {
    return {
      success: false,
      error: `Directory is already covered by watched directory: ${parentDir}`,
      errorCode: 'NESTED_DIRECTORY',
    }
  }

  // Create the watched directory entry
  const watchedDir = createWatchedDirectory(path, patterns)

  // Add to config
  watchConfig!.directories[path] = watchedDir

  // Persist to disk
  await saveWatchConfig()

  return {
    success: true,
    directory: watchedDir,
  }
}

/**
 * Removes a directory from the watch list.
 *
 * @param path - Absolute path to the directory to remove
 * @returns True if directory was removed, false if it wasn't being watched
 *
 * @example
 * ```ts
 * const removed = await removeWatchedDirectory('/path/to/dir')
 * if (removed) {
 *   console.log('Stopped watching directory')
 * }
 * ```
 */
export const removeWatchedDirectory = async (path: string): Promise<boolean> => {
  if (!watchConfig) {
    return false
  }

  if (!(path in watchConfig.directories)) {
    return false
  }

  delete watchConfig.directories[path]

  // Persist to disk
  await saveWatchConfig()

  return true
}

/**
 * Updates the enabled status of a watched directory.
 *
 * @param path - Path to the watched directory
 * @param enabled - Whether watching should be enabled
 * @returns Updated WatchedDirectory, or undefined if not found
 */
export const setWatchEnabled = async (
  path: string,
  enabled: boolean
): Promise<WatchedDirectory | undefined> => {
  if (!watchConfig) {
    return undefined
  }

  const dir = watchConfig.directories[path]
  if (!dir) {
    return undefined
  }

  dir.enabled = enabled
  await saveWatchConfig()

  return dir
}

/**
 * Updates the patterns for a watched directory.
 *
 * @param path - Path to the watched directory
 * @param patterns - New glob patterns
 * @returns Updated WatchedDirectory, or undefined if not found
 */
export const updateWatchPatterns = async (
  path: string,
  patterns: string[]
): Promise<WatchedDirectory | undefined> => {
  if (!watchConfig) {
    return undefined
  }

  const dir = watchConfig.directories[path]
  if (!dir) {
    return undefined
  }

  dir.patterns = patterns
  await saveWatchConfig()

  return dir
}

/**
 * Gets the count of watched directories.
 *
 * @returns Number of watched directories
 */
export const getWatchedDirectoriesCount = (): number => {
  if (!watchConfig) {
    return 0
  }

  return Object.keys(watchConfig.directories).length
}

/**
 * Checks if the configuration has been loaded.
 *
 * @returns True if loadWatchConfig has been called
 */
export const isConfigInitialized = (): boolean => {
  return configInitialized
}

/**
 * Clears the in-memory configuration cache.
 * Useful for testing or forcing a reload from disk.
 */
export const clearConfigCache = (): void => {
  watchConfig = null
  configInitialized = false
}

/**
 * Removes all watched directories.
 * Use with caution - this clears all watch configuration.
 */
export const removeAllWatchedDirectories = async (): Promise<void> => {
  watchConfig = createEmptyWatchConfig()
  await saveWatchConfig()
}
