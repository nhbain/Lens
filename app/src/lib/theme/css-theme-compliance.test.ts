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

  describe('Critical Component CSS - No Hardcoded Colors', () => {
    /**
     * Check if CSS has hardcoded HEX colors (excluding CSS variable definitions).
     * Matches #RGB, #RRGGBB patterns not preceded by -- (variable definition).
     */
    const hasHardcodedHexColors = (css: string): boolean => {
      // Remove CSS variable definitions (lines containing --)
      const withoutVarDefs = css
        .split('\n')
        .filter(line => !line.includes('--'))
        .join('\n')
      // Check for hex colors
      return /#[0-9a-fA-F]{3,6}\b/.test(withoutVarDefs)
    }

    /**
     * Check if CSS has hardcoded rgba() with raw RGB values.
     * Matches rgba(N, N, N, ...) patterns not using var().
     */
    const hasHardcodedRgba = (css: string): boolean => {
      // Match rgba( followed by digits (not var)
      return /rgba\(\s*\d+\s*,/.test(css)
    }

    describe('Settings.css', () => {
      let settingsCss: string

      beforeAll(async () => {
        settingsCss = await readCssFile('src/components/Settings/Settings.css')
      })

      it('contains no hardcoded HEX colors', () => {
        expect(hasHardcodedHexColors(settingsCss)).toBe(false)
      })

      it('contains no hardcoded rgba() values', () => {
        expect(hasHardcodedRgba(settingsCss)).toBe(false)
      })
    })

    describe('Button.css', () => {
      let buttonCss: string

      beforeAll(async () => {
        buttonCss = await readCssFile('src/lib/common-components/Button/Button.css')
      })

      it('contains no hardcoded HEX colors', () => {
        expect(hasHardcodedHexColors(buttonCss)).toBe(false)
      })

      it('contains no hardcoded rgba() values', () => {
        expect(hasHardcodedRgba(buttonCss)).toBe(false)
      })
    })

    describe('Badge.css', () => {
      let badgeCss: string

      beforeAll(async () => {
        badgeCss = await readCssFile('src/lib/common-components/Badge/Badge.css')
      })

      it('contains no hardcoded HEX colors', () => {
        expect(hasHardcodedHexColors(badgeCss)).toBe(false)
      })

      it('contains no hardcoded rgba() values', () => {
        expect(hasHardcodedRgba(badgeCss)).toBe(false)
      })
    })

    describe('FilterButtons.css', () => {
      let filterButtonsCss: string

      beforeAll(async () => {
        filterButtonsCss = await readCssFile('src/components/DocumentView/FilterButtons.css')
      })

      it('contains no hardcoded HEX colors', () => {
        expect(hasHardcodedHexColors(filterButtonsCss)).toBe(false)
      })

      it('contains no hardcoded rgba() values', () => {
        expect(hasHardcodedRgba(filterButtonsCss)).toBe(false)
      })
    })
  })

  describe('Document View CSS - No Hardcoded Colors', () => {
    describe('DocumentView.css', () => {
      let documentViewCss: string

      beforeAll(async () => {
        documentViewCss = await readCssFile('src/components/DocumentView/DocumentView.css')
      })

      it('contains no hardcoded HEX colors', () => {
        const hasHardcodedHexColors = (css: string): boolean => {
          const withoutVarDefs = css
            .split('\n')
            .filter(line => !line.includes('--'))
            .join('\n')
          return /#[0-9a-fA-F]{3,6}\b/.test(withoutVarDefs)
        }
        expect(hasHardcodedHexColors(documentViewCss)).toBe(false)
      })

      it('contains no hardcoded rgba() values', () => {
        const hasHardcodedRgba = (css: string): boolean => {
          return /rgba\(\s*\d+\s*,/.test(css)
        }
        expect(hasHardcodedRgba(documentViewCss)).toBe(false)
      })
    })

    describe('DocumentHeader.css', () => {
      let documentHeaderCss: string

      beforeAll(async () => {
        documentHeaderCss = await readCssFile('src/components/DocumentView/DocumentHeader.css')
      })

      it('contains no hardcoded rgba() values', () => {
        const hasHardcodedRgba = (css: string): boolean => {
          return /rgba\(\s*\d+\s*,/.test(css)
        }
        expect(hasHardcodedRgba(documentHeaderCss)).toBe(false)
      })
    })

    describe('SectionProgressBar.css', () => {
      let sectionProgressBarCss: string

      beforeAll(async () => {
        sectionProgressBarCss = await readCssFile('src/components/DocumentView/SectionProgressBar.css')
      })

      it('contains no hardcoded rgba() values', () => {
        const hasHardcodedRgba = (css: string): boolean => {
          return /rgba\(\s*\d+\s*,/.test(css)
        }
        expect(hasHardcodedRgba(sectionProgressBarCss)).toBe(false)
      })
    })
  })
})
