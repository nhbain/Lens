/**
 * ResumeSection component.
 * Displays a section with in-progress items for quick resume functionality.
 */

import { InProgressItem } from './InProgressItem'
import { Button } from '@/lib/common-components'
import type { InProgressItemSummary } from '@/lib/navigation/types'
import './ResumeSection.css'

export interface ResumeSectionProps {
  /** Array of in-progress item summaries to display */
  items: InProgressItemSummary[]
  /** Total count of in-progress items (if more than displayed) */
  totalCount?: number
  /** Whether the data is loading */
  isLoading?: boolean
  /** Callback when an item is clicked */
  onItemClick?: (item: InProgressItemSummary) => void
  /** Callback when "Show all" is clicked */
  onShowAll?: () => void
}

/**
 * Loading state for the resume section.
 */
const LoadingState = () => (
  <div className="resume-section__loading" role="status" aria-label="Loading in-progress items">
    <span className="resume-section__loading-text">Loading...</span>
  </div>
)

/**
 * Empty state when no items are in progress.
 */
const EmptyState = () => (
  <div className="resume-section__empty">
    <p className="resume-section__empty-text">
      No items in progress. Start working on a document to see items here.
    </p>
  </div>
)

/**
 * Renders a section showing in-progress items for quick resume.
 * Appears at the top of the dashboard when there are items to resume.
 */
export const ResumeSection = ({
  items,
  totalCount,
  isLoading = false,
  onItemClick,
  onShowAll,
}: ResumeSectionProps) => {
  // Don't render if no items and not loading
  if (!isLoading && items.length === 0) {
    return null
  }

  const displayCount = items.length
  const hasMore = totalCount !== undefined && totalCount > displayCount

  return (
    <section className="resume-section" aria-labelledby="resume-section-title">
      <header className="resume-section__header">
        <h3 id="resume-section-title" className="resume-section__title">
          Continue Where You Left Off
        </h3>
        {hasMore && onShowAll && (
          <Button
            variant="link"
            size="small"
            onClick={onShowAll}
            aria-label={`Show all ${totalCount} in-progress items`}
            className="resume-section__show-all"
          >
            Show all ({totalCount})
          </Button>
        )}
      </header>

      <div className="resume-section__content">
        {isLoading ? (
          <LoadingState />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="resume-section__list" aria-label="In-progress items">
            {items.map((item) => (
              <li key={`${item.filePath}:${item.item.id}`} className="resume-section__item">
                <InProgressItem item={item} onClick={onItemClick} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
