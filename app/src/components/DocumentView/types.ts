/**
 * Types for the DocumentView component.
 * Defines props interfaces for rendering parsed markdown documents.
 */

import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'

/**
 * Props for the DocumentView component.
 * Renders a parsed markdown document with trackable items.
 */
export interface DocumentViewProps {
  /** Flat list of trackable items to display */
  items: TrackableItem[]

  /** Optional title to display at the top of the document */
  title?: string

  /** Optional path to the source file (for display purposes) */
  filePath?: string

  /** Map of item IDs to their tracking status */
  itemStatuses?: Record<string, TrackingStatus>

  /** Callback when an item is clicked */
  onItemClick?: (item: TrackableItem) => void

  /** Callback when an item's status should change (for future use) */
  onItemStatusChange?: (itemId: string, status: TrackingStatus) => void

  /** Whether the document is currently loading */
  isLoading?: boolean

  /** Optional ID of an item to scroll to and highlight on mount */
  targetItemId?: string
}

/**
 * Props for the TrackableItemRow component.
 * Renders a single trackable item within the document view.
 */
export interface TrackableItemRowProps {
  /** The trackable item to render */
  item: TrackableItem

  /** Current tracking status of this item */
  status: TrackingStatus

  /** Whether this item currently has keyboard focus */
  isFocused: boolean

  /** Whether this item is disabled (e.g., during save operation) */
  disabled?: boolean

  /** Callback when the item is clicked */
  onClick?: (item: TrackableItem) => void

  /** Callback when the item should be activated (Enter/Space key) */
  onActivate?: (item: TrackableItem) => void
}
