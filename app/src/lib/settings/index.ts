/**
 * Settings module public API.
 * Provides types and functions for managing application settings.
 */

// Types
export type {
  AppSettings,
  ThemeOption,
  AnimationIntensity,
  ThemeColors,
  SettingsOperationResult,
  LoadSettingsResult,
  StorageStats,
  ExportData,
} from './types'

// Type guards and factories
export {
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
} from './types'

// Settings manager functions
export {
  loadSettings,
  saveSettings,
  resetSettings,
  updateSetting,
  updateFilePatterns,
  addFilePattern,
  removeFilePattern,
  updateTheme,
  updateAnimationIntensity,
  updateThemeColor,
  updateThemeColors,
  resetThemeSettings,
} from './settings-manager'
