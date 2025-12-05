/**
 * Type definitions for Settings components.
 */

import type { WatchedDirectory } from '@/lib/watcher/types'
import type { ThemeOption, StorageStats } from '@/lib/settings/types'

/**
 * Props for the main Settings component.
 */
export interface SettingsProps {
  /** Callback when back button is clicked */
  onBack?: () => void
}

/**
 * Props for the WatchedDirectoriesSection component.
 */
export interface WatchedDirectoriesSectionProps {
  /** List of watched directories */
  directories: WatchedDirectory[]
  /** Callback to add a new directory */
  onAddDirectory: () => Promise<void>
  /** Callback to remove a directory */
  onRemoveDirectory: (path: string) => Promise<void>
  /** Callback to toggle directory enabled state */
  onToggleEnabled: (path: string, enabled: boolean) => Promise<void>
  /** Whether an operation is in progress */
  isLoading?: boolean
  /** Error message to display */
  error?: string | null
}

/**
 * Props for the FilePatternSection component.
 */
export interface FilePatternSectionProps {
  /** List of current file patterns */
  patterns: string[]
  /** Callback to add a pattern */
  onAddPattern: (pattern: string) => Promise<void>
  /** Callback to remove a pattern */
  onRemovePattern: (pattern: string) => Promise<void>
  /** Whether an operation is in progress */
  isLoading?: boolean
  /** Error message to display */
  error?: string | null
}

/**
 * Props for the DataManagementSection component.
 */
export interface DataManagementSectionProps {
  /** Storage statistics */
  stats?: StorageStats | null
  /** Callback to clear all data */
  onClearData: () => Promise<void>
  /** Callback to export data */
  onExportData: () => Promise<void>
  /** Callback to import data */
  onImportData: () => Promise<void>
  /** Whether an operation is in progress */
  isLoading?: boolean
  /** Error message to display */
  error?: string | null
  /** Success message to display */
  successMessage?: string | null
}

/**
 * Props for the AboutSection component.
 */
export interface AboutSectionProps {
  /** App version */
  version?: string
  /** Current theme */
  theme: ThemeOption
  /** Callback to change theme */
  onThemeChange: (theme: ThemeOption) => void
}

/**
 * Result of the useWatchedDirectories hook.
 */
export interface UseWatchedDirectoriesResult {
  /** List of watched directories */
  directories: WatchedDirectory[]
  /** Whether data is loading */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Add a new directory */
  addDirectory: () => Promise<void>
  /** Remove a directory */
  removeDirectory: (path: string) => Promise<void>
  /** Toggle directory enabled state */
  toggleEnabled: (path: string, enabled: boolean) => Promise<void>
  /** Reload directories */
  reload: () => Promise<void>
}
