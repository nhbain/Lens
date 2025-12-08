/**
 * Markdown slice extraction utilities.
 * Extracts markdown content for specific items from source documents.
 */

import type { TrackableItem } from '../parser/types'

/**
 * Extracts the markdown slice for a trackable item and its children.
 * Uses line numbers from the item's position to cut the exact content from the source.
 *
 * @param sourceContent - The complete markdown source content as a string
 * @param item - The trackable item to extract content for
 * @returns The markdown content for this item including all its children
 *
 * @example
 * ```typescript
 * const markdown = "# Header\n\n- Item 1\n- Item 2";
 * const item = { position: { line: 1, column: 1, endLine: 1, endColumn: 9 }, ... };
 * const slice = extractMarkdownSlice(markdown, item);
 * // Returns: "# Header"
 * ```
 */
export function extractMarkdownSlice(
  sourceContent: string,
  item: TrackableItem
): string {
  // Validate that the item has end position information
  if (
    item.position.endLine === undefined ||
    item.position.endColumn === undefined
  ) {
    throw new Error(
      'Item must have end position information (endLine and endColumn)'
    )
  }

  // Split content into lines
  const lines = sourceContent.split('\n')

  // Extract lines (convert from 1-indexed to 0-indexed)
  const startLineIndex = item.position.line - 1
  const endLineIndex = item.position.endLine - 1

  // Validate line indices
  if (startLineIndex < 0 || startLineIndex >= lines.length) {
    throw new Error(
      `Start line ${item.position.line} is out of bounds (total lines: ${lines.length})`
    )
  }

  if (endLineIndex < 0 || endLineIndex >= lines.length) {
    throw new Error(
      `End line ${item.position.endLine} is out of bounds (total lines: ${lines.length})`
    )
  }

  if (endLineIndex < startLineIndex) {
    throw new Error(
      `End line ${item.position.endLine} cannot be before start line ${item.position.line}`
    )
  }

  // Handle single-line extraction
  if (startLineIndex === endLineIndex) {
    const line = lines[startLineIndex]
    // Extract substring from start column to end column (columns are 1-indexed)
    // mdast endColumn points to the position AFTER the last character
    const startCol = item.position.column - 1
    const endCol = item.position.endColumn - 1

    // Validate column indices
    if (startCol < 0 || startCol > line.length) {
      throw new Error(
        `Start column ${item.position.column} is out of bounds for line ${item.position.line}`
      )
    }

    // endCol can be equal to line.length (points after last char)
    if (endCol < 0 || endCol > line.length) {
      throw new Error(
        `End column ${item.position.endColumn} is out of bounds for line ${item.position.endLine}`
      )
    }

    return line.substring(startCol, endCol)
  }

  // Handle multi-line extraction
  const extractedLines: string[] = []

  // First line: from start column to end of line
  const firstLine = lines[startLineIndex]
  const startCol = item.position.column - 1
  if (startCol < 0 || startCol > firstLine.length) {
    throw new Error(
      `Start column ${item.position.column} is out of bounds for line ${item.position.line}`
    )
  }
  extractedLines.push(firstLine.substring(startCol))

  // Middle lines: complete lines
  for (let i = startLineIndex + 1; i < endLineIndex; i++) {
    extractedLines.push(lines[i])
  }

  // Last line: from start of line to end column
  const lastLine = lines[endLineIndex]
  const endCol = item.position.endColumn - 1
  // endCol can be equal to lastLine.length (points after last char)
  if (endCol < 0 || endCol > lastLine.length) {
    throw new Error(
      `End column ${item.position.endColumn} is out of bounds for line ${item.position.endLine}`
    )
  }
  extractedLines.push(lastLine.substring(0, endCol))

  return extractedLines.join('\n')
}
