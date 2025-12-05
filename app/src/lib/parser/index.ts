/**
 * Markdown Parser Module
 *
 * Provides functionality to parse markdown documents and extract trackable items
 * such as headers, list items, and checkboxes with hierarchy preservation.
 *
 * @example
 * ```ts
 * import { parseMarkdown, parseDocument } from '@/lib/parser'
 *
 * const content = `
 * # Project Tasks
 *
 * - [ ] Task 1
 * - [x] Task 2
 * `
 *
 * const ast = parseMarkdown(content)
 * const doc = parseDocument(ast, '/path/to/file.md')
 *
 * console.log(doc.itemCount) // 3
 * console.log(doc.items[0].type) // 'header'
 * ```
 *
 * @module parser
 */

// Core parsing
export { parseMarkdown } from './markdown-parser'

// Item extraction
export {
  extractItems,
  buildTree,
  flattenTree,
  parseDocument,
} from './item-extractor'

// Types
export type {
  TrackableItem,
  TrackableItemType,
  TrackingStatus,
  ParsedDocument,
  Position,
} from './types'

// Type guards
export {
  isTrackableItem,
  isTrackableItemType,
  isTrackingStatus,
  isParsedDocument,
  isPosition,
} from './types'

// Re-export mdast types for consumers who need to work with the AST
export type { Root, Heading, List, ListItem } from 'mdast'
