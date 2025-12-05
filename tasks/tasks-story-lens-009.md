# Task List for STORY-LENS-009: Resume & Quick Navigation

> Generated from: story-list-feature-lens.md
> Story: As a user, I want to see my in-progress items highlighted so that I can resume work instantly after a context switch.
> Acceptance Criteria: In-progress items surfaced on dashboard; clicking jumps to correct position; scroll position preserved when returning to document.

## Relevant Files

- `app/src/components/Dashboard/ResumeSection.tsx` - Section showing in-progress items
- `app/src/components/Dashboard/ResumeSection.test.tsx` - Component tests
- `app/src/components/Dashboard/InProgressItem.tsx` - Single in-progress item display
- `app/src/components/Dashboard/Dashboard.tsx` - Update to include ResumeSection
- `app/src/components/DocumentView/DocumentView.tsx` - Update for scroll position
- `app/src/hooks/useScrollPosition.ts` - Hook for managing scroll positions
- `app/src/hooks/useInProgressItems.ts` - Hook for aggregating in-progress items
- `app/src/lib/navigation/types.ts` - Navigation state types
- `app/src/lib/navigation/scroll-manager.ts` - Scroll position persistence

### Notes

- This is a **frontend-heavy story** - read React rules and style guide first
- Depends on STORY-LENS-007 (Progress Tracking) and STORY-LENS-008 (Dashboard)
- "Resume" section aggregates all in-progress items across all tracked files
- Clicking an in-progress item should:
  1. Navigate to that document
  2. Scroll to the specific item
  3. Optionally highlight/focus the item
- Store last scroll position per document for seamless return
- Consider "last worked" timestamp per item for sorting resume list
- Follow style guide in `~/.claude/rules`

## Tasks

- [x] 0.0 Review React Guidelines
  - [x] 0.1 Read `~/.claude/rules/style-guide.md` for TypeScript coding standards
  - [x] 0.2 Read `~/.claude/rules/react/components.md` for component patterns
  - [x] 0.3 Read `~/.claude/rules/react/state-and-data.md` for state management

- [x] 1.0 Define Navigation & Resume Types
  - [x] 1.1 Create `app/src/lib/navigation/types.ts`
  - [x] 1.2 Define `ScrollPosition` interface (documentPath, scrollTop, focusedItemId?)
  - [x] 1.3 Define `InProgressItemSummary` interface (item + file info + lastWorked)
  - [x] 1.4 Define `NavigationTarget` interface for jump-to functionality

- [x] 2.0 Implement Scroll Position Management
  - [x] 2.1 Create `scroll-manager.ts` for scroll position persistence
  - [x] 2.2 Implement `saveScrollPosition(documentPath, position)` - save to memory/storage
  - [x] 2.3 Implement `getScrollPosition(documentPath)` - retrieve saved position
  - [x] 2.4 Implement `clearScrollPosition(documentPath)` - cleanup on file removal
  - [x] 2.5 Decide on storage: memory-only vs persisted (session storage recommended)
  - [x] 2.6 Write unit tests for scroll manager

- [x] 3.0 Create useScrollPosition Hook
  - [x] 3.1 Create `useScrollPosition.ts` hook
  - [x] 3.2 Track current scroll position on scroll events (debounced)
  - [x] 3.3 Save position when leaving document view
  - [x] 3.4 Restore position when entering document view
  - [x] 3.5 Handle case where target item no longer exists
  - [x] 3.6 Write hook tests

- [x] 4.0 Create useInProgressItems Hook
  - [x] 4.1 Create `useInProgressItems.ts` hook
  - [x] 4.2 Aggregate in-progress items from all tracked files
  - [x] 4.3 Include file context (name, path) with each item
  - [x] 4.4 Sort by last-worked timestamp (most recent first)
  - [x] 4.5 Limit results (e.g., top 10) for dashboard display
  - [x] 4.6 Refresh when state changes
  - [x] 4.7 Write hook tests

- [x] 5.0 Build InProgressItem Component
  - [x] 5.1 Create `InProgressItem.tsx` - compact item display
  - [x] 5.2 Show item text (truncated if long)
  - [x] 5.3 Show source file name
  - [x] 5.4 Show relative timestamp ("2 hours ago")
  - [x] 5.5 Make clickable to navigate
  - [x] 5.6 Show hover state
  - [x] 5.7 Write component tests

- [x] 6.0 Build ResumeSection Component
  - [x] 6.1 Create `ResumeSection.tsx` - container for resume functionality
  - [x] 6.2 Show "Resume Work" or "In Progress" header
  - [x] 6.3 List InProgressItem components
  - [x] 6.4 Show empty state when nothing in progress
  - [x] 6.5 "Show all" link if more items than displayed limit
  - [x] 6.6 Write component tests

- [x] 7.0 Implement Jump-to-Item Navigation
  - [x] 7.1 Update DocumentView to accept optional `targetItemId` prop
  - [x] 7.2 On mount with targetItemId, scroll to that item
  - [x] 7.3 Highlight/focus the target item briefly
  - [x] 7.4 Handle case where item doesn't exist (show error/fallback)
  - [x] 7.5 Use smooth scrolling for better UX
  - [x] 7.6 Write tests for jump-to functionality

- [x] 8.0 Integrate into Dashboard
  - [x] 8.1 Add ResumeSection to Dashboard above file list
  - [x] 8.2 Pass navigation callback to handle item clicks
  - [x] 8.3 Update routing/navigation to support item targeting
  - [x] 8.4 Style ResumeSection to be prominent but not overwhelming

- [x] 9.0 Integration & Testing
  - [x] 9.1 Create `app/src/lib/navigation/index.ts` exporting public API
  - [x] 9.2 Update DocumentView with scroll position restoration
  - [x] 9.3 Add comprehensive JSDoc comments
  - [x] 9.4 Run full test suite and ensure all tests pass
  - [x] 9.5 Run linter and fix any issues
  - [x] 9.6 Evaluate code against `~/.claude/rules` style guide
  - [x] 9.7 Integration test: in-progress items appear in resume section
  - [x] 9.8 Integration test: clicking jumps to correct item in document
  - [x] 9.9 Integration test: scroll position preserved on return
