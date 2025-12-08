/**
 * Editor Settings Section component.
 * Manages editor view mode and auto-save preferences.
 */

import { Select, Checkbox, Input, type SelectOption } from '@/lib/common-components'
import type { EditorSettings } from '@/lib/settings/types'
import './EditorSettingsSection.css'

export interface EditorSettingsSectionProps {
  /** Current editor settings */
  settings: EditorSettings
  /** Whether the form is disabled */
  disabled?: boolean
  /** Handler for view mode changes */
  onViewModeChange: (viewMode: EditorSettings['viewMode']) => void
  /** Handler for auto-save toggle */
  onAutoSaveChange: (enabled: boolean) => void
  /** Handler for auto-save delay changes */
  onAutoSaveDelayChange: (delay: number) => void
}

/**
 * Editor settings section component.
 * Provides controls for editor view mode and auto-save behavior.
 */
export const EditorSettingsSection = ({
  settings,
  disabled = false,
  onViewModeChange,
  onAutoSaveChange,
  onAutoSaveDelayChange,
}: EditorSettingsSectionProps) => {
  const viewModeOptions: SelectOption[] = [
    { value: 'overlay', label: 'Overlay' },
    { value: 'split', label: 'Split View' },
  ]

  const handleViewModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onViewModeChange(e.target.value as EditorSettings['viewMode'])
  }

  const handleAutoSaveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onAutoSaveChange(e.target.checked)
  }

  const handleAutoSaveDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10)
    // Clamp between 1 and 10 seconds (1000-10000ms)
    if (!isNaN(value) && value >= 1 && value <= 10) {
      onAutoSaveDelayChange(value * 1000)
    }
  }

  return (
    <section className="settings-section editor-settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">Editor</h2>
      </div>

      <div className="editor-settings-section__content">
        <div className="editor-settings-section__row">
          <Select
            label="View Mode"
            options={viewModeOptions}
            value={settings.viewMode}
            onChange={handleViewModeChange}
            disabled={disabled}
            className="editor-settings-section__select"
          />
        </div>

        <div className="editor-settings-section__row">
          <Checkbox
            label="Enable Auto-save"
            checked={settings.autoSave}
            onChange={handleAutoSaveChange}
            disabled={disabled}
          />
        </div>

        <div className="editor-settings-section__row">
          <Input
            type="number"
            label="Auto-save Delay (seconds)"
            value={String(settings.autoSaveDelay / 1000)}
            onChange={handleAutoSaveDelayChange}
            disabled={disabled || !settings.autoSave}
            placeholder="2"
            className="editor-settings-section__input"
          />
          <p className="editor-settings-section__hint">
            Delay between 1-10 seconds before auto-saving changes
          </p>
        </div>
      </div>
    </section>
  )
}
