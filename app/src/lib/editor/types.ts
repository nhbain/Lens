/**
 * Types for the editor module.
 * Defines interfaces for markdown editing operations.
 */

/**
 * Result of extracting a markdown slice.
 */
export interface MarkdownSlice {
  /** The extracted markdown content */
  content: string
  /** Start line number (1-indexed) */
  startLine: number
  /** End line number (1-indexed) */
  endLine: number
  /** Start column number (1-indexed) */
  startColumn: number
  /** End column number (1-indexed) */
  endColumn: number
}
