/**
 * Type definitions for the Dashboard component.
 */

import type { TrackedFile } from '@/lib/files/types'
import type { ParentProgress } from '@/lib/progress/types'

/**
 * Extended file information for dashboard display.
 * Combines TrackedFile with calculated progress data.
 */
export interface DashboardFile extends TrackedFile {
  /** Progress information calculated from item statuses */
  progress: ParentProgress
  /** Whether the file has any in-progress items */
  hasInProgress: boolean
  /** ISO timestamp when the file was last worked on (status changed) */
  lastWorkedAt: string | null
}

/**
 * Available sort options for the dashboard file list.
 */
export type SortOption = 'name' | 'progress' | 'date' | 'items'

/**
 * Sort direction.
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Sort configuration combining option and direction.
 */
export interface SortConfig {
  /** Field to sort by */
  option: SortOption
  /** Sort direction */
  direction: SortDirection
}

/**
 * Filter configuration for future filtering capabilities.
 */
export interface DashboardFilter {
  /** Show only files with in-progress items */
  inProgressOnly?: boolean
  /** Minimum progress percentage */
  minProgress?: number
  /** Maximum progress percentage */
  maxProgress?: number
  /** Search text to filter by file name */
  searchText?: string
}

/**
 * Props for the ProgressBar component.
 */
export interface ProgressBarProps {
  /** Completion percentage (0-100) */
  percentage: number
  /** Whether to show the percentage text */
  showLabel?: boolean
  /** Size variant */
  size?: 'small' | 'medium' | 'large'
  /** Whether to animate changes */
  animated?: boolean
}

/**
 * Props for the FileCard component.
 */
export interface FileCardProps {
  /** File data to display */
  file: DashboardFile
  /** Whether this card is currently selected */
  isSelected?: boolean
  /** Callback when the card is clicked */
  onClick?: (file: DashboardFile) => void
}

/**
 * Props for the SortControls component.
 */
export interface SortControlsProps {
  /** Current sort configuration */
  sortConfig: SortConfig
  /** Callback when sort changes */
  onSortChange: (config: SortConfig) => void
}

/**
 * Navigation target for resume item clicks.
 */
export interface DashboardNavigationTarget {
  /** File to navigate to */
  file: DashboardFile
  /** Optional item ID to scroll to and highlight */
  targetItemId?: string
}

/**
 * Props for the Dashboard component.
 */
export interface DashboardProps {
  /** Callback when a file is selected */
  onFileSelect?: (file: DashboardFile) => void
  /** Callback to add a new file */
  onAddFile?: () => void
  /** Currently selected file path */
  selectedPath?: string
  /** Callback when a resume item is clicked (includes targetItemId) */
  onResumeItemClick?: (target: DashboardNavigationTarget) => void
}

/**
 * State returned by the useDashboard hook.
 */
export interface UseDashboardResult {
  /** List of files with progress data, sorted according to current config */
  files: DashboardFile[]
  /** Whether files are currently loading */
  isLoading: boolean
  /** Error message if loading failed */
  error: string | null
  /** Current sort configuration */
  sortConfig: SortConfig
  /** Update sort configuration */
  setSortConfig: (config: SortConfig) => void
  /** Refresh the file list */
  refresh: () => Promise<void>
}
