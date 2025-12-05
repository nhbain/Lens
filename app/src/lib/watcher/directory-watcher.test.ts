import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import type { WatchedDirectory } from './types'

// Create mock watcher instance
const mockWatcherInstance = {
  on: vi.fn().mockReturnThis(),
  close: vi.fn().mockResolvedValue(undefined),
}

// Mock chokidar
vi.mock('chokidar', () => ({
  default: {
    watch: vi.fn(() => mockWatcherInstance),
  },
}))

// Mock watch-config
vi.mock('./watch-config', () => ({
  getWatchedDirectories: vi.fn(),
  getWatchedDirectory: vi.fn(),
}))

import chokidar from 'chokidar'
import { getWatchedDirectories, getWatchedDirectory } from './watch-config'
import {
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

describe('directory-watcher', () => {
  const mockWatchedDir: WatchedDirectory = {
    path: '/test/dir',
    patterns: ['*.md', '*.markdown'],
    addedAt: '2025-01-01T00:00:00.000Z',
    enabled: true,
  }

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    await clearAllWatcherState()

    // Reset mock implementations
    vi.mocked(getWatchedDirectory).mockReturnValue(undefined)
    vi.mocked(getWatchedDirectories).mockReturnValue([])
    mockWatcherInstance.on.mockClear().mockReturnThis()
    mockWatcherInstance.close.mockClear().mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('onFileChange / offFileChange', () => {
    it('registers a listener and returns unsubscribe function', () => {
      const listener = vi.fn()
      const unsubscribe = onFileChange(listener)

      expect(typeof unsubscribe).toBe('function')
    })

    it('unsubscribes when calling returned function', () => {
      const listener = vi.fn()
      const unsubscribe = onFileChange(listener)

      unsubscribe()
      // Listener should be removed (we test this via event emission below)
    })

    it('removes listener via offFileChange', () => {
      const listener = vi.fn()
      onFileChange(listener)
      offFileChange(listener)
      // Listener should be removed
    })
  })

  describe('startWatching', () => {
    it('returns false if directory is not configured', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(undefined)
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const result = startWatching('/test/dir')

      expect(result).toBe(false)
      expect(chokidar.watch).not.toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('returns false if directory is not enabled', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue({
        ...mockWatchedDir,
        enabled: false,
      })

      const result = startWatching('/test/dir')

      expect(result).toBe(false)
      expect(chokidar.watch).not.toHaveBeenCalled()
    })

    it('starts watching configured directory', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)

      const result = startWatching('/test/dir')

      expect(result).toBe(true)
      expect(chokidar.watch).toHaveBeenCalledWith('/test/dir', expect.any(Object))
    })

    it('registers event handlers', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)

      startWatching('/test/dir')

      expect(mockWatcherInstance.on).toHaveBeenCalledWith('add', expect.any(Function))
      expect(mockWatcherInstance.on).toHaveBeenCalledWith('change', expect.any(Function))
      expect(mockWatcherInstance.on).toHaveBeenCalledWith('unlink', expect.any(Function))
      expect(mockWatcherInstance.on).toHaveBeenCalledWith('error', expect.any(Function))
    })

    it('returns false if already watching', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)

      startWatching('/test/dir')
      const result = startWatching('/test/dir')

      expect(result).toBe(false)
      // chokidar.watch should only be called once
      expect(chokidar.watch).toHaveBeenCalledTimes(1)
    })

    it('uses custom debounce time', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)

      const result = startWatching('/test/dir', 500)

      expect(result).toBe(true)
    })
  })

  describe('stopWatching', () => {
    it('returns false if not watching', async () => {
      const result = await stopWatching('/test/dir')
      expect(result).toBe(false)
    })

    it('stops watching and returns true', async () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      startWatching('/test/dir')

      const result = await stopWatching('/test/dir')

      expect(result).toBe(true)
      expect(mockWatcherInstance.close).toHaveBeenCalled()
    })

    it('removes directory from active watchers', async () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      startWatching('/test/dir')

      expect(isWatching('/test/dir')).toBe(true)
      await stopWatching('/test/dir')
      expect(isWatching('/test/dir')).toBe(false)
    })
  })

  describe('stopAllWatchers', () => {
    it('stops all active watchers', async () => {
      vi.mocked(getWatchedDirectory).mockImplementation((path) => ({
        ...mockWatchedDir,
        path,
      }))

      startWatching('/test/dir1')
      startWatching('/test/dir2')

      expect(getActiveWatcherCount()).toBe(2)

      await stopAllWatchers()

      expect(getActiveWatcherCount()).toBe(0)
    })
  })

  describe('isWatching', () => {
    it('returns false for unwatched directory', () => {
      expect(isWatching('/test/dir')).toBe(false)
    })

    it('returns true for watched directory', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      startWatching('/test/dir')

      expect(isWatching('/test/dir')).toBe(true)
    })
  })

  describe('getActiveWatchers', () => {
    it('returns empty array when no watchers', () => {
      expect(getActiveWatchers()).toEqual([])
    })

    it('returns array of watched paths', () => {
      vi.mocked(getWatchedDirectory).mockImplementation((path) => ({
        ...mockWatchedDir,
        path,
      }))

      startWatching('/test/dir1')
      startWatching('/test/dir2')

      const watchers = getActiveWatchers()
      expect(watchers).toHaveLength(2)
      expect(watchers).toContain('/test/dir1')
      expect(watchers).toContain('/test/dir2')
    })
  })

  describe('getActiveWatcherCount', () => {
    it('returns 0 when no watchers', () => {
      expect(getActiveWatcherCount()).toBe(0)
    })

    it('returns correct count', () => {
      vi.mocked(getWatchedDirectory).mockImplementation((path) => ({
        ...mockWatchedDir,
        path,
      }))

      startWatching('/test/dir1')
      startWatching('/test/dir2')

      expect(getActiveWatcherCount()).toBe(2)
    })
  })

  describe('startAllConfiguredWatchers', () => {
    it('starts all enabled configured directories', () => {
      const dirs: WatchedDirectory[] = [
        { ...mockWatchedDir, path: '/test/dir1', enabled: true },
        { ...mockWatchedDir, path: '/test/dir2', enabled: true },
        { ...mockWatchedDir, path: '/test/dir3', enabled: false },
      ]
      vi.mocked(getWatchedDirectories).mockReturnValue(dirs)
      vi.mocked(getWatchedDirectory).mockImplementation((path) =>
        dirs.find((d) => d.path === path)
      )

      const started = startAllConfiguredWatchers()

      expect(started).toBe(2)
      expect(isWatching('/test/dir1')).toBe(true)
      expect(isWatching('/test/dir2')).toBe(true)
      expect(isWatching('/test/dir3')).toBe(false)
    })

    it('returns 0 when no directories configured', () => {
      vi.mocked(getWatchedDirectories).mockReturnValue([])

      const started = startAllConfiguredWatchers()

      expect(started).toBe(0)
    })
  })

  describe('event emission', () => {
    it('emits add event for matching files after debounce', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      const listener = vi.fn()
      onFileChange(listener)

      startWatching('/test/dir')

      // Get the add handler
      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      // Simulate file add
      addHandler('/test/dir/file.md')

      // Not called yet (debounced)
      expect(listener).not.toHaveBeenCalled()

      // Fast-forward debounce time
      vi.advanceTimersByTime(200)

      expect(listener).toHaveBeenCalledWith({
        type: 'add',
        path: '/test/dir/file.md',
        directory: '/test/dir',
      })
    })

    it('emits change event for matching files', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      const listener = vi.fn()
      onFileChange(listener)

      startWatching('/test/dir')

      const changeHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'change'
      )?.[1] as (path: string) => void

      changeHandler('/test/dir/file.markdown')
      vi.advanceTimersByTime(200)

      expect(listener).toHaveBeenCalledWith({
        type: 'change',
        path: '/test/dir/file.markdown',
        directory: '/test/dir',
      })
    })

    it('emits unlink event for matching files', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      const listener = vi.fn()
      onFileChange(listener)

      startWatching('/test/dir')

      const unlinkHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'unlink'
      )?.[1] as (path: string) => void

      unlinkHandler('/test/dir/deleted.md')
      vi.advanceTimersByTime(200)

      expect(listener).toHaveBeenCalledWith({
        type: 'unlink',
        path: '/test/dir/deleted.md',
        directory: '/test/dir',
      })
    })

    it('does not emit for non-matching files', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      const listener = vi.fn()
      onFileChange(listener)

      startWatching('/test/dir')

      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      // .txt files should not match
      addHandler('/test/dir/file.txt')
      vi.advanceTimersByTime(200)

      expect(listener).not.toHaveBeenCalled()
    })

    it('debounces rapid events for same file', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      const listener = vi.fn()
      onFileChange(listener)

      startWatching('/test/dir')

      const changeHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'change'
      )?.[1] as (path: string) => void

      // Rapid changes
      changeHandler('/test/dir/file.md')
      vi.advanceTimersByTime(50)
      changeHandler('/test/dir/file.md')
      vi.advanceTimersByTime(50)
      changeHandler('/test/dir/file.md')

      // Still debouncing, not called yet
      expect(listener).not.toHaveBeenCalled()

      // Final debounce
      vi.advanceTimersByTime(200)

      // Only one event emitted
      expect(listener).toHaveBeenCalledTimes(1)
    })

    it('calls multiple listeners', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      const listener1 = vi.fn()
      const listener2 = vi.fn()
      onFileChange(listener1)
      onFileChange(listener2)

      startWatching('/test/dir')

      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      addHandler('/test/dir/file.md')
      vi.advanceTimersByTime(200)

      expect(listener1).toHaveBeenCalled()
      expect(listener2).toHaveBeenCalled()
    })

    it('handles listener errors gracefully', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const errorListener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error')
      })
      const normalListener = vi.fn()

      onFileChange(errorListener)
      onFileChange(normalListener)

      startWatching('/test/dir')

      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      addHandler('/test/dir/file.md')
      vi.advanceTimersByTime(200)

      // Error listener threw, but normal listener still called
      expect(normalListener).toHaveBeenCalled()
      expect(errorSpy).toHaveBeenCalled()

      errorSpy.mockRestore()
    })

    it('does not call unsubscribed listeners', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      const listener = vi.fn()
      const unsubscribe = onFileChange(listener)

      unsubscribe()

      startWatching('/test/dir')

      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      addHandler('/test/dir/file.md')
      vi.advanceTimersByTime(200)

      expect(listener).not.toHaveBeenCalled()
    })
  })

  describe('pattern matching', () => {
    it('matches *.md pattern', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue({
        ...mockWatchedDir,
        patterns: ['*.md'],
      })
      const listener = vi.fn()
      onFileChange(listener)

      startWatching('/test/dir')

      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      addHandler('/test/dir/readme.md')
      vi.advanceTimersByTime(200)

      expect(listener).toHaveBeenCalled()
    })

    it('matches *.markdown pattern', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue({
        ...mockWatchedDir,
        patterns: ['*.markdown'],
      })
      const listener = vi.fn()
      onFileChange(listener)

      startWatching('/test/dir')

      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      addHandler('/test/dir/file.markdown')
      vi.advanceTimersByTime(200)

      expect(listener).toHaveBeenCalled()
    })

    it('is case insensitive', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue({
        ...mockWatchedDir,
        patterns: ['*.md'],
      })
      const listener = vi.fn()
      onFileChange(listener)

      startWatching('/test/dir')

      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      addHandler('/test/dir/README.MD')
      vi.advanceTimersByTime(200)

      expect(listener).toHaveBeenCalled()
    })

    it('handles multiple patterns', () => {
      vi.mocked(getWatchedDirectory).mockReturnValue({
        ...mockWatchedDir,
        patterns: ['*.md', '*.txt', 'readme.*'],
      })
      const listener = vi.fn()
      onFileChange(listener)

      startWatching('/test/dir')

      const addHandler = mockWatcherInstance.on.mock.calls.find(
        (call) => call[0] === 'add'
      )?.[1] as (path: string) => void

      addHandler('/test/dir/file.txt')
      vi.advanceTimersByTime(200)

      expect(listener).toHaveBeenCalled()
    })
  })

  describe('clearAllWatcherState', () => {
    it('stops all watchers and clears listeners', async () => {
      vi.mocked(getWatchedDirectory).mockReturnValue(mockWatchedDir)
      const listener = vi.fn()
      onFileChange(listener)
      startWatching('/test/dir')

      await clearAllWatcherState()

      expect(getActiveWatcherCount()).toBe(0)
    })
  })
})
