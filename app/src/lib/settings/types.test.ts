/**
 * Tests for settings type definitions and type guards.
 */

import { describe, it, expect } from 'vitest'
import {
  CURRENT_SETTINGS_VERSION,
  SETTINGS_FILENAME,
  DEFAULT_FILE_PATTERNS,
  CURRENT_EXPORT_VERSION,
  createDefaultSettings,
  createEmptyExportData,
  isThemeOption,
  isFilePatternArray,
  isAppSettings,
  isExportData,
  type AppSettings,
  type ThemeOption,
  type ExportData,
} from './types'

describe('settings types', () => {
  describe('constants', () => {
    it('exports CURRENT_SETTINGS_VERSION', () => {
      expect(CURRENT_SETTINGS_VERSION).toBe(1)
    })

    it('exports SETTINGS_FILENAME', () => {
      expect(SETTINGS_FILENAME).toBe('settings.json')
    })

    it('exports DEFAULT_FILE_PATTERNS', () => {
      expect(DEFAULT_FILE_PATTERNS).toEqual(['*.md', '*.markdown'])
    })

    it('exports CURRENT_EXPORT_VERSION', () => {
      expect(CURRENT_EXPORT_VERSION).toBe(1)
    })
  })

  describe('createDefaultSettings', () => {
    it('creates settings with current version', () => {
      const settings = createDefaultSettings()
      expect(settings.version).toBe(CURRENT_SETTINGS_VERSION)
    })

    it('creates settings with default file patterns', () => {
      const settings = createDefaultSettings()
      expect(settings.filePatterns).toEqual(['*.md', '*.markdown'])
    })

    it('creates settings with system theme', () => {
      const settings = createDefaultSettings()
      expect(settings.theme).toBe('system')
    })

    it('creates settings with timestamps', () => {
      const before = new Date().toISOString()
      const settings = createDefaultSettings()
      const after = new Date().toISOString()

      expect(settings.createdAt).toBeDefined()
      expect(settings.updatedAt).toBeDefined()
      expect(settings.createdAt >= before).toBe(true)
      expect(settings.createdAt <= after).toBe(true)
    })

    it('creates unique instances', () => {
      const settings1 = createDefaultSettings()
      const settings2 = createDefaultSettings()

      settings1.filePatterns.push('*.txt')
      expect(settings2.filePatterns).not.toContain('*.txt')
    })
  })

  describe('isThemeOption', () => {
    it('returns true for "system"', () => {
      expect(isThemeOption('system')).toBe(true)
    })

    it('returns true for "light"', () => {
      expect(isThemeOption('light')).toBe(true)
    })

    it('returns true for "dark"', () => {
      expect(isThemeOption('dark')).toBe(true)
    })

    it('returns false for invalid strings', () => {
      expect(isThemeOption('auto')).toBe(false)
      expect(isThemeOption('DARK')).toBe(false)
      expect(isThemeOption('')).toBe(false)
    })

    it('returns false for non-strings', () => {
      expect(isThemeOption(null)).toBe(false)
      expect(isThemeOption(undefined)).toBe(false)
      expect(isThemeOption(123)).toBe(false)
      expect(isThemeOption({})).toBe(false)
    })
  })

  describe('isFilePatternArray', () => {
    it('returns true for valid pattern arrays', () => {
      expect(isFilePatternArray(['*.md'])).toBe(true)
      expect(isFilePatternArray(['*.md', '*.markdown'])).toBe(true)
      expect(isFilePatternArray(['**/*.md'])).toBe(true)
    })

    it('returns true for empty arrays', () => {
      expect(isFilePatternArray([])).toBe(true)
    })

    it('returns false for non-arrays', () => {
      expect(isFilePatternArray(null)).toBe(false)
      expect(isFilePatternArray(undefined)).toBe(false)
      expect(isFilePatternArray('*.md')).toBe(false)
      expect(isFilePatternArray({})).toBe(false)
    })

    it('returns false for arrays with non-strings', () => {
      expect(isFilePatternArray([123])).toBe(false)
      expect(isFilePatternArray(['*.md', null])).toBe(false)
      expect(isFilePatternArray(['*.md', 123])).toBe(false)
    })

    it('returns false for arrays with empty strings', () => {
      expect(isFilePatternArray([''])).toBe(false)
      expect(isFilePatternArray(['*.md', ''])).toBe(false)
    })
  })

  describe('isAppSettings', () => {
    it('returns true for valid settings', () => {
      const settings = createDefaultSettings()
      expect(isAppSettings(settings)).toBe(true)
    })

    it('returns true for settings with all valid themes', () => {
      const themes: ThemeOption[] = ['system', 'light', 'dark']
      themes.forEach((theme) => {
        const settings: AppSettings = {
          ...createDefaultSettings(),
          theme,
        }
        expect(isAppSettings(settings)).toBe(true)
      })
    })

    it('returns false for null', () => {
      expect(isAppSettings(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isAppSettings(undefined)).toBe(false)
    })

    it('returns false for non-objects', () => {
      expect(isAppSettings('string')).toBe(false)
      expect(isAppSettings(123)).toBe(false)
      expect(isAppSettings([])).toBe(false)
    })

    it('returns false when version is missing', () => {
      const settings = createDefaultSettings()
      const { version: _version, ...noVersion } = settings
      expect(isAppSettings(noVersion)).toBe(false)
    })

    it('returns false when version is invalid', () => {
      const settings = { ...createDefaultSettings(), version: 0 }
      expect(isAppSettings(settings)).toBe(false)
    })

    it('returns false when version is not a number', () => {
      const settings = { ...createDefaultSettings(), version: '1' }
      expect(isAppSettings(settings)).toBe(false)
    })

    it('returns false when filePatterns is missing', () => {
      const settings = createDefaultSettings()
      const { filePatterns: _filePatterns, ...noPatterns } = settings
      expect(isAppSettings(noPatterns)).toBe(false)
    })

    it('returns false when filePatterns is invalid', () => {
      const settings = { ...createDefaultSettings(), filePatterns: 'invalid' }
      expect(isAppSettings(settings)).toBe(false)
    })

    it('returns false when theme is missing', () => {
      const settings = createDefaultSettings()
      const { theme: _theme, ...noTheme } = settings
      expect(isAppSettings(noTheme)).toBe(false)
    })

    it('returns false when theme is invalid', () => {
      const settings = { ...createDefaultSettings(), theme: 'invalid' }
      expect(isAppSettings(settings)).toBe(false)
    })

    it('returns false when timestamps are missing', () => {
      const settings = createDefaultSettings()
      const { createdAt: _createdAt, ...noCreatedAt } = settings
      expect(isAppSettings(noCreatedAt)).toBe(false)

      const { updatedAt: _updatedAt, ...noUpdatedAt } = settings
      expect(isAppSettings(noUpdatedAt)).toBe(false)
    })

    it('returns false when timestamps are not strings', () => {
      expect(
        isAppSettings({ ...createDefaultSettings(), createdAt: 123 })
      ).toBe(false)
      expect(
        isAppSettings({ ...createDefaultSettings(), updatedAt: null })
      ).toBe(false)
    })
  })

  describe('createEmptyExportData', () => {
    it('creates export data with current version', () => {
      const data = createEmptyExportData()
      expect(data.exportVersion).toBe(CURRENT_EXPORT_VERSION)
    })

    it('creates export data with timestamp', () => {
      const before = new Date().toISOString()
      const data = createEmptyExportData()
      const after = new Date().toISOString()

      expect(data.exportedAt).toBeDefined()
      expect(data.exportedAt >= before).toBe(true)
      expect(data.exportedAt <= after).toBe(true)
    })

    it('creates export data with default settings', () => {
      const data = createEmptyExportData()
      expect(isAppSettings(data.settings)).toBe(true)
    })

    it('creates export data with empty arrays', () => {
      const data = createEmptyExportData()
      expect(data.trackingStates).toEqual([])
      expect(data.trackedFiles).toEqual([])
    })

    it('creates export data with empty watch config', () => {
      const data = createEmptyExportData()
      expect(data.watchConfig).toEqual({ version: 1, directories: {} })
    })
  })

  describe('isExportData', () => {
    it('returns true for valid export data', () => {
      const data = createEmptyExportData()
      expect(isExportData(data)).toBe(true)
    })

    it('returns false for null', () => {
      expect(isExportData(null)).toBe(false)
    })

    it('returns false for undefined', () => {
      expect(isExportData(undefined)).toBe(false)
    })

    it('returns false for non-objects', () => {
      expect(isExportData('string')).toBe(false)
      expect(isExportData(123)).toBe(false)
    })

    it('returns false when exportVersion is missing', () => {
      const data = createEmptyExportData()
      const { exportVersion: _exportVersion, ...noVersion } = data
      expect(isExportData(noVersion)).toBe(false)
    })

    it('returns false when exportVersion is invalid', () => {
      const data = { ...createEmptyExportData(), exportVersion: 0 }
      expect(isExportData(data)).toBe(false)
    })

    it('returns false when exportedAt is missing', () => {
      const data = createEmptyExportData()
      const { exportedAt: _exportedAt, ...noTimestamp } = data
      expect(isExportData(noTimestamp)).toBe(false)
    })

    it('returns false when settings is invalid', () => {
      const data = { ...createEmptyExportData(), settings: {} }
      expect(isExportData(data)).toBe(false)
    })

    it('returns false when watchConfig is invalid', () => {
      const data = { ...createEmptyExportData(), watchConfig: null }
      expect(isExportData(data)).toBe(false)
    })

    it('returns false when trackingStates is not an array', () => {
      const data = { ...createEmptyExportData(), trackingStates: {} }
      expect(isExportData(data)).toBe(false)
    })

    it('returns false when trackedFiles is not an array', () => {
      const data = { ...createEmptyExportData(), trackedFiles: 'invalid' }
      expect(isExportData(data)).toBe(false)
    })

    it('returns true for export data with populated arrays', () => {
      const data: ExportData = {
        ...createEmptyExportData(),
        trackingStates: [{ id: '1' }, { id: '2' }],
        trackedFiles: [{ path: '/file.md' }],
      }
      expect(isExportData(data)).toBe(true)
    })
  })
})
