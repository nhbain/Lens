/**
 * Settings persistence manager.
 * Handles reading, writing, and managing application settings
 * using the shared file system utilities.
 */

import {
  readStateFile,
  writeStateFile,
  backupStateFile,
  restoreFromBackup,
  stateFileExists,
} from '../state/file-system'
import {
  SETTINGS_FILENAME,
  CURRENT_SETTINGS_VERSION,
  createDefaultSettings,
  createDefaultEditorSettings,
  isAppSettings,
  type AppSettings,
  type LoadSettingsResult,
  type SettingsOperationResult,
  type AnimationIntensity,
  type ThemeColors,
} from './types'

/**
 * Loads settings from the config file.
 * Returns default settings if file doesn't exist or is corrupted.
 *
 * @returns Promise resolving to LoadSettingsResult
 */
export const loadSettings = async (): Promise<LoadSettingsResult> => {
  try {
    // Check if settings file exists
    const fileExists = await stateFileExists(SETTINGS_FILENAME)

    if (!fileExists) {
      // First run - return defaults
      const settings = createDefaultSettings()
      return {
        success: true,
        settings,
        usedDefaults: true,
      }
    }

    // Read the file
    const content = await readStateFile(SETTINGS_FILENAME)

    if (content === null) {
      // File exists but couldn't be read
      const settings = createDefaultSettings()
      return {
        success: true,
        settings,
        usedDefaults: true,
      }
    }

    // Parse JSON
    let parsed: unknown
    try {
      parsed = JSON.parse(content)
    } catch {
      // JSON parse error - try to restore from backup
      const restored = await restoreFromBackup(SETTINGS_FILENAME)
      if (restored) {
        // Retry load after restore
        return loadSettings()
      }

      // No backup available - use defaults
      const settings = createDefaultSettings()
      return {
        success: true,
        settings,
        usedDefaults: true,
        error: 'Settings file corrupted, using defaults',
      }
    }

    // Validate structure
    if (!isAppSettings(parsed)) {
      // Invalid structure - try to restore from backup
      const restored = await restoreFromBackup(SETTINGS_FILENAME)
      if (restored) {
        return loadSettings()
      }

      const settings = createDefaultSettings()
      return {
        success: true,
        settings,
        usedDefaults: true,
        error: 'Settings file invalid, using defaults',
      }
    }

    // Check for version migration
    if (parsed.version < CURRENT_SETTINGS_VERSION) {
      const migrated = migrateSettings(parsed)
      // Save migrated settings
      await saveSettings(migrated)
      return {
        success: true,
        settings: migrated,
        usedDefaults: false,
      }
    }

    return {
      success: true,
      settings: parsed,
      usedDefaults: false,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error loading settings'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Saves settings to the config file.
 * Creates a backup before overwriting.
 *
 * @param settings - Settings to save
 * @returns Promise resolving to SettingsOperationResult
 */
export const saveSettings = async (
  settings: AppSettings
): Promise<SettingsOperationResult> => {
  try {
    // Update timestamp
    const updatedSettings: AppSettings = {
      ...settings,
      updatedAt: new Date().toISOString(),
    }

    // Backup existing file if it exists
    const fileExists = await stateFileExists(SETTINGS_FILENAME)
    if (fileExists) {
      await backupStateFile(SETTINGS_FILENAME)
    }

    // Write directly (atomic rename has issues with Tauri plugin-fs)
    const content = JSON.stringify(updatedSettings, null, 2)
    await writeStateFile(SETTINGS_FILENAME, content)

    return { success: true }
  } catch (error) {
    console.error('[saveSettings] Exception:', error)
    const message =
      error instanceof Error ? error.message : String(error) || 'Unknown error saving settings'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Resets settings to defaults.
 * Creates a backup before resetting.
 *
 * @returns Promise resolving to LoadSettingsResult with default settings
 */
export const resetSettings = async (): Promise<LoadSettingsResult> => {
  try {
    // Backup existing file if it exists
    const fileExists = await stateFileExists(SETTINGS_FILENAME)
    if (fileExists) {
      await backupStateFile(SETTINGS_FILENAME)
    }

    // Create and save defaults
    const settings = createDefaultSettings()
    const saveResult = await saveSettings(settings)

    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error,
      }
    }

    return {
      success: true,
      settings,
      usedDefaults: true,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error resetting settings'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Updates a single setting value.
 *
 * @param key - Setting key to update
 * @param value - New value for the setting
 * @returns Promise resolving to SettingsOperationResult
 */
export const updateSetting = async <K extends keyof AppSettings>(
  key: K,
  value: AppSettings[K]
): Promise<SettingsOperationResult> => {
  try {
    const loadResult = await loadSettings()

    if (!loadResult.success || !loadResult.settings) {
      return {
        success: false,
        error: loadResult.error ?? 'Failed to load current settings',
      }
    }

    const updatedSettings: AppSettings = {
      ...loadResult.settings,
      [key]: value,
    }

    return saveSettings(updatedSettings)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error updating setting'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Updates file patterns.
 *
 * @param patterns - New file patterns
 * @returns Promise resolving to SettingsOperationResult
 */
export const updateFilePatterns = async (
  patterns: string[]
): Promise<SettingsOperationResult> => {
  return updateSetting('filePatterns', patterns)
}

/**
 * Adds a file pattern.
 *
 * @param pattern - Pattern to add
 * @returns Promise resolving to SettingsOperationResult
 */
export const addFilePattern = async (
  pattern: string
): Promise<SettingsOperationResult> => {
  try {
    const loadResult = await loadSettings()

    if (!loadResult.success || !loadResult.settings) {
      return {
        success: false,
        error: loadResult.error ?? 'Failed to load current settings',
      }
    }

    // Check if pattern already exists
    if (loadResult.settings.filePatterns.includes(pattern)) {
      return { success: true } // Already exists, no-op
    }

    const updatedPatterns = [...loadResult.settings.filePatterns, pattern]
    return updateFilePatterns(updatedPatterns)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error adding pattern'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Removes a file pattern.
 *
 * @param pattern - Pattern to remove
 * @returns Promise resolving to SettingsOperationResult
 */
export const removeFilePattern = async (
  pattern: string
): Promise<SettingsOperationResult> => {
  try {
    const loadResult = await loadSettings()

    if (!loadResult.success || !loadResult.settings) {
      return {
        success: false,
        error: loadResult.error ?? 'Failed to load current settings',
      }
    }

    const updatedPatterns = loadResult.settings.filePatterns.filter(
      (p) => p !== pattern
    )
    return updateFilePatterns(updatedPatterns)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error removing pattern'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Updates the theme setting.
 *
 * @param theme - New theme value
 * @returns Promise resolving to SettingsOperationResult
 */
export const updateTheme = async (
  theme: AppSettings['theme']
): Promise<SettingsOperationResult> => {
  return updateSetting('theme', theme)
}

/**
 * Updates the editor settings.
 *
 * @param editor - New editor settings
 * @returns Promise resolving to SettingsOperationResult
 */
export const updateEditorSettings = async (
  editor: AppSettings['editor']
): Promise<SettingsOperationResult> => {
  return updateSetting('editor', editor)
}

/**
 * Migrates settings from an older version to the current version.
 * Add migration logic here when schema changes.
 *
 * @param settings - Settings with older version
 * @returns Migrated settings
 */
const migrateSettings = (settings: AppSettings): AppSettings => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const migrated = { ...settings } as any

  // Migrate from v1 to v2: add animationIntensity and themeColors
  if (settings.version === 1) {
    migrated.animationIntensity = 'full'
    migrated.themeColors = {
      accentPrimary: null,
      accentSecondary: null,
      accentIntermediary: null,
      surfaceBase: null,
      surfaceElevated: null,
      surfaceCard: null,
    }
    migrated.version = 2
  }

  // Migrate from v2 to v3: add editor settings
  if (settings.version === 2) {
    migrated.editor = createDefaultEditorSettings()
    migrated.version = 3
  }

  // Ensure version is current
  migrated.version = CURRENT_SETTINGS_VERSION
  migrated.updatedAt = new Date().toISOString()

  return migrated as AppSettings
}

/**
 * Updates the animation intensity setting.
 *
 * @param intensity - New animation intensity value
 * @returns Promise resolving to SettingsOperationResult
 */
export const updateAnimationIntensity = async (
  intensity: AnimationIntensity
): Promise<SettingsOperationResult> => {
  return updateSetting('animationIntensity', intensity)
}

/**
 * Default theme colors for fallback when themeColors is missing.
 */
const DEFAULT_THEME_COLORS_FALLBACK: ThemeColors = {
  accentPrimary: null,
  accentSecondary: null,
  accentIntermediary: null,
  surfaceBase: null,
  surfaceElevated: null,
  surfaceCard: null,
}

/**
 * Updates a single theme color.
 *
 * @param colorKey - The color field to update
 * @param value - New color value (hex string) or null for default
 * @returns Promise resolving to SettingsOperationResult
 */
export const updateThemeColor = async (
  colorKey: keyof ThemeColors,
  value: string | null
): Promise<SettingsOperationResult> => {
  try {
    const loadResult = await loadSettings()

    if (!loadResult.success || !loadResult.settings) {
      console.error('[updateThemeColor] Failed to load settings:', loadResult.error)
      return {
        success: false,
        error: loadResult.error ?? 'Failed to load current settings',
      }
    }

    // Ensure themeColors has all required fields (handles legacy v2 files without this field)
    const currentThemeColors: ThemeColors = {
      ...DEFAULT_THEME_COLORS_FALLBACK,
      ...(loadResult.settings.themeColors ?? {}),
    }

    const updatedSettings: AppSettings = {
      ...loadResult.settings,
      themeColors: {
        ...currentThemeColors,
        [colorKey]: value,
      },
    }

    const saveResult = await saveSettings(updatedSettings)
    if (!saveResult.success) {
      console.error('[updateThemeColor] Failed to save settings:', saveResult.error)
    }
    return saveResult
  } catch (error) {
    console.error('[updateThemeColor] Exception:', error)
    const message =
      error instanceof Error ? error.message : 'Unknown error updating theme color'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Updates multiple theme colors at once.
 *
 * @param colors - Partial theme colors object with values to update
 * @returns Promise resolving to SettingsOperationResult
 */
export const updateThemeColors = async (
  colors: Partial<ThemeColors>
): Promise<SettingsOperationResult> => {
  try {
    const loadResult = await loadSettings()

    if (!loadResult.success || !loadResult.settings) {
      console.error('[updateThemeColors] Failed to load settings:', loadResult.error)
      return {
        success: false,
        error: loadResult.error ?? 'Failed to load current settings',
      }
    }

    // Ensure themeColors has all required fields (handles legacy v2 files without this field)
    const currentThemeColors: ThemeColors = {
      ...DEFAULT_THEME_COLORS_FALLBACK,
      ...(loadResult.settings.themeColors ?? {}),
    }

    const updatedSettings: AppSettings = {
      ...loadResult.settings,
      themeColors: {
        ...currentThemeColors,
        ...colors,
      },
    }

    return saveSettings(updatedSettings)
  } catch (error) {
    console.error('[updateThemeColors] Exception:', error)
    const message =
      error instanceof Error ? error.message : 'Unknown error updating theme colors'
    return {
      success: false,
      error: message,
    }
  }
}

/**
 * Resets only theme-related settings to defaults.
 * This includes animationIntensity and themeColors.
 *
 * @returns Promise resolving to LoadSettingsResult
 */
export const resetThemeSettings = async (): Promise<LoadSettingsResult> => {
  try {
    const loadResult = await loadSettings()

    if (!loadResult.success || !loadResult.settings) {
      return {
        success: false,
        error: loadResult.error ?? 'Failed to load current settings',
      }
    }

    const defaults = createDefaultSettings()
    const updatedSettings: AppSettings = {
      ...loadResult.settings,
      animationIntensity: defaults.animationIntensity,
      themeColors: { ...defaults.themeColors },
    }

    const saveResult = await saveSettings(updatedSettings)

    if (!saveResult.success) {
      return {
        success: false,
        error: saveResult.error,
      }
    }

    return {
      success: true,
      settings: updatedSettings,
      usedDefaults: false,
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error resetting theme settings'
    return {
      success: false,
      error: message,
    }
  }
}
