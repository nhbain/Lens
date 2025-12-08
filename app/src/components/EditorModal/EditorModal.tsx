/**
 * EditorModal - Markdown editor component with Milkdown integration.
 * Supports overlay and split-view modes with WYSIWYG editing.
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { MilkdownProvider, Milkdown, useEditor } from '@milkdown/react'
import { Editor, rootCtx, defaultValueCtx } from '@milkdown/core'
import { commonmark } from '@milkdown/preset-commonmark'
import { gfm } from '@milkdown/preset-gfm'
import { listener, listenerCtx } from '@milkdown/plugin-listener'
import { Button } from '@/lib/common-components/Button/Button'
import { EditorToolbar } from './EditorToolbar'
import './EditorModal.css'

export type EditorMode = 'overlay' | 'split'

export interface EditorModalProps {
  /** Whether the modal is open */
  isOpen: boolean
  /** Callback when modal should close */
  onClose: () => void
  /** Modal title */
  title?: string
  /** Display mode: overlay (centered modal) or split (side-by-side) */
  mode?: EditorMode
  /** Initial markdown content */
  initialContent?: string
  /** Callback when content changes */
  onContentChange?: (content: string) => void
  /** Callback when save button is clicked */
  onSave?: () => void
  /** Whether the save operation is in progress */
  isSaving?: boolean
}

/**
 * Internal editor component that uses Milkdown hooks.
 */
const MilkdownEditor = ({
  initialContent,
  onContentChange,
  onEditorReady,
}: {
  initialContent: string
  onContentChange?: (content: string) => void
  onEditorReady?: (editor: Editor) => void
}) => {
  const editorRef = useRef<Editor | null>(null)

  const { get } = useEditor((root) => {
    const editor = Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root)
        ctx.set(defaultValueCtx, initialContent)

        // Set up content change listener
        ctx.get(listenerCtx).markdownUpdated((_, markdown) => {
          onContentChange?.(markdown)
        })
      })
      .use(commonmark)
      .use(gfm)
      .use(listener)

    return editor
  })

  useEffect(() => {
    const editor = get()
    if (editor) {
      editorRef.current = editor
      onEditorReady?.(editor)
    }
  }, [get, onEditorReady])

  return <Milkdown />
}

/**
 * EditorModal component with Milkdown WYSIWYG editor.
 * Renders in overlay or split-view mode with toolbar and unsaved changes detection.
 */
export const EditorModal = ({
  isOpen,
  onClose,
  title = 'Edit Markdown',
  mode = 'overlay',
  initialContent = '',
  onContentChange,
  onSave,
  isSaving = false,
}: EditorModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)
  const currentContentRef = useRef(initialContent)
  const [isDirty, setIsDirty] = useState(false)
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null)

  // Reset content tracking when initialContent changes
  // This is a valid pattern for resetting internal state when a prop changes
  const prevInitialContentRef = useRef(initialContent)
  useEffect(() => {
    if (prevInitialContentRef.current !== initialContent) {
      prevInitialContentRef.current = initialContent
      currentContentRef.current = initialContent
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDirty(false)
    }
  }, [initialContent])

  // Handle content changes
  const handleContentChange = useCallback(
    (content: string) => {
      currentContentRef.current = content
      setIsDirty(content !== initialContent)
      onContentChange?.(content)
    },
    [initialContent, onContentChange]
  )

  // Handle editor ready
  const handleEditorReady = useCallback((editor: Editor) => {
    setEditorInstance(editor)
  }, [])

  // Handle close with unsaved changes check
  const handleClose = useCallback(() => {
    if (isDirty) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmed) return
    }
    onClose()
  }, [isDirty, onClose])

  // Handle Escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose()
      }
    },
    [handleClose]
  )

  // Handle backdrop click (only in overlay mode)
  const handleBackdropClick = useCallback(() => {
    if (mode === 'overlay') {
      handleClose()
    }
  }, [mode, handleClose])

  // Handle save
  const handleSave = useCallback(() => {
    onSave?.()
  }, [onSave])

  // Setup and cleanup effects
  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousActiveElement.current = document.activeElement

      // Add event listeners
      document.addEventListener('keydown', handleKeyDown)

      // Prevent body scroll in overlay mode
      if (mode === 'overlay') {
        document.body.style.overflow = 'hidden'
      }

      // Focus the modal
      setTimeout(() => {
        modalRef.current?.focus()
      }, 0)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''

      // Restore focus
      if (previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus()
      }
    }
  }, [isOpen, handleKeyDown, mode])

  if (!isOpen) return null

  const containerClass = `editor-modal editor-modal--${mode}`

  const content = (
    <div className={containerClass}>
      {mode === 'overlay' && (
        <div
          className="editor-modal__backdrop"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="editor-modal__content"
        tabIndex={-1}
      >
        {/* Header */}
        <div className="editor-modal__header">
          <div className="editor-modal__title-group">
            <h2 className="editor-modal__title">{title}</h2>
            {isDirty && (
              <span
                className="editor-modal__unsaved-indicator"
                title="Unsaved changes"
                aria-label="Unsaved changes"
              />
            )}
          </div>
          <button
            type="button"
            className="editor-modal__close"
            onClick={handleClose}
            aria-label="Close editor"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15 5L5 15M5 5L15 15"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* Toolbar */}
        <EditorToolbar editor={editorInstance} />

        {/* Editor Content */}
        <div className="editor-modal__body">
          <MilkdownProvider>
            <MilkdownEditor
              initialContent={initialContent}
              onContentChange={handleContentChange}
              onEditorReady={handleEditorReady}
            />
          </MilkdownProvider>
        </div>

        {/* Footer */}
        <div className="editor-modal__footer">
          <Button variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            isLoading={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}
