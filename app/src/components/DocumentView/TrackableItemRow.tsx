/**
 * TrackableItemRow component.
 * Renders a single trackable item (header, list item, or checkbox) from a markdown document.
 */

import type { TrackableItem, TrackingStatus } from '@/lib/parser/types'
import type { TrackableItemRowProps } from './types'
import { SectionProgressBar } from './SectionProgressBar'
import { highlightSearchText } from '@/hooks/useDocumentFilters'

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
  disabled: boolean,
  hasChildren: boolean,
  isCollapsed: boolean
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

  // Collapsible class (has children)
  if (hasChildren) {
    classes.push('trackable-item-row--collapsible')
  }

  // Collapsed class
  if (isCollapsed) {
    classes.push('trackable-item-row--collapsed')
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
  hasChildren = false,
  isCollapsed = false,
  onToggleCollapse,
  onClick,
  onActivate,
  progress,
  searchQuery,
}: TrackableItemRowProps) => {
  const handleClick = () => {
    // Single click just focuses the row (handled naturally by tabIndex)
    // No status change or editor opening on single click
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return
    if (event.key === 'Enter') {
      // Enter opens editor
      event.preventDefault()
      onClick?.(item)
    } else if (event.key === ' ') {
      // Space cycles status (for accessibility)
      event.preventDefault()
      onActivate?.(item)
    }
  }

  const handleChevronClick = (event: React.MouseEvent) => {
    event.stopPropagation()
    if (disabled) return
    onToggleCollapse?.(item)
  }

  const handleDoubleClick = () => {
    if (disabled) return
    // Double-click opens editor for any item
    onClick?.(item)
  }

  const indentLevel = getIndentLevel(item)
  const showChevron = item.type === 'header' && hasChildren
  const showProgress = item.type === 'header' && hasChildren && progress && progress.total > 0

  return (
    <div
      className={getRowClassNames(item, status, isFocused, disabled, hasChildren, isCollapsed)}
      style={{ '--indent-level': indentLevel } as React.CSSProperties}
      data-item-id={item.id}
      tabIndex={disabled ? -1 : 0}
      role="button"
      aria-label={`${item.type === 'header' ? `Heading level ${item.depth}` : item.type}: ${item.content}`}
      aria-pressed={status === 'complete'}
      aria-disabled={disabled}
      aria-expanded={hasChildren ? !isCollapsed : undefined}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {showChevron && (
        <button
          type="button"
          className={`chevron-button ${isCollapsed ? 'chevron-button--collapsed' : 'chevron-button--expanded'}`}
          onClick={handleChevronClick}
          aria-label={isCollapsed ? 'Expand section' : 'Collapse section'}
          tabIndex={-1}
        >
          <span className="chevron-icon" aria-hidden="true">
            ▶
          </span>
        </button>
      )}
      <span
        className={`item-type-badge item-type-badge--${item.type}${item.type === 'header' ? ` item-type-badge--h${item.depth}` : ''}`}
        aria-hidden="true"
      >
        {getTypeBadgeLabel(item)}
      </span>
      <span className="trackable-item-content">
        {searchQuery ? highlightSearchText(item.content, searchQuery) : item.content}
      </span>
      {showProgress && (
        <SectionProgressBar
          completed={progress.completed}
          total={progress.total}
          percentage={progress.percentage}
          isComplete={progress.percentage === 100}
        />
      )}
    </div>
  )
}
