/**
 * Settings component.
 * Main container for all settings sections.
 */

import { useState } from 'react'
import { WatchedDirectoriesSection } from './WatchedDirectoriesSection'
import { FilePatternSection } from './FilePatternSection'
import { DataManagementSection } from './DataManagementSection'
import { EditorSettingsSection } from './EditorSettingsSection'
import { ResetThemeModal } from './ResetThemeModal'
import { Button, Select, ColorPicker, type SelectOption } from '@/lib/common-components'
import type { SettingsProps } from './types'
import type { WatchedDirectory } from '@/lib/watcher/types'
import type { AppSettings, StorageStats, ThemeOption, AnimationIntensity, ThemeColors, EditorSettings } from '@/lib/settings/types'
import { DEFAULT_THEME_COLORS } from '@/lib/settings/types'
import './Settings.css'

/**
 * Extended props for Settings component including all state and handlers.
 */
export interface SettingsViewProps extends SettingsProps {
  /** Current settings */
  settings: AppSettings | null
  /** Watched directories list */
  watchedDirectories: WatchedDirectory[]
  /** Storage statistics */
  storageStats: StorageStats | null
  /** Whether data is loading */
  isLoading: boolean
  /** Error message */
  error: string | null
  /** Success message */
  successMessage: string | null
  /** Add a watched directory */
  onAddDirectory: () => Promise<void>
  /** Remove a watched directory */
  onRemoveDirectory: (path: string) => Promise<void>
  /** Toggle watched directory enabled state */
  onToggleDirectoryEnabled: (path: string, enabled: boolean) => Promise<void>
  /** Add a file pattern */
  onAddPattern: (pattern: string) => Promise<void>
  /** Remove a file pattern */
  onRemovePattern: (pattern: string) => Promise<void>
  /** Change theme */
  onThemeChange: (theme: ThemeOption) => Promise<void>
  /** Change animation intensity */
  onAnimationIntensityChange: (intensity: AnimationIntensity) => Promise<void>
  /** Change a theme color */
  onThemeColorChange: (colorKey: keyof ThemeColors, value: string | null) => Promise<void>
  /** Reset theme settings to defaults, returns true on success */
  onResetThemeSettings: () => Promise<boolean>
  /** Change editor view mode */
  onEditorViewModeChange: (viewMode: EditorSettings['viewMode']) => Promise<void>
  /** Change editor auto-save enabled */
  onEditorAutoSaveChange: (enabled: boolean) => Promise<void>
  /** Change editor auto-save delay */
  onEditorAutoSaveDelayChange: (delay: number) => Promise<void>
  /** Clear all data */
  onClearData: () => Promise<void>
  /** Export data */
  onExportData: () => Promise<void>
  /** Import data */
  onImportData: () => Promise<void>
}

/**
 * Settings view component.
 * Combines all settings sections into a unified view.
 */
export const Settings = ({
  settings,
  watchedDirectories,
  storageStats,
  isLoading,
  error,
  successMessage,
  onBack,
  onAddDirectory,
  onRemoveDirectory,
  onToggleDirectoryEnabled,
  onAddPattern,
  onRemovePattern,
  onThemeChange,
  onAnimationIntensityChange,
  onThemeColorChange,
  onResetThemeSettings,
  onEditorViewModeChange,
  onEditorAutoSaveChange,
  onEditorAutoSaveDelayChange,
  onClearData,
  onExportData,
  onImportData,
}: SettingsViewProps) => {
  const [showResetModal, setShowResetModal] = useState(false)

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange(e.target.value as ThemeOption)
  }

  const handleAnimationIntensityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onAnimationIntensityChange(e.target.value as AnimationIntensity)
  }

  const themeOptions: SelectOption[] = [
    { value: 'system', label: 'System' },
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
  ]

  const motionOptions: SelectOption[] = [
    { value: 'full', label: 'Full' },
    { value: 'reduced', label: 'Reduced' },
    { value: 'off', label: 'Off' },
  ]

  return (
    <div className="settings">
      <header className="settings__header">
        {onBack && (
          <Button
            variant="ghost"
            size="small"
            onClick={onBack}
            aria-label="Go back"
            className="settings__back-button"
          >
            <span aria-hidden="true">&larr;</span> Back
          </Button>
        )}
        <h1 className="settings__title">Settings</h1>
      </header>

      <main className="settings__content">
        {/* Loading State */}
        {isLoading && (
          <div className="settings__loading" role="status">
            <span className="settings__loading-spinner" aria-hidden="true" />
            Loading settings...
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="settings__error" role="alert">
            {error}
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="settings__success" role="status">
            {successMessage}
          </div>
        )}

        {/* Watched Directories Section */}
        <WatchedDirectoriesSection
          directories={watchedDirectories}
          onAddDirectory={onAddDirectory}
          onRemoveDirectory={onRemoveDirectory}
          onToggleEnabled={onToggleDirectoryEnabled}
          isLoading={isLoading}
        />

        {/* File Patterns Section */}
        <FilePatternSection
          patterns={settings?.filePatterns ?? []}
          onAddPattern={onAddPattern}
          onRemovePattern={onRemovePattern}
          isLoading={isLoading}
        />

        {/* Editor Settings Section */}
        {settings?.editor && (
          <EditorSettingsSection
            settings={settings.editor}
            disabled={isLoading}
            onViewModeChange={onEditorViewModeChange}
            onAutoSaveChange={onEditorAutoSaveChange}
            onAutoSaveDelayChange={onEditorAutoSaveDelayChange}
          />
        )}

        {/* Data Management Section */}
        <DataManagementSection
          stats={storageStats}
          onClearData={onClearData}
          onExportData={onExportData}
          onImportData={onImportData}
          isLoading={isLoading}
        />

        {/* Theme & About Section */}
        <section className="settings-section">
          <div className="settings-section__header">
            <h2 className="settings-section__title">Appearance</h2>
          </div>

          <div className="settings-appearance">
            <div className="settings-appearance__row">
              <Select
                label="Theme"
                options={themeOptions}
                value={settings?.theme ?? 'system'}
                onChange={handleThemeChange}
                disabled={isLoading}
                className="settings-appearance__select"
              />

              <Select
                label="Motion"
                options={motionOptions}
                value={settings?.animationIntensity ?? 'full'}
                onChange={handleAnimationIntensityChange}
                disabled={isLoading}
                className="settings-appearance__select"
              />
            </div>

            <div className="settings-appearance__colors">
              <h3 className="settings-appearance__colors-title">Accent Colors</h3>
              <div className="settings-appearance__colors-grid">
                <ColorPicker
                  label="Primary"
                  value={settings?.themeColors?.accentPrimary ?? null}
                  defaultColor={DEFAULT_THEME_COLORS.accentPrimary}
                  onChange={(value) => onThemeColorChange('accentPrimary', value)}
                  disabled={isLoading}
                  size="small"
                />
                <ColorPicker
                  label="Secondary"
                  value={settings?.themeColors?.accentSecondary ?? null}
                  defaultColor={DEFAULT_THEME_COLORS.accentSecondary}
                  onChange={(value) => onThemeColorChange('accentSecondary', value)}
                  disabled={isLoading}
                  size="small"
                />
                <ColorPicker
                  label="Warning"
                  value={settings?.themeColors?.accentWarning ?? null}
                  defaultColor={DEFAULT_THEME_COLORS.accentWarning}
                  onChange={(value) => onThemeColorChange('accentWarning', value)}
                  disabled={isLoading}
                  size="small"
                />
              </div>
            </div>

            <div className="settings-appearance__colors">
              <h3 className="settings-appearance__colors-title">Surface Colors</h3>
              <div className="settings-appearance__colors-grid">
                <ColorPicker
                  label="Base"
                  value={settings?.themeColors?.surfaceBase ?? null}
                  defaultColor={DEFAULT_THEME_COLORS.surfaceBase}
                  onChange={(value) => onThemeColorChange('surfaceBase', value)}
                  disabled={isLoading}
                  size="small"
                />
                <ColorPicker
                  label="Elevated"
                  value={settings?.themeColors?.surfaceElevated ?? null}
                  defaultColor={DEFAULT_THEME_COLORS.surfaceElevated}
                  onChange={(value) => onThemeColorChange('surfaceElevated', value)}
                  disabled={isLoading}
                  size="small"
                />
                <ColorPicker
                  label="Card"
                  value={settings?.themeColors?.surfaceCard ?? null}
                  defaultColor={DEFAULT_THEME_COLORS.surfaceCard}
                  onChange={(value) => onThemeColorChange('surfaceCard', value)}
                  disabled={isLoading}
                  size="small"
                />
              </div>
            </div>

            <div className="settings-appearance__reset">
              <Button
                variant="ghost-danger"
                size="small"
                onClick={() => setShowResetModal(true)}
                disabled={isLoading}
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="settings-section settings-section--about">
          <div className="settings-section__header">
            <h2 className="settings-section__title">About</h2>
          </div>

          <div className="settings-about">
            <p className="settings-about__name">Lens</p>
            <p className="settings-about__description">
              Markdown Progress Tracker
            </p>
            <p className="settings-about__version">Version 0.1.0</p>
          </div>
        </section>
      </main>

      {/* Reset Theme Confirmation Modal */}
      <ResetThemeModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={onResetThemeSettings}
      />
    </div>
  )
}
