/**
 * CSS Theme Compliance Tests
 * Verifies that CSS files use theme variables instead of hardcoded colors.
 */

import { describe, it, expect, beforeAll } from 'vitest'
import { readFile } from 'fs/promises'
import { resolve } from 'path'

/**
 * Helper to read a CSS file from the project.
 */
const readCssFile = async (relativePath: string): Promise<string> => {
  const fullPath = resolve(__dirname, '../../..', relativePath)
  return await readFile(fullPath, 'utf-8')
}

/**
 * Check if a CSS variable is defined in a CSS string.
 */
const hasVariable = (css: string, variableName: string): boolean => {
  // Match variable definition: --variable-name: value;
  const regex = new RegExp(`${variableName}:\\s*[^;]+;`)
  return regex.test(css)
}

describe('CSS Theme Compliance', () => {
  describe('App.css - Required CSS Variable Definitions', () => {
    let appCss: string

    beforeAll(async () => {
      appCss = await readCssFile('src/App.css')
    })

    it('defines --shimmer-color variable for loading animations', () => {
      expect(hasVariable(appCss, '--shimmer-color')).toBe(true)
    })

    it('defines --backdrop-color variable for modal/overlay backgrounds', () => {
      expect(hasVariable(appCss, '--backdrop-color')).toBe(true)
    })

    it('defines --color-white variable for text on colored backgrounds', () => {
      expect(hasVariable(appCss, '--color-white')).toBe(true)
    })

    it('defines --color-accent-glow-rgb variable for rgba() usage', () => {
      // RGB format: R, G, B (without rgba wrapper)
      expect(hasVariable(appCss, '--color-accent-glow-rgb')).toBe(true)
    })

    it('defines --color-secondary-glow-rgb variable for secondary accent glows', () => {
      expect(hasVariable(appCss, '--color-secondary-glow-rgb')).toBe(true)
    })

    it('defines --color-error-rgb variable for error color rgba() usage', () => {
      expect(hasVariable(appCss, '--color-error-rgb')).toBe(true)
    })

    it('defines --color-intermediary-rgb variable for intermediary color rgba() usage', () => {
      expect(hasVariable(appCss, '--color-intermediary-rgb')).toBe(true)
    })

    it('defines --color-success-rgb variable for success color rgba() usage', () => {
      expect(hasVariable(appCss, '--color-success-rgb')).toBe(true)
    })
  })
})
