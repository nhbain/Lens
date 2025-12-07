/**
 * Type definitions for application settings and configuration.
 * Settings are persisted separately from tracking state and watcher config.
 */

/**
 * Current version of the settings schema.
 * Increment when making breaking changes to enable migrations.
 */
export const CURRENT_SETTINGS_VERSION = 2

/**
 * Settings file name in the app data directory.
 */
export const SETTINGS_FILENAME = 'settings.json'

/**
 * Theme options for the application.
 */
export type ThemeOption = 'system' | 'light' | 'dark'

/**
 * Animation intensity options for controlling app animations.
 * - 'off': Disables all animations
 * - 'reduced': Enables only subtle transitions, disables entrance animations and glows
 * - 'full': Enables all animations (default)
 */
export type AnimationIntensity = 'off' | 'reduced' | 'full'

/**
 * Theme color customization fields.
 * Each field stores a hex color string or null for default.
 */
export interface ThemeColors {
  /** Primary accent color (default: #00F0F4 cyan) */
  accentPrimary: string | null
  /** Secondary accent color (default: #10B981 emerald) */
  accentSecondary: string | null
  /** Warning/tertiary accent color (default: #F59E0B amber) */
  accentWarning: string | null
  /** Base surface color (default: #0a0a0a) */
  surfaceBase: string | null
  /** Elevated surface color (default: #111111) */
  surfaceElevated: string | null
  /** Card surface color (default: #1a1a1a) */
  surfaceCard: string | null
}

/**
 * Default theme colors matching the Dark OLED Luxury theme.
 */
export const DEFAULT_THEME_COLORS: Required<Record<keyof ThemeColors, string>> = {
  accentPrimary: '#00F0F4',
  accentSecondary: '#10B981',
  accentWarning: '#F59E0B',
  surfaceBase: '#0a0a0a',
  surfaceElevated: '#111111',
  surfaceCard: '#1a1a1a',
}

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
  /** Animation intensity preference */
  animationIntensity: AnimationIntensity
  /** Custom theme colors (null values use defaults) */
  themeColors: ThemeColors
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
    animationIntensity: 'full',
    themeColors: {
      accentPrimary: null,
      accentSecondary: null,
      accentWarning: null,
      surfaceBase: null,
      surfaceElevated: null,
      surfaceCard: null,
    },
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
 * Type guard for AnimationIntensity.
 *
 * @param value - Value to check
 * @returns True if value is a valid AnimationIntensity
 */
export const isAnimationIntensity = (value: unknown): value is AnimationIntensity => {
  return value === 'off' || value === 'reduced' || value === 'full'
}

/**
 * Type guard for hex color strings.
 * Accepts 3 or 6 character hex with # prefix.
 *
 * @param value - Value to check
 * @returns True if value is a valid hex color string
 */
export const isHexColor = (value: unknown): value is string => {
  if (typeof value !== 'string') {
    return false
  }
  // Matches #RGB or #RRGGBB format
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value)
}

/**
 * Type guard for ThemeColors.
 *
 * @param value - Value to check
 * @returns True if value is a valid ThemeColors object
 */
export const isThemeColors = (value: unknown): value is ThemeColors => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const obj = value as Record<string, unknown>
  const colorFields: (keyof ThemeColors)[] = [
    'accentPrimary',
    'accentSecondary',
    'accentWarning',
    'surfaceBase',
    'surfaceElevated',
    'surfaceCard',
  ]

  return colorFields.every((field) => {
    const fieldValue = obj[field]
    // Allow undefined (missing), null, or valid hex colors for backwards compatibility
    return fieldValue === undefined || fieldValue === null || isHexColor(fieldValue)
  })
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

  // Base validation (required for all versions)
  const hasBaseFields =
    typeof obj.version === 'number' &&
    obj.version > 0 &&
    isFilePatternArray(obj.filePatterns) &&
    isThemeOption(obj.theme) &&
    typeof obj.createdAt === 'string' &&
    typeof obj.updatedAt === 'string'

  if (!hasBaseFields) {
    return false
  }

  // Version 2+ fields - if present, they must be valid
  // (migration will add them if missing from v1 settings)
  if (obj.animationIntensity !== undefined && !isAnimationIntensity(obj.animationIntensity)) {
    return false
  }

  if (obj.themeColors !== undefined && !isThemeColors(obj.themeColors)) {
    return false
  }

  return true
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
