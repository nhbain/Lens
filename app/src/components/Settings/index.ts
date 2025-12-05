/**
 * Settings module exports.
 * Provides the Settings view and related components.
 */

// Components
export { Settings } from './Settings'
export { WatchedDirectoriesSection } from './WatchedDirectoriesSection'
export { FilePatternSection } from './FilePatternSection'
export { DataManagementSection } from './DataManagementSection'

// Types
export type {
  SettingsProps,
  WatchedDirectoriesSectionProps,
  FilePatternSectionProps,
  DataManagementSectionProps,
  AboutSectionProps,
  UseWatchedDirectoriesResult,
} from './types'

export type { SettingsViewProps } from './Settings'

// Styles (import in consuming components)
import './Settings.css'
