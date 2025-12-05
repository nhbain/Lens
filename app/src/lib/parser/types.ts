/**
 * Types for the markdown parser module.
 * Defines the data model for trackable items extracted from markdown documents.
 */

/**
 * Types of trackable items that can be extracted from markdown.
 */
export type TrackableItemType = 'header' | 'listItem' | 'checkbox'

/**
 * Tracking status for an item.
 * - pending: Not started
 * - in_progress: Currently being worked on
 * - complete: Finished
 */
export type TrackingStatus = 'pending' | 'in_progress' | 'complete'

/**
 * Position information for an item in the source document.
 */
export interface Position {
  /** Line number (1-indexed) */
  line: number
  /** Column number (1-indexed) */
  column: number
}

/**
 * A trackable item extracted from a markdown document.
 * Represents headers, list items, or checkboxes that can be tracked for progress.
 */
export interface TrackableItem {
  /** Unique identifier for this item (hash of position + content) */
  id: string

  /** The type of markdown element this item represents */
  type: TrackableItemType

  /** Text content of the item (e.g., header text, list item text) */
  content: string

  /**
   * Depth/level of the item:
   * - For headers: 1-6 corresponding to H1-H6
   * - For list items: nesting level (0 = top-level)
   * - For checkboxes: nesting level (0 = top-level)
   */
  depth: number

  /** Position of the item in the source document */
  position: Position

  /**
   * For checkboxes: whether the checkbox is checked in the source markdown.
   * Undefined for non-checkbox items.
   */
  checked?: boolean

  /**
   * For list items: whether this is part of an ordered list.
   * Undefined for non-list items.
   */
  ordered?: boolean

  /** Child items (nested list items, items under a header) */
  children: TrackableItem[]
}

/**
 * Result of parsing a markdown document.
 * Contains both a flat list and a hierarchical tree of trackable items.
 */
export interface ParsedDocument {
  /** Path to the source file (if known) */
  sourcePath?: string

  /** Flat list of all trackable items in document order */
  items: TrackableItem[]

  /** Hierarchical tree of items (headers contain their children) */
  tree: TrackableItem[]

  /** Timestamp when the document was parsed */
  parsedAt: Date

  /** Total count of trackable items */
  itemCount: number
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Checks if a value is a valid TrackableItemType.
 */
export function isTrackableItemType(value: unknown): value is TrackableItemType {
  return value === 'header' || value === 'listItem' || value === 'checkbox'
}

/**
 * Checks if a value is a valid TrackingStatus.
 */
export function isTrackingStatus(value: unknown): value is TrackingStatus {
  return value === 'pending' || value === 'in_progress' || value === 'complete'
}

/**
 * Checks if a value is a valid Position object.
 */
export function isPosition(value: unknown): value is Position {
  if (typeof value !== 'object' || value === null) return false
  const pos = value as Record<string, unknown>
  return typeof pos.line === 'number' && typeof pos.column === 'number'
}

/**
 * Checks if a value is a valid TrackableItem.
 */
export function isTrackableItem(value: unknown): value is TrackableItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>

  return (
    typeof item.id === 'string' &&
    isTrackableItemType(item.type) &&
    typeof item.content === 'string' &&
    typeof item.depth === 'number' &&
    isPosition(item.position) &&
    Array.isArray(item.children)
  )
}

/**
 * Checks if a value is a valid ParsedDocument.
 */
export function isParsedDocument(value: unknown): value is ParsedDocument {
  if (typeof value !== 'object' || value === null) return false
  const doc = value as Record<string, unknown>

  return (
    Array.isArray(doc.items) &&
    Array.isArray(doc.tree) &&
    doc.parsedAt instanceof Date &&
    typeof doc.itemCount === 'number'
  )
}
