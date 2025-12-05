/**
 * SortControls component.
 * Provides UI controls for sorting the dashboard file list.
 */

import type { SortControlsProps, SortOption, SortDirection } from './types'

/**
 * Sort option labels for display.
 */
const SORT_OPTION_LABELS: Record<SortOption, string> = {
  name: 'Name',
  progress: 'Progress',
  date: 'Last Worked',
  items: 'Items',
}

/**
 * Direction labels for accessibility.
 */
const DIRECTION_LABELS: Record<SortDirection, string> = {
  asc: 'Ascending',
  desc: 'Descending',
}

/**
 * Direction icons/symbols.
 */
const DIRECTION_ICONS: Record<SortDirection, string> = {
  asc: '↑',
  desc: '↓',
}

/**
 * All available sort options.
 */
const SORT_OPTIONS: SortOption[] = ['name', 'progress', 'date', 'items']

/**
 * Renders sort controls with a dropdown for sort field and toggle for direction.
 */
export const SortControls = ({
  sortConfig,
  onSortChange,
}: SortControlsProps) => {
  const handleOptionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newOption = event.target.value as SortOption
    onSortChange({
      ...sortConfig,
      option: newOption,
    })
  }

  const handleDirectionToggle = () => {
    const newDirection: SortDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc'
    onSortChange({
      ...sortConfig,
      direction: newDirection,
    })
  }

  return (
    <div className="sort-controls" role="group" aria-label="Sort options">
      <label htmlFor="sort-select" className="sort-controls__label">
        Sort by:
      </label>
      <select
        id="sort-select"
        className="sort-controls__select"
        value={sortConfig.option}
        onChange={handleOptionChange}
        aria-label="Sort by field"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {SORT_OPTION_LABELS[option]}
          </option>
        ))}
      </select>
      <button
        type="button"
        className="sort-controls__direction"
        onClick={handleDirectionToggle}
        aria-label={`Sort direction: ${DIRECTION_LABELS[sortConfig.direction]}. Click to toggle.`}
        title={`Sort ${DIRECTION_LABELS[sortConfig.direction]}`}
      >
        {DIRECTION_ICONS[sortConfig.direction]}
      </button>
    </div>
  )
}
