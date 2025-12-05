/**
 * Type definitions for application settings and configuration.
 * Settings are persisted separately from tracking state and watcher config.
 */

/**
 * Current version of the settings schema.
 * Increment when making breaking changes to enable migrations.
 */
export const CURRENT_SETTINGS_VERSION = 1

/**
 * Settings file name in the app data directory.
 */
export const SETTINGS_FILENAME = 'settings.json'

/**
 * Theme options for the application.
 */
export type ThemeOption = 'system' | 'light' | 'dark'

/**
 * Application-wide settings.
 * Note: Watched directories are managed by the watcher module (WatchConfig).
 * This interface handles app-level preferences.
 */
export interface AppSettings {
  /** Schema version for migration support */
  version: number
  /** Default file patterns for matching markdown files */
  filePatterns: string[]
  /** Theme preference */
  theme: ThemeOption
  /** ISO timestamp when settings were first created */
  createdAt: string
  /** ISO timestamp when settings were last modified */
  updatedAt: string
}

/**
 * Default file patterns for matching markdown files.
 */
export const DEFAULT_FILE_PATTERNS = ['*.md', '*.markdown'] as const

/**
 * Creates default settings.
 *
 * @returns Default AppSettings object
 */
export const createDefaultSettings = (): AppSettings => {
  const now = new Date().toISOString()
  return {
    version: CURRENT_SETTINGS_VERSION,
    filePatterns: [...DEFAULT_FILE_PATTERNS],
    theme: 'system',
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Type guard for ThemeOption.
 *
 * @param value - Value to check
 * @returns True if value is a valid ThemeOption
 */
export const isThemeOption = (value: unknown): value is ThemeOption => {
  return value === 'system' || value === 'light' || value === 'dark'
}

/**
 * Validates that a value is a valid file patterns array.
 *
 * @param value - Value to check
 * @returns True if value is a valid file patterns array
 */
export const isFilePatternArray = (value: unknown): value is string[] => {
  if (!Array.isArray(value)) {
    return false
  }
  return value.every((item) => typeof item === 'string' && item.length > 0)
}

/**
 * Type guard for AppSettings.
 *
 * @param value - Value to check
 * @returns True if value is a valid AppSettings object
 */
export const isAppSettings = (value: unknown): value is AppSettings => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.version === 'number' &&
    obj.version > 0 &&
    isFilePatternArray(obj.filePatterns) &&
    isThemeOption(obj.theme) &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'
  )
}

/**
 * Result of a settings operation.
 */
export interface SettingsOperationResult {
  /** Whether the operation succeeded */
  success: boolean
  /** Error message if operation failed */
  error?: string
}

/**
 * Result of loading settings.
 */
export interface LoadSettingsResult extends SettingsOperationResult {
  /** The loaded settings if successful */
  settings?: AppSettings
  /** Whether default settings were used (first run or corrupted file) */
  usedDefaults?: boolean
}

/**
 * Statistics about stored data for the data management section.
 */
export interface StorageStats {
  /** Number of tracked files */
  trackedFileCount: number
  /** Number of watched directories */
  watchedDirectoryCount: number
  /** Total number of tracked items across all files */
  totalItemCount: number
  /** Total size of state files in bytes */
  totalSizeBytes: number
}

/**
 * Export data format for backup/restore.
 */
export interface ExportData {
  /** Export format version */
  exportVersion: number
  /** ISO timestamp when export was created */
  exportedAt: string
  /** App settings */
  settings: AppSettings
  /** Watcher configuration (watched directories) */
  watchConfig: unknown
  /** Tracking state for all files */
  trackingStates: unknown[]
  /** List of tracked files */
  trackedFiles: unknown[]
}

/**
 * Current version of the export format.
 */
export const CURRENT_EXPORT_VERSION = 1

/**
 * Creates an empty export data structure.
 *
 * @returns Empty ExportData object
 */
export const createEmptyExportData = (): ExportData => ({
  exportVersion: CURRENT_EXPORT_VERSION,
  exportedAt: new Date().toISOString(),
  settings: createDefaultSettings(),
  watchConfig: { version: 1, directories: {} },
  trackingStates: [],
  trackedFiles: [],
})

/**
 * Type guard for ExportData.
 *
 * @param value - Value to check
 * @returns True if value is a valid ExportData object
 */
export const isExportData = (value: unknown): value is ExportData => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>

  return (
    typeof obj.exportVersion === 'number' &&
    obj.exportVersion > 0 &&
    typeof obj.exportedAt === 'string' &&
    isAppSettings(obj.settings) &&
    typeof obj.watchConfig === 'object' &&
    obj.watchConfig !== null &&
    Array.isArray(obj.trackingStates) &&
    Array.isArray(obj.trackedFiles)
  )
}
