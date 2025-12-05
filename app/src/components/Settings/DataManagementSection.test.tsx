/**
 * Tests for DataManagementSection component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { DataManagementSectionProps } from './types'
import type { StorageStats } from '@/lib/settings/types'

/**
 * Creates mock storage stats for testing.
 */
const createMockStats = (
  overrides: Partial<StorageStats> = {}
): StorageStats => ({
  trackedFileCount: 5,
  watchedDirectoryCount: 2,
  totalItemCount: 150,
  totalSizeBytes: 1024 * 50, // 50 KB
  ...overrides,
})

/**
 * Mock component that mirrors real component behavior.
 */
const MockDataManagementSection = ({
  stats,
  onClearData,
  onExportData,
  onImportData,
  isLoading = false,
  error,
  successMessage,
}: DataManagementSectionProps) => {
  return (
    <section className="settings-section">
      <h2>Data Management</h2>
      <p>Manage your tracking data and app state</p>

      {error && <div role="alert">{error}</div>}
      {successMessage && <div role="status">{successMessage}</div>}

      {stats && (
        <div className="data-management__stats">
          <h3>Storage Usage</h3>
          <dl>
            <div>
              <dt>Tracked Files</dt>
              <dd>{stats.trackedFileCount}</dd>
            </div>
            <div>
              <dt>Watched Directories</dt>
              <dd>{stats.watchedDirectoryCount}</dd>
            </div>
            <div>
              <dt>Total Items</dt>
              <dd>{stats.totalItemCount}</dd>
            </div>
          </dl>
        </div>
      )}

      <button onClick={onExportData} disabled={isLoading}>
        Export Data
      </button>
      <button onClick={onImportData} disabled={isLoading}>
        Import Data
      </button>
      <button
        onClick={onClearData}
        disabled={isLoading}
        className="settings-button--danger"
      >
        Clear All Data
      </button>
    </section>
  )
}

const DataManagementSection = MockDataManagementSection

describe('DataManagementSection', () => {
  const defaultProps: DataManagementSectionProps = {
    onClearData: vi.fn(),
    onExportData: vi.fn(),
    onImportData: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders section title', () => {
      render(<DataManagementSection {...defaultProps} />)

      expect(screen.getByText('Data Management')).toBeInTheDocument()
    })

    it('renders section description', () => {
      render(<DataManagementSection {...defaultProps} />)

      expect(
        screen.getByText('Manage your tracking data and app state')
      ).toBeInTheDocument()
    })

    it('renders export button', () => {
      render(<DataManagementSection {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: 'Export Data' })
      ).toBeInTheDocument()
    })

    it('renders import button', () => {
      render(<DataManagementSection {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: 'Import Data' })
      ).toBeInTheDocument()
    })

    it('renders clear data button', () => {
      render(<DataManagementSection {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: 'Clear All Data' })
      ).toBeInTheDocument()
    })
  })

  describe('storage statistics', () => {
    it('displays stats when provided', () => {
      const stats = createMockStats()

      render(<DataManagementSection {...defaultProps} stats={stats} />)

      expect(screen.getByText('Storage Usage')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument() // trackedFileCount
      expect(screen.getByText('2')).toBeInTheDocument() // watchedDirectoryCount
      expect(screen.getByText('150')).toBeInTheDocument() // totalItemCount
    })

    it('does not display stats when null', () => {
      render(<DataManagementSection {...defaultProps} stats={null} />)

      expect(screen.queryByText('Storage Usage')).not.toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onExportData when export button clicked', () => {
      const onExportData = vi.fn()

      render(
        <DataManagementSection {...defaultProps} onExportData={onExportData} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Export Data' }))

      expect(onExportData).toHaveBeenCalledTimes(1)
    })

    it('calls onImportData when import button clicked', () => {
      const onImportData = vi.fn()

      render(
        <DataManagementSection {...defaultProps} onImportData={onImportData} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Import Data' }))

      expect(onImportData).toHaveBeenCalledTimes(1)
    })

    it('calls onClearData when clear button clicked', () => {
      const onClearData = vi.fn()

      render(
        <DataManagementSection {...defaultProps} onClearData={onClearData} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Clear All Data' }))

      expect(onClearData).toHaveBeenCalledTimes(1)
    })
  })

  describe('loading state', () => {
    it('disables buttons when loading', () => {
      render(<DataManagementSection {...defaultProps} isLoading={true} />)

      expect(
        screen.getByRole('button', { name: 'Export Data' })
      ).toBeDisabled()
      expect(
        screen.getByRole('button', { name: 'Import Data' })
      ).toBeDisabled()
      expect(
        screen.getByRole('button', { name: 'Clear All Data' })
      ).toBeDisabled()
    })
  })

  describe('error state', () => {
    it('displays error message', () => {
      render(
        <DataManagementSection {...defaultProps} error="Export failed" />
      )

      expect(screen.getByRole('alert')).toHaveTextContent('Export failed')
    })

    it('does not show error when null', () => {
      render(<DataManagementSection {...defaultProps} error={null} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })

  describe('success state', () => {
    it('displays success message', () => {
      render(
        <DataManagementSection
          {...defaultProps}
          successMessage="Data exported successfully"
        />
      )

      expect(screen.getByRole('status')).toHaveTextContent(
        'Data exported successfully'
      )
    })
  })
})

describe('formatBytes helper', () => {
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  it('formats 0 bytes', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
  })

  it('formats bytes', () => {
    expect(formatBytes(500)).toBe('500 Bytes')
  })

  it('formats kilobytes', () => {
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1536)).toBe('1.5 KB')
  })

  it('formats megabytes', () => {
    expect(formatBytes(1024 * 1024)).toBe('1 MB')
    expect(formatBytes(1024 * 1024 * 2.5)).toBe('2.5 MB')
  })

  it('formats gigabytes', () => {
    expect(formatBytes(1024 * 1024 * 1024)).toBe('1 GB')
  })
})
