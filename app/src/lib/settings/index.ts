/**
 * Settings module public API.
 * Provides types and functions for managing application settings.
 */

// Types
export type {
  AppSettings,
  ThemeOption,
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
  createDefaultSettings,
  createEmptyExportData,
  isThemeOption,
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
} from './settings-manager'
