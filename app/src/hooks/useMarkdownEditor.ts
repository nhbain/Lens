/**
 * useMarkdownEditor hook.
 * Manages state and logic for editing markdown content with auto-save and manual save.
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { readTextFile } from '@tauri-apps/plugin-fs'
import { extractMarkdownSlice } from '@/lib/editor/markdown-slice'
import { writeSourceFile, type WriteResult } from '@/lib/editor/source-file-operations'
import type { TrackableItem } from '@/lib/parser/types'
import type { EditorSettings } from '@/lib/settings/types'

/**
 * Result of a save operation from the hook.
 */
export interface SaveResult {
  /** Whether the save was successful */
  success: boolean
  /** Error message if save failed */
  error?: string
  /** Path to backup file if one was created */
  backupPath?: string
}

/**
 * Options for the useMarkdownEditor hook.
 */
export interface UseMarkdownEditorOptions {
  /** Editor settings for auto-save behavior */
  editorSettings?: EditorSettings
  /** Callback when save succeeds */
  onSaveSuccess?: () => void
  /** Callback when save fails */
  onSaveError?: (error: string) => void
}

/**
 * Result of the useMarkdownEditor hook.
 */
export interface UseMarkdownEditorResult {
  /** The item currently being edited, or null if no item is open */
  editingItem: TrackableItem | null
  /** The original content when the editor was opened */
  originalContent: string
  /** The current content (may be modified) */
  currentContent: string
  /** Whether the current content differs from the original */
  isDirty: boolean
  /** Whether a save operation is in progress */
  isSaving: boolean
  /** Source file path for the currently editing item */
  sourcePath: string
  /** Open the editor for a specific item */
  openEditor: (item: TrackableItem, sourcePath: string) => Promise<void>
  /** Close the editor (with dirty check) */
  closeEditor: () => boolean
  /** Update the current content */
  updateContent: (content: string) => void
  /** Manually save the current content */
  saveContent: () => Promise<SaveResult>
}

/**
 * Debounce utility function.
 */
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const debouncedFunc = function (this: unknown, ...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args)
      timeoutId = null
    }, delay)
  } as T & { cancel: () => void }

  debouncedFunc.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debouncedFunc
}

/**
 * Hook for managing markdown editor state and save operations.
 * Handles content extraction, editing, auto-save, and writing back to source files.
 */
export const useMarkdownEditor = ({
  editorSettings,
  onSaveSuccess,
  onSaveError,
}: UseMarkdownEditorOptions = {}): UseMarkdownEditorResult => {
  // State
  const [editingItem, setEditingItem] = useState<TrackableItem | null>(null)
  const [sourcePath, setSourcePath] = useState<string>('')
  const [originalContent, setOriginalContent] = useState<string>('')
  const [currentContent, setCurrentContent] = useState<string>('')
  const [isSaving, setIsSaving] = useState<boolean>(false)

  // Track if we've shown unsaved changes prompt
  const hasPromptedRef = useRef<boolean>(false)

  // Refs for stable access in debounced function (avoids dependency on state)
  const editingItemRef = useRef<TrackableItem | null>(null)
  const isDirtyRef = useRef<boolean>(false)
  const isSavingRef = useRef<boolean>(false)
  const currentContentRef = useRef<string>('')
  const sourcePathRef = useRef<string>('')

  // Compute dirty flag
  const isDirty = useMemo(() => {
    return currentContent !== originalContent
  }, [currentContent, originalContent])

  // Sync refs with state (for stable access in debounced function)
  useEffect(() => { editingItemRef.current = editingItem }, [editingItem])
  useEffect(() => { isDirtyRef.current = isDirty }, [isDirty])
  useEffect(() => { isSavingRef.current = isSaving }, [isSaving])
  useEffect(() => { currentContentRef.current = currentContent }, [currentContent])
  useEffect(() => { sourcePathRef.current = sourcePath }, [sourcePath])

  /**
   * Open the editor for a specific item.
   * Extracts the markdown slice for the item and loads it into the editor.
   */
  const openEditor = useCallback(async (item: TrackableItem, itemSourcePath: string) => {
    try {
      // Read the full source file
      const fullContent = await readTextFile(itemSourcePath)

      // Extract the markdown slice for this item
      const slice = extractMarkdownSlice(fullContent, item)

      // Set editor state
      setEditingItem(item)
      setSourcePath(itemSourcePath)
      setOriginalContent(slice)
      setCurrentContent(slice)
      hasPromptedRef.current = false
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Failed to open editor:', error)
      throw new Error(`Failed to load item content: ${message}`)
    }
  }, [])

  /**
   * Close the editor.
   * Prompts the user if there are unsaved changes.
   * @returns true if the editor was closed, false if the user cancelled
   */
  const closeEditor = useCallback((): boolean => {
    if (isDirty && !hasPromptedRef.current) {
      const confirmed = window.confirm(
        'You have unsaved changes. Are you sure you want to close?'
      )
      if (!confirmed) {
        return false
      }
      hasPromptedRef.current = true
    }

    // Clear editor state
    setEditingItem(null)
    setSourcePath('')
    setOriginalContent('')
    setCurrentContent('')
    hasPromptedRef.current = false

    return true
  }, [isDirty])

  /**
   * Update the current content.
   * Sets the dirty flag if the content differs from the original.
   */
  const updateContent = useCallback((content: string) => {
    setCurrentContent(content)
  }, [])

  /**
   * Internal save implementation that reads from refs.
   * This allows the function to be stable while still accessing current values.
   * Used by auto-save to avoid dependency chain that causes focus loss.
   */
  const performSave = useCallback(async (): Promise<SaveResult> => {
    const item = editingItemRef.current
    const path = sourcePathRef.current
    const content = currentContentRef.current

    if (!item || !path) {
      return {
        success: false,
        error: 'No item is currently being edited',
      }
    }

    // Check dirty using current values from refs
    if (!isDirtyRef.current) {
      return {
        success: true,
      }
    }

    // Prevent concurrent saves
    if (isSavingRef.current) {
      return {
        success: false,
        error: 'Save already in progress',
      }
    }

    setIsSaving(true)

    try {
      const fullContent = await readTextFile(path)
      const lines = fullContent.split('\n')

      if (
        item.position.endLine === undefined ||
        item.position.endColumn === undefined
      ) {
        throw new Error('Item does not have end position information')
      }

      const beforeLines = lines.slice(0, item.position.line - 1)
      const afterLines = lines.slice(item.position.endLine)
      const newContent = [...beforeLines, content, ...afterLines].join('\n')

      const writeResult: WriteResult = await writeSourceFile(path, newContent, true)

      if (!writeResult.success) {
        throw new Error(writeResult.error ?? 'Failed to write file')
      }

      setOriginalContent(content)
      onSaveSuccess?.()

      return {
        success: true,
        backupPath: writeResult.backupPath,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Failed to save content:', error)
      onSaveError?.(message)

      return {
        success: false,
        error: message,
      }
    } finally {
      setIsSaving(false)
    }
  }, [onSaveSuccess, onSaveError])

  /**
   * Save the current content back to the source file.
   * Implements the content replacement logic: read full file, replace slice, write back.
   */
  const saveContent = useCallback(async (): Promise<SaveResult> => {
    if (!editingItem || !sourcePath) {
      return {
        success: false,
        error: 'No item is currently being edited',
      }
    }

    if (!isDirty) {
      return {
        success: true,
      }
    }

    setIsSaving(true)

    try {
      // Read the full source file
      const fullContent = await readTextFile(sourcePath)
      const lines = fullContent.split('\n')

      // Validate that we have end position information
      if (
        editingItem.position.endLine === undefined ||
        editingItem.position.endColumn === undefined
      ) {
        throw new Error('Item does not have end position information')
      }

      // Replace lines from item.position.line to item.position.endLine
      // Note: positions are 1-indexed, but array indices are 0-indexed
      const beforeLines = lines.slice(0, editingItem.position.line - 1)
      const afterLines = lines.slice(editingItem.position.endLine)

      // Combine: before + edited content + after
      const newContent = [...beforeLines, currentContent, ...afterLines].join('\n')

      // Write back to the source file (with backup)
      const writeResult: WriteResult = await writeSourceFile(sourcePath, newContent, true)

      if (!writeResult.success) {
        throw new Error(writeResult.error ?? 'Failed to write file')
      }

      // Update original content to match current (no longer dirty)
      setOriginalContent(currentContent)

      // Call success callback
      onSaveSuccess?.()

      return {
        success: true,
        backupPath: writeResult.backupPath,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error('Failed to save content:', error)

      // Call error callback
      onSaveError?.(message)

      return {
        success: false,
        error: message,
      }
    } finally {
      setIsSaving(false)
    }
  }, [editingItem, sourcePath, currentContent, isDirty, onSaveSuccess, onSaveError])

  // Auto-save with debounce - reads from refs for stable reference
  const debouncedSave = useMemo(() => {
    if (!editorSettings?.autoSave) {
      return null
    }

    return debounce(() => {
      // Read from refs to avoid dependency on state (which causes recreating this function)
      if (editingItemRef.current && isDirtyRef.current && !isSavingRef.current) {
        performSave()
      }
    }, editorSettings.autoSaveDelay ?? 2000)
  }, [editorSettings?.autoSave, editorSettings?.autoSaveDelay, performSave])

  // Trigger auto-save when content changes (if enabled)
  // Only depends on currentContent to avoid re-running on isDirty/isSaving state changes
  useEffect(() => {
    if (debouncedSave && isDirtyRef.current && !isSavingRef.current) {
      debouncedSave()
    }
  }, [currentContent, debouncedSave])

  // Cleanup debounced function on unmount or when debouncedSave changes
  useEffect(() => {
    return () => {
      debouncedSave?.cancel()
    }
  }, [debouncedSave])

  // Keyboard shortcut: Cmd/Ctrl+S for manual save
  useEffect(() => {
    if (!editingItem) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 's') {
        event.preventDefault()
        saveContent()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editingItem, saveContent])

  return {
    editingItem,
    originalContent,
    currentContent,
    isDirty,
    isSaving,
    sourcePath,
    openEditor,
    closeEditor,
    updateContent,
    saveContent,
  }
}
