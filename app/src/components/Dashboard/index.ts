/**
 * Dashboard module exports.
 * Provides the main Dashboard view with file cards and sorting controls.
 */

// Components
export { Dashboard } from './Dashboard'
export { FileCard } from './FileCard'
export { ProgressBar } from './ProgressBar'
export { SortControls } from './SortControls'
export { ResumeSection } from './ResumeSection'
export { InProgressItem } from './InProgressItem'

// Types
export type {
  DashboardFile,
  DashboardNavigationTarget,
  DashboardProps,
  DashboardFilter,
  FileCardProps,
  ProgressBarProps,
  SortControlsProps,
  SortConfig,
  SortDirection,
  SortOption,
  UseDashboardResult,
} from './types'

// Styles (import in consuming components)
import './Dashboard.css'
