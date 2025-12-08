/**
 * Tests for settings type definitions and type guards.
 */

import { describe, it, expect } from 'vitest'
import {
  CURRENT_SETTINGS_VERSION,
  SETTINGS_FILENAME,
  DEFAULT_FILE_PATTERNS,
  CURRENT_EXPORT_VERSION,
  DEFAULT_THEME_COLORS,
  createDefaultSettings,
  createEmptyExportData,
  isThemeOption,
  isAnimationIntensity,
  isHexColor,
  isThemeColors,
  isFilePatternArray,
  isAppSettings,
  isExportData,
  type AppSettings,
  type ThemeOption,
  type AnimationIntensity,
  type ThemeColors,
  type ExportData,
} from './types'

describe('settings types', () => {
  describe('constants', () => {
    it('exports CURRENT_SETTINGS_VERSION', () => {
      expect(CURRENT_SETTINGS_VERSION).toBe(3)
    })

    it('exports DEFAULT_THEME_COLORS', () => {
      expect(DEFAULT_THEME_COLORS.accentPrimary).toBe('#00F0F4')
      expect(DEFAULT_THEME_COLORS.accentSecondary).toBe('#6B00E5')
      expect(DEFAULT_THEME_COLORS.accentIntermediary).toBe('#D10467')
      expect(DEFAULT_THEME_COLORS.surfaceBase).toBe('#0a0a0a')
      expect(DEFAULT_THEME_COLORS.surfaceElevated).toBe('#111111')
      expect(DEFAULT_THEME_COLORS.surfaceCard).toBe('#1a1a1a')
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

    it('creates settings with full animation intensity', () => {
      const settings = createDefaultSettings()
      expect(settings.animationIntensity).toBe('full')
    })

    it('creates settings with null theme colors (use defaults)', () => {
      const settings = createDefaultSettings()
      expect(settings.themeColors.accentPrimary).toBeNull()
      expect(settings.themeColors.accentSecondary).toBeNull()
      expect(settings.themeColors.surfaceBase).toBeNull()
      expect(settings.themeColors.surfaceElevated).toBeNull()
      expect(settings.themeColors.surfaceCard).toBeNull()
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

  describe('isAnimationIntensity', () => {
    it('returns true for "off"', () => {
      expect(isAnimationIntensity('off')).toBe(true)
    })

    it('returns true for "reduced"', () => {
      expect(isAnimationIntensity('reduced')).toBe(true)
    })

    it('returns true for "full"', () => {
      expect(isAnimationIntensity('full')).toBe(true)
    })

    it('returns false for invalid strings', () => {
      expect(isAnimationIntensity('none')).toBe(false)
      expect(isAnimationIntensity('FULL')).toBe(false)
      expect(isAnimationIntensity('')).toBe(false)
      expect(isAnimationIntensity('partial')).toBe(false)
    })

    it('returns false for non-strings', () => {
      expect(isAnimationIntensity(null)).toBe(false)
      expect(isAnimationIntensity(undefined)).toBe(false)
      expect(isAnimationIntensity(123)).toBe(false)
      expect(isAnimationIntensity({})).toBe(false)
      expect(isAnimationIntensity(true)).toBe(false)
    })
  })

  describe('isHexColor', () => {
    it('returns true for valid 6-character hex colors', () => {
      expect(isHexColor('#00F0F4')).toBe(true)
      expect(isHexColor('#ffffff')).toBe(true)
      expect(isHexColor('#000000')).toBe(true)
      expect(isHexColor('#10B981')).toBe(true)
      expect(isHexColor('#AbCdEf')).toBe(true)
    })

    it('returns true for valid 3-character hex colors', () => {
      expect(isHexColor('#FFF')).toBe(true)
      expect(isHexColor('#000')).toBe(true)
      expect(isHexColor('#abc')).toBe(true)
      expect(isHexColor('#123')).toBe(true)
    })

    it('returns false for hex without #', () => {
      expect(isHexColor('00F0F4')).toBe(false)
      expect(isHexColor('FFF')).toBe(false)
    })

    it('returns false for invalid hex lengths', () => {
      expect(isHexColor('#FF')).toBe(false)
      expect(isHexColor('#FFFF')).toBe(false)
      expect(isHexColor('#FFFFF')).toBe(false)
      expect(isHexColor('#FFFFFFF')).toBe(false)
    })

    it('returns false for invalid hex characters', () => {
      expect(isHexColor('#GGGGGG')).toBe(false)
      expect(isHexColor('#00G0F4')).toBe(false)
      expect(isHexColor('#XYZ')).toBe(false)
    })

    it('returns false for non-strings', () => {
      expect(isHexColor(null)).toBe(false)
      expect(isHexColor(undefined)).toBe(false)
      expect(isHexColor(123)).toBe(false)
      expect(isHexColor({})).toBe(false)
    })
  })

  describe('isThemeColors', () => {
    it('returns true for valid theme colors with all null', () => {
      const colors: ThemeColors = {
        accentPrimary: null,
        accentSecondary: null,
        accentIntermediary: null,
        surfaceBase: null,
        surfaceElevated: null,
        surfaceCard: null,
      }
      expect(isThemeColors(colors)).toBe(true)
    })

    it('returns true for valid theme colors with hex values', () => {
      const colors: ThemeColors = {
        accentPrimary: '#00F0F4',
        accentSecondary: '#10B981',
        accentIntermediary: '#F59E0B',
        surfaceBase: '#0a0a0a',
        surfaceElevated: '#111111',
        surfaceCard: '#1a1a1a',
      }
      expect(isThemeColors(colors)).toBe(true)
    })

    it('returns true for mixed null and hex values', () => {
      const colors: ThemeColors = {
        accentPrimary: '#00F0F4',
        accentSecondary: null,
        accentIntermediary: null,
        surfaceBase: '#0a0a0a',
        surfaceElevated: null,
        surfaceCard: null,
      }
      expect(isThemeColors(colors)).toBe(true)
    })

    it('returns false for invalid hex values', () => {
      const colors = {
        accentPrimary: 'not-a-color',
        accentSecondary: null,
        accentIntermediary: null,
        surfaceBase: null,
        surfaceElevated: null,
        surfaceCard: null,
      }
      expect(isThemeColors(colors)).toBe(false)
    })

    it('returns false for non-objects', () => {
      expect(isThemeColors(null)).toBe(false)
      expect(isThemeColors(undefined)).toBe(false)
      expect(isThemeColors('string')).toBe(false)
      expect(isThemeColors(123)).toBe(false)
    })

    it('returns false for wrong value types', () => {
      const colors = {
        accentPrimary: 123,
        accentSecondary: null,
        accentIntermediary: null,
        surfaceBase: null,
        surfaceElevated: null,
        surfaceCard: null,
      }
      expect(isThemeColors(colors)).toBe(false)
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

    it('returns true for settings with all valid animation intensities', () => {
      const intensities: AnimationIntensity[] = ['off', 'reduced', 'full']
      intensities.forEach((animationIntensity) => {
        const settings: AppSettings = {
          ...createDefaultSettings(),
          animationIntensity,
        }
        expect(isAppSettings(settings)).toBe(true)
      })
    })

    it('returns false when animationIntensity is invalid', () => {
      const settings = { ...createDefaultSettings(), animationIntensity: 'invalid' }
      expect(isAppSettings(settings)).toBe(false)
    })

    it('returns false when themeColors has invalid values', () => {
      const settings = {
        ...createDefaultSettings(),
        themeColors: {
          accentPrimary: 'not-a-color',
          accentSecondary: null,
          surfaceBase: null,
          surfaceElevated: null,
          surfaceCard: null,
        },
      }
      expect(isAppSettings(settings)).toBe(false)
    })

    it('returns true for v1 settings (without v2 fields) - allows migration', () => {
      // V1 settings that don't have animationIntensity or themeColors
      const v1Settings = {
        version: 1,
        filePatterns: ['*.md'],
        theme: 'system',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      expect(isAppSettings(v1Settings)).toBe(true)
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
