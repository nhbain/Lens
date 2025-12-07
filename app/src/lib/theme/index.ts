/**
 * Theme module public API.
 * Provides color utilities and theme application functions.
 */

export {
  hexToHsl,
  hslToHex,
  hexToRgb,
  deriveHoverColor,
  deriveLightColor,
  deriveMutedColor,
  deriveGlowColor,
  deriveAccentRingColor,
  deriveFullAccentPalette,
  generateGlowShadow,
} from './color-utils'

export type { HSLColor, RGBColor, AccentPalette } from './color-utils'
