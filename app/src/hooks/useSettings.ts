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
} from '@/lib/settings'
import type { AppSettings, ThemeOption } from '@/lib/settings/types'

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
  /** Reset settings to defaults */
  reset: () => Promise<void>
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
    reset,
    reload: load,
    save,
  }
}
