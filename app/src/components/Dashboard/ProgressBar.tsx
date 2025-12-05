/**
 * ProgressBar component.
 * Displays a visual progress indicator with optional percentage label.
 */

import type { ProgressBarProps } from './types'

/**
 * Get color class based on progress percentage.
 * - 0-33%: blue (starting)
 * - 34-66%: yellow (in progress)
 * - 67-99%: green (almost done)
 * - 100%: green with complete styling
 */
const getProgressColorClass = (percentage: number): string => {
  if (percentage === 100) {
    return 'progress-bar__fill--complete'
  }
  if (percentage >= 67) {
    return 'progress-bar__fill--high'
  }
  if (percentage >= 34) {
    return 'progress-bar__fill--medium'
  }
  return 'progress-bar__fill--low'
}

/**
 * Renders a progress bar with customizable size, color, and optional label.
 */
export const ProgressBar = ({
  percentage,
  showLabel = false,
  size = 'medium',
  animated = true,
}: ProgressBarProps) => {
  // Clamp percentage to valid range
  const clampedPercentage = Math.max(0, Math.min(100, percentage))

  const colorClass = getProgressColorClass(clampedPercentage)
  const sizeClass = `progress-bar--${size}`
  const animatedClass = animated ? 'progress-bar--animated' : ''

  return (
    <div
      className={`progress-bar ${sizeClass} ${animatedClass}`.trim()}
      role="progressbar"
      aria-valuenow={clampedPercentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Progress: ${clampedPercentage}%`}
    >
      <div className="progress-bar__track">
        <div
          className={`progress-bar__fill ${colorClass}`}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-bar__label">{clampedPercentage}%</span>
      )}
    </div>
  )
}
