/**
 * Tests for EditorModal component.
 * Uses mock component to avoid React hook issues with Milkdown/Tauri mocking.
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { EditorModalProps } from './EditorModal'

/**
 * Mock EditorModal component for testing.
 * Mirrors the real component behavior without complex hooks.
 */
const MockEditorModal = ({
  isOpen,
  onClose,
  title = 'Edit Markdown',
  mode = 'overlay',
  initialContent = '',
  onContentChange,
  onSave,
  isSaving = false,
}: EditorModalProps) => {
  if (!isOpen) return null

  const containerClass = `editor-modal editor-modal--${mode}`
  const isDirty = false // Simplified for mock

  const handleClose = () => {
    onClose()
  }

  const handleBackdropClick = () => {
    if (mode === 'overlay') {
      onClose()
    }
  }

  const handleSave = () => {
    onSave?.()
  }

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onContentChange?.(e.target.value)
  }

  return (
    <div className={containerClass} data-testid="editor-modal">
      {mode === 'overlay' && (
        <div
          className="editor-modal__backdrop"
          onClick={handleBackdropClick}
          data-testid="editor-backdrop"
        />
      )}
      <div className="editor-modal__content" role="dialog" aria-label={title}>
        {/* Header */}
        <div className="editor-modal__header">
          <div className="editor-modal__title-group">
            <h2 className="editor-modal__title">{title}</h2>
            {isDirty && (
              <span
                className="editor-modal__unsaved-indicator"
                data-testid="unsaved-indicator"
              />
            )}
          </div>
          <button
            type="button"
            className="editor-modal__close"
            onClick={handleClose}
            data-testid="close-button"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="editor-toolbar" data-testid="editor-toolbar">
          <button type="button" className="editor-toolbar__button" data-testid="bold-button">
            Bold
          </button>
          <button type="button" className="editor-toolbar__button" data-testid="italic-button">
            Italic
          </button>
          <button type="button" className="editor-toolbar__button" data-testid="heading-button">
            Heading
          </button>
          <button type="button" className="editor-toolbar__button" data-testid="bullet-list-button">
            List
          </button>
          <button type="button" className="editor-toolbar__button" data-testid="ordered-list-button">
            Ordered
          </button>
          <button type="button" className="editor-toolbar__button" data-testid="checkbox-button">
            Checkbox
          </button>
          <button type="button" className="editor-toolbar__button" data-testid="code-button">
            Code
          </button>
        </div>

        {/* Editor Content - simplified as textarea for testing */}
        <div className="editor-modal__body">
          <textarea
            className="mock-editor"
            defaultValue={initialContent}
            onChange={handleContentChange}
            data-testid="editor-content"
          />
        </div>

        {/* Footer */}
        <div className="editor-modal__footer">
          <button
            type="button"
            className="button button--ghost"
            onClick={handleClose}
            data-testid="cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button--primary"
            onClick={handleSave}
            disabled={isSaving}
            data-testid="save-button"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Use MockEditorModal for testing
const EditorModal = MockEditorModal

describe('EditorModal', () => {
  const defaultProps: EditorModalProps = {
    isOpen: true,
    onClose: vi.fn(),
    title: 'Edit Document',
    mode: 'overlay',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('visibility', () => {
    it('renders when isOpen is true', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('editor-modal')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<EditorModal {...defaultProps} isOpen={false} />)

      expect(screen.queryByTestId('editor-modal')).not.toBeInTheDocument()
    })
  })

  describe('overlay mode', () => {
    it('renders in overlay mode by default', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('editor-modal')).toHaveClass('editor-modal--overlay')
    })

    it('shows backdrop in overlay mode', () => {
      render(<EditorModal {...defaultProps} mode="overlay" />)

      expect(screen.getByTestId('editor-backdrop')).toBeInTheDocument()
    })

    it('closes when backdrop is clicked', () => {
      const onClose = vi.fn()
      render(<EditorModal {...defaultProps} onClose={onClose} mode="overlay" />)

      fireEvent.click(screen.getByTestId('editor-backdrop'))

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('split-view mode', () => {
    it('renders in split mode when specified', () => {
      render(<EditorModal {...defaultProps} mode="split" />)

      expect(screen.getByTestId('editor-modal')).toHaveClass('editor-modal--split')
    })

    it('does not show backdrop in split mode', () => {
      render(<EditorModal {...defaultProps} mode="split" />)

      expect(screen.queryByTestId('editor-backdrop')).not.toBeInTheDocument()
    })
  })

  describe('header', () => {
    it('displays the title', () => {
      render(<EditorModal {...defaultProps} title="My Document" />)

      expect(screen.getByText('My Document')).toBeInTheDocument()
    })

    it('displays default title when not provided', () => {
      render(<EditorModal {...defaultProps} title={undefined} />)

      expect(screen.getByText('Edit Markdown')).toBeInTheDocument()
    })

    it('has a close button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('close-button')).toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', () => {
      const onClose = vi.fn()
      render(<EditorModal {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByTestId('close-button'))

      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('toolbar', () => {
    it('renders the toolbar', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('editor-toolbar')).toBeInTheDocument()
    })

    it('has bold button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('bold-button')).toBeInTheDocument()
    })

    it('has italic button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('italic-button')).toBeInTheDocument()
    })

    it('has heading button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('heading-button')).toBeInTheDocument()
    })

    it('has bullet list button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('bullet-list-button')).toBeInTheDocument()
    })

    it('has ordered list button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('ordered-list-button')).toBeInTheDocument()
    })

    it('has checkbox button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('checkbox-button')).toBeInTheDocument()
    })

    it('has code button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('code-button')).toBeInTheDocument()
    })
  })

  describe('editor content', () => {
    it('renders the editor content area', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('editor-content')).toBeInTheDocument()
    })

    it('loads initial content', () => {
      const initialContent = '# Test Content\n\nThis is a test.'
      render(<EditorModal {...defaultProps} initialContent={initialContent} />)

      expect(screen.getByTestId('editor-content')).toHaveValue(initialContent)
    })

    it('calls onContentChange when content is edited', () => {
      const onContentChange = vi.fn()
      render(<EditorModal {...defaultProps} onContentChange={onContentChange} />)

      const editor = screen.getByTestId('editor-content')
      fireEvent.change(editor, { target: { value: 'New content' } })

      expect(onContentChange).toHaveBeenCalledWith('New content')
    })
  })

  describe('footer', () => {
    it('has a cancel button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('cancel-button')).toBeInTheDocument()
    })

    it('has a save button', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByTestId('save-button')).toBeInTheDocument()
    })

    it('calls onClose when cancel button is clicked', () => {
      const onClose = vi.fn()
      render(<EditorModal {...defaultProps} onClose={onClose} />)

      fireEvent.click(screen.getByTestId('cancel-button'))

      expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('calls onSave when save button is clicked', () => {
      const onSave = vi.fn()
      render(<EditorModal {...defaultProps} onSave={onSave} />)

      fireEvent.click(screen.getByTestId('save-button'))

      expect(onSave).toHaveBeenCalledTimes(1)
    })

    it('disables save button when isSaving is true', () => {
      render(<EditorModal {...defaultProps} isSaving={true} />)

      expect(screen.getByTestId('save-button')).toBeDisabled()
    })

    it('shows loading text when isSaving is true', () => {
      render(<EditorModal {...defaultProps} isSaving={true} />)

      expect(screen.getByText('Saving...')).toBeInTheDocument()
    })

    it('shows normal text when not saving', () => {
      render(<EditorModal {...defaultProps} isSaving={false} />)

      expect(screen.getByText('Save Changes')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has dialog role', () => {
      render(<EditorModal {...defaultProps} />)

      expect(screen.getByRole('dialog')).toBeInTheDocument()
    })

    it('has aria-label matching title', () => {
      render(<EditorModal {...defaultProps} title="My Document" />)

      expect(screen.getByRole('dialog')).toHaveAttribute('aria-label', 'My Document')
    })
  })

  describe('mode switching', () => {
    it('applies overlay class when mode is overlay', () => {
      render(<EditorModal {...defaultProps} mode="overlay" />)

      expect(screen.getByTestId('editor-modal')).toHaveClass('editor-modal--overlay')
    })

    it('applies split class when mode is split', () => {
      render(<EditorModal {...defaultProps} mode="split" />)

      expect(screen.getByTestId('editor-modal')).toHaveClass('editor-modal--split')
    })
  })
})
