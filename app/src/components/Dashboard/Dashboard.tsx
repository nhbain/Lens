/**
 * Dashboard component.
 * Main view showing all tracked files with progress information.
 */

import { useEffect } from 'react'
import { FileCard } from './FileCard'
import { SortControls } from './SortControls'
import { ResumeSection } from './ResumeSection'
import { Button } from '@/lib/common-components'
import { useDashboard } from '@/hooks/useDashboard'
import { useInProgressItems } from '@/hooks/useInProgressItems'
import type { DashboardProps, DashboardFile, DashboardNavigationTarget } from './types'
import type { InProgressItemSummary } from '@/lib/navigation/types'

/**
 * Empty state component shown when no files are tracked.
 */
const EmptyState = ({ onAddFile }: { onAddFile?: () => void }) => (
  <div className="dashboard__empty">
    <p className="dashboard__empty-message">No documents being tracked yet.</p>
    <p className="dashboard__empty-hint">
      Add a markdown file to start tracking your progress.
    </p>
    {onAddFile && (
      <Button
        variant="primary"
        onClick={onAddFile}
        className="dashboard__add-button dashboard__add-button--primary"
      >
        Add File
      </Button>
    )}
  </div>
)

/**
 * Loading state component shown while files are loading.
 */
const LoadingState = () => (
  <div className="dashboard__loading" role="status" aria-label="Loading files">
    <p>Loading your documents...</p>
  </div>
)

/**
 * Error state component shown when loading fails.
 */
const ErrorState = ({ message }: { message: string }) => (
  <div className="dashboard__error" role="alert">
    <p className="dashboard__error-message">Error: {message}</p>
  </div>
)

/**
 * Renders the main dashboard view with file cards and sorting controls.
 */
export const Dashboard = ({
  onFileSelect,
  onAddFile,
  onResumeItemClick,
  selectedPath,
  refreshTrigger,
}: DashboardProps) => {
  const {
    files,
    isLoading,
    error,
    sortConfig,
    setSortConfig,
    refresh,
  } = useDashboard()

  // Refresh data when refreshTrigger changes (e.g., after file import)
  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      refresh()
    }
  }, [refreshTrigger, refresh])

  const {
    items: inProgressItems,
    isLoading: isLoadingInProgress,
    totalCount: inProgressTotalCount,
  } = useInProgressItems({ limit: 5 })

  const handleFileClick = (file: DashboardFile) => {
    onFileSelect?.(file)
  }

  /**
   * Handle click on a resume item - find the file and call the navigation callback.
   */
  const handleResumeItemClick = (summary: InProgressItemSummary) => {
    // Find the file that matches this in-progress item
    const file = files.find((f) => f.path === summary.filePath)
    if (file && onResumeItemClick) {
      const target: DashboardNavigationTarget = {
        file,
        targetItemId: summary.item.id,
      }
      onResumeItemClick(target)
    } else if (file && onFileSelect) {
      // Fallback to regular file select if no resume handler
      onFileSelect(file)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="dashboard">
        <LoadingState />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="dashboard">
        <ErrorState message={error} />
      </div>
    )
  }

  // Calculate summary statistics
  const totalFiles = files.length
  const filesInProgress = files.filter((f) => f.hasInProgress).length

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__title-row">
          <h2 className="dashboard__title">Your Documents</h2>
          {onAddFile && (
            <Button
              variant="outline"
              onClick={onAddFile}
              aria-label="Add new file"
              className="dashboard__add-button"
            >
              + Add File
            </Button>
          )}
        </div>
        {totalFiles > 0 && (
          <p className="dashboard__summary">
            {totalFiles} file{totalFiles === 1 ? '' : 's'}
            {filesInProgress > 0 && (
              <span className="dashboard__summary-highlight">
                {' '}· {filesInProgress} in progress
              </span>
            )}
          </p>
        )}
      </header>

      {/* Resume Section - shown above file list when there are in-progress items */}
      <ResumeSection
        items={inProgressItems}
        totalCount={inProgressTotalCount}
        isLoading={isLoadingInProgress}
        onItemClick={handleResumeItemClick}
      />

      {files.length === 0 ? (
        <EmptyState onAddFile={onAddFile} />
      ) : (
        <>
          <div className="dashboard__controls">
            <SortControls sortConfig={sortConfig} onSortChange={setSortConfig} />
          </div>

          <div className="dashboard__grid" role="list" aria-label="Tracked files">
            {files.map((file) => (
              <div key={file.path} role="listitem">
                <FileCard
                  file={file}
                  isSelected={file.path === selectedPath}
                  onClick={handleFileClick}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
