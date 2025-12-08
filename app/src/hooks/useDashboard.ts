/**
 * useDashboard hook.
 * Manages state for the Dashboard component including file loading,
 * progress calculation, and sorting.
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getTrackedFiles, loadTrackedFiles } from '@/lib/files'
import { loadAllFileStates } from '@/lib/state'
import type { TrackedFile } from '@/lib/files/types'
import type { FileTrackingState } from '@/lib/state/types'
import type {
  DashboardFile,
  SortConfig,
  SortOption,
  UseDashboardResult,
} from '@/components/Dashboard/types'
import type { ParentProgress } from '@/lib/progress/types'

/**
 * Calculate progress from a file's tracking state.
 */
const calculateProgress = (
  trackingState: FileTrackingState | null,
  itemCount: number
): ParentProgress => {
  if (!trackingState || Object.keys(trackingState.items).length === 0) {
    return {
      total: itemCount,
      complete: 0,
      inProgress: 0,
      pending: itemCount,
      percentage: 0,
    }
  }

  const items = Object.values(trackingState.items)
  let complete = 0
  let inProgress = 0
  let _pending = 0

  for (const item of items) {
    switch (item.status) {
      case 'complete':
        complete++
        break
      case 'in_progress':
        inProgress++
        break
      case 'pending':
      default:
        _pending++
        break
    }
  }

  // Use document's total item count (not just tracked items)
  // pending = total items minus those explicitly tracked as complete or in_progress
  const actualPending = itemCount - complete - inProgress
  const percentage = itemCount > 0 ? Math.round((complete / itemCount) * 100) : 0

  return {
    total: itemCount,
    complete,
    inProgress,
    pending: actualPending,
    percentage,
  }
}

/**
 * Check if a file has any in-progress items.
 */
const hasInProgressItems = (trackingState: FileTrackingState | null): boolean => {
  if (!trackingState) return false
  return Object.values(trackingState.items).some(
    (item) => item.status === 'in_progress'
  )
}

/**
 * Get the most recent update timestamp from tracking state.
 */
const getLastWorkedAt = (trackingState: FileTrackingState | null): string | null => {
  if (!trackingState || Object.keys(trackingState.items).length === 0) {
    return null
  }

  let latest: string | null = null
  for (const item of Object.values(trackingState.items)) {
    if (!latest || item.updatedAt > latest) {
      latest = item.updatedAt
    }
  }
  return latest
}

/**
 * Convert TrackedFile to DashboardFile with progress data.
 */
const toDashboardFile = (
  file: TrackedFile,
  trackingState: FileTrackingState | null
): DashboardFile => ({
  ...file,
  progress: calculateProgress(trackingState, file.itemCount),
  hasInProgress: hasInProgressItems(trackingState),
  lastWorkedAt: getLastWorkedAt(trackingState),
})

/**
 * Sort comparator functions for each sort option.
 */
const sortComparators: Record<
  SortOption,
  (a: DashboardFile, b: DashboardFile, direction: 'asc' | 'desc') => number
> = {
  name: (a, b, direction) => {
    const result = a.fileName.localeCompare(b.fileName)
    return direction === 'asc' ? result : -result
  },
  progress: (a, b, direction) => {
    const result = a.progress.percentage - b.progress.percentage
    return direction === 'asc' ? result : -result
  },
  date: (a, b, direction) => {
    // null values go to the end
    if (!a.lastWorkedAt && !b.lastWorkedAt) return 0
    if (!a.lastWorkedAt) return direction === 'asc' ? 1 : -1
    if (!b.lastWorkedAt) return direction === 'asc' ? -1 : 1
    const result = a.lastWorkedAt.localeCompare(b.lastWorkedAt)
    return direction === 'asc' ? result : -result
  },
  items: (a, b, direction) => {
    const result = a.itemCount - b.itemCount
    return direction === 'asc' ? result : -result
  },
}

/**
 * Sort files based on the given configuration.
 */
const sortFiles = (files: DashboardFile[], config: SortConfig): DashboardFile[] => {
  const comparator = sortComparators[config.option]
  return [...files].sort((a, b) => comparator(a, b, config.direction))
}

/**
 * Hook for managing dashboard state including file loading, progress calculation, and sorting.
 */
export const useDashboard = (): UseDashboardResult => {
  const [trackedFiles, setTrackedFiles] = useState<TrackedFile[]>([])
  const [trackingStates, setTrackingStates] = useState<Record<string, FileTrackingState>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    option: 'date',
    direction: 'desc',
  })

  // Load files and their tracking states
  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Load tracked files list
      await loadTrackedFiles()
      const files = getTrackedFiles()
      setTrackedFiles(files)

      // Load tracking states for all files
      const statesMap = await loadAllFileStates()
      setTrackingStates(Object.fromEntries(statesMap))
    } catch (err) {
      let message: string
      if (err instanceof Error) {
        message = err.message
      } else if (typeof err === 'string') {
        message = err
      } else {
        message = 'Failed to load files'
      }
      console.error('useDashboard error:', err)
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load on mount
  useEffect(() => {
    loadData()
  }, [loadData])

  // Convert and sort files
  const files = useMemo(() => {
    const dashboardFiles = trackedFiles.map((file) =>
      toDashboardFile(file, trackingStates[file.path] ?? null)
    )
    return sortFiles(dashboardFiles, sortConfig)
  }, [trackedFiles, trackingStates, sortConfig])

  return {
    files,
    isLoading,
    error,
    sortConfig,
    setSortConfig,
    refresh: loadData,
  }
}
