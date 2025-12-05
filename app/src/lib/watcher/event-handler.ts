/**
 * File change event handler.
 * Bridges watcher events to the tracked files module.
 */

import {
  addTrackedFile,
  removeTrackedFile,
  isFileTracked,
  updateContentHash as updateTrackedFileHash,
} from '../files'
import { onFileChange } from './directory-watcher'
import type { FileChangeEvent } from './types'

/** Whether the event handler is connected */
let isConnected = false

/** Unsubscribe function for the event listener */
let unsubscribe: (() => void) | null = null

/** Callback for when a file is added to tracking */
type FileAddedCallback = (path: string, success: boolean) => void

/** Callback for when a file is removed from tracking */
type FileRemovedCallback = (path: string) => void

/** Callback for when a file is updated */
type FileUpdatedCallback = (path: string) => void

/** Registered callbacks */
const callbacks = {
  onFileAdded: new Set<FileAddedCallback>(),
  onFileRemoved: new Set<FileRemovedCallback>(),
  onFileUpdated: new Set<FileUpdatedCallback>(),
}

/**
 * Handles a file add event.
 * Attempts to add the file to tracking.
 *
 * @param event - The file change event
 */
const handleFileAdd = async (event: FileChangeEvent): Promise<void> => {
  const { path } = event

  // Skip if already tracked
  if (isFileTracked(path)) {
    return
  }

  const result = await addTrackedFile(path)

  // Notify callbacks
  for (const callback of callbacks.onFileAdded) {
    try {
      callback(path, result.success)
    } catch (error) {
      console.error('Error in onFileAdded callback:', error)
    }
  }
}

/**
 * Handles a file change event.
 * Updates the content hash for tracked files.
 *
 * @param event - The file change event
 */
const handleFileChange = async (event: FileChangeEvent): Promise<void> => {
  const { path } = event

  // Only update if file is tracked
  if (!isFileTracked(path)) {
    return
  }

  // Update content hash - the tracked-files module handles the actual update
  // The file will be re-parsed when the user opens it
  updateTrackedFileHash(path, `changed-${Date.now()}`)

  // Notify callbacks
  for (const callback of callbacks.onFileUpdated) {
    try {
      callback(path)
    } catch (error) {
      console.error('Error in onFileUpdated callback:', error)
    }
  }
}

/**
 * Handles a file unlink (delete) event.
 * Removes the file from tracking.
 *
 * @param event - The file change event
 */
const handleFileUnlink = async (event: FileChangeEvent): Promise<void> => {
  const { path } = event

  // Only remove if file is tracked
  if (!isFileTracked(path)) {
    return
  }

  await removeTrackedFile(path)

  // Notify callbacks
  for (const callback of callbacks.onFileRemoved) {
    try {
      callback(path)
    } catch (error) {
      console.error('Error in onFileRemoved callback:', error)
    }
  }
}

/**
 * Main event handler that dispatches to specific handlers.
 *
 * @param event - The file change event
 */
const handleEvent = async (event: FileChangeEvent): Promise<void> => {
  switch (event.type) {
    case 'add':
      await handleFileAdd(event)
      break
    case 'change':
      await handleFileChange(event)
      break
    case 'unlink':
      await handleFileUnlink(event)
      break
  }
}

/**
 * Connects the event handler to the directory watcher.
 * Should be called once on app startup after initializing watchers.
 *
 * @example
 * ```ts
 * await loadWatchConfig()
 * startAllConfiguredWatchers()
 * connectEventHandler()
 * ```
 */
export const connectEventHandler = (): void => {
  if (isConnected) {
    return
  }

  unsubscribe = onFileChange((event) => {
    // Run async handler, but don't await (fire and forget)
    handleEvent(event).catch((error) => {
      console.error('Error handling file change event:', error)
    })
  })

  isConnected = true
}

/**
 * Disconnects the event handler from the directory watcher.
 * Should be called on app shutdown.
 */
export const disconnectEventHandler = (): void => {
  if (!isConnected || !unsubscribe) {
    return
  }

  unsubscribe()
  unsubscribe = null
  isConnected = false
}

/**
 * Checks if the event handler is connected.
 *
 * @returns True if connected
 */
export const isEventHandlerConnected = (): boolean => {
  return isConnected
}

/**
 * Registers a callback for when a file is added to tracking.
 *
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export const onTrackedFileAdded = (
  callback: FileAddedCallback
): (() => void) => {
  callbacks.onFileAdded.add(callback)
  return () => callbacks.onFileAdded.delete(callback)
}

/**
 * Registers a callback for when a file is removed from tracking.
 *
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export const onTrackedFileRemoved = (
  callback: FileRemovedCallback
): (() => void) => {
  callbacks.onFileRemoved.add(callback)
  return () => callbacks.onFileRemoved.delete(callback)
}

/**
 * Registers a callback for when a tracked file is updated.
 *
 * @param callback - Callback function
 * @returns Unsubscribe function
 */
export const onTrackedFileUpdated = (
  callback: FileUpdatedCallback
): (() => void) => {
  callbacks.onFileUpdated.add(callback)
  return () => callbacks.onFileUpdated.delete(callback)
}

/**
 * Clears all registered callbacks and disconnects.
 * Useful for testing.
 */
export const clearEventHandlerState = (): void => {
  disconnectEventHandler()
  callbacks.onFileAdded.clear()
  callbacks.onFileRemoved.clear()
  callbacks.onFileUpdated.clear()
}
