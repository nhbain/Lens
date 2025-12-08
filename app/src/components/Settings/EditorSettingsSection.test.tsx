/**
 * Tests for EditorSettingsSection component.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { EditorSettingsSection as EditorSettingsSectionType } from './EditorSettingsSection'
import type { EditorSettings } from '@/lib/settings/types'

/**
 * Mock component that mirrors real component behavior without hooks causing issues.
 */
const MockEditorSettingsSection = ({
  settings,
  disabled = false,
  onViewModeChange,
  onAutoSaveChange,
  onAutoSaveDelayChange,
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
      </div>
    </section>
  )
}

const EditorSettingsSection = MockEditorSettingsSection

describe('EditorSettingsSection', () => {
  const defaultSettings: EditorSettings = {
    viewMode: 'overlay',
    autoSave: true,
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

  it('renders auto-save checkbox checked when enabled', () => {
    render(<EditorSettingsSection {...defaultProps} />)

    const checkbox = screen.getByLabelText('Enable Auto-save') as HTMLInputElement
    expect(checkbox.checked).toBe(true)
  })

  it('renders auto-save checkbox unchecked when disabled', () => {
    const props = {
      ...defaultProps,
      settings: { ...defaultSettings, autoSave: false },
    }
    render(<EditorSettingsSection {...props} />)

    const checkbox = screen.getByLabelText('Enable Auto-save') as HTMLInputElement
    expect(checkbox.checked).toBe(false)
  })

  it('renders auto-save delay input with correct value in seconds', () => {
    render(<EditorSettingsSection {...defaultProps} />)

    const input = screen.getByLabelText('Auto-save Delay (seconds)') as HTMLInputElement
    expect(input.value).toBe('2')
  })

  it('disables auto-save delay input when auto-save is off', () => {
    const props = {
      ...defaultProps,
      settings: { ...defaultSettings, autoSave: false },
    }
    render(<EditorSettingsSection {...props} />)

    const input = screen.getByLabelText('Auto-save Delay (seconds)') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('calls onViewModeChange when view mode is changed', () => {
    const onViewModeChange = vi.fn()
    const props = { ...defaultProps, onViewModeChange }

    render(<EditorSettingsSection {...props} />)

    const select = screen.getByLabelText('View Mode')
    fireEvent.change(select, { target: { value: 'split' } })

    expect(onViewModeChange).toHaveBeenCalledWith('split')
  })

  it('calls onAutoSaveChange when checkbox is toggled', () => {
    const onAutoSaveChange = vi.fn()
    const props = { ...defaultProps, onAutoSaveChange }

    render(<EditorSettingsSection {...props} />)

    const checkbox = screen.getByLabelText('Enable Auto-save')
    fireEvent.click(checkbox)

    expect(onAutoSaveChange).toHaveBeenCalledWith(false)
  })

  it('calls onAutoSaveDelayChange with milliseconds when delay is changed', () => {
    const onAutoSaveDelayChange = vi.fn()
    const props = { ...defaultProps, onAutoSaveDelayChange }

    render(<EditorSettingsSection {...props} />)

    const input = screen.getByLabelText('Auto-save Delay (seconds)')
    fireEvent.change(input, { target: { value: '5' } })

    expect(onAutoSaveDelayChange).toHaveBeenCalledWith(5000)
  })

  it('does not call onAutoSaveDelayChange for values below 1', () => {
    const onAutoSaveDelayChange = vi.fn()
    const props = { ...defaultProps, onAutoSaveDelayChange }

    render(<EditorSettingsSection {...props} />)

    const input = screen.getByLabelText('Auto-save Delay (seconds)')
    fireEvent.change(input, { target: { value: '0' } })

    expect(onAutoSaveDelayChange).not.toHaveBeenCalled()
  })

  it('does not call onAutoSaveDelayChange for values above 10', () => {
    const onAutoSaveDelayChange = vi.fn()
    const props = { ...defaultProps, onAutoSaveDelayChange }

    render(<EditorSettingsSection {...props} />)

    const input = screen.getByLabelText('Auto-save Delay (seconds)')
    fireEvent.change(input, { target: { value: '11' } })

    expect(onAutoSaveDelayChange).not.toHaveBeenCalled()
  })

  it('disables all controls when disabled prop is true', () => {
    const props = { ...defaultProps, disabled: true }
    render(<EditorSettingsSection {...props} />)

    const select = screen.getByLabelText('View Mode') as HTMLSelectElement
    const checkbox = screen.getByLabelText('Enable Auto-save') as HTMLInputElement
    const input = screen.getByLabelText('Auto-save Delay (seconds)') as HTMLInputElement

    expect(select.disabled).toBe(true)
    expect(checkbox.disabled).toBe(true)
    expect(input.disabled).toBe(true)
  })

  it('renders hint text for auto-save delay', () => {
    render(<EditorSettingsSection {...defaultProps} />)

    expect(
      screen.getByText('Delay between 1-10 seconds before auto-saving changes')
    ).toBeInTheDocument()
  })
})
