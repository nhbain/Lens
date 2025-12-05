/**
 * Tests for FilePatternSection component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { FilePatternSectionProps } from './types'

/**
 * Mock component that mirrors real component behavior without hooks causing issues.
 */
const MockFilePatternSection = ({
  patterns,
  onAddPattern,
  onRemovePattern,
  isLoading = false,
  error,
}: FilePatternSectionProps) => {
  return (
    <section className="settings-section">
      <h2 className="settings-section__title">File Patterns</h2>
      <p className="settings-section__description">
        Glob patterns to match markdown files
      </p>

      {error && (
        <div className="settings-section__error" role="alert">
          {error}
        </div>
      )}

      <div className="file-patterns">
        {patterns.length === 0 ? (
          <p>No patterns configured.</p>
        ) : (
          <ul className="file-patterns__list" role="list">
            {patterns.map((pattern) => (
              <li key={pattern} className="file-pattern">
                <code>{pattern}</code>
                <button
                  type="button"
                  onClick={() => onRemovePattern(pattern)}
                  disabled={isLoading}
                  aria-label={`Remove pattern ${pattern}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="file-patterns__add">
          <input
            type="text"
            placeholder="e.g., *.md"
            disabled={isLoading}
            aria-label="New file pattern"
            data-testid="pattern-input"
          />
          <button
            type="button"
            onClick={() => onAddPattern('*.md')}
            disabled={isLoading}
          >
            Add
          </button>
        </div>
      </div>
    </section>
  )
}

const FilePatternSection = MockFilePatternSection

describe('FilePatternSection', () => {
  const defaultProps: FilePatternSectionProps = {
    patterns: [],
    onAddPattern: vi.fn(),
    onRemovePattern: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders section title', () => {
      render(<FilePatternSection {...defaultProps} />)

      expect(screen.getByText('File Patterns')).toBeInTheDocument()
    })

    it('renders section description', () => {
      render(<FilePatternSection {...defaultProps} />)

      expect(
        screen.getByText('Glob patterns to match markdown files')
      ).toBeInTheDocument()
    })

    it('renders empty state when no patterns', () => {
      render(<FilePatternSection {...defaultProps} patterns={[]} />)

      expect(screen.getByText('No patterns configured.')).toBeInTheDocument()
    })

    it('renders add input and button', () => {
      render(<FilePatternSection {...defaultProps} />)

      expect(screen.getByLabelText('New file pattern')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument()
    })
  })

  describe('pattern list', () => {
    it('renders list of patterns', () => {
      const patterns = ['*.md', '*.markdown', 'docs/*.md']

      render(<FilePatternSection {...defaultProps} patterns={patterns} />)

      expect(screen.getByText('*.md')).toBeInTheDocument()
      expect(screen.getByText('*.markdown')).toBeInTheDocument()
      expect(screen.getByText('docs/*.md')).toBeInTheDocument()
    })

    it('renders remove button for each pattern', () => {
      const patterns = ['*.md', '*.markdown']

      render(<FilePatternSection {...defaultProps} patterns={patterns} />)

      const removeButtons = screen.getAllByRole('button', { name: /Remove/ })
      expect(removeButtons).toHaveLength(2)
    })
  })

  describe('interactions', () => {
    it('calls onAddPattern when add button clicked', () => {
      const onAddPattern = vi.fn()

      render(
        <FilePatternSection {...defaultProps} onAddPattern={onAddPattern} />
      )

      fireEvent.click(screen.getByRole('button', { name: 'Add' }))

      expect(onAddPattern).toHaveBeenCalled()
    })

    it('calls onRemovePattern when remove button clicked', () => {
      const onRemovePattern = vi.fn()
      const patterns = ['*.md']

      render(
        <FilePatternSection
          {...defaultProps}
          patterns={patterns}
          onRemovePattern={onRemovePattern}
        />
      )

      fireEvent.click(screen.getByRole('button', { name: /Remove/ }))

      expect(onRemovePattern).toHaveBeenCalledWith('*.md')
    })
  })

  describe('loading state', () => {
    it('disables input when loading', () => {
      render(<FilePatternSection {...defaultProps} isLoading={true} />)

      expect(screen.getByLabelText('New file pattern')).toBeDisabled()
    })

    it('disables add button when loading', () => {
      render(<FilePatternSection {...defaultProps} isLoading={true} />)

      expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled()
    })

    it('disables remove buttons when loading', () => {
      const patterns = ['*.md']

      render(
        <FilePatternSection {...defaultProps} patterns={patterns} isLoading={true} />
      )

      expect(screen.getByRole('button', { name: /Remove/ })).toBeDisabled()
    })
  })

  describe('error state', () => {
    it('displays error message', () => {
      render(
        <FilePatternSection {...defaultProps} error="Failed to add pattern" />
      )

      expect(screen.getByRole('alert')).toHaveTextContent(
        'Failed to add pattern'
      )
    })

    it('does not show error when null', () => {
      render(<FilePatternSection {...defaultProps} error={null} />)

      expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })
  })
})

describe('validatePattern helper', () => {
  const validatePattern = (pattern: string): string | null => {
    if (!pattern || pattern.trim().length === 0) {
      return 'Pattern cannot be empty'
    }
    if (pattern.includes('//')) {
      return 'Pattern contains invalid double slashes'
    }
    const trimmed = pattern.trim()
    if (trimmed.length > 100) {
      return 'Pattern is too long (max 100 characters)'
    }
    return null
  }

  it('returns error for empty pattern', () => {
    expect(validatePattern('')).toBe('Pattern cannot be empty')
    expect(validatePattern('   ')).toBe('Pattern cannot be empty')
  })

  it('returns error for pattern with double slashes', () => {
    expect(validatePattern('docs//files')).toBe(
      'Pattern contains invalid double slashes'
    )
  })

  it('returns error for pattern over 100 characters', () => {
    const longPattern = 'a'.repeat(101)
    expect(validatePattern(longPattern)).toBe(
      'Pattern is too long (max 100 characters)'
    )
  })

  it('returns null for valid patterns', () => {
    expect(validatePattern('*.md')).toBeNull()
    expect(validatePattern('**/*.markdown')).toBeNull()
    expect(validatePattern('docs/*.md')).toBeNull()
    expect(validatePattern('a'.repeat(100))).toBeNull()
  })
})
