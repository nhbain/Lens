/**
 * Tests for settings-manager.ts
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the file system module
vi.mock('../state/file-system', () => ({
  readStateFile: vi.fn(),
  writeStateFileAtomic: vi.fn(),
  backupStateFile: vi.fn(),
  restoreFromBackup: vi.fn(),
  stateFileExists: vi.fn(),
}))

import {
  readStateFile,
  writeStateFileAtomic,
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
  type AppSettings,
} from './types'

const mockReadStateFile = vi.mocked(readStateFile)
const mockWriteStateFileAtomic = vi.mocked(writeStateFileAtomic)
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
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

      const result = await saveSettings(settings)

      expect(result.success).toBe(true)
      expect(mockWriteStateFileAtomic).toHaveBeenCalledWith(
        SETTINGS_FILENAME,
        expect.any(String)
      )
    })

    it('creates backup before overwriting existing file', async () => {
      const settings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(true)
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

      await saveSettings(settings)

      expect(mockBackupStateFile).toHaveBeenCalledWith(SETTINGS_FILENAME)
    })

    it('updates the updatedAt timestamp', async () => {
      const settings = createDefaultSettings()
      const originalUpdatedAt = settings.updatedAt
      mockStateFileExists.mockResolvedValue(false)
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

      // Small delay to ensure timestamp differs
      await new Promise((r) => setTimeout(r, 10))
      await saveSettings(settings)

      const savedContent = mockWriteStateFileAtomic.mock.calls[0][1]
      const savedSettings = JSON.parse(savedContent) as AppSettings
      expect(savedSettings.updatedAt).not.toBe(originalUpdatedAt)
    })

    it('handles write errors', async () => {
      const settings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(false)
      mockWriteStateFileAtomic.mockRejectedValue(new Error('Write failed'))

      const result = await saveSettings(settings)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Write failed')
    })
  })

  describe('resetSettings', () => {
    it('creates backup before resetting', async () => {
      mockStateFileExists.mockResolvedValue(true)
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

      await resetSettings()

      expect(mockBackupStateFile).toHaveBeenCalledWith(SETTINGS_FILENAME)
    })

    it('returns default settings after reset', async () => {
      mockStateFileExists.mockResolvedValue(false)
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

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
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

      const result = await updateSetting('theme', 'dark')

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFileAtomic.mock.calls[0][1]
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
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

      const result = await updateFilePatterns(['*.md', '*.txt'])

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFileAtomic.mock.calls[0][1]
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
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

      const result = await addFilePattern('*.txt')

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFileAtomic.mock.calls[0][1]
      const savedSettings = JSON.parse(savedContent) as AppSettings
      expect(savedSettings.filePatterns).toContain('*.txt')
    })

    it('does not duplicate existing patterns', async () => {
      const existingSettings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(JSON.stringify(existingSettings))

      const result = await addFilePattern('*.md')

      expect(result.success).toBe(true)
      expect(mockWriteStateFileAtomic).not.toHaveBeenCalled()
    })
  })

  describe('removeFilePattern', () => {
    it('removes an existing pattern', async () => {
      const existingSettings = createDefaultSettings()
      mockStateFileExists.mockResolvedValue(true)
      mockReadStateFile.mockResolvedValue(JSON.stringify(existingSettings))
      mockBackupStateFile.mockResolvedValue(true)
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

      const result = await removeFilePattern('*.markdown')

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFileAtomic.mock.calls[0][1]
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
      mockWriteStateFileAtomic.mockResolvedValue(undefined)

      const result = await updateTheme('light')

      expect(result.success).toBe(true)
      const savedContent = mockWriteStateFileAtomic.mock.calls[0][1]
      const savedSettings = JSON.parse(savedContent) as AppSettings
      expect(savedSettings.theme).toBe('light')
    })
  })
})
