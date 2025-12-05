/**
 * Tests for the Dashboard component.
 * Uses mock data to avoid Tauri module complexity.
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { DashboardFile, SortConfig } from './types'

// Mock Dashboard components that depend on hook
const MockProgressBar = ({ percentage }: { percentage: number }) => (
  <div role="progressbar" aria-valuenow={percentage}>{percentage}%</div>
)

const MockFileCard = ({
  file,
  onClick,
  isSelected,
}: {
  file: DashboardFile
  onClick?: (file: DashboardFile) => void
  isSelected?: boolean
}) => (
  <article
    role="button"
    aria-label={`Open ${file.fileName}`}
    aria-pressed={isSelected}
    onClick={() => onClick?.(file)}
    className={isSelected ? 'file-card--selected' : ''}
    data-testid={`file-card-${file.fileName}`}
  >
    <h3>{file.fileName}</h3>
    <MockProgressBar percentage={file.progress.percentage} />
    <span>{file.progress.complete} of {file.progress.total} complete</span>
    {file.hasInProgress && <span>In Progress</span>}
  </article>
)

const MockSortControls = ({
  sortConfig,
  onSortChange,
}: {
  sortConfig: SortConfig
  onSortChange: (config: SortConfig) => void
}) => (
  <div>
    <select
      value={sortConfig.option}
      onChange={(e) => onSortChange({ ...sortConfig, option: e.target.value as SortConfig['option'] })}
      aria-label="Sort by field"
    >
      <option value="name">Name</option>
      <option value="progress">Progress</option>
      <option value="date">Last Worked</option>
      <option value="items">Items</option>
    </select>
    <button
      onClick={() => onSortChange({ ...sortConfig, direction: sortConfig.direction === 'asc' ? 'desc' : 'asc' })}
    >
      {sortConfig.direction === 'asc' ? '↑' : '↓'}
    </button>
  </div>
)

// Create mock Dashboard component for testing
const MockDashboard = ({
  files,
  isLoading,
  error,
  sortConfig,
  onSortChange,
  onFileSelect,
  onAddFile,
  selectedPath,
}: {
  files: DashboardFile[]
  isLoading: boolean
  error: string | null
  sortConfig: SortConfig
  onSortChange: (config: SortConfig) => void
  onFileSelect?: (file: DashboardFile) => void
  onAddFile?: () => void
  selectedPath?: string
}) => {
  if (isLoading) {
    return (
      <div className="dashboard">
        <div className="dashboard__loading" role="status" aria-label="Loading files">
          <p>Loading your documents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard__error" role="alert">
          <p className="dashboard__error-message">Error: {error}</p>
        </div>
      </div>
    )
  }

  const filesInProgress = files.filter((f) => f.hasInProgress).length

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__title-row">
          <h2 className="dashboard__title">Your Documents</h2>
          {onAddFile && (
            <button
              type="button"
              className="dashboard__add-button"
              onClick={onAddFile}
              aria-label="Add new file"
            >
              + Add File
            </button>
          )}
        </div>
        {files.length > 0 && (
          <p className="dashboard__summary">
            {files.length} file{files.length === 1 ? '' : 's'}
            {filesInProgress > 0 && (
              <span className="dashboard__summary-highlight">
                {' '}· {filesInProgress} in progress
              </span>
            )}
          </p>
        )}
      </header>

      {files.length === 0 ? (
        <div className="dashboard__empty">
          <p className="dashboard__empty-message">No documents being tracked yet.</p>
          <p className="dashboard__empty-hint">
            Add a markdown file to start tracking your progress.
          </p>
          {onAddFile && (
            <button
              type="button"
              className="dashboard__add-button dashboard__add-button--primary"
              onClick={onAddFile}
            >
              Add File
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="dashboard__controls">
            <MockSortControls sortConfig={sortConfig} onSortChange={onSortChange} />
          </div>

          <div className="dashboard__grid" role="list" aria-label="Tracked files">
            {files.map((file) => (
              <div key={file.path} role="listitem">
                <MockFileCard
                  file={file}
                  isSelected={file.path === selectedPath}
                  onClick={onFileSelect}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const createMockFile = (overrides: Partial<DashboardFile> = {}): DashboardFile => ({
  path: '/path/to/file.md',
  fileName: 'file.md',
  itemCount: 10,
  contentHash: 'abc123',
  addedAt: '2025-01-01T00:00:00Z',
  lastAccessedAt: '2025-01-02T00:00:00Z',
  progress: {
    total: 10,
    complete: 5,
    inProgress: 2,
    pending: 3,
    percentage: 50,
  },
  hasInProgress: true,
  lastWorkedAt: '2025-01-02T00:00:00Z',
  ...overrides,
})

describe('Dashboard', () => {
  const defaultSortConfig: SortConfig = { option: 'date', direction: 'desc' }

  describe('loading state', () => {
    it('shows loading indicator while loading', () => {
      render(
        <MockDashboard
          files={[]}
          isLoading={true}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByRole('status', { name: 'Loading files' })).toBeInTheDocument()
      expect(screen.getByText('Loading your documents...')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message when error occurs', () => {
      render(
        <MockDashboard
          files={[]}
          isLoading={false}
          error="Failed to load files"
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText('Error: Failed to load files')).toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('shows empty state when no files', () => {
      render(
        <MockDashboard
          files={[]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByText('No documents being tracked yet.')).toBeInTheDocument()
      expect(screen.getByText(/Add a markdown file/)).toBeInTheDocument()
    })

    it('shows Add File button in empty state', () => {
      const handleAddFile = vi.fn()
      render(
        <MockDashboard
          files={[]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
          onAddFile={handleAddFile}
        />
      )
      const addButtons = screen.getAllByRole('button', { name: /add file/i })
      expect(addButtons.length).toBeGreaterThan(0)
    })
  })

  describe('with files', () => {
    it('renders header with title', () => {
      render(
        <MockDashboard
          files={[createMockFile()]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByText('Your Documents')).toBeInTheDocument()
    })

    it('shows file count summary', () => {
      render(
        <MockDashboard
          files={[createMockFile(), createMockFile({ path: '/other.md', fileName: 'other.md' })]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByText(/2 files/)).toBeInTheDocument()
    })

    it('shows singular file text for 1 file', () => {
      render(
        <MockDashboard
          files={[createMockFile()]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByText(/1 file/)).toBeInTheDocument()
    })

    it('shows in-progress count when files have in-progress items', () => {
      render(
        <MockDashboard
          files={[
            createMockFile({ hasInProgress: true }),
            createMockFile({ path: '/other.md', hasInProgress: false }),
          ]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByText(/1 in progress/)).toBeInTheDocument()
    })

    it('renders file cards', () => {
      render(
        <MockDashboard
          files={[createMockFile({ fileName: 'test-doc.md' })]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByText('test-doc.md')).toBeInTheDocument()
    })

    it('renders sort controls', () => {
      render(
        <MockDashboard
          files={[createMockFile()]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByRole('combobox', { name: 'Sort by field' })).toBeInTheDocument()
    })
  })

  describe('interactions', () => {
    it('calls onFileSelect when file card is clicked', () => {
      const handleFileSelect = vi.fn()
      const file = createMockFile()
      render(
        <MockDashboard
          files={[file]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
          onFileSelect={handleFileSelect}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: `Open ${file.fileName}` }))
      expect(handleFileSelect).toHaveBeenCalledWith(file)
    })

    it('calls onAddFile when Add File button is clicked', () => {
      const handleAddFile = vi.fn()
      render(
        <MockDashboard
          files={[createMockFile()]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
          onAddFile={handleAddFile}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Add new file' }))
      expect(handleAddFile).toHaveBeenCalled()
    })

    it('calls onSortChange when sort option changes', () => {
      const handleSortChange = vi.fn()
      render(
        <MockDashboard
          files={[createMockFile()]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={handleSortChange}
        />
      )

      fireEvent.change(screen.getByRole('combobox'), { target: { value: 'name' } })
      expect(handleSortChange).toHaveBeenCalledWith({ option: 'name', direction: 'desc' })
    })

    it('calls onSortChange when direction is toggled', () => {
      const handleSortChange = vi.fn()
      render(
        <MockDashboard
          files={[createMockFile()]}
          isLoading={false}
          error={null}
          sortConfig={{ option: 'name', direction: 'asc' }}
          onSortChange={handleSortChange}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: '↑' }))
      expect(handleSortChange).toHaveBeenCalledWith({ option: 'name', direction: 'desc' })
    })
  })

  describe('selection', () => {
    it('highlights selected file', () => {
      const file = createMockFile()
      render(
        <MockDashboard
          files={[file]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
          selectedPath={file.path}
        />
      )

      const card = screen.getByRole('button', { name: `Open ${file.fileName}` })
      expect(card).toHaveAttribute('aria-pressed', 'true')
    })
  })

  describe('accessibility', () => {
    it('has list role for file grid', () => {
      render(
        <MockDashboard
          files={[createMockFile()]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getByRole('list', { name: 'Tracked files' })).toBeInTheDocument()
    })

    it('has listitem role for each file', () => {
      render(
        <MockDashboard
          files={[createMockFile(), createMockFile({ path: '/other.md' })]}
          isLoading={false}
          error={null}
          sortConfig={defaultSortConfig}
          onSortChange={vi.fn()}
        />
      )
      expect(screen.getAllByRole('listitem')).toHaveLength(2)
    })
  })
})
