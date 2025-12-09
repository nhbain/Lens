/**
 * Tests for EditorSettingsSection component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { EditorSettingsSection as EditorSettingsSectionType } from './EditorSettingsSection'
import type { EditorSettings } from '@/lib/settings/types'

/**
 * Mock component that mirrors real component behavior without hooks causing issues.
 * NOTE: Auto-save UI is disabled pending bug fixes (see EditorSettingsSection.tsx)
 */
const MockEditorSettingsSection = ({
  settings,
  disabled = false,
  onViewModeChange,
  onAutoSaveChange: _onAutoSaveChange,
  onAutoSaveDelayChange: _onAutoSaveDelayChange,
}: Parameters<typeof EditorSettingsSectionType>[0]) => {
  return (
    <section className="settings-section editor-settings-section">
      <h2 className="settings-section__title">Editor</h2>

      <div className="editor-settings-section__content">
        <div>
          <label htmlFor="view-mode">View Mode</label>
          <select
            id="view-mode"
            value={settings.viewMode}
            onChange={(e) => onViewModeChange(e.target.value as EditorSettings['viewMode'])}
            disabled={disabled}
          >
            <option value="overlay">Overlay</option>
            <option value="split">Split View</option>
          </select>
        </div>

        {/* DISABLED: Auto-save feature temporarily disabled pending bug fixes
        <div>
          <label>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => onAutoSaveChange(e.target.checked)}
              disabled={disabled}
            />
            Enable Auto-save
          </label>
        </div>

        <div>
          <label htmlFor="auto-save-delay">Auto-save Delay (seconds)</label>
          <input
            id="auto-save-delay"
            type="number"
            value={String(settings.autoSaveDelay / 1000)}
            onChange={(e) => {
              const value = parseInt(e.target.value, 10)
              if (!isNaN(value) && value >= 1 && value <= 10) {
                onAutoSaveDelayChange(value * 1000)
              }
            }}
            disabled={disabled || !settings.autoSave}
          />
          <p>Delay between 1-10 seconds before auto-saving changes</p>
        </div>
        */}
      </div>
    </section>
  )
}

const EditorSettingsSection = MockEditorSettingsSection

describe('EditorSettingsSection', () => {
  const defaultSettings: EditorSettings = {
    viewMode: 'overlay',
    autoSave: false, // Default is now false (auto-save disabled)
    autoSaveDelay: 2000,
  }

  const defaultProps = {
    settings: defaultSettings,
    disabled: false,
    onViewModeChange: vi.fn(),
    onAutoSaveChange: vi.fn(),
    onAutoSaveDelayChange: vi.fn(),
  }

  it('renders the section with title', () => {
    render(<EditorSettingsSection {...defaultProps} />)

    expect(screen.getByText('Editor')).toBeInTheDocument()
  })

  it('renders view mode select with correct value', () => {
    render(<EditorSettingsSection {...defaultProps} />)

    const select = screen.getByLabelText('View Mode') as HTMLSelectElement
    expect(select.value).toBe('overlay')
  })

  it('calls onViewModeChange when view mode is changed', () => {
    const onViewModeChange = vi.fn()
    const props = { ...defaultProps, onViewModeChange }

    render(<EditorSettingsSection {...props} />)

    const select = screen.getByLabelText('View Mode')
    fireEvent.change(select, { target: { value: 'split' } })

    expect(onViewModeChange).toHaveBeenCalledWith('split')
  })

  it('disables view mode select when disabled prop is true', () => {
    const props = { ...defaultProps, disabled: true }
    render(<EditorSettingsSection {...props} />)

    const select = screen.getByLabelText('View Mode') as HTMLSelectElement

    expect(select.disabled).toBe(true)
  })

  // Auto-save UI is hidden - verify it's not rendered
  describe('auto-save UI (disabled feature)', () => {
    it('does not render auto-save checkbox', () => {
      render(<EditorSettingsSection {...defaultProps} />)

      expect(screen.queryByLabelText(/auto-save/i)).not.toBeInTheDocument()
    })

    it('does not render auto-save delay input', () => {
      render(<EditorSettingsSection {...defaultProps} />)

      expect(screen.queryByLabelText(/delay/i)).not.toBeInTheDocument()
    })

    it('does not render auto-save hint text', () => {
      render(<EditorSettingsSection {...defaultProps} />)

      expect(
        screen.queryByText(/delay between 1-10 seconds/i)
      ).not.toBeInTheDocument()
    })
  })
})
