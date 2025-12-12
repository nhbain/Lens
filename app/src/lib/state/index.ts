/**
 * State Persistence Module
 *
 * Provides functionality to persist tracking state for markdown documents
 * across app restarts. State is stored in the platform-appropriate app
 * data directory, separate from the original markdown files.
 *
 * @example
 * ```ts
 * import {
 *   computeContentHash,
 *   getOrCreateFileState,
 *   updateItemStatus,
 *   loadFileState,
 * } from '@/lib/state'
 *
 * // Start tracking a markdown file
 * const content = await readFile('/path/to/file.md')
 * const hash = computeContentHash(content)
 * const state = await getOrCreateFileState('/path/to/file.md', hash)
 *
 * // Update item tracking status
 * await updateItemStatus('/path/to/file.md', 'item-123', 'complete')
 *
 * // Load existing state
 * const existingState = await loadFileState('/path/to/file.md')
 * ```
 *
 * @module state
 */

// Types
export type {
  ItemTrackingState,
  FileTrackingState,
  AppState,
} from './types'

export {
  CURRENT_STATE_VERSION,
  isItemTrackingState,
  isFileTrackingState,
  isAppState,
  createEmptyAppState,
  createFileTrackingState,
  createItemTrackingState,
} from './types'

// Content hashing
export {
  computeContentHash,
  computeNormalizedHash,
  hasContentChanged,
  hasMeaningfulChange,
  computeHashes,
} from './file-hash'

// State management
export {
  generateStateFilename,
  saveFileState,
  loadFileState,
  deleteFileState,
  listTrackedFiles,
  hasTrackingState,
  getOrCreateFileState,
  updateItemStatus,
  updateContentHash,
  updateTotalItemCount,
  loadAllFileStates,
  updateCollapseState,
  setAllCollapsed,
} from './state-manager'

// File system utilities (for advanced use cases)
export {
  getStateDirectory,
  ensureStateDirectory,
  readStateFile,
  writeStateFile,
  writeStateFileAtomic,
  removeStateFile,
  stateFileExists,
  listStateFiles,
  getStateFilePath,
  backupStateFile,
  restoreFromBackup,
} from './file-system'
