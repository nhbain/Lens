/**
 * FilterButtons component.
 * Renders a group of filter buttons for status filtering.
 */

import type { StatusFilter, StatusCounts } from '@/hooks/useDocumentFilters'
import { Button } from '@/lib/common-components'
import './FilterButtons.css'

export interface FilterButtonsProps {
  /** Currently active filter */
  activeFilter: StatusFilter
  /** Callback when filter changes */
  onFilterChange: (filter: StatusFilter) => void
  /** Item counts per status (for badges) */
  counts: StatusCounts
  /** Optional CSS class name */
  className?: string
}

const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'complete', label: 'Complete' },
]

/**
 * Renders a group of filter buttons for filtering items by status.
 */
export const FilterButtons = ({
  activeFilter,
  onFilterChange,
  counts,
  className = '',
}: FilterButtonsProps) => {
  return (
    <div className={`filter-buttons ${className}`.trim()} role="group" aria-label="Filter by status">
      {FILTER_OPTIONS.map(({ value, label }) => {
        const count = counts[value]
        const isActive = activeFilter === value

        return (
          <Button
            key={value}
            variant={isActive ? 'secondary' : 'ghost'}
            size="small"
            onClick={() => onFilterChange(value)}
            aria-pressed={isActive}
            className={`filter-button ${isActive ? 'filter-button--active' : ''}`}
          >
            {label}
            {count > 0 && (
              <span className="filter-button-count" aria-label={`${count} items`}>
                {count}
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
}
