/**
 * State persistence types for tracking progress across app restarts.
 * These types define the structure of state files that store tracking information
 * separate from the original markdown files.
 */

import type { TrackingStatus } from '../parser/types'

/**
 * Tracking state for a single item within a markdown file.
 * Maps to a specific header, list item, or checkbox in the source document.
 */
export interface ItemTrackingState {
  /** Unique identifier matching the TrackableItem.id from the parser */
  itemId: string
  /** Current tracking status of the item */
  status: TrackingStatus
  /** ISO timestamp when this item's status was last updated */
  updatedAt: string
}

/**
 * Tracking state for an entire markdown file.
 * Contains all item states and metadata for change detection.
 */
export interface FileTrackingState {
  /** Absolute path to the source markdown file */
  sourcePath: string
  /** Content hash of the source file for change detection */
  contentHash: string
  /** Map of item IDs to their tracking states */
  items: Record<string, ItemTrackingState>
  /** ISO timestamp when tracking was first created for this file */
  createdAt: string
  /** ISO timestamp when this file's state was last modified */
  updatedAt: string
}

/**
 * Root application state containing all tracked files.
 * This is the top-level structure persisted to disk.
 */
export interface AppState {
  /** Schema version for migration support */
  version: number
  /** Map of source file paths to their tracking states */
  files: Record<string, FileTrackingState>
}

/** Current schema version */
export const CURRENT_STATE_VERSION = 1

/**
 * Type guard for ItemTrackingState.
 * Validates that an unknown value conforms to the ItemTrackingState interface.
 */
export function isItemTrackingState(value: unknown): value is ItemTrackingState {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const obj = value as Record<string, unknown>
  return (
    typeof obj.itemId === 'string' &&
    typeof obj.status === 'string' &&
    ['pending', 'in_progress', 'complete'].includes(obj.status) &&
    typeof obj.updatedAt === 'string'
  )
}

/**
 * Type guard for FileTrackingState.
 * Validates that an unknown value conforms to the FileTrackingState interface.
 */
export function isFileTrackingState(value: unknown): value is FileTrackingState {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const obj = value as Record<string, unknown>
  if (
    typeof obj.sourcePath !== 'string' ||
    typeof obj.contentHash !== 'string' ||
    typeof obj.createdAt !== 'string' ||
    typeof obj.updatedAt !== 'string'
  ) {
    return false
  }
  if (typeof obj.items !== 'object' || obj.items === null) {
    return false
  }
  // Validate each item in the items map
  const items = obj.items as Record<string, unknown>
  for (const key in items) {
    if (!isItemTrackingState(items[key])) {
      return false
    }
  }
  return true
}

/**
 * Type guard for AppState.
 * Validates that an unknown value conforms to the AppState interface.
 */
export function isAppState(value: unknown): value is AppState {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const obj = value as Record<string, unknown>
  if (typeof obj.version !== 'number') {
    return false
  }
  if (typeof obj.files !== 'object' || obj.files === null) {
    return false
  }
  // Validate each file in the files map
  const files = obj.files as Record<string, unknown>
  for (const key in files) {
    if (!isFileTrackingState(files[key])) {
      return false
    }
  }
  return true
}

/**
 * Creates a new empty AppState with the current schema version.
 */
export function createEmptyAppState(): AppState {
  return {
    version: CURRENT_STATE_VERSION,
    files: {},
  }
}

/**
 * Creates a new FileTrackingState for a given source file.
 */
export function createFileTrackingState(
  sourcePath: string,
  contentHash: string
): FileTrackingState {
  const now = new Date().toISOString()
  return {
    sourcePath,
    contentHash,
    items: {},
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Creates a new ItemTrackingState with default pending status.
 */
export function createItemTrackingState(
  itemId: string,
  status: TrackingStatus = 'pending'
): ItemTrackingState {
  return {
    itemId,
    status,
    updatedAt: new Date().toISOString(),
  }
}
