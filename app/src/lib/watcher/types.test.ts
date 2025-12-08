import { describe, it, expect } from 'vitest'
import {
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
import type {
  WatchedDirectory,
  WatchConfig,
  FileChangeEvent,
  AddWatchedDirectoryResult,
} from './types'

describe('types', () => {
  describe('constants', () => {
    it('has default patterns for markdown files', () => {
      expect(DEFAULT_PATTERNS).toContain('*.md')
      expect(DEFAULT_PATTERNS).toContain('*.markdown')
    })

    it('has a version number for migration support', () => {
      expect(CURRENT_WATCH_CONFIG_VERSION).toBe(1)
    })
  })

  describe('isWatchedDirectory', () => {
    const validDirectory: WatchedDirectory = {
      path: '/path/to/dir',
      patterns: ['*.md'],
      addedAt: '2025-01-01T00:00:00.000Z',
      enabled: true,
    }

    it('returns true for valid WatchedDirectory', () => {
      expect(isWatchedDirectory(validDirectory)).toBe(true)
    })

    it('returns true with multiple patterns', () => {
      const dir: WatchedDirectory = {
        ...validDirectory,
        patterns: ['*.md', '*.markdown', 'readme.*'],
      }
      expect(isWatchedDirectory(dir)).toBe(true)
    })

    it('returns true with empty patterns array', () => {
      const dir: WatchedDirectory = {
        ...validDirectory,
        patterns: [],
      }
      expect(isWatchedDirectory(dir)).toBe(true)
    })

    it('returns false for null', () => {
      expect(isWatchedDirectory(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isWatchedDirectory(undefined)).toBe(false)
    })

    it('returns false for non-object', () => {
      expect(isWatchedDirectory('string')).toBe(false)
      expect(isWatchedDirectory(123)).toBe(false)
    })

    it('returns false if path is missing', () => {
      const { path: _path, ...rest } = validDirectory
      expect(isWatchedDirectory(rest)).toBe(false)
    })

    it('returns false if path is not a string', () => {
      expect(isWatchedDirectory({ ...validDirectory, path: 123 })).toBe(false)
    })

    it('returns false if patterns is not an array', () => {
      expect(isWatchedDirectory({ ...validDirectory, patterns: '*.md' })).toBe(
        false
      )
    })

    it('returns false if patterns contains non-strings', () => {
      expect(
        isWatchedDirectory({ ...validDirectory, patterns: ['*.md', 123] })
      ).toBe(false)
    })

    it('returns false if addedAt is not a string', () => {
      expect(isWatchedDirectory({ ...validDirectory, addedAt: 123 })).toBe(
        false
      )
    })

    it('returns false if enabled is not a boolean', () => {
      expect(isWatchedDirectory({ ...validDirectory, enabled: 'true' })).toBe(
        false
      )
    })
  })

  describe('isWatchConfig', () => {
    const validConfig: WatchConfig = {
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

    it('returns true for valid WatchConfig', () => {
      expect(isWatchConfig(validConfig)).toBe(true)
    })

    it('returns true for empty directories', () => {
      const config: WatchConfig = {
        version: 1,
        directories: {},
      }
      expect(isWatchConfig(config)).toBe(true)
    })

    it('returns true with multiple directories', () => {
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
      expect(isWatchConfig(config)).toBe(true)
    })

    it('returns false for null', () => {
      expect(isWatchConfig(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isWatchConfig(undefined)).toBe(false)
    })

    it('returns false if version is missing', () => {
      expect(isWatchConfig({ directories: {} })).toBe(false)
    })

    it('returns false if version is not a number', () => {
      expect(isWatchConfig({ version: '1', directories: {} })).toBe(false)
    })

    it('returns false if directories is missing', () => {
      expect(isWatchConfig({ version: 1 })).toBe(false)
    })

    it('returns false if directories is not an object', () => {
      expect(isWatchConfig({ version: 1, directories: [] })).toBe(false)
    })

    it('returns false if directories is null', () => {
      expect(isWatchConfig({ version: 1, directories: null })).toBe(false)
    })

    it('returns false if a directory entry is invalid', () => {
      expect(
        isWatchConfig({
          version: 1,
          directories: {
            '/path/to/dir': { path: '/path/to/dir' }, // missing other fields
          },
        })
      ).toBe(false)
    })
  })

  describe('isFileChangeType', () => {
    it('returns true for "add"', () => {
      expect(isFileChangeType('add')).toBe(true)
    })

    it('returns true for "change"', () => {
      expect(isFileChangeType('change')).toBe(true)
    })

    it('returns true for "unlink"', () => {
      expect(isFileChangeType('unlink')).toBe(true)
    })

    it('returns false for other strings', () => {
      expect(isFileChangeType('delete')).toBe(false)
      expect(isFileChangeType('modify')).toBe(false)
      expect(isFileChangeType('')).toBe(false)
    })

    it('returns false for non-strings', () => {
      expect(isFileChangeType(null)).toBe(false)
      expect(isFileChangeType(undefined)).toBe(false)
      expect(isFileChangeType(123)).toBe(false)
    })
  })

  describe('isFileChangeEvent', () => {
    const validEvent: FileChangeEvent = {
      type: 'add',
      path: '/path/to/file.md',
      directory: '/path/to',
    }

    it('returns true for valid add event', () => {
      expect(isFileChangeEvent(validEvent)).toBe(true)
    })

    it('returns true for valid change event', () => {
      expect(isFileChangeEvent({ ...validEvent, type: 'change' })).toBe(true)
    })

    it('returns true for valid unlink event', () => {
      expect(isFileChangeEvent({ ...validEvent, type: 'unlink' })).toBe(true)
    })

    it('returns false for null', () => {
      expect(isFileChangeEvent(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isFileChangeEvent(undefined)).toBe(false)
    })

    it('returns false if type is invalid', () => {
      expect(isFileChangeEvent({ ...validEvent, type: 'delete' })).toBe(false)
    })

    it('returns false if path is not a string', () => {
      expect(isFileChangeEvent({ ...validEvent, path: 123 })).toBe(false)
    })

    it('returns false if directory is not a string', () => {
      expect(isFileChangeEvent({ ...validEvent, directory: null })).toBe(false)
    })
  })

  describe('isAddWatchedDirectoryResult', () => {
    it('returns true for success result with directory', () => {
      const result: AddWatchedDirectoryResult = {
        success: true,
        directory: {
          path: '/path/to/dir',
          patterns: ['*.md'],
          addedAt: '2025-01-01T00:00:00.000Z',
          enabled: true,
        },
      }
      expect(isAddWatchedDirectoryResult(result)).toBe(true)
    })

    it('returns true for already watched result', () => {
      const result: AddWatchedDirectoryResult = {
        success: true,
        alreadyWatched: true,
        directory: {
          path: '/path/to/dir',
          patterns: ['*.md'],
          addedAt: '2025-01-01T00:00:00.000Z',
          enabled: true,
        },
      }
      expect(isAddWatchedDirectoryResult(result)).toBe(true)
    })

    it('returns true for failure result with error', () => {
      const result: AddWatchedDirectoryResult = {
        success: false,
        error: 'Directory not found',
        errorCode: 'DIRECTORY_NOT_FOUND',
      }
      expect(isAddWatchedDirectoryResult(result)).toBe(true)
    })

    it('returns true for minimal success result', () => {
      const result: AddWatchedDirectoryResult = {
        success: true,
      }
      expect(isAddWatchedDirectoryResult(result)).toBe(true)
    })

    it('returns false for null', () => {
      expect(isAddWatchedDirectoryResult(null)).toBe(false)
    })

    it('returns false if success is missing', () => {
      expect(isAddWatchedDirectoryResult({ directory: {} })).toBe(false)
    })

    it('returns false if success is not a boolean', () => {
      expect(isAddWatchedDirectoryResult({ success: 'true' })).toBe(false)
    })

    it('returns false if directory is invalid', () => {
      expect(
        isAddWatchedDirectoryResult({
          success: true,
          directory: { path: 123 }, // invalid directory
        })
      ).toBe(false)
    })
  })

  describe('createWatchedDirectory', () => {
    it('creates a WatchedDirectory with default patterns', () => {
      const dir = createWatchedDirectory('/path/to/dir')

      expect(dir.path).toBe('/path/to/dir')
      expect(dir.patterns).toEqual(['*.md', '*.markdown'])
      expect(dir.enabled).toBe(true)
      expect(typeof dir.addedAt).toBe('string')
    })

    it('creates a WatchedDirectory with custom patterns', () => {
      const customPatterns = ['*.txt', 'readme.*']
      const dir = createWatchedDirectory('/path/to/dir', customPatterns)

      expect(dir.patterns).toEqual(customPatterns)
    })

    it('creates a valid addedAt timestamp', () => {
      const before = new Date().toISOString()
      const dir = createWatchedDirectory('/path/to/dir')
      const after = new Date().toISOString()

      expect(dir.addedAt >= before).toBe(true)
      expect(dir.addedAt <= after).toBe(true)
    })

    it('does not mutate the default patterns array', () => {
      const dir1 = createWatchedDirectory('/path/one')
      dir1.patterns.push('*.txt')

      const dir2 = createWatchedDirectory('/path/two')
      expect(dir2.patterns).toEqual(['*.md', '*.markdown'])
    })

    it('passes type guard validation', () => {
      const dir = createWatchedDirectory('/path/to/dir')
      expect(isWatchedDirectory(dir)).toBe(true)
    })
  })

  describe('createEmptyWatchConfig', () => {
    it('creates an empty WatchConfig with current version', () => {
      const config = createEmptyWatchConfig()

      expect(config.version).toBe(CURRENT_WATCH_CONFIG_VERSION)
      expect(config.directories).toEqual({})
    })

    it('passes type guard validation', () => {
      const config = createEmptyWatchConfig()
      expect(isWatchConfig(config)).toBe(true)
    })
  })
})
