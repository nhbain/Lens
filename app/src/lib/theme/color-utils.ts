/**
 * Color utility functions for theme customization.
 * Provides HSL/Hex conversion and color derivation functions.
 */

/**
 * HSL color representation.
 */
export interface HSLColor {
  /** Hue (0-360) */
  h: number
  /** Saturation (0-100) */
  s: number
  /** Lightness (0-100) */
  l: number
}

/**
 * RGB color representation.
 */
export interface RGBColor {
  r: number
  g: number
  b: number
}

/**
 * Full accent color palette derived from a base color.
 */
export interface AccentPalette {
  /** Base accent color */
  base: string
  /** Hover state (10% darker) */
  hover: string
  /** Muted variant (low saturation, dark) */
  muted: string
  /** Glow color (15% opacity rgba) */
  glow: string
  /** Ring/focus color (25% opacity rgba) */
  ring: string
  /** Intense glow for emphasis */
  glowIntense: string
}

/**
 * Converts a hex color string to HSL values.
 *
 * @param hex - Hex color string (3 or 6 characters, with or without #)
 * @returns HSL color object
 */
export const hexToHsl = (hex: string): HSLColor => {
  // Remove # if present and normalize to 6 characters
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('')
  }

  // Parse RGB values
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

/**
 * Converts HSL values to a hex color string.
 *
 * @param hsl - HSL color object
 * @returns Hex color string with # prefix
 */
export const hslToHex = (hsl: HSLColor): string => {
  const { h, s, l } = hsl
  const sNorm = s / 100
  const lNorm = l / 100

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = lNorm - c / 2

  let r = 0
  let g = 0
  let b = 0

  if (h >= 0 && h < 60) {
    r = c
    g = x
    b = 0
  } else if (h >= 60 && h < 120) {
    r = x
    g = c
    b = 0
  } else if (h >= 120 && h < 180) {
    r = 0
    g = c
    b = x
  } else if (h >= 180 && h < 240) {
    r = 0
    g = x
    b = c
  } else if (h >= 240 && h < 300) {
    r = x
    g = 0
    b = c
  } else {
    r = c
    g = 0
    b = x
  }

  const toHex = (n: number): string => {
    const hex = Math.round((n + m) * 255).toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase()
}

/**
 * Converts hex to RGB values.
 *
 * @param hex - Hex color string
 * @returns RGB color object
 */
export const hexToRgb = (hex: string): RGBColor => {
  let cleanHex = hex.replace('#', '')
  if (cleanHex.length === 3) {
    cleanHex = cleanHex
      .split('')
      .map((c) => c + c)
      .join('')
  }

  return {
    r: parseInt(cleanHex.substring(0, 2), 16),
    g: parseInt(cleanHex.substring(2, 4), 16),
    b: parseInt(cleanHex.substring(4, 6), 16),
  }
}

/**
 * Derives a hover color by shifting lightness by -10%.
 *
 * @param hex - Base hex color
 * @returns Darker hex color for hover state
 */
export const deriveHoverColor = (hex: string): string => {
  const hsl = hexToHsl(hex)
  return hslToHex({
    ...hsl,
    l: Math.max(0, hsl.l - 10),
  })
}

/**
 * Derives a light color by shifting lightness by +15%.
 *
 * @param hex - Base hex color
 * @returns Lighter hex color
 */
export const deriveLightColor = (hex: string): string => {
  const hsl = hexToHsl(hex)
  return hslToHex({
    ...hsl,
    l: Math.min(100, hsl.l + 15),
  })
}

/**
 * Derives a muted color with low saturation and dark lightness.
 *
 * @param hex - Base hex color
 * @returns Muted hex color
 */
export const deriveMutedColor = (hex: string): string => {
  const hsl = hexToHsl(hex)
  return hslToHex({
    h: hsl.h,
    s: 20,
    l: 15,
  })
}

/**
 * Derives a glow color as rgba with configurable opacity.
 *
 * @param hex - Base hex color
 * @param opacity - Opacity value (0-1), default 0.15
 * @returns RGBA color string
 */
export const deriveGlowColor = (hex: string, opacity: number = 0.15): string => {
  const rgb = hexToRgb(hex)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

/**
 * Derives an accent ring color as rgba with 25% opacity.
 *
 * @param hex - Base hex color
 * @returns RGBA color string for focus rings
 */
export const deriveAccentRingColor = (hex: string): string => {
  return deriveGlowColor(hex, 0.25)
}

/**
 * Derives a full accent palette from a base color.
 *
 * @param hex - Base hex color
 * @returns Complete accent palette with all derived variants
 */
export const deriveFullAccentPalette = (hex: string): AccentPalette => {
  const rgb = hexToRgb(hex)

  return {
    base: hex,
    hover: deriveHoverColor(hex),
    muted: deriveMutedColor(hex),
    glow: deriveGlowColor(hex, 0.15),
    ring: deriveAccentRingColor(hex),
    glowIntense: `0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5), 0 0 80px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`,
  }
}

/**
 * Generates a box-shadow glow string for CSS.
 *
 * @param hex - Base hex color
 * @param intensity - 'normal' | 'intense' | 'breathing'
 * @returns CSS box-shadow value
 */
export const generateGlowShadow = (
  hex: string,
  intensity: 'normal' | 'intense' | 'breathing' = 'normal'
): string => {
  const rgb = hexToRgb(hex)

  switch (intensity) {
    case 'intense':
      return `0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5), 0 0 80px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
    case 'breathing':
      return `0 0 20px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2), 0 0 40px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
    case 'normal':
    default:
      return `0 0 30px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)`
  }
}
