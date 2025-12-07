/**
 * Tests for color utility functions.
 */

import { describe, it, expect } from 'vitest'
import {
  hexToHsl,
  hslToHex,
  hexToRgb,
  deriveHoverColor,
  deriveMutedColor,
  deriveGlowColor,
  deriveAccentRingColor,
  deriveFullAccentPalette,
  generateGlowShadow,
} from './color-utils'

describe('color-utils', () => {
  describe('hexToHsl', () => {
    it('converts pure red to correct HSL', () => {
      const hsl = hexToHsl('#FF0000')
      expect(hsl.h).toBe(0)
      expect(hsl.s).toBe(100)
      expect(hsl.l).toBe(50)
    })

    it('converts pure green to correct HSL', () => {
      const hsl = hexToHsl('#00FF00')
      expect(hsl.h).toBe(120)
      expect(hsl.s).toBe(100)
      expect(hsl.l).toBe(50)
    })

    it('converts pure blue to correct HSL', () => {
      const hsl = hexToHsl('#0000FF')
      expect(hsl.h).toBe(240)
      expect(hsl.s).toBe(100)
      expect(hsl.l).toBe(50)
    })

    it('converts white to correct HSL', () => {
      const hsl = hexToHsl('#FFFFFF')
      expect(hsl.h).toBe(0)
      expect(hsl.s).toBe(0)
      expect(hsl.l).toBe(100)
    })

    it('converts black to correct HSL', () => {
      const hsl = hexToHsl('#000000')
      expect(hsl.h).toBe(0)
      expect(hsl.s).toBe(0)
      expect(hsl.l).toBe(0)
    })

    it('converts cyan accent color correctly', () => {
      const hsl = hexToHsl('#00F0F4')
      expect(hsl.h).toBe(181)
      expect(hsl.s).toBe(100)
      expect(hsl.l).toBe(48)
    })

    it('handles 3-character hex', () => {
      const hsl = hexToHsl('#FFF')
      expect(hsl.l).toBe(100)
    })

    it('handles lowercase hex', () => {
      const hsl = hexToHsl('#ff0000')
      expect(hsl.h).toBe(0)
      expect(hsl.s).toBe(100)
      expect(hsl.l).toBe(50)
    })

    it('handles hex without #', () => {
      const hsl = hexToHsl('FF0000')
      expect(hsl.h).toBe(0)
    })
  })

  describe('hslToHex', () => {
    it('converts red HSL to hex', () => {
      const hex = hslToHex({ h: 0, s: 100, l: 50 })
      expect(hex).toBe('#FF0000')
    })

    it('converts green HSL to hex', () => {
      const hex = hslToHex({ h: 120, s: 100, l: 50 })
      expect(hex).toBe('#00FF00')
    })

    it('converts blue HSL to hex', () => {
      const hex = hslToHex({ h: 240, s: 100, l: 50 })
      expect(hex).toBe('#0000FF')
    })

    it('converts white HSL to hex', () => {
      const hex = hslToHex({ h: 0, s: 0, l: 100 })
      expect(hex).toBe('#FFFFFF')
    })

    it('converts black HSL to hex', () => {
      const hex = hslToHex({ h: 0, s: 0, l: 0 })
      expect(hex).toBe('#000000')
    })

    it('handles intermediate hue values', () => {
      // Yellow (h=60)
      const yellow = hslToHex({ h: 60, s: 100, l: 50 })
      expect(yellow).toBe('#FFFF00')

      // Cyan (h=180)
      const cyan = hslToHex({ h: 180, s: 100, l: 50 })
      expect(cyan).toBe('#00FFFF')

      // Magenta (h=300)
      const magenta = hslToHex({ h: 300, s: 100, l: 50 })
      expect(magenta).toBe('#FF00FF')
    })
  })

  describe('hexToRgb', () => {
    it('converts white to RGB', () => {
      const rgb = hexToRgb('#FFFFFF')
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 })
    })

    it('converts black to RGB', () => {
      const rgb = hexToRgb('#000000')
      expect(rgb).toEqual({ r: 0, g: 0, b: 0 })
    })

    it('converts cyan accent to RGB', () => {
      const rgb = hexToRgb('#00F0F4')
      expect(rgb).toEqual({ r: 0, g: 240, b: 244 })
    })

    it('handles 3-character hex', () => {
      const rgb = hexToRgb('#FFF')
      expect(rgb).toEqual({ r: 255, g: 255, b: 255 })
    })
  })

  describe('deriveHoverColor', () => {
    it('darkens the color by reducing lightness', () => {
      // A color with 50% lightness should become 40% lightness
      const hover = deriveHoverColor('#FF0000') // red at 50% lightness
      const hsl = hexToHsl(hover)
      expect(hsl.l).toBe(40)
    })

    it('does not go below 0% lightness', () => {
      // Very dark color
      const hover = deriveHoverColor('#0A0A0A')
      const hsl = hexToHsl(hover)
      expect(hsl.l).toBeGreaterThanOrEqual(0)
    })

    it('preserves hue and saturation', () => {
      const original = hexToHsl('#00F0F4')
      const hover = deriveHoverColor('#00F0F4')
      const hoverHsl = hexToHsl(hover)

      expect(hoverHsl.h).toBe(original.h)
      expect(hoverHsl.s).toBe(original.s)
    })
  })

  describe('deriveMutedColor', () => {
    it('creates a low saturation dark variant', () => {
      const muted = deriveMutedColor('#00F0F4')
      const hsl = hexToHsl(muted)

      // Allow for small rounding errors in HSL -> Hex -> HSL conversion (±1)
      expect(Math.abs(hsl.s - 20)).toBeLessThanOrEqual(1)
      expect(Math.abs(hsl.l - 15)).toBeLessThanOrEqual(1)
    })

    it('preserves the hue approximately', () => {
      const original = hexToHsl('#00F0F4')
      const muted = deriveMutedColor('#00F0F4')
      const mutedHsl = hexToHsl(muted)

      // Allow ±1 degree variance due to HSL -> Hex -> HSL roundtrip
      expect(Math.abs(mutedHsl.h - original.h)).toBeLessThanOrEqual(1)
    })
  })

  describe('deriveGlowColor', () => {
    it('returns rgba with default 15% opacity', () => {
      const glow = deriveGlowColor('#00F0F4')
      expect(glow).toBe('rgba(0, 240, 244, 0.15)')
    })

    it('accepts custom opacity', () => {
      const glow = deriveGlowColor('#00F0F4', 0.5)
      expect(glow).toBe('rgba(0, 240, 244, 0.5)')
    })

    it('handles different colors', () => {
      const glow = deriveGlowColor('#FF0000')
      expect(glow).toBe('rgba(255, 0, 0, 0.15)')
    })
  })

  describe('deriveAccentRingColor', () => {
    it('returns rgba with 25% opacity', () => {
      const ring = deriveAccentRingColor('#00F0F4')
      expect(ring).toBe('rgba(0, 240, 244, 0.25)')
    })
  })

  describe('deriveFullAccentPalette', () => {
    it('generates all palette colors', () => {
      const palette = deriveFullAccentPalette('#00F0F4')

      expect(palette.base).toBe('#00F0F4')
      expect(palette.hover).toBeDefined()
      expect(palette.muted).toBeDefined()
      expect(palette.glow).toContain('rgba')
      expect(palette.ring).toContain('rgba')
      expect(palette.glowIntense).toContain('0 0')
    })

    it('hover is darker than base', () => {
      const palette = deriveFullAccentPalette('#00F0F4')
      const baseHsl = hexToHsl(palette.base)
      const hoverHsl = hexToHsl(palette.hover)

      expect(hoverHsl.l).toBeLessThan(baseHsl.l)
    })
  })

  describe('generateGlowShadow', () => {
    it('generates normal intensity glow', () => {
      const glow = generateGlowShadow('#00F0F4', 'normal')
      expect(glow).toContain('0 0 30px')
      expect(glow).toContain('0.3')
    })

    it('generates intense glow with multiple layers', () => {
      const glow = generateGlowShadow('#00F0F4', 'intense')
      expect(glow).toContain('0 0 40px')
      expect(glow).toContain('0 0 80px')
    })

    it('generates breathing glow', () => {
      const glow = generateGlowShadow('#00F0F4', 'breathing')
      expect(glow).toContain('0 0 20px')
      expect(glow).toContain('0 0 40px')
    })

    it('defaults to normal intensity', () => {
      const glow = generateGlowShadow('#00F0F4')
      expect(glow).toContain('0 0 30px')
    })
  })

  describe('roundtrip conversion', () => {
    it('hex -> hsl -> hex preserves color (approximately)', () => {
      const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#00FFFF', '#FF00FF']

      colors.forEach((hex) => {
        const hsl = hexToHsl(hex)
        const backToHex = hslToHex(hsl)
        expect(backToHex).toBe(hex)
      })
    })
  })
})
