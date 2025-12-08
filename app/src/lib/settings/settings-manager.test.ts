/**
 * Tests for settings-manager.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the file system module
vi.mock('../state/file-system', () => ({
  readStateFile: vi.fn(),
  writeStateFile: vi.fn(),
  backupStateFile: vi.fn(),
  restoreFromBackup: vi.fn(),
  stateFileExists: vi.fn(),
}))

import {
  readStateFile,
  writeStateFile,
  backupStateFile,
  restoreFromBackup,
  stateFileExists,
} from '../state/file-system'
import {
  loadSettings,
  saveSettings,
  resetSettings,
  updateSetting,
  updateFilePatterns,
  addFilePattern,
  removeFilePattern,
  updateTheme,
} from './settings-manager'
import {
  SETTINGS_FILENAME,
  CURRENT_SETTINGS_VERSION,
  createDefaultSettings,
  isEditorViewMode,
  isEditorSettings,
  type AppSettings,
} from './types'

const mockReadStateFile = vi.mocked(readStateFile)
const mockWriteStateFile = vi.mocked(writeStateFile)
const mockBackupStateFile = vi.mocked(backupStateFile)
const mockRestoreFromBackup = vi.mocked(restoreFromBackup)
const mockStateFileExists = vi.mocked(stateFileExists)

describe('settings-manager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadSettings', () => {
    it('returns default settings when file does not exist', async () => {
      mockStateFileExists.mockResolvedValue(false)

      const result = await loadSettings()

      expect(result.success).toBe(true)
      expect(result.usedDefaults).toBe(true)
      expect(result.settings).toBeDefined()
      expect(result.settings?.version).toBe(CURRENT_SETTINGS_VERSION)
      expect(result.settings?.theme).toBe('system')
      expect(result.settings?.filePatterns).toEqual(['*.md', '*.markdown'])
    })

    it('loads existing settings from file', async () => {
      const existingSettings: AppSettings = {
        version: CURRENT_SETTINGS_VERSION,
        filePatterns: ['*.md'],
        theme: 'dark',
        animationIntensity: 'full',
        themeColors: {
          accentPrimary: null,
          accentSecondary: null,
          accentWarning: null,
          surfaceBase: null,
          surfaceElevated: null,
          surfaceCard: null,
        },
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      }

      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(JSON.stringify(existingSettings))

      const result = await loadSettings()

      expect(result.success).toBe(true)
      expect(result.usedDefaults).toBe(false)
      expect(result.settings).toEqual(existingSettings)
    })

    it('returns defaults when file content is null', async () => {
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(null)

      const result = await loadSettings()

      expect(result.success).toBe(true)
      expect(result.usedDefaults).toBe(true)
    })

    it('handles corrupted JSON gracefully', async () => {
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue('not valid json {')
      mockRestoreFromBackup.mockResolvedValue(false)

      const result = await loadSettings()

      expect(result.success).toBe(true)
      expect(result.usedDefaults).toBe(true)
      expect(result.error).toContain('corrupted')
    })

    it('attempts to restore from backup on corrupted file', async () => {
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile
        .mockResolvedValueOnce('not valid json')
        .mockResolvedValueOnce(JSON.stringify(createDefaultSettings()))
      mockRestoreFromBackup.mockResolvedValue(true)

      const result = await loadSettings()

      expect(mockRestoreFromBackup).toHaveBeenCalledWith(SETTINGS_FILENAME)
      expect(result.success).toBe(true)
    })

    it('handles invalid settings structure', async () => {
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(
        JSON.stringify({ invalid: 'structure' })
      )
      mockRestoreFromBackup.mockResolvedValue(false)

      const result = await loadSettings()

      expect(result.success).toBe(true)
      expect(result.usedDefaults).toBe(true)
      expect(result.error).toContain('invalid')
    })

    it('handles file system errors', async () => {
      mockStateFileExists.mockRejectedValue(new Error('File system error'))

      const result = await loadSettings()

      expect(result.success).toBe(false)
      expect(result.error).toBe('File system error')
    })
  })

  describe('saveSettings', () => {
    it('saves settings to file', async () => {
      const settings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(false)
      mockWriteStateFile.mockResolvedValue(undefined)

      const result = await saveSettings(settings)

      expect(result.success).toBe(true)
      expect(mockWriteStateFile).toHaveBeenCalledWith(
        SETTINGS_FILENAME,
        expect.any(String)
      )
    })

    it('creates backup before overwriting existing file', async () => {
      const settings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(true)
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFile.mockResolvedValue(undefined)

      await saveSettings(settings)

      expect(mockBackupStateFile).toHaveBeenCalledWith(SETTINGS_FILENAME)
    })

    it('updates the updatedAt timestamp', async () => {
      const settings = createDefaultSettings()
      const originalUpdatedAt = settings.updatedAt
      mockStateFileExists.mockResolvedValue(false)
      mockWriteStateFile.mockResolvedValue(undefined)

      // Small delay to ensure timestamp differs
      await new Promise((r) => setTimeout(r, 10))
      await saveSettings(settings)

      const savedContent = mockWriteStateFile.mock.calls[0][1]
      const savedSettings = JSON.parse(savedContent) as AppSettings
      expect(savedSettings.updatedAt).not.toBe(originalUpdatedAt)
    })

    it('handles write errors', async () => {
      const settings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(false)
      mockWriteStateFile.mockRejectedValue(new Error('Write failed'))

      const result = await saveSettings(settings)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Write failed')
    })
  })

  describe('resetSettings', () => {
    it('creates backup before resetting', async () => {
      mockStateFileExists.mockResolvedValue(true)
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFile.mockResolvedValue(undefined)

      await resetSettings()

      expect(mockBackupStateFile).toHaveBeenCalledWith(SETTINGS_FILENAME)
    })

    it('returns default settings after reset', async () => {
      mockStateFileExists.mockResolvedValue(false)
      mockWriteStateFile.mockResolvedValue(undefined)

      const result = await resetSettings()

      expect(result.success).toBe(true)
      expect(result.usedDefaults).toBe(true)
      expect(result.settings?.theme).toBe('system')
    })
  })

  describe('updateSetting', () => {
    it('updates a single setting', async () => {
      const existingSettings = createDefaultSettings()
      mockStateFileExists
        .mockResolvedValueOnce(true) // loadSettings check
        .mockResolvedValueOnce(true) // saveSettings check
      mockReadStateFile.mockResolvedValue(JSON.stringify(existingSettings))
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFile.mockResolvedValue(undefined)

      const result = await updateSetting('theme', 'dark')

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFile.mock.calls[0][1]
      const savedSettings = JSON.parse(savedContent) as AppSettings
      expect(savedSettings.theme).toBe('dark')
    })
  })

  describe('updateFilePatterns', () => {
    it('updates file patterns', async () => {
      const existingSettings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(JSON.stringify(existingSettings))
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFile.mockResolvedValue(undefined)

      const result = await updateFilePatterns(['*.md', '*.txt'])

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFile.mock.calls[0][1]
      const savedSettings = JSON.parse(savedContent) as AppSettings
      expect(savedSettings.filePatterns).toEqual(['*.md', '*.txt'])
    })
  })

  describe('addFilePattern', () => {
    it('adds a new pattern', async () => {
      const existingSettings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(JSON.stringify(existingSettings))
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFile.mockResolvedValue(undefined)

      const result = await addFilePattern('*.txt')

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFile.mock.calls[0][1]
      const savedSettings = JSON.parse(savedContent) as AppSettings
      expect(savedSettings.filePatterns).toContain('*.txt')
    })

    it('does not duplicate existing patterns', async () => {
      const existingSettings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(JSON.stringify(existingSettings))

      const result = await addFilePattern('*.md')

      expect(result.success).toBe(true)
      expect(mockWriteStateFile).not.toHaveBeenCalled()
    })
  })

  describe('removeFilePattern', () => {
    it('removes an existing pattern', async () => {
      const existingSettings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(JSON.stringify(existingSettings))
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFile.mockResolvedValue(undefined)

      const result = await removeFilePattern('*.markdown')

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFile.mock.calls[0][1]
      const savedSettings = JSON.parse(savedContent) as AppSettings
      expect(savedSettings.filePatterns).not.toContain('*.markdown')
      expect(savedSettings.filePatterns).toContain('*.md')
    })
  })

  describe('updateTheme', () => {
    it('updates the theme setting', async () => {
      const existingSettings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(JSON.stringify(existingSettings))
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFile.mockResolvedValue(undefined)

      const result = await updateTheme('light')

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFile.mock.calls[0][1]
      const savedSettings = JSON.parse(savedContent) as AppSettings
      expect(savedSettings.theme).toBe('light')
    })
  })

  describe('Type Guards', () => {
    describe('isEditorViewMode', () => {
      it('returns true for valid view modes', () => {
        expect(isEditorViewMode('overlay')).toBe(true)
        expect(isEditorViewMode('split')).toBe(true)
      })

      it('returns false for invalid values', () => {
        expect(isEditorViewMode('invalid')).toBe(false)
        expect(isEditorViewMode(null)).toBe(false)
        expect(isEditorViewMode(undefined)).toBe(false)
        expect(isEditorViewMode(123)).toBe(false)
      })
    })

    describe('isEditorSettings', () => {
      it('returns true for valid editor settings', () => {
        const validSettings = {
          viewMode: 'overlay',
          autoSave: true,
          autoSaveDelay: 2000,
        }
        expect(isEditorSettings(validSettings)).toBe(true)
      })

      it('returns false for invalid viewMode', () => {
        const invalidSettings = {
          viewMode: 'invalid',
          autoSave: true,
          autoSaveDelay: 2000,
        }
        expect(isEditorSettings(invalidSettings)).toBe(false)
      })

      it('returns false for invalid autoSave', () => {
        const invalidSettings = {
          viewMode: 'overlay',
          autoSave: 'true',
          autoSaveDelay: 2000,
        }
        expect(isEditorSettings(invalidSettings)).toBe(false)
      })

      it('returns false for out-of-range autoSaveDelay', () => {
        const tooLow = {
          viewMode: 'overlay',
          autoSave: true,
          autoSaveDelay: 500,
        }
        expect(isEditorSettings(tooLow)).toBe(false)

        const tooHigh = {
          viewMode: 'overlay',
          autoSave: true,
          autoSaveDelay: 15000,
        }
        expect(isEditorSettings(tooHigh)).toBe(false)
      })

      it('returns false for missing fields', () => {
        const missingField = {
          viewMode: 'overlay',
          autoSave: true,
        }
        expect(isEditorSettings(missingField)).toBe(false)
      })

      it('returns false for null or non-object', () => {
        expect(isEditorSettings(null)).toBe(false)
        expect(isEditorSettings(undefined)).toBe(false)
        expect(isEditorSettings('string')).toBe(false)
        expect(isEditorSettings(123)).toBe(false)
      })
    })
  })

  describe('Migration from v2 to v3', () => {
    it('migrates v2 settings to v3 with editor settings', async () => {
      const v2Settings = {
        version: 2,
        filePatterns: ['*.md'],
        theme: 'dark',
        animationIntensity: 'full',
        themeColors: {
          accentPrimary: null,
          accentSecondary: null,
          accentWarning: null,
          surfaceBase: null,
          surfaceElevated: null,
          surfaceCard: null,
        },
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      }

      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(JSON.stringify(v2Settings))
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFile.mockResolvedValue(undefined)

      const result = await loadSettings()

      expect(result.success).toBe(true)
      expect(result.settings?.version).toBe(3)
      expect(result.settings?.editor).toBeDefined()
      expect(result.settings?.editor.viewMode).toBe('overlay')
      expect(result.settings?.editor.autoSave).toBe(true)
      expect(result.settings?.editor.autoSaveDelay).toBe(2000)

      // Verify migration saved to disk
      expect(mockWriteStateFile).toHaveBeenCalled()
    })

    it('creates default settings with editor for new installations', async () => {
      mockStateFileExists.mockResolvedValue(false)

      const result = await loadSettings()

      expect(result.success).toBe(true)
      expect(result.usedDefaults).toBe(true)
      expect(result.settings?.version).toBe(3)
      expect(result.settings?.editor).toBeDefined()
      expect(result.settings?.editor.viewMode).toBe('overlay')
      expect(result.settings?.editor.autoSave).toBe(true)
      expect(result.settings?.editor.autoSaveDelay).toBe(2000)
    })
  })
})
