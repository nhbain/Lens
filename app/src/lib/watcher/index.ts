/**
 * Directory Watching & Auto-Discovery Module
 *
 * Provides functionality to watch directories for markdown file changes
 * and automatically track/untrack files as they are added, modified, or deleted.
 *
 * @example
 * ```ts
 * import {
 *   loadWatchConfig,
 *   addWatchedDirectory,
 *   startAllConfiguredWatchers,
 *   connectEventHandler,
 *   onTrackedFileAdded,
 * } from '@/lib/watcher'
 *
 * // Initialize on app startup
 * await loadWatchConfig()
 * startAllConfiguredWatchers()
 * connectEventHandler()
 *
 * // Listen for auto-tracked files
 * onTrackedFileAdded((path, success) => {
 *   console.log(`File ${path} was ${success ? 'tracked' : 'failed to track'}`)
 * })
 *
 * // Add a new directory to watch
 * const result = await addWatchedDirectory('/path/to/docs')
 * if (result.success) {
 *   startWatching('/path/to/docs')
 * }
 * ```
 *
 * @module watcher
 */

// Types
export type {
  WatchedDirectory,
  WatchConfig,
  FileChangeType,
  FileChangeEvent,
  WatcherErrorCode,
  AddWatchedDirectoryResult,
} from './types'

export {
  DEFAULT_PATTERNS,
  CURRENT_WATCH_CONFIG_VERSION,
  isWatchedDirectory,
  isWatchConfig,
  isFileChangeType,
  isFileChangeEvent,
  isAddWatchedDirectoryResult,
  createWatchedDirectory,
  createEmptyWatchConfig,
} from './types'

// Configuration management
export {
  loadWatchConfig,
  saveWatchConfig,
  getWatchedDirectories,
  getWatchedDirectory,
  isDirectoryWatched,
  getParentWatchedDirectory,
  getChildWatchedDirectories,
  addWatchedDirectory,
  removeWatchedDirectory,
  setWatchEnabled,
  updateWatchPatterns,
  getWatchedDirectoriesCount,
  isConfigInitialized,
  clearConfigCache,
  removeAllWatchedDirectories,
} from './watch-config'

// Directory watcher
export {
  onFileChange,
  offFileChange,
  startWatching,
  stopWatching,
  stopAllWatchers,
  isWatching,
  getActiveWatchers,
  getActiveWatcherCount,
  startAllConfiguredWatchers,
  clearAllWatcherState,
} from './directory-watcher'

// Event handler (integration with tracked files)
export {
  connectEventHandler,
  disconnectEventHandler,
  isEventHandlerConnected,
  onTrackedFileAdded,
  onTrackedFileRemoved,
  onTrackedFileUpdated,
  clearEventHandlerState,
} from './event-handler'
