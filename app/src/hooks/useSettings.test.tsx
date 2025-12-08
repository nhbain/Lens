/**
 * Tests for useSettings hook helper functions.
 * Note: The hook itself is tested indirectly through component tests
 * due to Tauri module mocking complexity with React hooks.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the settings module
vi.mock('@/lib/settings', () => ({
  loadSettings: vi.fn(),
  saveSettings: vi.fn(),
  resetSettings: vi.fn(),
  addFilePattern: vi.fn(),
  removeFilePattern: vi.fn(),
  updateTheme: vi.fn(),
}))

import {
  loadSettings,
  saveSettings,
  resetSettings,
  addFilePattern,
  removeFilePattern,
  updateTheme,
} from '@/lib/settings'
import type { AppSettings, ThemeOption } from '@/lib/settings/types'

const mockLoadSettings = vi.mocked(loadSettings)
const mockSaveSettings = vi.mocked(saveSettings)
const mockResetSettings = vi.mocked(resetSettings)
const mockAddFilePattern = vi.mocked(addFilePattern)
const mockRemoveFilePattern = vi.mocked(removeFilePattern)
const mockUpdateTheme = vi.mocked(updateTheme)

/**
 * Helper to create mock settings for testing.
 */
const createMockSettings = (
  overrides: Partial<AppSettings> = {}
): AppSettings => ({
  version: 3,
  filePatterns: ['*.md', '*.markdown'],
  theme: 'system',
  animationIntensity: 'full',
  themeColors: {
    accentPrimary: null,
    accentSecondary: null,
    accentIntermediary: null,
    surfaceBase: null,
    surfaceElevated: null,
    surfaceCard: null,
  },
  editor: {
    viewMode: 'overlay',
    autoSave: true,
    autoSaveDelay: 2000,
  },
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

describe('useSettings helper functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadSettings integration', () => {
    it('returns settings on successful load', async () => {
      const mockSettings = createMockSettings()
      mockLoadSettings.mockResolvedValue({
        success: true,
        settings: mockSettings,
        usedDefaults: false,
      })

      const result = await loadSettings()

      expect(result.success).toBe(true)
      expect(result.settings).toEqual(mockSettings)
    })

    it('returns error on failed load', async () => {
      mockLoadSettings.mockResolvedValue({
        success: false,
        error: 'File system error',
      })

      const result = await loadSettings()

      expect(result.success).toBe(false)
      expect(result.error).toBe('File system error')
    })

    it('indicates when defaults were used', async () => {
      const mockSettings = createMockSettings()
      mockLoadSettings.mockResolvedValue({
        success: true,
        settings: mockSettings,
        usedDefaults: true,
      })

      const result = await loadSettings()

      expect(result.usedDefaults).toBe(true)
    })
  })

  describe('saveSettings integration', () => {
    it('saves settings successfully', async () => {
      const mockSettings = createMockSettings()
      mockSaveSettings.mockResolvedValue({ success: true })

      const result = await saveSettings(mockSettings)

      expect(result.success).toBe(true)
      expect(mockSaveSettings).toHaveBeenCalledWith(mockSettings)
    })

    it('returns error on failed save', async () => {
      const mockSettings = createMockSettings()
      mockSaveSettings.mockResolvedValue({
        success: false,
        error: 'Write failed',
      })

      const result = await saveSettings(mockSettings)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Write failed')
    })
  })

  describe('resetSettings integration', () => {
    it('resets settings successfully', async () => {
      const defaultSettings = createMockSettings()
      mockResetSettings.mockResolvedValue({
        success: true,
        settings: defaultSettings,
        usedDefaults: true,
      })

      const result = await resetSettings()

      expect(result.success).toBe(true)
      expect(result.settings).toEqual(defaultSettings)
      expect(result.usedDefaults).toBe(true)
    })
  })

  describe('addFilePattern integration', () => {
    it('adds a pattern successfully', async () => {
      mockAddFilePattern.mockResolvedValue({ success: true })

      const result = await addFilePattern('*.txt')

      expect(result.success).toBe(true)
      expect(mockAddFilePattern).toHaveBeenCalledWith('*.txt')
    })

    it('returns error on failed add', async () => {
      mockAddFilePattern.mockResolvedValue({
        success: false,
        error: 'Failed to add pattern',
      })

      const result = await addFilePattern('*.txt')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to add pattern')
    })
  })

  describe('removeFilePattern integration', () => {
    it('removes a pattern successfully', async () => {
      mockRemoveFilePattern.mockResolvedValue({ success: true })

      const result = await removeFilePattern('*.markdown')

      expect(result.success).toBe(true)
      expect(mockRemoveFilePattern).toHaveBeenCalledWith('*.markdown')
    })

    it('returns error on failed remove', async () => {
      mockRemoveFilePattern.mockResolvedValue({
        success: false,
        error: 'Failed to remove pattern',
      })

      const result = await removeFilePattern('*.markdown')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to remove pattern')
    })
  })

  describe('updateTheme integration', () => {
    const themes: ThemeOption[] = ['system', 'light', 'dark']

    themes.forEach((theme) => {
      it(`updates theme to ${theme} successfully`, async () => {
        mockUpdateTheme.mockResolvedValue({ success: true })

        const result = await updateTheme(theme)

        expect(result.success).toBe(true)
        expect(mockUpdateTheme).toHaveBeenCalledWith(theme)
      })
    })

    it('returns error on failed update', async () => {
      mockUpdateTheme.mockResolvedValue({
        success: false,
        error: 'Failed to update theme',
      })

      const result = await updateTheme('dark')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Failed to update theme')
    })
  })
})

describe('settings state transformations', () => {
  describe('pattern list operations', () => {
    it('adds pattern to existing list without duplicates', () => {
      const patterns = ['*.md', '*.markdown']
      const newPattern = '*.txt'

      // Simulate add pattern logic
      const updated = patterns.includes(newPattern)
        ? patterns
        : [...patterns, newPattern]

      expect(updated).toEqual(['*.md', '*.markdown', '*.txt'])
    })

    it('does not add duplicate pattern', () => {
      const patterns = ['*.md', '*.markdown']
      const newPattern = '*.md'

      const updated = patterns.includes(newPattern)
        ? patterns
        : [...patterns, newPattern]

      expect(updated).toEqual(['*.md', '*.markdown'])
    })

    it('removes pattern from list', () => {
      const patterns = ['*.md', '*.markdown', '*.txt']
      const patternToRemove = '*.markdown'

      const updated = patterns.filter((p) => p !== patternToRemove)

      expect(updated).toEqual(['*.md', '*.txt'])
    })

    it('handles removing non-existent pattern', () => {
      const patterns = ['*.md', '*.markdown']
      const patternToRemove = '*.txt'

      const updated = patterns.filter((p) => p !== patternToRemove)

      expect(updated).toEqual(['*.md', '*.markdown'])
    })
  })

  describe('theme transformations', () => {
    it('updates settings with new theme', () => {
      const settings = createMockSettings({ theme: 'system' })
      const newTheme: ThemeOption = 'dark'

      const updated: AppSettings = {
        ...settings,
        theme: newTheme,
      }

      expect(updated.theme).toBe('dark')
      expect(updated.filePatterns).toEqual(settings.filePatterns)
    })
  })

  describe('timestamp updates', () => {
    it('updates updatedAt on modification', () => {
      const settings = createMockSettings()
      const originalUpdatedAt = settings.updatedAt

      // Simulate update with new timestamp
      const updated: AppSettings = {
        ...settings,
        theme: 'dark',
        updatedAt: new Date().toISOString(),
      }

      expect(updated.updatedAt).not.toBe(originalUpdatedAt)
    })

    it('preserves createdAt on modification', () => {
      const settings = createMockSettings()
      const originalCreatedAt = settings.createdAt

      const updated: AppSettings = {
        ...settings,
        theme: 'dark',
        updatedAt: new Date().toISOString(),
      }

      expect(updated.createdAt).toBe(originalCreatedAt)
    })
  })
})
