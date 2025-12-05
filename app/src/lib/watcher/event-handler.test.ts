import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { FileChangeEvent } from './types'

// Mock the files module
vi.mock('../files', () => ({
  addTrackedFile: vi.fn(),
  removeTrackedFile: vi.fn(),
  isFileTracked: vi.fn(),
  updateContentHash: vi.fn(),
}))

// Mock the state module
vi.mock('../state', () => ({
  computeContentHash: vi.fn(),
}))

// Track the file change listener
let fileChangeListener: ((event: FileChangeEvent) => void) | null = null

// Mock the directory-watcher module
vi.mock('./directory-watcher', () => ({
  onFileChange: vi.fn((listener) => {
    fileChangeListener = listener
    return () => {
      fileChangeListener = null
    }
  }),
}))

import {
  addTrackedFile,
  removeTrackedFile,
  isFileTracked,
  updateContentHash,
} from '../files'
import { onFileChange } from './directory-watcher'
import {
  connectEventHandler,
  disconnectEventHandler,
  isEventHandlerConnected,
  onTrackedFileAdded,
  onTrackedFileRemoved,
  onTrackedFileUpdated,
  clearEventHandlerState,
} from './event-handler'

describe('event-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    fileChangeListener = null
    clearEventHandlerState()

    // Default mock implementations
    vi.mocked(isFileTracked).mockReturnValue(false)
    vi.mocked(addTrackedFile).mockResolvedValue({ success: true })
    vi.mocked(removeTrackedFile).mockResolvedValue(true)
    vi.mocked(updateContentHash).mockReturnValue(undefined)
  })

  describe('connectEventHandler', () => {
    it('registers a file change listener', () => {
      connectEventHandler()

      expect(onFileChange).toHaveBeenCalled()
      expect(fileChangeListener).not.toBeNull()
    })

    it('sets connected state to true', () => {
      expect(isEventHandlerConnected()).toBe(false)
      connectEventHandler()
      expect(isEventHandlerConnected()).toBe(true)
    })

    it('does not register multiple listeners', () => {
      connectEventHandler()
      connectEventHandler()

      expect(onFileChange).toHaveBeenCalledTimes(1)
    })
  })

  describe('disconnectEventHandler', () => {
    it('unsubscribes the listener', () => {
      connectEventHandler()
      disconnectEventHandler()

      expect(fileChangeListener).toBeNull()
    })

    it('sets connected state to false', () => {
      connectEventHandler()
      expect(isEventHandlerConnected()).toBe(true)

      disconnectEventHandler()
      expect(isEventHandlerConnected()).toBe(false)
    })

    it('does nothing if not connected', () => {
      disconnectEventHandler() // Should not throw
      expect(isEventHandlerConnected()).toBe(false)
    })
  })

  describe('file add events', () => {
    beforeEach(() => {
      connectEventHandler()
    })

    it('adds file to tracking on add event', async () => {
      vi.mocked(isFileTracked).mockReturnValue(false)

      fileChangeListener!({
        type: 'add',
        path: '/test/file.md',
        directory: '/test',
      })

      // Allow async handler to complete
      await vi.waitFor(() => {
        expect(addTrackedFile).toHaveBeenCalledWith('/test/file.md')
      })
    })

    it('skips already tracked files', async () => {
      vi.mocked(isFileTracked).mockReturnValue(true)

      fileChangeListener!({
        type: 'add',
        path: '/test/file.md',
        directory: '/test',
      })

      // Give time for async handler
      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(addTrackedFile).not.toHaveBeenCalled()
    })

    it('calls onFileAdded callbacks on success', async () => {
      vi.mocked(addTrackedFile).mockResolvedValue({ success: true })
      const callback = vi.fn()
      onTrackedFileAdded(callback)

      fileChangeListener!({
        type: 'add',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledWith('/test/file.md', true)
      })
    })

    it('calls onFileAdded callbacks on failure', async () => {
      vi.mocked(addTrackedFile).mockResolvedValue({
        success: false,
        error: 'File not found',
      })
      const callback = vi.fn()
      onTrackedFileAdded(callback)

      fileChangeListener!({
        type: 'add',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledWith('/test/file.md', false)
      })
    })
  })

  describe('file change events', () => {
    beforeEach(() => {
      connectEventHandler()
    })

    it('updates content hash for tracked files', async () => {
      vi.mocked(isFileTracked).mockReturnValue(true)

      fileChangeListener!({
        type: 'change',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(updateContentHash).toHaveBeenCalledWith(
          '/test/file.md',
          expect.any(String)
        )
      })
    })

    it('skips untracked files', async () => {
      vi.mocked(isFileTracked).mockReturnValue(false)

      fileChangeListener!({
        type: 'change',
        path: '/test/file.md',
        directory: '/test',
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(updateContentHash).not.toHaveBeenCalled()
    })

    it('calls onFileUpdated callbacks', async () => {
      vi.mocked(isFileTracked).mockReturnValue(true)
      const callback = vi.fn()
      onTrackedFileUpdated(callback)

      fileChangeListener!({
        type: 'change',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledWith('/test/file.md')
      })
    })
  })

  describe('file unlink events', () => {
    beforeEach(() => {
      connectEventHandler()
    })

    it('removes file from tracking on unlink event', async () => {
      vi.mocked(isFileTracked).mockReturnValue(true)

      fileChangeListener!({
        type: 'unlink',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(removeTrackedFile).toHaveBeenCalledWith('/test/file.md')
      })
    })

    it('skips untracked files', async () => {
      vi.mocked(isFileTracked).mockReturnValue(false)

      fileChangeListener!({
        type: 'unlink',
        path: '/test/file.md',
        directory: '/test',
      })

      await new Promise((resolve) => setTimeout(resolve, 10))

      expect(removeTrackedFile).not.toHaveBeenCalled()
    })

    it('calls onFileRemoved callbacks', async () => {
      vi.mocked(isFileTracked).mockReturnValue(true)
      const callback = vi.fn()
      onTrackedFileRemoved(callback)

      fileChangeListener!({
        type: 'unlink',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledWith('/test/file.md')
      })
    })
  })

  describe('callback management', () => {
    it('unsubscribes onFileAdded callback', async () => {
      connectEventHandler()
      const callback = vi.fn()
      const unsubscribe = onTrackedFileAdded(callback)

      unsubscribe()

      fileChangeListener!({
        type: 'add',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(addTrackedFile).toHaveBeenCalled()
      })
      expect(callback).not.toHaveBeenCalled()
    })

    it('unsubscribes onFileRemoved callback', async () => {
      connectEventHandler()
      vi.mocked(isFileTracked).mockReturnValue(true)
      const callback = vi.fn()
      const unsubscribe = onTrackedFileRemoved(callback)

      unsubscribe()

      fileChangeListener!({
        type: 'unlink',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(removeTrackedFile).toHaveBeenCalled()
      })
      expect(callback).not.toHaveBeenCalled()
    })

    it('unsubscribes onFileUpdated callback', async () => {
      connectEventHandler()
      vi.mocked(isFileTracked).mockReturnValue(true)
      const callback = vi.fn()
      const unsubscribe = onTrackedFileUpdated(callback)

      unsubscribe()

      fileChangeListener!({
        type: 'change',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(updateContentHash).toHaveBeenCalled()
      })
      expect(callback).not.toHaveBeenCalled()
    })

    it('handles callback errors gracefully', async () => {
      connectEventHandler()
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Callback error')
      })
      const normalCallback = vi.fn()

      onTrackedFileAdded(errorCallback)
      onTrackedFileAdded(normalCallback)

      fileChangeListener!({
        type: 'add',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(normalCallback).toHaveBeenCalled()
      })
      expect(errorSpy).toHaveBeenCalled()

      errorSpy.mockRestore()
    })
  })

  describe('clearEventHandlerState', () => {
    it('disconnects and clears all callbacks', async () => {
      connectEventHandler()
      const callback = vi.fn()
      onTrackedFileAdded(callback)

      clearEventHandlerState()

      expect(isEventHandlerConnected()).toBe(false)

      // Reconnect and verify callback was cleared
      connectEventHandler()
      fileChangeListener!({
        type: 'add',
        path: '/test/file.md',
        directory: '/test',
      })

      await vi.waitFor(() => {
        expect(addTrackedFile).toHaveBeenCalled()
      })
      expect(callback).not.toHaveBeenCalled()
    })
  })
})
