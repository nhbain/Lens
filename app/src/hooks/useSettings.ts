/**
 * useSettings hook.
 * Manages application settings state including loading, updating, and persistence.
 */

import { useState, useEffect, useCallback } from 'react'
import {
  loadSettings,
  saveSettings,
  resetSettings,
  addFilePattern,
  removeFilePattern,
  updateTheme,
  updateAnimationIntensity,
  updateThemeColor,
  updateEditorSettings,
  resetThemeSettings,
} from '@/lib/settings'
import type { AppSettings, ThemeOption, AnimationIntensity, ThemeColors, EditorSettings } from '@/lib/settings/types'

/**
 * Default theme colors for fallback when themeColors is missing.
 * Defined outside the hook to avoid recreating on each render.
 */
const DEFAULT_THEME_COLORS: ThemeColors = {
  accentPrimary: null,
  accentSecondary: null,
  accentWarning: null,
  surfaceBase: null,
  surfaceElevated: null,
  surfaceCard: null,
}

/**
 * Options for the useSettings hook.
 */
export interface UseSettingsOptions {
  /** Whether to auto-load settings on mount (default: true) */
  autoLoad?: boolean
  /** Callback when settings are loaded */
  onLoaded?: (settings: AppSettings) => void
  /** Callback when an error occurs */
  onError?: (error: string) => void
}

/**
 * Result of the useSettings hook.
 */
export interface UseSettingsResult {
  /** Current settings or null if not loaded */
  settings: AppSettings | null
  /** Whether settings are currently loading */
  isLoading: boolean
  /** Error message if loading failed */
  error: string | null
  /** Add a file pattern */
  addPattern: (pattern: string) => Promise<void>
  /** Remove a file pattern */
  removePattern: (pattern: string) => Promise<void>
  /** Update the theme */
  setTheme: (theme: ThemeOption) => Promise<void>
  /** Update animation intensity */
  setAnimationIntensity: (intensity: AnimationIntensity) => Promise<void>
  /** Update a single theme color */
  setThemeColor: (colorKey: keyof ThemeColors, value: string | null) => Promise<void>
  /** Update editor view mode */
  setEditorViewMode: (viewMode: EditorSettings['viewMode']) => Promise<void>
  /** Update editor auto-save enabled */
  setEditorAutoSave: (enabled: boolean) => Promise<void>
  /** Update editor auto-save delay */
  setEditorAutoSaveDelay: (delay: number) => Promise<void>
  /** Reset settings to defaults */
  reset: () => Promise<void>
  /** Reset only theme settings to defaults, returns true on success */
  resetTheme: () => Promise<boolean>
  /** Reload settings from disk */
  reload: () => Promise<void>
  /** Save current settings (for manual save scenarios) */
  save: () => Promise<void>
}

/**
 * Hook for managing application settings.
 * Loads settings on mount and provides functions to update them.
 *
 * @param options - Configuration options
 * @returns Settings state and update functions
 */
export const useSettings = ({
  autoLoad = true,
  onLoaded,
  onError,
}: UseSettingsOptions = {}): UseSettingsResult => {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [isLoading, setIsLoading] = useState(autoLoad)
  const [error, setError] = useState<string | null>(null)

  // Load settings from disk
  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await loadSettings()

      if (!result.success || !result.settings) {
        const errorMsg = result.error ?? 'Failed to load settings'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      setSettings(result.settings)
      onLoaded?.(result.settings)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error loading settings'
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }, [onLoaded, onError])

  // Load on mount if autoLoad is enabled
  useEffect(() => {
    if (autoLoad) {
      load()
    }
  }, [autoLoad, load])

  // Add a file pattern
  const addPattern = useCallback(
    async (pattern: string) => {
      if (!settings) return

      try {
        const result = await addFilePattern(pattern)

        if (!result.success) {
          const errorMsg = result.error ?? 'Failed to add pattern'
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        // Update local state optimistically
        setSettings((prev) =>
          prev && !prev.filePatterns.includes(pattern)
            ? {
                ...prev,
                filePatterns: [...prev.filePatterns, pattern],
                updatedAt: new Date().toISOString(),
              }
            : prev
        )
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error adding pattern'
        setError(message)
        onError?.(message)
      }
    },
    [settings, onError]
  )

  // Remove a file pattern
  const removePattern = useCallback(
    async (pattern: string) => {
      if (!settings) return

      try {
        const result = await removeFilePattern(pattern)

        if (!result.success) {
          const errorMsg = result.error ?? 'Failed to remove pattern'
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        // Update local state optimistically
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                filePatterns: prev.filePatterns.filter((p) => p !== pattern),
                updatedAt: new Date().toISOString(),
              }
            : prev
        )
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error removing pattern'
        setError(message)
        onError?.(message)
      }
    },
    [settings, onError]
  )

  // Update the theme
  const setTheme = useCallback(
    async (theme: ThemeOption) => {
      if (!settings) return

      try {
        const result = await updateTheme(theme)

        if (!result.success) {
          const errorMsg = result.error ?? 'Failed to update theme'
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        // Update local state
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                theme,
                updatedAt: new Date().toISOString(),
              }
            : prev
        )
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error updating theme'
        setError(message)
        onError?.(message)
      }
    },
    [settings, onError]
  )

  // Update animation intensity
  const setAnimationIntensity = useCallback(
    async (intensity: AnimationIntensity) => {
      if (!settings) return

      try {
        const result = await updateAnimationIntensity(intensity)

        if (!result.success) {
          const errorMsg = result.error ?? 'Failed to update animation intensity'
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        // Update local state
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                animationIntensity: intensity,
                updatedAt: new Date().toISOString(),
              }
            : prev
        )
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error updating animation intensity'
        setError(message)
        onError?.(message)
      }
    },
    [settings, onError]
  )

  // Update a single theme color
  const setThemeColor = useCallback(
    async (colorKey: keyof ThemeColors, value: string | null) => {
      if (!settings) return

      try {
        const result = await updateThemeColor(colorKey, value)

        if (!result.success) {
          const errorMsg = result.error ?? 'Failed to update theme color'
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        // Update local state (ensure all themeColors fields exist)
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                themeColors: {
                  ...DEFAULT_THEME_COLORS,
                  ...prev.themeColors,
                  [colorKey]: value,
                },
                updatedAt: new Date().toISOString(),
              }
            : prev
        )
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error updating theme color'
        setError(message)
        onError?.(message)
      }
    },
    [settings, onError]
  )

  // Reset settings to defaults
  const reset = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await resetSettings()

      if (!result.success || !result.settings) {
        const errorMsg = result.error ?? 'Failed to reset settings'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      setSettings(result.settings)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error resetting settings'
      setError(message)
      onError?.(message)
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // Reset only theme settings to defaults
  const resetTheme = useCallback(async (): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await resetThemeSettings()

      if (!result.success || !result.settings) {
        const errorMsg = result.error ?? 'Failed to reset theme settings'
        setError(errorMsg)
        onError?.(errorMsg)
        return false
      }

      setSettings(result.settings)
      return true
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error resetting theme settings'
      setError(message)
      onError?.(message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [onError])

  // Update editor view mode
  const setEditorViewMode = useCallback(
    async (viewMode: EditorSettings['viewMode']) => {
      if (!settings?.editor) return

      try {
        const updatedEditor: EditorSettings = {
          ...settings.editor,
          viewMode,
        }
        const result = await updateEditorSettings(updatedEditor)

        if (!result.success) {
          const errorMsg = result.error ?? 'Failed to update editor view mode'
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        // Update local state
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                editor: updatedEditor,
                updatedAt: new Date().toISOString(),
              }
            : prev
        )
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error updating editor view mode'
        setError(message)
        onError?.(message)
      }
    },
    [settings, onError]
  )

  // Update editor auto-save enabled
  const setEditorAutoSave = useCallback(
    async (enabled: boolean) => {
      if (!settings?.editor) return

      try {
        const updatedEditor: EditorSettings = {
          ...settings.editor,
          autoSave: enabled,
        }
        const result = await updateEditorSettings(updatedEditor)

        if (!result.success) {
          const errorMsg = result.error ?? 'Failed to update editor auto-save'
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        // Update local state
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                editor: updatedEditor,
                updatedAt: new Date().toISOString(),
              }
            : prev
        )
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error updating editor auto-save'
        setError(message)
        onError?.(message)
      }
    },
    [settings, onError]
  )

  // Update editor auto-save delay
  const setEditorAutoSaveDelay = useCallback(
    async (delay: number) => {
      if (!settings?.editor) return

      try {
        const updatedEditor: EditorSettings = {
          ...settings.editor,
          autoSaveDelay: delay,
        }
        const result = await updateEditorSettings(updatedEditor)

        if (!result.success) {
          const errorMsg = result.error ?? 'Failed to update editor auto-save delay'
          setError(errorMsg)
          onError?.(errorMsg)
          return
        }

        // Update local state
        setSettings((prev) =>
          prev
            ? {
                ...prev,
                editor: updatedEditor,
                updatedAt: new Date().toISOString(),
              }
            : prev
        )
        setError(null)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown error updating editor auto-save delay'
        setError(message)
        onError?.(message)
      }
    },
    [settings, onError]
  )

  // Save current settings (useful for batched changes)
  const save = useCallback(async () => {
    if (!settings) return

    try {
      const result = await saveSettings(settings)

      if (!result.success) {
        const errorMsg = result.error ?? 'Failed to save settings'
        setError(errorMsg)
        onError?.(errorMsg)
        return
      }

      setError(null)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Unknown error saving settings'
      setError(message)
      onError?.(message)
    }
  }, [settings, onError])

  return {
    settings,
    isLoading,
    error,
    addPattern,
    removePattern,
    setTheme,
    setAnimationIntensity,
    setThemeColor,
    setEditorViewMode,
    setEditorAutoSave,
    setEditorAutoSaveDelay,
    reset,
    resetTheme,
    reload: load,
    save,
  }
}
