/**
 * SortControls component.
 * Provides UI controls for sorting the dashboard file list.
 */

import { Button, Select, type SelectOption } from '@/lib/common-components'
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
 * All available sort options as SelectOption array.
 */
const SORT_OPTIONS: SelectOption[] = [
  { value: 'name', label: SORT_OPTION_LABELS['name'] },
  { value: 'progress', label: SORT_OPTION_LABELS['progress'] },
  { value: 'date', label: SORT_OPTION_LABELS['date'] },
  { value: 'items', label: SORT_OPTION_LABELS['items'] },
]

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
      <Select
        label="Sort by:"
        options={SORT_OPTIONS}
        value={sortConfig.option}
        onChange={handleOptionChange}
        size="small"
        className="sort-controls__select"
      />
      <Button
        variant="ghost"
        size="small"
        onClick={handleDirectionToggle}
        aria-label={`Sort direction: ${DIRECTION_LABELS[sortConfig.direction]}. Click to toggle.`}
        className="sort-controls__direction"
      >
        {DIRECTION_ICONS[sortConfig.direction]}
      </Button>
    </div>
  )
}
