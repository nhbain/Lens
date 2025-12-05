/**
 * Type definitions for directory watching and auto-discovery.
 */

/**
 * Default glob patterns for matching markdown files.
 */
export const DEFAULT_PATTERNS = ['*.md', '*.markdown'] as const

/**
 * Current version of the watch configuration schema.
 */
export const CURRENT_WATCH_CONFIG_VERSION = 1

/**
 * A directory configured for watching.
 */
export interface WatchedDirectory {
  /** Absolute path to the watched directory */
  path: string
  /** Glob patterns for matching files (e.g., ['*.md', '*.markdown']) */
  patterns: string[]
  /** ISO timestamp when this directory was added */
  addedAt: string
  /** Whether watching is currently enabled for this directory */
  enabled: boolean
}

/**
 * Configuration for all watched directories.
 * Persisted to app data directory.
 */
export interface WatchConfig {
  /** Schema version for migration support */
  version: number
  /** Map of directory paths to their watch configuration */
  directories: Record<string, WatchedDirectory>
}

/**
 * Type of file change event.
 */
export type FileChangeType = 'add' | 'change' | 'unlink'

/**
 * Event emitted when a file changes in a watched directory.
 */
export interface FileChangeEvent {
  /** Type of change that occurred */
  type: FileChangeType
  /** Absolute path to the changed file */
  path: string
  /** Absolute path to the watched directory containing the file */
  directory: string
}

/**
 * Error codes for watcher operations.
 */
export type WatcherErrorCode =
  | 'DIRECTORY_NOT_FOUND'
  | 'PERMISSION_DENIED'
  | 'ALREADY_WATCHING'
  | 'NOT_WATCHING'
  | 'NOT_A_DIRECTORY'
  | 'NESTED_DIRECTORY'
  | 'WATCHER_ERROR'
  | 'CONFIG_ERROR'

/**
 * Result of adding a watched directory.
 */
export interface AddWatchedDirectoryResult {
  /** Whether the operation succeeded */
  success: boolean
  /** The watched directory if successful */
  directory?: WatchedDirectory
  /** Whether this directory was already being watched */
  alreadyWatched?: boolean
  /** Error message if failed */
  error?: string
  /** Error code for programmatic handling */
  errorCode?: WatcherErrorCode
}

/**
 * Type guard for WatchedDirectory.
 *
 * @param value - Value to check
 * @returns True if value is a WatchedDirectory
 */
export const isWatchedDirectory = (
  value: unknown
): value is WatchedDirectory => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.path === 'string' &&
    Array.isArray(obj.patterns) &&
    obj.patterns.every((p) => typeof p === 'string') &&
    typeof obj.addedAt === 'string' &&
    typeof obj.enabled === 'boolean'
  )
}

/**
 * Type guard for WatchConfig.
 *
 * @param value - Value to check
 * @returns True if value is a WatchConfig
 */
export const isWatchConfig = (value: unknown): value is WatchConfig => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  if (typeof obj.version !== 'number') {
    return false
  }

  if (
    typeof obj.directories !== 'object' ||
    obj.directories === null ||
    Array.isArray(obj.directories)
  ) {
    return false
  }

  const directories = obj.directories as Record<string, unknown>
  for (const key in directories) {
    if (!isWatchedDirectory(directories[key])) {
      return false
    }
  }

  return true
}

/**
 * Type guard for FileChangeType.
 *
 * @param value - Value to check
 * @returns True if value is a FileChangeType
 */
export const isFileChangeType = (value: unknown): value is FileChangeType => {
  return value === 'add' || value === 'change' || value === 'unlink'
}

/**
 * Type guard for FileChangeEvent.
 *
 * @param value - Value to check
 * @returns True if value is a FileChangeEvent
 */
export const isFileChangeEvent = (
  value: unknown
): value is FileChangeEvent => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    isFileChangeType(obj.type) &&
    typeof obj.path === 'string' &&
    typeof obj.directory === 'string'
  )
}

/**
 * Type guard for AddWatchedDirectoryResult.
 *
 * @param value - Value to check
 * @returns True if value is an AddWatchedDirectoryResult
 */
export const isAddWatchedDirectoryResult = (
  value: unknown
): value is AddWatchedDirectoryResult => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.success === 'boolean' &&
    (obj.directory === undefined || isWatchedDirectory(obj.directory)) &&
    (obj.alreadyWatched === undefined ||
      typeof obj.alreadyWatched === 'boolean') &&
    (obj.error === undefined || typeof obj.error === 'string') &&
    (obj.errorCode === undefined || typeof obj.errorCode === 'string')
  )
}

/**
 * Creates a new WatchedDirectory with default settings.
 *
 * @param path - Absolute path to the directory
 * @param patterns - Optional glob patterns (defaults to DEFAULT_PATTERNS)
 * @returns WatchedDirectory object
 */
export const createWatchedDirectory = (
  path: string,
  patterns: string[] = [...DEFAULT_PATTERNS]
): WatchedDirectory => {
  return {
    path,
    patterns,
    addedAt: new Date().toISOString(),
    enabled: true,
  }
}

/**
 * Creates a new empty WatchConfig.
 *
 * @returns Empty WatchConfig object
 */
export const createEmptyWatchConfig = (): WatchConfig => {
  return {
    version: CURRENT_WATCH_CONFIG_VERSION,
    directories: {},
  }
}
