/**
 * FilePatternSection component.
 * Manages glob patterns for matching markdown files.
 */

import { useState } from 'react'
import type { FilePatternSectionProps } from './types'

/**
 * Examples of common file patterns.
 */
const PATTERN_EXAMPLES = [
  { pattern: '*.md', description: 'Markdown files' },
  { pattern: '*.markdown', description: 'Markdown files (alt extension)' },
  { pattern: 'docs/*.md', description: 'Markdown files in docs folder' },
  { pattern: '**/*.md', description: 'All markdown files recursively' },
]

/**
 * Validates a glob pattern.
 * Returns an error message if invalid, null if valid.
 */
const validatePattern = (pattern: string): string | null => {
  if (!pattern || pattern.trim().length === 0) {
    return 'Pattern cannot be empty'
  }

  if (pattern.includes('//')) {
    return 'Pattern contains invalid double slashes'
  }

  // Basic validation - patterns should have some content
  const trimmed = pattern.trim()
  if (trimmed.length > 100) {
    return 'Pattern is too long (max 100 characters)'
  }

  return null
}

/**
 * Component for managing file patterns.
 */
export const FilePatternSection = ({
  patterns,
  onAddPattern,
  onRemovePattern,
  isLoading = false,
  error,
}: FilePatternSectionProps) => {
  const [newPattern, setNewPattern] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewPattern(value)

    // Clear validation error when typing
    if (validationError) {
      setValidationError(null)
    }
  }

  const handleAddClick = async () => {
    const trimmed = newPattern.trim()

    // Validate
    const error = validatePattern(trimmed)
    if (error) {
      setValidationError(error)
      return
    }

    // Check for duplicates
    if (patterns.includes(trimmed)) {
      setValidationError('This pattern already exists')
      return
    }

    await onAddPattern(trimmed)
    setNewPattern('')
    setValidationError(null)
  }

  const handleRemoveClick = async (pattern: string) => {
    await onRemovePattern(pattern)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddClick()
    }
  }

  return (
    <section className="settings-section">
      <div className="settings-section__header">
        <h2 className="settings-section__title">File Patterns</h2>
        <p className="settings-section__description">
          Glob patterns to match markdown files
        </p>
      </div>

      {error && (
        <div className="settings-section__error" role="alert">
          {error}
        </div>
      )}

      <div className="file-patterns">
        {patterns.length === 0 ? (
          <div className="file-patterns__empty">
            <p>No patterns configured.</p>
            <p className="file-patterns__hint">
              Add patterns like <code>*.md</code> to match files.
            </p>
          </div>
        ) : (
          <ul className="file-patterns__list" role="list">
            {patterns.map((pattern) => (
              <li key={pattern} className="file-pattern">
                <code className="file-pattern__value">{pattern}</code>
                <button
                  type="button"
                  className="file-pattern__remove"
                  onClick={() => handleRemoveClick(pattern)}
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
          <div className="file-patterns__input-group">
            <input
              type="text"
              className={`file-patterns__input ${validationError ? 'file-patterns__input--error' : ''}`}
              value={newPattern}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="e.g., *.md"
              disabled={isLoading}
              aria-label="New file pattern"
              aria-invalid={validationError !== null}
              aria-describedby={validationError ? 'pattern-error' : undefined}
            />
            <button
              type="button"
              className="settings-button settings-button--primary"
              onClick={handleAddClick}
              disabled={isLoading || !newPattern.trim()}
            >
              Add
            </button>
          </div>
          {validationError && (
            <p id="pattern-error" className="file-patterns__error" role="alert">
              {validationError}
            </p>
          )}
        </div>

        <div className="file-patterns__examples">
          <p className="file-patterns__examples-label">Examples:</p>
          <ul className="file-patterns__examples-list">
            {PATTERN_EXAMPLES.map((example) => (
              <li key={example.pattern} className="file-patterns__example">
                <code>{example.pattern}</code>
                <span>{example.description}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
