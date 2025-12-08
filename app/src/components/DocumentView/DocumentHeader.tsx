/**
 * DocumentHeader component.
 * Renders document title, progress bar, filter buttons, and search input.
 */

import type { StatusFilter, StatusCounts } from '@/hooks/useDocumentFilters'
import type { SectionProgress } from '@/lib/progress'
import { Input, Button } from '@/lib/common-components'
import { FilterButtons } from './FilterButtons'
import { SectionProgressBar } from './SectionProgressBar'
import './DocumentHeader.css'

export interface DocumentHeaderProps {
  /** Document title (optional) */
  title?: string
  /** Path to the source file (optional) */
  filePath?: string
  /** Overall document progress */
  progress: SectionProgress
  /** Currently active status filter */
  activeFilter: StatusFilter
  /** Callback when filter changes */
  onFilterChange: (filter: StatusFilter) => void
  /** Current search query */
  searchQuery: string
  /** Callback when search query changes */
  onSearchChange: (query: string) => void
  /** Callback to clear search */
  onSearchClear: () => void
  /** Item counts per status */
  statusCounts: StatusCounts
  /** Callback to expand all sections */
  onExpandAll?: () => void
  /** Callback to collapse all sections */
  onCollapseAll?: () => void
  /** Ref for the search input (for keyboard focus) */
  searchInputRef?: React.RefObject<HTMLInputElement | null>
}

/**
 * Renders the document header with progress, filters, and search.
 */
export const DocumentHeader = ({
  title,
  filePath,
  progress,
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  onSearchClear,
  statusCounts,
  onExpandAll,
  onCollapseAll,
  searchInputRef,
}: DocumentHeaderProps) => {
  const hasTitle = title || filePath
  const showProgress = progress.total > 0

  return (
    <header className="document-header">
      {/* Title row */}
      {hasTitle && (
        <div className="document-header-title-row">
          <div className="document-header-info">
            {title && <h1 className="document-header-title">{title}</h1>}
            {filePath && (
              <p className="document-header-filepath" title={filePath}>
                {filePath}
              </p>
            )}
          </div>
          {showProgress && (
            <div className="document-header-progress">
              <SectionProgressBar
                completed={progress.completed}
                total={progress.total}
                percentage={progress.percentage}
                isComplete={progress.percentage === 100}
              />
            </div>
          )}
        </div>
      )}

      {/* Filter and actions row */}
      <div className="document-header-controls">
        <FilterButtons
          activeFilter={activeFilter}
          onFilterChange={onFilterChange}
          counts={statusCounts}
          className="document-header-filters"
        />

        <div className="document-header-actions">
          {/* Expand/Collapse buttons */}
          {(onExpandAll || onCollapseAll) && (
            <div className="document-header-collapse-buttons">
              {onExpandAll && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={onExpandAll}
                  aria-label="Expand all sections"
                >
                  Expand All
                </Button>
              )}
              {onCollapseAll && (
                <Button
                  variant="ghost"
                  size="small"
                  onClick={onCollapseAll}
                  aria-label="Collapse all sections"
                >
                  Collapse All
                </Button>
              )}
            </div>
          )}

          {/* Search input */}
          <div className="document-header-search">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search items"
              size="small"
              className="document-header-search-input"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="small"
                onClick={onSearchClear}
                aria-label="Clear search"
                className="document-header-search-clear"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
