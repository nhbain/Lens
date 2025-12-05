/**
 * Directory watcher implementation using chokidar.
 * Watches configured directories for markdown file changes.
 */

import chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import { getWatchedDirectories, getWatchedDirectory } from './watch-config'
import type { FileChangeEvent, FileChangeType, WatchedDirectory } from './types'

/** Default debounce delay in milliseconds */
const DEFAULT_DEBOUNCE_MS = 200

/** Map of directory paths to their watcher instances */
const watchers = new Map<string, FSWatcher>()

/** Map of directory paths to their pending debounced events */
const pendingEvents = new Map<string, Map<string, NodeJS.Timeout>>()

/** Registered event listeners */
const eventListeners: Set<(event: FileChangeEvent) => void> = new Set()

/**
 * Registers a listener for file change events.
 *
 * @param listener - Callback function to handle file changes
 * @returns Unsubscribe function
 *
 * @example
 * ```ts
 * const unsubscribe = onFileChange((event) => {
 *   console.log(`${event.type}: ${event.path}`)
 * })
 *
 * // Later, to stop listening:
 * unsubscribe()
 * ```
 */
export const onFileChange = (
  listener: (event: FileChangeEvent) => void
): (() => void) => {
  eventListeners.add(listener)

  return () => {
    eventListeners.delete(listener)
  }
}

/**
 * Removes a file change listener.
 *
 * @param listener - The listener to remove
 */
export const offFileChange = (
  listener: (event: FileChangeEvent) => void
): void => {
  eventListeners.delete(listener)
}

/**
 * Emits a file change event to all registered listeners.
 *
 * @param event - The file change event
 */
const emitEvent = (event: FileChangeEvent): void => {
  for (const listener of eventListeners) {
    try {
      listener(event)
    } catch (error) {
      console.error('Error in file change listener:', error)
    }
  }
}

/**
 * Checks if a file matches the watched directory's patterns.
 *
 * @param filePath - Path to the file
 * @param patterns - Glob patterns to match against
 * @returns True if the file matches any pattern
 */
const matchesPatterns = (filePath: string, patterns: string[]): boolean => {
  // Extract filename from path
  const parts = filePath.split(/[/\\]/)
  const fileName = parts[parts.length - 1] ?? ''

  return patterns.some((pattern) => {
    // Convert simple glob patterns to regex
    // Supports: *.md, *.markdown, file.*, etc.
    const regexPattern = pattern
      .replace(/[.+^${}()|[\]\\]/g, '\\$&') // Escape special regex chars except *
      .replace(/\*/g, '.*') // Convert * to .*

    const regex = new RegExp(`^${regexPattern}$`, 'i')
    return regex.test(fileName)
  })
}

/**
 * Creates a debounced event handler for a specific file.
 *
 * @param dirPath - Path to the watched directory
 * @param filePath - Path to the changed file
 * @param eventType - Type of change event
 * @param debounceMs - Debounce delay in milliseconds
 */
const handleDebouncedEvent = (
  dirPath: string,
  filePath: string,
  eventType: FileChangeType,
  debounceMs: number
): void => {
  // Get or create the pending events map for this directory
  let dirPendingEvents = pendingEvents.get(dirPath)
  if (!dirPendingEvents) {
    dirPendingEvents = new Map()
    pendingEvents.set(dirPath, dirPendingEvents)
  }

  // Clear any existing timeout for this file
  const existingTimeout = dirPendingEvents.get(filePath)
  if (existingTimeout) {
    clearTimeout(existingTimeout)
  }

  // Set new timeout
  const timeout = setTimeout(() => {
    dirPendingEvents!.delete(filePath)

    const event: FileChangeEvent = {
      type: eventType,
      path: filePath,
      directory: dirPath,
    }

    emitEvent(event)
  }, debounceMs)

  dirPendingEvents.set(filePath, timeout)
}

/**
 * Creates event handlers for a watcher.
 *
 * @param watchedDir - The watched directory configuration
 * @param debounceMs - Debounce delay in milliseconds
 * @returns Object with event handler functions
 */
const createEventHandlers = (
  watchedDir: WatchedDirectory,
  debounceMs: number
): {
  onAdd: (path: string) => void
  onChange: (path: string) => void
  onUnlink: (path: string) => void
  onError: (error: unknown) => void
} => {
  const { path: dirPath, patterns } = watchedDir

  const handleEvent = (eventType: FileChangeType) => (filePath: string) => {
    // Check if file matches patterns
    if (!matchesPatterns(filePath, patterns)) {
      return
    }

    handleDebouncedEvent(dirPath, filePath, eventType, debounceMs)
  }

  return {
    onAdd: handleEvent('add'),
    onChange: handleEvent('change'),
    onUnlink: handleEvent('unlink'),
    onError: (error: unknown) => {
      console.error(`Watcher error for ${dirPath}:`, error)
    },
  }
}

/**
 * Starts watching a directory.
 *
 * @param dirPath - Absolute path to the directory
 * @param debounceMs - Debounce delay in milliseconds (default: 200)
 * @returns True if watching started, false if already watching or directory not configured
 *
 * @example
 * ```ts
 * await addWatchedDirectory('/path/to/dir')
 * const started = startWatching('/path/to/dir')
 * if (started) {
 *   console.log('Now watching directory')
 * }
 * ```
 */
export const startWatching = (
  dirPath: string,
  debounceMs: number = DEFAULT_DEBOUNCE_MS
): boolean => {
  // Check if already watching
  if (watchers.has(dirPath)) {
    return false
  }

  // Get watch configuration
  const watchedDir = getWatchedDirectory(dirPath)
  if (!watchedDir) {
    console.warn(`Cannot start watching: ${dirPath} is not configured`)
    return false
  }

  // Check if watching is enabled
  if (!watchedDir.enabled) {
    return false
  }

  // Create watcher
  const watcher = chokidar.watch(dirPath, {
    ignored: /(^|[/\\])\../, // Ignore dotfiles
    persistent: true,
    ignoreInitial: false, // Emit 'add' events for existing files
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 50,
    },
  })

  // Set up event handlers
  const handlers = createEventHandlers(watchedDir, debounceMs)
  watcher.on('add', handlers.onAdd)
  watcher.on('change', handlers.onChange)
  watcher.on('unlink', handlers.onUnlink)
  watcher.on('error', handlers.onError)

  watchers.set(dirPath, watcher)
  pendingEvents.set(dirPath, new Map())

  return true
}

/**
 * Stops watching a directory.
 *
 * @param dirPath - Absolute path to the directory
 * @returns Promise resolving to true if stopped, false if wasn't watching
 *
 * @example
 * ```ts
 * const stopped = await stopWatching('/path/to/dir')
 * if (stopped) {
 *   console.log('Stopped watching directory')
 * }
 * ```
 */
export const stopWatching = async (dirPath: string): Promise<boolean> => {
  const watcher = watchers.get(dirPath)
  if (!watcher) {
    return false
  }

  // Clear pending events
  const dirPendingEvents = pendingEvents.get(dirPath)
  if (dirPendingEvents) {
    for (const timeout of dirPendingEvents.values()) {
      clearTimeout(timeout)
    }
    pendingEvents.delete(dirPath)
  }

  // Close the watcher
  await watcher.close()
  watchers.delete(dirPath)

  return true
}

/**
 * Stops all active watchers.
 *
 * @returns Promise resolving when all watchers are stopped
 *
 * @example
 * ```ts
 * // On app shutdown
 * await stopAllWatchers()
 * ```
 */
export const stopAllWatchers = async (): Promise<void> => {
  const paths = Array.from(watchers.keys())
  await Promise.all(paths.map(stopWatching))
}

/**
 * Checks if a directory is currently being watched.
 *
 * @param dirPath - Absolute path to check
 * @returns True if the directory has an active watcher
 */
export const isWatching = (dirPath: string): boolean => {
  return watchers.has(dirPath)
}

/**
 * Gets all currently watched directory paths.
 *
 * @returns Array of directory paths with active watchers
 */
export const getActiveWatchers = (): string[] => {
  return Array.from(watchers.keys())
}

/**
 * Gets the count of active watchers.
 *
 * @returns Number of active watchers
 */
export const getActiveWatcherCount = (): number => {
  return watchers.size
}

/**
 * Starts watching all configured directories that are enabled.
 *
 * @param debounceMs - Debounce delay in milliseconds (default: 200)
 * @returns Number of watchers started
 *
 * @example
 * ```ts
 * await loadWatchConfig()
 * const count = startAllConfiguredWatchers()
 * console.log(`Started ${count} watchers`)
 * ```
 */
export const startAllConfiguredWatchers = (
  debounceMs: number = DEFAULT_DEBOUNCE_MS
): number => {
  const directories = getWatchedDirectories()
  let started = 0

  for (const dir of directories) {
    if (dir.enabled && startWatching(dir.path, debounceMs)) {
      started++
    }
  }

  return started
}

/**
 * Clears all watchers and event listeners.
 * Useful for testing.
 */
export const clearAllWatcherState = async (): Promise<void> => {
  await stopAllWatchers()
  eventListeners.clear()
}
