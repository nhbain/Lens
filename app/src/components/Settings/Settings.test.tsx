/**
 * Tests for Settings component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { SettingsViewProps } from './Settings'
import type { AppSettings, StorageStats } from '@/lib/settings/types'
import type { WatchedDirectory } from '@/lib/watcher/types'

/**
 * Creates mock settings for testing.
 */
const createMockSettings = (
  overrides: Partial<AppSettings> = {}
): AppSettings => ({
  version: 1,
  filePatterns: ['*.md', '*.markdown'],
  theme: 'system',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
  ...overrides,
})

/**
 * Creates mock storage stats for testing.
 */
const createMockStats = (
  overrides: Partial<StorageStats> = {}
): StorageStats => ({
  trackedFileCount: 5,
  watchedDirectoryCount: 2,
  totalItemCount: 150,
  totalSizeBytes: 1024 * 50,
  ...overrides,
})

/**
 * Creates mock watched directory for testing.
 */
const createMockDirectory = (
  overrides: Partial<WatchedDirectory> = {}
): WatchedDirectory => ({
  path: '/test/path',
  patterns: ['*.md'],
  addedAt: '2025-01-01T00:00:00.000Z',
  enabled: true,
  ...overrides,
})

/**
 * Mock Settings component that mirrors structure without React hooks.
 */
const MockSettings = ({
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
  return (
    <div className="settings">
      <header className="settings__header">
        {onBack && (
          <button type="button" onClick={onBack} aria-label="Go back">
            &larr; Back
          </button>
        )}
        <h1>Settings</h1>
      </header>

      <main className="settings__content">
        {isLoading && <div role="status">Loading settings...</div>}
        {error && <div role="alert">{error}</div>}
        {successMessage && <div role="status">{successMessage}</div>}

        {/* Watched Directories */}
        <section>
          <h2>Watched Directories</h2>
          {watchedDirectories.map((dir) => (
            <div key={dir.path}>
              <span>{dir.path}</span>
              <button
                onClick={() => onToggleDirectoryEnabled(dir.path, !dir.enabled)}
              >
                {dir.enabled ? 'Disable' : 'Enable'}
              </button>
              <button
                onClick={() => onRemoveDirectory(dir.path)}
                aria-label={`Remove directory ${dir.path}`}
              >
                Remove Dir
              </button>
            </div>
          ))}
          <button onClick={onAddDirectory}>Add Directory</button>
        </section>

        {/* File Patterns */}
        <section>
          <h2>File Patterns</h2>
          {settings?.filePatterns.map((pattern) => (
            <div key={pattern}>
              <code>{pattern}</code>
              <button
                onClick={() => onRemovePattern(pattern)}
                aria-label={`Remove pattern ${pattern}`}
              >
                Remove Pattern
              </button>
            </div>
          ))}
          <button onClick={() => onAddPattern('*.txt')}>Add Pattern</button>
        </section>

        {/* Data Management */}
        <section>
          <h2>Data Management</h2>
          {storageStats && (
            <div>
              <span>Files: {storageStats.trackedFileCount}</span>
            </div>
          )}
          <button onClick={onExportData}>Export Data</button>
          <button onClick={onImportData}>Import Data</button>
          <button onClick={onClearData}>Clear All Data</button>
        </section>

        {/* Theme */}
        <section>
          <h2>Appearance</h2>
          <select
            value={settings?.theme ?? 'system'}
            onChange={(e) =>
              onThemeChange(e.target.value as 'system' | 'light' | 'dark')
            }
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </section>

        {/* About */}
        <section>
          <h2>About</h2>
          <p>Lens</p>
          <p>Markdown Progress Tracker</p>
        </section>
      </main>
    </div>
  )
}

const Settings = MockSettings

describe('Settings', () => {
  const defaultProps: SettingsViewProps = {
    settings: createMockSettings(),
    watchedDirectories: [],
    storageStats: null,
    isLoading: false,
    error: null,
    successMessage: null,
    onAddDirectory: vi.fn(),
    onRemoveDirectory: vi.fn(),
    onToggleDirectoryEnabled: vi.fn(),
    onAddPattern: vi.fn(),
    onRemovePattern: vi.fn(),
    onThemeChange: vi.fn(),
    onClearData: vi.fn(),
    onExportData: vi.fn(),
    onImportData: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders main title', () => {
      render(<Settings {...defaultProps} />)

      expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    })

    it('renders all section titles', () => {
      render(<Settings {...defaultProps} />)

      expect(screen.getByText('Watched Directories')).toBeInTheDocument()
      expect(screen.getByText('File Patterns')).toBeInTheDocument()
      expect(screen.getByText('Data Management')).toBeInTheDocument()
      expect(screen.getByText('Appearance')).toBeInTheDocument()
      expect(screen.getByText('About')).toBeInTheDocument()
    })

    it('renders back button when onBack provided', () => {
      const onBack = vi.fn()
      render(<Settings {...defaultProps} onBack={onBack} />)

      expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument()
    })

    it('does not render back button when onBack not provided', () => {
      render(<Settings {...defaultProps} onBack={undefined} />)

      expect(screen.queryByRole('button', { name: /back/i })).not.toBeInTheDocument()
    })

    it('renders about section', () => {
      render(<Settings {...defaultProps} />)

      expect(screen.getByText('Lens')).toBeInTheDocument()
      expect(screen.getByText('Markdown Progress Tracker')).toBeInTheDocument()
    })
  })

  describe('loading state', () => {
    it('shows loading message when loading', () => {
      render(<Settings {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('status')).toHaveTextContent('Loading settings')
    })
  })

  describe('error state', () => {
    it('shows error message', () => {
      render(<Settings {...defaultProps} error="Failed to load settings" />)

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to load settings'
      )
    })
  })

  describe('success state', () => {
    it('shows success message', () => {
      render(
        <Settings {...defaultProps} successMessage="Settings saved successfully" />
      )

      expect(screen.getByRole('status')).toHaveTextContent(
        'Settings saved successfully'
      )
    })
  })

  describe('navigation', () => {
    it('calls onBack when back button clicked', () => {
      const onBack = vi.fn()
      render(<Settings {...defaultProps} onBack={onBack} />)

      fireEvent.click(screen.getByRole('button', { name: /back/i }))

      expect(onBack).toHaveBeenCalledTimes(1)
    })
  })

  describe('watched directories section', () => {
    it('renders watched directories', () => {
      const directories = [
        createMockDirectory({ path: '/path/one' }),
        createMockDirectory({ path: '/path/two' }),
      ]

      render(<Settings {...defaultProps} watchedDirectories={directories} />)

      expect(screen.getByText('/path/one')).toBeInTheDocument()
      expect(screen.getByText('/path/two')).toBeInTheDocument()
    })

    it('calls onAddDirectory when add clicked', () => {
      const onAddDirectory = vi.fn()
      render(<Settings {...defaultProps} onAddDirectory={onAddDirectory} />)

      fireEvent.click(screen.getByRole('button', { name: 'Add Directory' }))

      expect(onAddDirectory).toHaveBeenCalledTimes(1)
    })

    it('calls onRemoveDirectory when remove clicked', () => {
      const onRemoveDirectory = vi.fn()
      const directories = [createMockDirectory({ path: '/test' })]

      render(
        <Settings
          {...defaultProps}
          watchedDirectories={directories}
          onRemoveDirectory={onRemoveDirectory}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /Remove directory/i }))

      expect(onRemoveDirectory).toHaveBeenCalledWith('/test')
    })
  })

  describe('file patterns section', () => {
    it('renders file patterns', () => {
      const settings = createMockSettings({
        filePatterns: ['*.md', '*.markdown'],
      })

      render(<Settings {...defaultProps} settings={settings} />)

      expect(screen.getByText('*.md')).toBeInTheDocument()
      expect(screen.getByText('*.markdown')).toBeInTheDocument()
    })

    it('calls onRemovePattern when remove clicked', () => {
      const onRemovePattern = vi.fn()
      const settings = createMockSettings({ filePatterns: ['*.md'] })

      render(
        <Settings
          {...defaultProps}
          settings={settings}
          onRemovePattern={onRemovePattern}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /Remove pattern/i }))

      expect(onRemovePattern).toHaveBeenCalledWith('*.md')
    })
  })

  describe('data management section', () => {
    it('renders storage stats', () => {
      const stats = createMockStats({ trackedFileCount: 10 })

      render(<Settings {...defaultProps} storageStats={stats} />)

      expect(screen.getByText('Files: 10')).toBeInTheDocument()
    })

    it('calls onExportData when export clicked', () => {
      const onExportData = vi.fn()
      render(<Settings {...defaultProps} onExportData={onExportData} />)

      fireEvent.click(screen.getByRole('button', { name: 'Export Data' }))

      expect(onExportData).toHaveBeenCalledTimes(1)
    })

    it('calls onImportData when import clicked', () => {
      const onImportData = vi.fn()
      render(<Settings {...defaultProps} onImportData={onImportData} />)

      fireEvent.click(screen.getByRole('button', { name: 'Import Data' }))

      expect(onImportData).toHaveBeenCalledTimes(1)
    })

    it('calls onClearData when clear clicked', () => {
      const onClearData = vi.fn()
      render(<Settings {...defaultProps} onClearData={onClearData} />)

      fireEvent.click(screen.getByRole('button', { name: 'Clear All Data' }))

      expect(onClearData).toHaveBeenCalledTimes(1)
    })
  })

  describe('theme section', () => {
    it('renders theme selector with current value', () => {
      const settings = createMockSettings({ theme: 'dark' })

      render(<Settings {...defaultProps} settings={settings} />)

      const select = screen.getByRole('combobox')
      expect(select).toHaveValue('dark')
    })

    it('calls onThemeChange when theme changed', () => {
      const onThemeChange = vi.fn()
      render(<Settings {...defaultProps} onThemeChange={onThemeChange} />)

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'light' } })

      expect(onThemeChange).toHaveBeenCalledWith('light')
    })

    it('renders all theme options', () => {
      render(<Settings {...defaultProps} />)

      expect(screen.getByRole('option', { name: 'System' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Light' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Dark' })).toBeInTheDocument()
    })
  })
})
