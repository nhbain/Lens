/**
 * EditorToolbar - Formatting toolbar for Milkdown editor.
 * Provides buttons for common markdown formatting operations.
 */

import { useCallback, useState } from 'react'
import type { Editor, CmdKey } from '@milkdown/core'
import './EditorToolbar.css'

// Define command keys for formatting operations
// Note: Using double cast through unknown since CmdKey is a branded symbol type
const ToggleBoldCommand = 'ToggleStrong' as unknown as CmdKey
const ToggleItalicCommand = 'ToggleEmphasis' as unknown as CmdKey
const ToggleCodeCommand = 'ToggleInlineCode' as unknown as CmdKey
const WrapInHeadingCommand = 'WrapInHeading' as unknown as CmdKey
const WrapInBulletListCommand = 'WrapInBulletList' as unknown as CmdKey
const WrapInOrderedListCommand = 'WrapInOrderedList' as unknown as CmdKey
const ToggleStrikethroughCommand = 'ToggleStrikethrough' as unknown as CmdKey
const TurnIntoTaskListCommand = 'TurnIntoTaskList' as unknown as CmdKey

export interface EditorToolbarProps {
  /** Milkdown editor instance */
  editor: Editor | null
}

/**
 * EditorToolbar provides formatting buttons for the Milkdown editor.
 * Includes bold, italic, headings, lists, checkboxes, and code.
 */
export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  const [isHeadingDropdownOpen, setIsHeadingDropdownOpen] = useState(false)

  // Execute a command on the editor
  const executeCommand = useCallback(
    (commandKey: CmdKey, payload?: unknown) => {
      if (!editor) return

      try {
        editor.action((ctx) => {
          const commandRunner = ctx.get(commandKey)
          if (typeof commandRunner === 'function') {
            ;(commandRunner as (arg?: unknown) => void)(payload)
          }
        })
      } catch (error) {
        console.error('Failed to execute command:', error)
      }
    },
    [editor]
  )

  // Formatting handlers
  const handleBold = useCallback(() => {
    executeCommand(ToggleBoldCommand)
  }, [executeCommand])

  const handleItalic = useCallback(() => {
    executeCommand(ToggleItalicCommand)
  }, [executeCommand])

  const handleHeading = useCallback(
    (level: 1 | 2 | 3 | 4 | 5 | 6) => {
      executeCommand(WrapInHeadingCommand, level)
      setIsHeadingDropdownOpen(false)
    },
    [executeCommand]
  )

  const handleBulletList = useCallback(() => {
    executeCommand(WrapInBulletListCommand)
  }, [executeCommand])

  const handleOrderedList = useCallback(() => {
    executeCommand(WrapInOrderedListCommand)
  }, [executeCommand])

  const handleCheckbox = useCallback(() => {
    executeCommand(TurnIntoTaskListCommand)
  }, [executeCommand])

  const handleInlineCode = useCallback(() => {
    executeCommand(ToggleCodeCommand)
  }, [executeCommand])

  const handleStrikethrough = useCallback(() => {
    executeCommand(ToggleStrikethroughCommand)
  }, [executeCommand])

  return (
    <div className="editor-toolbar" role="toolbar" aria-label="Formatting toolbar">
      {/* Bold */}
      <button
        type="button"
        className="editor-toolbar__button"
        onClick={handleBold}
        disabled={!editor}
        title="Bold (Ctrl+B)"
        aria-label="Bold"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M4 2h5a3 3 0 0 1 3 3 3 3 0 0 1-1.5 2.6A3.5 3.5 0 0 1 9 14H4V2zm4 5a1.5 1.5 0 0 0 0-3H6v3h2zm1 5a2 2 0 0 0 0-4H6v4h3z"
            fill="currentColor"
          />
        </svg>
      </button>

      {/* Italic */}
      <button
        type="button"
        className="editor-toolbar__button"
        onClick={handleItalic}
        disabled={!editor}
        title="Italic (Ctrl+I)"
        aria-label="Italic"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 2h6v2h-2l-2 8h2v2H4v-2h2l2-8H6V2z" fill="currentColor" />
        </svg>
      </button>

      {/* Strikethrough */}
      <button
        type="button"
        className="editor-toolbar__button"
        onClick={handleStrikethrough}
        disabled={!editor}
        title="Strikethrough"
        aria-label="Strikethrough"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2 8h12M5 3h6a2 2 0 0 1 2 2v.5M5 13h6a2 2 0 0 0 2-2v-.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="editor-toolbar__separator" />

      {/* Headings Dropdown */}
      <div className="editor-toolbar__dropdown">
        <button
          type="button"
          className="editor-toolbar__button editor-toolbar__button--dropdown"
          onClick={() => setIsHeadingDropdownOpen(!isHeadingDropdownOpen)}
          disabled={!editor}
          title="Headings"
          aria-label="Headings"
          aria-expanded={isHeadingDropdownOpen}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2 2h2v5h4V2h2v12h-2V9H4v5H2V2z"
              fill="currentColor"
            />
          </svg>
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 2l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {isHeadingDropdownOpen && (
          <div className="editor-toolbar__dropdown-menu">
            {([1, 2, 3, 4, 5, 6] as const).map((level) => (
              <button
                key={level}
                type="button"
                className="editor-toolbar__dropdown-item"
                onClick={() => handleHeading(level)}
              >
                H{level}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="editor-toolbar__separator" />

      {/* Bullet List */}
      <button
        type="button"
        className="editor-toolbar__button"
        onClick={handleBulletList}
        disabled={!editor}
        title="Bullet List"
        aria-label="Bullet List"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="3" cy="3" r="1" fill="currentColor" />
          <circle cx="3" cy="8" r="1" fill="currentColor" />
          <circle cx="3" cy="13" r="1" fill="currentColor" />
          <rect x="6" y="2" width="8" height="2" rx="1" fill="currentColor" />
          <rect x="6" y="7" width="8" height="2" rx="1" fill="currentColor" />
          <rect x="6" y="12" width="8" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>

      {/* Ordered List */}
      <button
        type="button"
        className="editor-toolbar__button"
        onClick={handleOrderedList}
        disabled={!editor}
        title="Numbered List"
        aria-label="Numbered List"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 2h1v3H2V2zM2 7h1v3H2V7zM2 12h1v3H2v-3z" fill="currentColor" />
          <rect x="6" y="2" width="8" height="2" rx="1" fill="currentColor" />
          <rect x="6" y="7" width="8" height="2" rx="1" fill="currentColor" />
          <rect x="6" y="12" width="8" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>

      {/* Checkbox/Task List */}
      <button
        type="button"
        className="editor-toolbar__button"
        onClick={handleCheckbox}
        disabled={!editor}
        title="Task List"
        aria-label="Task List"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M3.5 4.5l1 1 2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="9" y="3" width="5" height="2" rx="1" fill="currentColor" />
          <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <rect x="9" y="10" width="5" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>

      <div className="editor-toolbar__separator" />

      {/* Inline Code */}
      <button
        type="button"
        className="editor-toolbar__button"
        onClick={handleInlineCode}
        disabled={!editor}
        title="Inline Code"
        aria-label="Inline Code"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M5 4L2 8l3 4M11 4l3 4-3 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  )
}
