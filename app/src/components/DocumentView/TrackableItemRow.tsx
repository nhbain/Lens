/**
 * TrackableItemRow component.
 * Renders a single trackable item (header, list item, or checkbox) from a markdown document.
 */

import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'
import type { TrackableItemRowProps } from './types'

/**
 * Get the display label for an item type badge.
 */
const getTypeBadgeLabel = (item: TrackableItem): string => {
  switch (item.type) {
    case 'header':
      return `H${item.depth}`
    case 'checkbox':
      return item.checked ? '☑' : '☐'
    case 'listItem':
      return item.ordered ? '#' : '•'
    default:
      return ''
  }
}

/**
 * Get CSS class names for the item row based on type and status.
 */
const getRowClassNames = (
  item: TrackableItem,
  status: TrackingStatus,
  isFocused: boolean,
  disabled: boolean
): string => {
  const classes = ['trackable-item-row']

  // Type-specific class
  classes.push(`trackable-item-row--${item.type}`)

  // Header level class
  if (item.type === 'header') {
    classes.push(`trackable-item-row--h${item.depth}`)
  }

  // Status class
  classes.push(`trackable-item-row--${status.replace('_', '-')}`)

  // Focus class
  if (isFocused) {
    classes.push('trackable-item-row--focused')
  }

  // Disabled class
  if (disabled) {
    classes.push('trackable-item-row--disabled')
  }

  return classes.join(' ')
}

/**
 * Calculate indentation level for non-header items.
 * Headers use their depth for typography, lists use depth for indentation.
 */
const getIndentLevel = (item: TrackableItem): number => {
  if (item.type === 'header') {
    // Headers don't indent based on level, they use typography
    return 0
  }
  return item.depth
}

/**
 * Renders a single trackable item with type indicator, content, and status styling.
 */
export const TrackableItemRow = ({
  item,
  status,
  isFocused,
  disabled = false,
  onClick,
  onActivate,
}: TrackableItemRowProps) => {
  const handleClick = () => {
    if (disabled) return
    onClick?.(item)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onActivate?.(item)
    }
  }

  const indentLevel = getIndentLevel(item)

  return (
    <div
      className={getRowClassNames(item, status, isFocused, disabled)}
      style={{ '--indent-level': indentLevel } as React.CSSProperties}
      data-item-id={item.id}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`${item.type === 'header' ? `Heading level ${item.depth}` : item.type}: ${item.content}`}
      aria-pressed={status === 'complete'}
      aria-disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <span
        className={`item-type-badge item-type-badge--${item.type}${item.type === 'header' ? ` item-type-badge--h${item.depth}` : ''}`}
        aria-hidden="true"
      >
        {getTypeBadgeLabel(item)}
      </span>
      <span className="trackable-item-content">{item.content}</span>
    </div>
  )
}
