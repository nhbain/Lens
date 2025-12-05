/**
 * Progress tracking module.
 * Exports types and utilities for tracking item progress.
 */

// Types
export type { TrackingStatus } from './types'
export type { StatusChangeEvent, ParentProgress } from './types'

// Type utilities
export {
  getNextStatus,
  getPreviousStatus,
  isStatusChangeEvent,
  isParentProgress,
  createEmptyProgress,
} from './types'

// Progress calculation
export {
  calculateChildrenProgress,
  calculateDeepProgress,
  deriveParentStatus,
  deriveDeepParentStatus,
  findAncestors,
  propagateStatusChange,
} from './calculator'
