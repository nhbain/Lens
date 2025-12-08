/**
 * SectionProgressBar component.
 * Displays a thin progress bar with completion summary for sections.
 */

import './SectionProgressBar.css'

export interface SectionProgressBarProps {
  /** Number of completed items */
  completed: number
  /** Total number of items */
  total: number
  /** Completion percentage (0-100) */
  percentage: number
  /** Whether section is 100% complete */
  isComplete?: boolean
  /** Optional CSS class name */
  className?: string
}

/**
 * Renders an inline progress bar with completion text.
 * Shows "X of Y complete" with a thin animated progress bar.
 */
export const SectionProgressBar = ({
  completed,
  total,
  percentage,
  isComplete,
  className = '',
}: SectionProgressBarProps) => {
  // Don't render if no items
  if (total === 0) {
    return null
  }

  const complete = isComplete ?? percentage === 100

  return (
    <div
      className={`section-progress ${complete ? 'section-progress--complete' : ''} ${className}`.trim()}
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${completed} of ${total} complete`}
    >
      <div className="section-progress-bar">
        <div
          className="section-progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="section-progress-text">
        {completed} of {total} complete
      </span>
    </div>
  )
}
