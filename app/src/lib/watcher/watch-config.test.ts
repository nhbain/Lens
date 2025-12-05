import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DEFAULT_PATTERNS, CURRENT_WATCH_CONFIG_VERSION } from './types'
import type { WatchConfig, WatchedDirectory } from './types'

// Mock the state file-system module
vi.mock('../state/file-system', () => ({
  readStateFile: vi.fn(),
  writeStateFileAtomic: vi.fn(),
  stateFileExists: vi.fn(),
}))

import { readStateFile, writeStateFileAtomic } from '../state/file-system'
import {
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

describe('watch-config', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    clearConfigCache()
  })

  describe('loadWatchConfig', () => {
    it('returns empty config when no file exists', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)

      const config = await loadWatchConfig()

      expect(config.version).toBe(CURRENT_WATCH_CONFIG_VERSION)
      expect(config.directories).toEqual({})
    })

    it('loads existing config from disk', async () => {
      const existingConfig: WatchConfig = {
        version: 1,
        directories: {
          '/path/to/dir': {
            path: '/path/to/dir',
            patterns: ['*.md'],
            addedAt: '2025-01-01T00:00:00.000Z',
            enabled: true,
          },
        },
      }
      vi.mocked(readStateFile).mockResolvedValue(JSON.stringify(existingConfig))

      const config = await loadWatchConfig()

      expect(config).toEqual(existingConfig)
    })

    it('returns empty config for invalid JSON', async () => {
      vi.mocked(readStateFile).mockResolvedValue('not valid json')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const config = await loadWatchConfig()

      expect(config.version).toBe(CURRENT_WATCH_CONFIG_VERSION)
      expect(config.directories).toEqual({})
      expect(warnSpy).toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('returns empty config for invalid schema', async () => {
      vi.mocked(readStateFile).mockResolvedValue('{"version": "invalid"}')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const config = await loadWatchConfig()

      expect(config.version).toBe(CURRENT_WATCH_CONFIG_VERSION)
      expect(config.directories).toEqual({})
      expect(warnSpy).toHaveBeenCalled()

      warnSpy.mockRestore()
    })

    it('sets configInitialized to true', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)

      expect(isConfigInitialized()).toBe(false)
      await loadWatchConfig()
      expect(isConfigInitialized()).toBe(true)
    })
  })

  describe('saveWatchConfig', () => {
    it('saves config to disk', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      vi.mocked(writeStateFileAtomic).mockResolvedValue()

      await loadWatchConfig()
      await saveWatchConfig()

      expect(writeStateFileAtomic).toHaveBeenCalledWith(
        'watch-config.json',
        expect.any(String)
      )
    })

    it('saves formatted JSON', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      vi.mocked(writeStateFileAtomic).mockResolvedValue()

      await loadWatchConfig()
      await saveWatchConfig()

      const savedContent = vi.mocked(writeStateFileAtomic).mock.calls[0][1]
      expect(savedContent).toContain('\n') // Pretty printed
    })
  })

  describe('getWatchedDirectories', () => {
    it('returns empty array before initialization', () => {
      expect(getWatchedDirectories()).toEqual([])
    })

    it('returns all watched directories', async () => {
      const config: WatchConfig = {
        version: 1,
        directories: {
          '/path/one': {
            path: '/path/one',
            patterns: ['*.md'],
            addedAt: '2025-01-01T00:00:00.000Z',
            enabled: true,
          },
          '/path/two': {
            path: '/path/two',
            patterns: ['*.markdown'],
            addedAt: '2025-01-02T00:00:00.000Z',
            enabled: false,
          },
        },
      }
      vi.mocked(readStateFile).mockResolvedValue(JSON.stringify(config))

      await loadWatchConfig()
      const directories = getWatchedDirectories()

      expect(directories).toHaveLength(2)
      expect(directories.map((d) => d.path)).toContain('/path/one')
      expect(directories.map((d) => d.path)).toContain('/path/two')
    })
  })

  describe('getWatchedDirectory', () => {
    it('returns undefined before initialization', () => {
      expect(getWatchedDirectory('/path/to/dir')).toBeUndefined()
    })

    it('returns the directory if found', async () => {
      const dir: WatchedDirectory = {
        path: '/path/to/dir',
        patterns: ['*.md'],
        addedAt: '2025-01-01T00:00:00.000Z',
        enabled: true,
      }
      vi.mocked(readStateFile).mockResolvedValue(
        JSON.stringify({ version: 1, directories: { '/path/to/dir': dir } })
      )

      await loadWatchConfig()
      const result = getWatchedDirectory('/path/to/dir')

      expect(result).toEqual(dir)
    })

    it('returns undefined if not found', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)

      await loadWatchConfig()
      const result = getWatchedDirectory('/nonexistent')

      expect(result).toBeUndefined()
    })
  })

  describe('isDirectoryWatched', () => {
    it('returns false before initialization', () => {
      expect(isDirectoryWatched('/path/to/dir')).toBe(false)
    })

    it('returns true for watched directory', async () => {
      vi.mocked(readStateFile).mockResolvedValue(
        JSON.stringify({
          version: 1,
          directories: {
            '/path/to/dir': {
              path: '/path/to/dir',
              patterns: ['*.md'],
              addedAt: '2025-01-01T00:00:00.000Z',
              enabled: true,
            },
          },
        })
      )

      await loadWatchConfig()
      expect(isDirectoryWatched('/path/to/dir')).toBe(true)
    })

    it('returns false for unwatched directory', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)

      await loadWatchConfig()
      expect(isDirectoryWatched('/path/to/dir')).toBe(false)
    })
  })

  describe('getParentWatchedDirectory', () => {
    it('returns undefined before initialization', () => {
      expect(getParentWatchedDirectory('/path/to/dir')).toBeUndefined()
    })

    it('returns parent directory if nested', async () => {
      vi.mocked(readStateFile).mockResolvedValue(
        JSON.stringify({
          version: 1,
          directories: {
            '/parent': {
              path: '/parent',
              patterns: ['*.md'],
              addedAt: '2025-01-01T00:00:00.000Z',
              enabled: true,
            },
          },
        })
      )

      await loadWatchConfig()
      expect(getParentWatchedDirectory('/parent/child')).toBe('/parent')
    })

    it('returns undefined for non-nested path', async () => {
      vi.mocked(readStateFile).mockResolvedValue(
        JSON.stringify({
          version: 1,
          directories: {
            '/path/one': {
              path: '/path/one',
              patterns: ['*.md'],
              addedAt: '2025-01-01T00:00:00.000Z',
              enabled: true,
            },
          },
        })
      )

      await loadWatchConfig()
      expect(getParentWatchedDirectory('/path/two')).toBeUndefined()
    })

    it('returns undefined for same path', async () => {
      vi.mocked(readStateFile).mockResolvedValue(
        JSON.stringify({
          version: 1,
          directories: {
            '/path/to/dir': {
              path: '/path/to/dir',
              patterns: ['*.md'],
              addedAt: '2025-01-01T00:00:00.000Z',
              enabled: true,
            },
          },
        })
      )

      await loadWatchConfig()
      expect(getParentWatchedDirectory('/path/to/dir')).toBeUndefined()
    })

    it('handles trailing slashes', async () => {
      vi.mocked(readStateFile).mockResolvedValue(
        JSON.stringify({
          version: 1,
          directories: {
            '/parent/': {
              path: '/parent/',
              patterns: ['*.md'],
              addedAt: '2025-01-01T00:00:00.000Z',
              enabled: true,
            },
          },
        })
      )

      await loadWatchConfig()
      expect(getParentWatchedDirectory('/parent/child/')).toBe('/parent/')
    })
  })

  describe('getChildWatchedDirectories', () => {
    it('returns empty array before initialization', () => {
      expect(getChildWatchedDirectories('/path')).toEqual([])
    })

    it('returns child directories', async () => {
      vi.mocked(readStateFile).mockResolvedValue(
        JSON.stringify({
          version: 1,
          directories: {
            '/parent/child1': {
              path: '/parent/child1',
              patterns: ['*.md'],
              addedAt: '2025-01-01T00:00:00.000Z',
              enabled: true,
            },
            '/parent/child2': {
              path: '/parent/child2',
              patterns: ['*.md'],
              addedAt: '2025-01-02T00:00:00.000Z',
              enabled: true,
            },
            '/other': {
              path: '/other',
              patterns: ['*.md'],
              addedAt: '2025-01-03T00:00:00.000Z',
              enabled: true,
            },
          },
        })
      )

      await loadWatchConfig()
      const children = getChildWatchedDirectories('/parent')

      expect(children).toHaveLength(2)
      expect(children).toContain('/parent/child1')
      expect(children).toContain('/parent/child2')
      expect(children).not.toContain('/other')
    })

    it('does not include same path', async () => {
      vi.mocked(readStateFile).mockResolvedValue(
        JSON.stringify({
          version: 1,
          directories: {
            '/path': {
              path: '/path',
              patterns: ['*.md'],
              addedAt: '2025-01-01T00:00:00.000Z',
              enabled: true,
            },
          },
        })
      )

      await loadWatchConfig()
      expect(getChildWatchedDirectories('/path')).toEqual([])
    })
  })

  describe('addWatchedDirectory', () => {
    beforeEach(() => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      vi.mocked(writeStateFileAtomic).mockResolvedValue()
    })

    it('adds a new directory with default patterns', async () => {
      const result = await addWatchedDirectory('/path/to/dir')

      expect(result.success).toBe(true)
      expect(result.directory?.path).toBe('/path/to/dir')
      expect(result.directory?.patterns).toEqual([...DEFAULT_PATTERNS])
      expect(result.directory?.enabled).toBe(true)
    })

    it('adds a new directory with custom patterns', async () => {
      const result = await addWatchedDirectory('/path/to/dir', ['*.txt'])

      expect(result.success).toBe(true)
      expect(result.directory?.patterns).toEqual(['*.txt'])
    })

    it('returns alreadyWatched for existing directory', async () => {
      await addWatchedDirectory('/path/to/dir')
      const result = await addWatchedDirectory('/path/to/dir')

      expect(result.success).toBe(true)
      expect(result.alreadyWatched).toBe(true)
    })

    it('rejects nested directories', async () => {
      await addWatchedDirectory('/parent')
      const result = await addWatchedDirectory('/parent/child')

      expect(result.success).toBe(false)
      expect(result.errorCode).toBe('NESTED_DIRECTORY')
      expect(result.error).toContain('/parent')
    })

    it('persists to disk after adding', async () => {
      await addWatchedDirectory('/path/to/dir')

      expect(writeStateFileAtomic).toHaveBeenCalled()
    })

    it('loads config if not initialized', async () => {
      clearConfigCache()
      await addWatchedDirectory('/path/to/dir')

      expect(readStateFile).toHaveBeenCalled()
    })
  })

  describe('removeWatchedDirectory', () => {
    beforeEach(() => {
      vi.mocked(writeStateFileAtomic).mockResolvedValue()
    })

    it('returns false if not initialized', async () => {
      const result = await removeWatchedDirectory('/path/to/dir')
      expect(result).toBe(false)
    })

    it('returns false if directory not watched', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      await loadWatchConfig()

      const result = await removeWatchedDirectory('/nonexistent')

      expect(result).toBe(false)
    })

    it('removes and returns true for watched directory', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      await addWatchedDirectory('/path/to/dir')
      vi.clearAllMocks()

      const result = await removeWatchedDirectory('/path/to/dir')

      expect(result).toBe(true)
      expect(isDirectoryWatched('/path/to/dir')).toBe(false)
    })

    it('persists to disk after removing', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      await addWatchedDirectory('/path/to/dir')
      vi.clearAllMocks()

      await removeWatchedDirectory('/path/to/dir')

      expect(writeStateFileAtomic).toHaveBeenCalled()
    })
  })

  describe('setWatchEnabled', () => {
    beforeEach(() => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      vi.mocked(writeStateFileAtomic).mockResolvedValue()
    })

    it('returns undefined if not initialized', async () => {
      const result = await setWatchEnabled('/path/to/dir', false)
      expect(result).toBeUndefined()
    })

    it('returns undefined if directory not found', async () => {
      await loadWatchConfig()
      const result = await setWatchEnabled('/nonexistent', false)
      expect(result).toBeUndefined()
    })

    it('updates enabled status', async () => {
      await addWatchedDirectory('/path/to/dir')
      vi.clearAllMocks()

      const result = await setWatchEnabled('/path/to/dir', false)

      expect(result?.enabled).toBe(false)
      expect(writeStateFileAtomic).toHaveBeenCalled()
    })
  })

  describe('updateWatchPatterns', () => {
    beforeEach(() => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      vi.mocked(writeStateFileAtomic).mockResolvedValue()
    })

    it('returns undefined if not initialized', async () => {
      const result = await updateWatchPatterns('/path/to/dir', ['*.txt'])
      expect(result).toBeUndefined()
    })

    it('returns undefined if directory not found', async () => {
      await loadWatchConfig()
      const result = await updateWatchPatterns('/nonexistent', ['*.txt'])
      expect(result).toBeUndefined()
    })

    it('updates patterns', async () => {
      await addWatchedDirectory('/path/to/dir')
      vi.clearAllMocks()

      const result = await updateWatchPatterns('/path/to/dir', [
        '*.txt',
        '*.rst',
      ])

      expect(result?.patterns).toEqual(['*.txt', '*.rst'])
      expect(writeStateFileAtomic).toHaveBeenCalled()
    })
  })

  describe('getWatchedDirectoriesCount', () => {
    it('returns 0 before initialization', () => {
      expect(getWatchedDirectoriesCount()).toBe(0)
    })

    it('returns correct count', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      vi.mocked(writeStateFileAtomic).mockResolvedValue()

      await addWatchedDirectory('/path/one')
      await addWatchedDirectory('/path/two')

      expect(getWatchedDirectoriesCount()).toBe(2)
    })
  })

  describe('clearConfigCache', () => {
    it('resets initialization state', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      await loadWatchConfig()

      expect(isConfigInitialized()).toBe(true)
      clearConfigCache()
      expect(isConfigInitialized()).toBe(false)
    })

    it('clears watched directories', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      vi.mocked(writeStateFileAtomic).mockResolvedValue()
      await addWatchedDirectory('/path/to/dir')

      expect(getWatchedDirectoriesCount()).toBe(1)
      clearConfigCache()
      expect(getWatchedDirectoriesCount()).toBe(0)
    })
  })

  describe('removeAllWatchedDirectories', () => {
    it('removes all directories', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      vi.mocked(writeStateFileAtomic).mockResolvedValue()

      await addWatchedDirectory('/path/one')
      await addWatchedDirectory('/path/two')
      expect(getWatchedDirectoriesCount()).toBe(2)

      await removeAllWatchedDirectories()

      expect(getWatchedDirectoriesCount()).toBe(0)
    })

    it('persists empty config to disk', async () => {
      vi.mocked(readStateFile).mockResolvedValue(null)
      vi.mocked(writeStateFileAtomic).mockResolvedValue()

      await addWatchedDirectory('/path/to/dir')
      vi.clearAllMocks()

      await removeAllWatchedDirectories()

      expect(writeStateFileAtomic).toHaveBeenCalled()
      const savedContent = vi.mocked(writeStateFileAtomic).mock.calls[0][1]
      const parsed = JSON.parse(savedContent)
      expect(parsed.directories).toEqual({})
    })
  })
})
