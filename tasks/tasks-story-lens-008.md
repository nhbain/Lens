# Task List for STORY-LENS-008: Dashboard View

> Generated from: story-list-feature-lens.md
> Story: As a user, I want a dashboard showing all my tracked files with progress so that I can see overall status at a glance.
> Acceptance Criteria: All tracked files visible; progress percentages accurate; sorting by name/progress/date works; clicking file opens document view.

## Relevant Files

- `app/src/components/Dashboard/Dashboard.tsx` - Main dashboard component
- `app/src/components/Dashboard/Dashboard.test.tsx` - Component tests
- `app/src/components/Dashboard/Dashboard.css` - Dashboard styles
- `app/src/components/Dashboard/FileCard.tsx` - Individual file card component
- `app/src/components/Dashboard/FileCard.test.tsx` - Card component tests
- `app/src/components/Dashboard/ProgressBar.tsx` - Reusable progress bar component
- `app/src/components/Dashboard/SortControls.tsx` - Sorting UI controls
- `app/src/components/Dashboard/index.ts` - Public exports
- `app/src/hooks/useDashboard.ts` - Hook for dashboard state management
- `app/src/lib/files/` - Existing tracked files module
- `app/src/lib/state/` - Existing state persistence module

### Notes

- This is a **frontend-heavy story** - read React rules and style guide first
- Dashboard is the app's home/landing view
- Depends on STORY-LENS-003 (State) and STORY-LENS-004 (File Import)
- Each file shows: name, path, progress bar, percentage, last-worked date
- Files with in-progress items should be visually highlighted
- Consider grid vs list view options
- Follow style guide in `~/.claude/rules`

## Tasks

- [x] 0.0 Review React Guidelines
  - [x] 0.1 Read `~/.claude/rules/style-guide.md` for TypeScript coding standards
  - [x] 0.2 Read `~/.claude/rules/react/components.md` for component patterns
  - [x] 0.3 Read `~/.claude/rules/react/state-and-data.md` for state management

- [x] 1.0 Define Dashboard Types
  - [x] 1.1 Create `app/src/components/Dashboard/types.ts`
  - [x] 1.2 Define `DashboardFile` interface (extends TrackedFile with progress data)
  - [x] 1.3 Define `SortOption` type: 'name' | 'progress' | 'date' | 'items'
  - [x] 1.4 Define `SortDirection` type: 'asc' | 'desc'
  - [x] 1.5 Define `DashboardFilter` interface for future filtering

- [x] 2.0 Build ProgressBar Component
  - [x] 2.1 Create reusable `ProgressBar.tsx` component
  - [x] 2.2 Accept percentage prop (0-100)
  - [x] 2.3 Show visual bar with fill based on percentage
  - [x] 2.4 Optionally show percentage text
  - [x] 2.5 Support different sizes (small, medium, large)
  - [x] 2.6 Support different colors based on progress level
  - [x] 2.7 Add animation for progress changes
  - [x] 2.8 Write component tests

- [x] 3.0 Build FileCard Component
  - [x] 3.1 Create `FileCard.tsx` - displays single tracked file
  - [x] 3.2 Show file name prominently
  - [x] 3.3 Show truncated file path with tooltip for full path
  - [x] 3.4 Show progress bar with percentage
  - [x] 3.5 Show item counts (e.g., "5 of 12 complete")
  - [x] 3.6 Show last-worked timestamp (relative time: "2 hours ago")
  - [x] 3.7 Highlight card if file has in-progress items
  - [x] 3.8 Make entire card clickable to open document
  - [x] 3.9 Add hover state for interactivity feedback
  - [x] 3.10 Write component tests for various states

- [x] 4.0 Build SortControls Component
  - [x] 4.1 Create `SortControls.tsx` with sort options
  - [x] 4.2 Dropdown or segmented control for sort field
  - [x] 4.3 Toggle button for ascending/descending
  - [x] 4.4 Show current sort state visually
  - [x] 4.5 Emit sort change events to parent
  - [x] 4.6 Write component tests

- [x] 5.0 Build Dashboard Component
  - [x] 5.1 Create `Dashboard.tsx` - main container
  - [x] 5.2 Show header with "Your Documents" title
  - [x] 5.3 Include SortControls in header area
  - [x] 5.4 Render grid/list of FileCard components
  - [x] 5.5 Show empty state when no files tracked
  - [x] 5.6 Show loading state while loading files
  - [x] 5.7 Include "Add File" button for quick access
  - [x] 5.8 Implement sorting logic based on selected option
  - [x] 5.9 Write component tests

- [x] 6.0 Create useDashboard Hook
  - [x] 6.1 Create `useDashboard.ts` hook for state management
  - [x] 6.2 Load tracked files on mount
  - [x] 6.3 Calculate progress for each file from state
  - [x] 6.4 Track sort option and direction
  - [x] 6.5 Return sorted files list
  - [x] 6.6 Handle file selection (navigate to document view)
  - [x] 6.7 Refresh data when files change
  - [x] 6.8 Write hook tests

- [x] 7.0 Style Dashboard
  - [x] 7.1 Create `Dashboard.css` with layout styles
  - [x] 7.2 Implement responsive grid layout (1-3 columns based on width)
  - [x] 7.3 Style FileCard with subtle borders/shadows
  - [x] 7.4 Style progress bar with appropriate colors
  - [x] 7.5 Style in-progress highlight state
  - [x] 7.6 Style empty state with helpful guidance
  - [x] 7.7 Support dark mode
  - [x] 7.8 Ensure good spacing and visual hierarchy

- [x] 8.0 Integration & Testing
  - [x] 8.1 Create `app/src/components/Dashboard/index.ts` exporting public API
  - [x] 8.2 Wire Dashboard as the main/home view in App.tsx
  - [x] 8.3 Implement navigation from Dashboard to DocumentView
  - [x] 8.4 Add comprehensive JSDoc comments
  - [x] 8.5 Run full test suite and ensure all tests pass
  - [x] 8.6 Run linter and fix any issues
  - [x] 8.7 Evaluate code against `~/.claude/rules` style guide
  - [x] 8.8 Integration test: files show with correct progress
  - [x] 8.9 Integration test: sorting works correctly
  - [x] 8.10 Integration test: clicking file navigates to document view
