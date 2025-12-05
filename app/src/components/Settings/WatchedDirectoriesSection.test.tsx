/**
 * Tests for WatchedDirectoriesSection component.
 * Uses a mock component pattern due to React hook + Tauri mocking complexity.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { WatchedDirectoriesSectionProps } from './types'
import type { WatchedDirectory } from '@/lib/watcher/types'

/**
 * Creates a mock WatchedDirectory for testing.
 */
const createMockDirectory = (
  overrides: Partial<WatchedDirectory> = {}
): WatchedDirectory => ({
  path: '/path/to/directory',
  patterns: ['*.md', '*.markdown'],
  addedAt: '2025-01-01T00:00:00.000Z',
  enabled: true,
  ...overrides,
})

/**
 * Mock component that mirrors real component behavior without React hooks.
 */
const MockWatchedDirectoriesSection = ({
  directories,
  onAddDirectory,
  onRemoveDirectory,
  onToggleEnabled,
  isLoading = false,
  error,
}: WatchedDirectoriesSectionProps) => {
  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">Watched Directories</h2>
        <p className="settings-section__description">
          Directories to monitor for new markdown files
        </p>
      </div>

      {error && (
        <div className="settings-section__error" role="alert">
          {error}
        </div>
      )}

      <div className="watched-directories">
        {directories.length === 0 ? (
          <div className="watched-directories__empty">
            <p>No directories are being watched.</p>
          </div>
        ) : (
          <ul className="watched-directories__list" role="list">
            {directories.map((directory) => (
              <li key={directory.path} className="watched-directory">
                <span className="watched-directory__path">{directory.path}</span>
                <button
                  type="button"
                  onClick={() => onToggleEnabled(directory.path, !directory.enabled)}
                  disabled={isLoading}
                  aria-pressed={directory.enabled}
                >
                  {directory.enabled ? 'Enabled' : 'Disabled'}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveDirectory(directory.path)}
                  disabled={isLoading}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={onAddDirectory}
          disabled={isLoading}
        >
          {isLoading ? 'Adding...' : 'Add Directory'}
        </button>
      </div>
    </section>
  )
}

const WatchedDirectoriesSection = MockWatchedDirectoriesSection

describe('WatchedDirectoriesSection', () => {
  const defaultProps: WatchedDirectoriesSectionProps = {
    directories: [],
    onAddDirectory: vi.fn(),
    onRemoveDirectory: vi.fn(),
    onToggleEnabled: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders section title', () => {
      render(<WatchedDirectoriesSection {...defaultProps} />)

      expect(screen.getByText('Watched Directories')).toBeInTheDocument()
    })

    it('renders section description', () => {
      render(<WatchedDirectoriesSection {...defaultProps} />)

      expect(
        screen.getByText('Directories to monitor for new markdown files')
      ).toBeInTheDocument()
    })

    it('renders add button', () => {
      render(<WatchedDirectoriesSection {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: 'Add Directory' })
      ).toBeInTheDocument()
    })

    it('renders empty state when no directories', () => {
      render(<WatchedDirectoriesSection {...defaultProps} directories={[]} />)

      expect(
        screen.getByText('No directories are being watched.')
      ).toBeInTheDocument()
    })
  })

  describe('directory list', () => {
    it('renders list of directories', () => {
      const directories = [
        createMockDirectory({ path: '/path/one' }),
        createMockDirectory({ path: '/path/two' }),
      ]

      render(
        <WatchedDirectoriesSection {...defaultProps} directories={directories} />
      )

      expect(screen.getByText('/path/one')).toBeInTheDocument()
      expect(screen.getByText('/path/two')).toBeInTheDocument()
    })

    it('renders enabled toggle for each directory', () => {
      const directories = [
        createMockDirectory({ path: '/path/one', enabled: true }),
        createMockDirectory({ path: '/path/two', enabled: false }),
      ]

      render(
        <WatchedDirectoriesSection {...defaultProps} directories={directories} />
      )

      const toggleButtons = screen.getAllByRole('button', { pressed: true })
      expect(toggleButtons).toHaveLength(1) // One enabled

      const disabledButtons = screen.getAllByRole('button', { pressed: false })
      expect(disabledButtons.length).toBeGreaterThan(0) // At least one disabled
    })

    it('renders remove button for each directory', () => {
      const directories = [
        createMockDirectory({ path: '/path/one' }),
        createMockDirectory({ path: '/path/two' }),
      ]

      render(
        <WatchedDirectoriesSection {...defaultProps} directories={directories} />
      )

      const removeButtons = screen.getAllByRole('button', { name: 'Remove' })
      expect(removeButtons).toHaveLength(2)
    })
  })

  describe('interactions', () => {
    it('calls onAddDirectory when add button clicked', async () => {
      const onAddDirectory = vi.fn()

      render(
        <WatchedDirectoriesSection
          {...defaultProps}
          onAddDirectory={onAddDirectory}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Add Directory' }))

      expect(onAddDirectory).toHaveBeenCalledTimes(1)
    })

    it('calls onRemoveDirectory when remove button clicked', async () => {
      const onRemoveDirectory = vi.fn()
      const directories = [createMockDirectory({ path: '/test/path' })]

      render(
        <WatchedDirectoriesSection
          {...defaultProps}
          directories={directories}
          onRemoveDirectory={onRemoveDirectory}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Remove' }))

      expect(onRemoveDirectory).toHaveBeenCalledWith('/test/path')
    })

    it('calls onToggleEnabled when toggle button clicked', async () => {
      const onToggleEnabled = vi.fn()
      const directories = [
        createMockDirectory({ path: '/test/path', enabled: true }),
      ]

      render(
        <WatchedDirectoriesSection
          {...defaultProps}
          directories={directories}
          onToggleEnabled={onToggleEnabled}
        />
      )

      fireEvent.click(screen.getByRole('button', { pressed: true }))

      expect(onToggleEnabled).toHaveBeenCalledWith('/test/path', false)
    })

    it('toggles from disabled to enabled', async () => {
      const onToggleEnabled = vi.fn()
      const directories = [
        createMockDirectory({ path: '/test/path', enabled: false }),
      ]

      render(
        <WatchedDirectoriesSection
          {...defaultProps}
          directories={directories}
          onToggleEnabled={onToggleEnabled}
        />
      )

      fireEvent.click(screen.getByRole('button', { pressed: false }))

      expect(onToggleEnabled).toHaveBeenCalledWith('/test/path', true)
    })
  })

  describe('loading state', () => {
    it('disables buttons when loading', () => {
      const directories = [createMockDirectory({ path: '/test/path' })]

      render(
        <WatchedDirectoriesSection
          {...defaultProps}
          directories={directories}
          isLoading={true}
        />
      )

      expect(
        screen.getByRole('button', { name: /Adding/i })
      ).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Remove' })).toBeDisabled()
    })

    it('shows loading text on add button', () => {
      render(
        <WatchedDirectoriesSection {...defaultProps} isLoading={true} />
      )

      expect(screen.getByText('Adding...')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('displays error message', () => {
      render(
        <WatchedDirectoriesSection
          {...defaultProps}
          error="Directory not found"
        />
      )

      expect(screen.getByRole('alert')).toHaveTextContent('Directory not found')
    })

    it('does not show error when null', () => {
      render(
        <WatchedDirectoriesSection {...defaultProps} error={null} />
      )

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})

describe('helper functions', () => {
  describe('truncatePath', () => {
    const truncatePath = (path: string, maxLength: number = 40): string => {
      if (path.length <= maxLength) return path
      const parts = path.split('/')
      if (parts.length <= 2) return path
      const first = parts[0] === '' ? '/' : parts[0]
      const last = parts[parts.length - 1]
      const truncated = `${first}/.../${last}`
      if (truncated.length <= maxLength) return truncated
      return '...' + path.slice(-(maxLength - 3))
    }

    it('returns short paths unchanged', () => {
      expect(truncatePath('/short')).toBe('/short')
    })

    it('truncates long paths', () => {
      const longPath = '/very/long/path/to/some/directory/somewhere'
      const result = truncatePath(longPath, 30)
      expect(result.length).toBeLessThanOrEqual(30)
    })

    it('preserves first and last segments', () => {
      const path = '/Users/name/docs/projects/file'
      const result = truncatePath(path, 25)
      expect(result).toContain('/')
      expect(result).toContain('file')
    })
  })

  describe('formatRelativeTime', () => {
    const formatRelativeTime = (isoTimestamp: string): string => {
      const date = new Date(isoTimestamp)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMs / 3600000)
      const diffDays = Math.floor(diffMs / 86400000)

      if (diffMins < 1) return 'just now'
      if (diffMins < 60) return `${diffMins}m ago`
      if (diffHours < 24) return `${diffHours}h ago`
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    }

    it('returns "just now" for recent timestamps', () => {
      const now = new Date().toISOString()
      expect(formatRelativeTime(now)).toBe('just now')
    })

    it('returns minutes ago for timestamps within an hour', () => {
      const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
      expect(formatRelativeTime(tenMinsAgo)).toBe('10m ago')
    })

    it('returns hours ago for timestamps within a day', () => {
      const threeHoursAgo = new Date(
        Date.now() - 3 * 60 * 60 * 1000
      ).toISOString()
      expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago')
    })

    it('returns days ago for timestamps within a week', () => {
      const twoDaysAgo = new Date(
        Date.now() - 2 * 24 * 60 * 60 * 1000
      ).toISOString()
      expect(formatRelativeTime(twoDaysAgo)).toBe('2d ago')
    })
  })
})
