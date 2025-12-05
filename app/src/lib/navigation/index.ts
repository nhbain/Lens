/**
 * Navigation module exports.
 * Provides scroll position management and navigation types for resume functionality.
 */

// Types
export type {
  ScrollPosition,
  InProgressItemSummary,
  NavigationTarget,
} from './types'

// Type guards
export {
  isScrollPosition,
  isInProgressItemSummary,
  isNavigationTarget,
} from './types'

// Factory functions
export {
  createScrollPosition,
  createNavigationTarget,
} from './types'

// Scroll position management
export {
  saveScrollPosition,
  getScrollPosition,
  clearScrollPosition,
  clearAllScrollPositions,
} from './scroll-manager'
