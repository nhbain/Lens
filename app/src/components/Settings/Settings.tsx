/**
 * Settings component.
 * Main container for all settings sections.
 */

import { WatchedDirectoriesSection } from './WatchedDirectoriesSection'
import { FilePatternSection } from './FilePatternSection'
import { DataManagementSection } from './DataManagementSection'
import type { SettingsProps } from './types'
import type { WatchedDirectory } from '@/lib/watcher/types'
import type { AppSettings, StorageStats, ThemeOption } from '@/lib/settings/types'
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
  onClearData,
  onExportData,
  onImportData,
}: SettingsViewProps) => {
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange(e.target.value as ThemeOption)
  }

  return (
    <div className="settings">
      <header className="settings__header">
        {onBack && (
          <button
            type="button"
            className="settings__back-button"
            onClick={onBack}
            aria-label="Go back"
          >
            <span aria-hidden="true">&larr;</span> Back
          </button>
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
            <label className="settings-appearance__label">
              <span>Theme</span>
              <select
                className="settings-appearance__select"
                value={settings?.theme ?? 'system'}
                onChange={handleThemeChange}
                disabled={isLoading}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </label>
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
    </div>
  )
}
