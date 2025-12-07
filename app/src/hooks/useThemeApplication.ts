/**
 * useThemeApplication hook.
 * Applies theme settings (animation intensity and colors) to CSS variables
 * and the data-animation attribute on the document root.
 */

import { useEffect } from 'react'
import type { AppSettings, ThemeColors } from '@/lib/settings/types'
import { DEFAULT_THEME_COLORS } from '@/lib/settings/types'
import {
  deriveHoverColor,
  deriveLightColor,
  deriveMutedColor,
  deriveGlowColor,
  deriveAccentRingColor,
  generateGlowShadow,
  hexToRgb,
} from '@/lib/theme'

/**
 * Applies primary accent colors to CSS variables.
 */
const applyAccentColors = (color: string): void => {
  const root = document.documentElement
  const rgb = hexToRgb(color)

  root.style.setProperty('--color-accent', color)
  root.style.setProperty('--color-accent-hover', deriveHoverColor(color))
  root.style.setProperty('--color-accent-muted', deriveMutedColor(color))
  root.style.setProperty('--color-accent-glow', deriveGlowColor(color, 0.15))
  root.style.setProperty('--color-accent-ring', deriveAccentRingColor(color))

  // Glow system
  root.style.setProperty('--glow-accent', generateGlowShadow(color, 'normal'))
  root.style.setProperty('--glow-accent-intense', generateGlowShadow(color, 'intense'))
  root.style.setProperty('--glow-accent-breathing', generateGlowShadow(color, 'breathing'))

  // In-progress status color (uses primary accent)
  root.style.setProperty('--color-in-progress', color)

  // Update breathing glow keyframes (CSS custom property for dynamic color)
  root.style.setProperty('--breathing-glow-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
}

/**
 * Applies secondary accent colors to CSS variables.
 */
const applySecondaryAccentColors = (color: string): void => {
  const root = document.documentElement
  const rgb = hexToRgb(color)

  root.style.setProperty('--color-accent-secondary', color)
  root.style.setProperty('--color-accent-secondary-hover', deriveHoverColor(color))
  root.style.setProperty('--color-accent-secondary-light', deriveLightColor(color))
  root.style.setProperty('--color-accent-secondary-muted', deriveMutedColor(color))
  root.style.setProperty('--color-accent-secondary-glow', deriveGlowColor(color, 0.2))

  // Glow system for secondary
  root.style.setProperty('--glow-emerald', generateGlowShadow(color, 'normal'))
  root.style.setProperty('--glow-emerald-intense', generateGlowShadow(color, 'intense'))

  // Success color (uses secondary accent)
  root.style.setProperty('--color-success', color)
  root.style.setProperty('--color-success-muted', deriveMutedColor(color))

  // Update secondary glow keyframes RGB
  root.style.setProperty('--breathing-glow-secondary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
}

/**
 * Applies warning/tertiary accent colors to CSS variables.
 */
const applyWarningColors = (color: string): void => {
  const root = document.documentElement

  root.style.setProperty('--color-warning', color)
  root.style.setProperty('--color-warning-hover', deriveLightColor(color))
  root.style.setProperty('--color-warning-muted', deriveMutedColor(color))
  root.style.setProperty('--color-warning-glow', deriveGlowColor(color, 0.2))
}

/**
 * Applies surface colors to CSS variables.
 */
const applySurfaceColors = (
  surfaceBase: string,
  surfaceElevated: string,
  surfaceCard: string
): void => {
  const root = document.documentElement

  root.style.setProperty('--color-surface-1', surfaceBase)
  root.style.setProperty('--color-surface-2', surfaceElevated)
  root.style.setProperty('--color-surface-3', surfaceCard)
}

/**
 * Applies animation intensity setting to the document.
 */
const applyAnimationIntensity = (intensity: 'off' | 'reduced' | 'full'): void => {
  const root = document.documentElement

  if (intensity === 'full') {
    // Remove the attribute entirely for full animations (default behavior)
    root.removeAttribute('data-animation')
  } else {
    root.setAttribute('data-animation', intensity)
  }
}

/**
 * Gets the effective color value, using default if null.
 */
const getEffectiveColor = (
  customColor: string | null,
  defaultColor: string
): string => {
  return customColor ?? defaultColor
}

/**
 * Hook for applying theme settings to CSS variables.
 * Updates the DOM whenever settings change.
 *
 * @param settings - Current application settings (or null if not loaded)
 */
export const useThemeApplication = (settings: AppSettings | null): void => {
  useEffect(() => {
    if (!settings) {
      return
    }

    // Apply animation intensity
    applyAnimationIntensity(settings.animationIntensity)

    // Get effective colors (custom or default)
    const themeColors: ThemeColors = settings.themeColors ?? {
      accentPrimary: null,
      accentSecondary: null,
      accentWarning: null,
      surfaceBase: null,
      surfaceElevated: null,
      surfaceCard: null,
    }

    const accentPrimary = getEffectiveColor(
      themeColors.accentPrimary,
      DEFAULT_THEME_COLORS.accentPrimary
    )
    const accentSecondary = getEffectiveColor(
      themeColors.accentSecondary,
      DEFAULT_THEME_COLORS.accentSecondary
    )
    const accentWarning = getEffectiveColor(
      themeColors.accentWarning,
      DEFAULT_THEME_COLORS.accentWarning
    )
    const surfaceBase = getEffectiveColor(
      themeColors.surfaceBase,
      DEFAULT_THEME_COLORS.surfaceBase
    )
    const surfaceElevated = getEffectiveColor(
      themeColors.surfaceElevated,
      DEFAULT_THEME_COLORS.surfaceElevated
    )
    const surfaceCard = getEffectiveColor(
      themeColors.surfaceCard,
      DEFAULT_THEME_COLORS.surfaceCard
    )

    // Apply colors to CSS variables
    applyAccentColors(accentPrimary)
    applySecondaryAccentColors(accentSecondary)
    applyWarningColors(accentWarning)
    applySurfaceColors(surfaceBase, surfaceElevated, surfaceCard)
  }, [settings])
}
