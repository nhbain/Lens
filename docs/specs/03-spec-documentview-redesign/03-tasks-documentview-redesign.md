# 03-tasks-documentview-redesign.md

Task list for implementing DocumentView redesign as defined in `03-spec-documentview-redesign.md`.

**Dependency:** This spec depends on `02-spec-theme-customization` being implemented first for full theme integration.

## Relevant Files

### Existing Files to Modify

- `app/src/components/DocumentView/DocumentView.tsx` - Refactor to render tree structure instead of flat list
- `app/src/components/DocumentView/DocumentView.css` - Update styling for tree view, indent guides, theme integration
- `app/src/components/DocumentView/DocumentView.test.tsx` - Add tests for tree rendering, collapse, filters, search
- `app/src/components/DocumentView/TrackableItemRow.tsx` - Add chevron icon, collapse functionality, tree-aware rendering
- `app/src/components/DocumentView/types.ts` - Update props for tree structure, filters, collapse callbacks
- `app/src/lib/state/types.ts` - Extend `FileTrackingState` with collapse state
- `app/src/lib/state/file-state-manager.ts` - Add functions to update collapse state
- `app/src/hooks/useDocumentView.ts` - Integrate collapse state management

### New Files to Create

- `app/src/components/DocumentView/DocumentHeader.tsx` - Enhanced header with progress, filters, search
- `app/src/components/DocumentView/DocumentHeader.css` - Header styling
- `app/src/components/DocumentView/DocumentHeader.test.tsx` - Header component tests
- `app/src/components/DocumentView/SectionProgressBar.tsx` - Inline progress bar for section headers
- `app/src/components/DocumentView/SectionProgressBar.css` - Progress bar styling
- `app/src/components/DocumentView/SectionProgressBar.test.tsx` - Progress bar tests
- `app/src/components/DocumentView/FilterButtons.tsx` - Quick filter button group component
- `app/src/components/DocumentView/FilterButtons.css` - Filter buttons styling
- `app/src/hooks/useCollapseState.ts` - Hook for managing and persisting collapse state
- `app/src/hooks/useCollapseState.test.ts` - Collapse state hook tests
- `app/src/hooks/useDocumentFilters.ts` - Hook for filter and search logic
- `app/src/hooks/useDocumentFilters.test.ts` - Filter hook tests
- `app/src/hooks/useTreeKeyboardNavigation.ts` - Hook for tree-aware keyboard navigation
- `app/src/hooks/useTreeKeyboardNavigation.test.ts` - Keyboard navigation tests
- `app/src/lib/progress/section-progress.ts` - Utilities for calculating section progress
- `app/src/lib/progress/section-progress.test.ts` - Progress calculation tests
- `app/src/lib/progress/index.ts` - Update exports to include section progress utilities

### Notes

- Unit tests should be placed alongside the code files they test
- Use `npm run test` to run tests; `npm run test -- path/to/file.test.ts` for specific files
- Follow existing component patterns in `DocumentView/` folder
- All new CSS should use theme CSS variables (no hardcoded colors)
- All animations must respect `data-animation` attribute from Spec 02
- Tree rendering should NOT flatten items - render children within parent containers

## Tasks

### [x] 1.0 Tree Structure & Collapse/Expand

Transform the flat list rendering into a hierarchical tree view with collapsible sections for headers.

#### 1.0 Proof Artifact(s)

- Test: `app/src/components/DocumentView/DocumentView.test.tsx` includes tests for tree rendering and collapse/expand behavior
- Test: `app/src/hooks/useCollapseState.test.ts` verifies collapse state persistence
- Code: DocumentView renders items hierarchically with chevron icons on headers
- Code: Collapse state persists per document in FileTrackingState

#### 1.0 Tasks

- [x] 1.1 Add `collapsedItems` field to `FileTrackingState` interface in `app/src/lib/state/types.ts` as `Record<string, boolean>` (itemId → collapsed)
- [x] 1.2 Update `createFileTrackingState()` to initialize `collapsedItems: {}`
- [x] 1.3 Update `isFileTrackingState` type guard to validate `collapsedItems` field
- [x] 1.4 Add `updateCollapseState(filePath, itemId, collapsed)` function to `file-state-manager.ts`
- [x] 1.5 Add `setAllCollapsed(filePath, collapsed)` function for "Expand All" / "Collapse All"
- [x] 1.6 Create `useCollapseState` hook in `app/src/hooks/useCollapseState.ts` that manages collapse state for a document
- [x] 1.7 Implement `toggleCollapse(itemId)` function in the hook that updates state and persists
- [x] 1.8 Implement `expandAll()` and `collapseAll()` functions in the hook
- [x] 1.9 Implement `isCollapsed(itemId)` getter function in the hook
- [x] 1.10 Write unit tests for `useCollapseState` hook (toggle, expand all, collapse all, persistence)
- [x] 1.11 Remove `flattenItems()` function call from `DocumentView.tsx` - render tree structure directly
- [x] 1.12 Create recursive `renderTreeItem()` function that renders item and its children
- [x] 1.13 Add `isCollapsed` and `onToggleCollapse` props to `TrackableItemRowProps` in `types.ts`
- [x] 1.14 Add `hasChildren` prop to indicate if item has children (for chevron display)
- [x] 1.15 Add chevron icon (▶/▼) to `TrackableItemRow` for header items with children
- [x] 1.16 Implement chevron rotation animation using CSS transform (respect `data-animation`)
- [x] 1.17 Implement click handler on chevron to call `onToggleCollapse`
- [x] 1.18 Implement double-click on header row to toggle collapse
- [x] 1.19 Add CSS for children container with collapse animation (max-height transition)
- [x] 1.20 When `data-animation="off"`, collapse should be instant (no transition)
- [x] 1.21 When `data-animation="reduced"`, use short transition (150ms)
- [x] 1.22 When `data-animation="full"`, use smooth transition (300ms with easing)
- [x] 1.23 Add "Expand All" and "Collapse All" buttons to DocumentView (or DocumentHeader)
- [x] 1.24 Integrate `useCollapseState` hook in `DocumentView.tsx`
- [x] 1.25 Write unit tests for tree rendering (items render hierarchically)
- [x] 1.26 Write unit tests for collapse/expand (clicking chevron hides children)
- [x] 1.27 Write unit tests for expand all / collapse all functionality

### [x] 2.0 Section Progress Bars & Summaries

Add progress bars and completion summaries to section headers showing descendant item completion.

#### 2.0 Proof Artifact(s)

- Test: `app/src/lib/progress/section-progress.test.ts` verifies progress calculation for nested items
- Test: Progress bar updates when child item status changes
- Code: `SectionProgressBar` component exists in DocumentView folder
- Code: Headers display inline progress bar and "X/Y complete" text

#### 2.0 Tasks

- [x] 2.1 Create `app/src/lib/progress/section-progress.ts` for progress calculation utilities
- [x] 2.2 Implement `countDescendants(item)` function that returns total count of all descendants
- [x] 2.3 Implement `countCompletedDescendants(item, itemStatuses)` that returns count of completed descendants
- [x] 2.4 Implement `calculateSectionProgress(item, itemStatuses)` that returns `{ completed: number, total: number, percentage: number }`
- [x] 2.5 Optimize with memoization/caching to avoid recalculating on every render
- [x] 2.6 Write unit tests for `countDescendants` with nested items (2-3 levels deep)
- [x] 2.7 Write unit tests for `countCompletedDescendants` with various status combinations
- [x] 2.8 Write unit tests for `calculateSectionProgress` percentage calculation
- [x] 2.9 Export functions from `app/src/lib/progress/index.ts`
- [x] 2.10 Create `SectionProgressBar.tsx` component in DocumentView folder
- [x] 2.11 Define `SectionProgressBarProps`: `completed`, `total`, `percentage`, `isComplete` (100%)
- [x] 2.12 Render progress bar as thin horizontal bar (4px height) using CSS
- [x] 2.13 Use `--color-accent` for in-progress fill, `--color-accent-secondary` for complete (100%)
- [x] 2.14 Add shimmer animation to progress bar when `data-animation="full"`
- [x] 2.15 Add subtle glow on complete (100%) when `data-animation="full"`
- [x] 2.16 Create `SectionProgressBar.css` with theme-aware styling
- [x] 2.17 Write unit tests for `SectionProgressBar` rendering at various percentages
- [x] 2.18 Add completion summary text display: "X of Y complete" format (e.g., "3 of 7 complete")
- [x] 2.19 Integrate `SectionProgressBar` into `TrackableItemRow` for header items
- [x] 2.20 Position progress bar inline after header content (flexbox layout)
- [x] 2.21 Only show progress bar on header items that have children
- [x] 2.22 Pass `itemStatuses` to calculate progress for each header
- [x] 2.23 Verify progress bar updates in real-time when child status changes (integration test)

### [x] 3.0 Document Header Enhancement

Add document-level progress bar, quick filter buttons, and search functionality to the document header.

#### 3.0 Proof Artifact(s)

- Test: `app/src/hooks/useDocumentFilters.test.ts` verifies filter and search logic
- Test: Filter buttons correctly show/hide items by status
- Test: Search filters items by content (case-insensitive)
- Code: `DocumentHeader` component includes progress bar, filter buttons, and search input

#### 3.0 Tasks

- [x] 3.1 Create `useDocumentFilters` hook in `app/src/hooks/useDocumentFilters.ts`
- [x] 3.2 Define filter state: `activeFilter: 'all' | 'pending' | 'in_progress' | 'complete'`
- [x] 3.3 Define search state: `searchQuery: string`
- [x] 3.4 Implement `setFilter(filter)` function to change active filter
- [x] 3.5 Implement `setSearchQuery(query)` function to update search
- [x] 3.6 Implement `clearSearch()` function to reset search query
- [x] 3.7 Implement `filterItems(items, itemStatuses)` function that returns filtered item tree
- [x] 3.8 Filter logic: show item if its status matches filter (or 'all' shows everything)
- [x] 3.9 Search logic: show item if content contains search query (case-insensitive)
- [x] 3.10 Combined logic: item must match BOTH filter AND search (AND logic)
- [x] 3.11 Tree preservation: if any descendant matches, show all ancestors (parent headers remain visible)
- [x] 3.12 Implement `itemMatchesFilter(item, itemStatuses, filter, searchQuery)` helper
- [x] 3.13 Implement recursive `filterTree(items, itemStatuses, filter, searchQuery)` function
- [x] 3.14 Use `useMemo` to avoid recalculating filtered tree on every render
- [x] 3.15 Write unit tests for filter by status (pending, in_progress, complete)
- [x] 3.16 Write unit tests for search filtering (case-insensitive match)
- [x] 3.17 Write unit tests for combined filter + search
- [x] 3.18 Write unit tests for tree preservation (parent visible if child matches)
- [x] 3.19 Create `DocumentHeader.tsx` component to replace existing header in DocumentView
- [x] 3.20 Move title and filepath display from DocumentView to DocumentHeader
- [x] 3.21 Calculate overall document progress using `calculateSectionProgress` on root items
- [x] 3.22 Add document-level progress bar showing total completion percentage
- [x] 3.23 Add completion statistics text: "X of Y items complete (Z%)"
- [x] 3.24 Create `FilterButtons.tsx` component for the filter button group
- [x] 3.25 Define `FilterButtonsProps`: `activeFilter`, `onFilterChange`, `counts` (item counts per status)
- [x] 3.26 Render four buttons: "All", "Pending", "In Progress", "Complete"
- [x] 3.27 Style active button with `--color-accent-muted` background and `--color-accent` text
- [x] 3.28 Style inactive buttons with ghost style (`--color-text-secondary`)
- [x] 3.29 Add hover glow effect when `data-animation="full"`
- [x] 3.30 Create `FilterButtons.css` with theme-aware styling
- [x] 3.31 Add search input to DocumentHeader using `Input` component from common-components
- [x] 3.32 Add search icon (magnifying glass) to input
- [x] 3.33 Position search input right-aligned in filter row
- [x] 3.34 Use compact/small size for search input
- [x] 3.35 Wire search input `onChange` to `setSearchQuery`
- [x] 3.36 Add clear button (X) to search input when query is non-empty
- [x] 3.37 Implement search text highlighting: wrap matching text in `<strong>` tags with `font-weight: 700; color: var(--color-accent)`
- [x] 3.38 Create `DocumentHeader.css` with layout styling (flexbox for filter row)
- [x] 3.39 Write unit tests for DocumentHeader rendering (progress, filters, search)
- [x] 3.40 Integrate `useDocumentFilters` hook in DocumentView.tsx
- [x] 3.41 Pass filtered items to tree rendering instead of raw items
- [x] 3.42 Pass filter/search state and handlers to DocumentHeader

### [x] 4.0 Visual Hierarchy & Theme Integration

Improve visual differentiation between item types and integrate with Spec 02 theme customization system.

#### 4.0 Proof Artifact(s)

- Test: Components render correctly with custom theme colors from CSS variables
- Test: Animations respect `data-animation` attribute (off/reduced/full)
- Code: `DocumentView.css` uses only CSS variable references (no hardcoded colors)
- Code: Tree indent guides, section backgrounds, and glows use theme colors

#### 4.0 Tasks

- [x] 4.1 Audit `DocumentView.css` for any hardcoded color values and replace with CSS variables
- [x] 4.2 Audit `TrackableItemRow` inline styles for hardcoded colors and replace
- [x] 4.3 Add tree indent guides: thin vertical lines (1px) using `--color-border-subtle`
- [x] 4.4 Implement indent guide CSS using `::before` pseudo-element on nested items
- [x] 4.5 Position indent guides to visually connect parent-child relationships
- [x] 4.6 Add section header visual treatment: subtle gradient background from `--color-surface-2` to transparent
- [x] 4.7 Add bottom border to headers: gradient divider line fading to transparent
- [x] 4.8 Update header typography to use existing scale (H1 largest → H6 smallest)
- [x] 4.9 Update checkbox item styling: styled checkbox icon using theme colors
- [x] 4.10 Add checkbox animation on status change when `data-animation="full"` (scale + color transition)
- [x] 4.11 Update list item bullet styling to use `--color-text-muted`
- [x] 4.12 Update hover states to use `--color-surface-2` background
- [x] 4.13 Add subtle glow on hover when `data-animation="full"` using `--color-accent-glow`
- [x] 4.14 Update focus states to use `--color-accent-ring` for visible focus indicator
- [x] 4.15 Ensure in-progress items use `--color-accent` (breathing glow when animation="full")
- [x] 4.16 Ensure complete items use `--color-accent-secondary` (emerald)
- [x] 4.17 Add `[data-animation="off"]` overrides in CSS to disable all animations
- [x] 4.18 Add `[data-animation="reduced"]` overrides to disable entrance/breathing but keep transitions
- [x] 4.19 Test visual rendering with different custom theme colors
- [x] 4.20 Write unit test verifying no hardcoded colors in rendered output
- [x] 4.21 Write unit test verifying animations are disabled when `data-animation="off"`

### [x] 5.0 Keyboard Navigation Refinements

Implement comprehensive keyboard navigation for the tree view including arrow key navigation, expand/collapse, and search focus.

#### 5.0 Proof Artifact(s)

- Test: `app/src/hooks/useTreeKeyboardNavigation.test.ts` verifies all keyboard interactions
- Test: Arrow Up/Down navigates visible items, Left/Right controls collapse
- Test: Ctrl/Cmd+F focuses search, Escape clears search
- Code: `useTreeKeyboardNavigation` hook implements full navigation logic

#### 5.0 Tasks

- [x] 5.1 Create `useTreeKeyboardNavigation` hook in `app/src/hooks/useTreeKeyboardNavigation.ts`
- [x] 5.2 Define hook params: `items` (tree), `collapsedItems`, `onToggleCollapse`, `searchInputRef`
- [x] 5.3 Maintain `focusedItemId` state for tracking currently focused item
- [x] 5.4 Implement `getVisibleItems(items, collapsedItems)` helper that returns flat list of visible (non-collapsed) items
- [x] 5.5 Implement `findItemIndex(visibleItems, itemId)` helper
- [x] 5.6 Implement `findParentHeader(items, itemId)` helper that returns parent header item
- [x] 5.7 Implement Arrow Down handler: move focus to next visible item
- [x] 5.8 Implement Arrow Up handler: move focus to previous visible item
- [x] 5.9 Implement Arrow Left handler on expanded header: collapse it
- [x] 5.10 Implement Arrow Left handler on collapsed header or non-header: move focus to parent header
- [x] 5.11 Implement Arrow Right handler on collapsed header: expand it
- [x] 5.12 Implement Arrow Right handler on expanded header: move focus to first child
- [x] 5.13 Implement Home handler: jump to first visible item
- [x] 5.14 Implement End handler: jump to last visible item
- [x] 5.15 Implement Enter/Space handler: toggle item status (cycle pending → in_progress → complete)
- [x] 5.16 Implement Ctrl+F / Cmd+F handler: focus search input (use `searchInputRef.current.focus()`)
- [x] 5.17 Implement Ctrl+E / Cmd+E handler: toggle expand/collapse all sections
- [x] 5.18 Implement Escape handler in search: clear search query and return focus to item list
- [x] 5.19 Implement Tab handler: move between header controls (filters, search) and item list
- [x] 5.20 Return `focusedItemId`, `setFocusedItemId`, `handleKeyDown` from hook
- [x] 5.21 Integrate hook in DocumentView.tsx: attach `handleKeyDown` to container
- [x] 5.22 Pass `focusedItemId` to TrackableItemRow to show focus styling (`isFocused` prop)
- [x] 5.23 Ensure all interactive elements have visible focus indicators (outline or ring)
- [x] 5.24 Use React refs to programmatically scroll focused item into view
- [x] 5.25 Write unit tests for Arrow Up/Down navigation between visible items
- [x] 5.26 Write unit tests for Arrow Left/Right collapse/expand behavior
- [x] 5.27 Write unit tests for Home/End navigation
- [x] 5.28 Write unit tests for Enter/Space status toggle
- [x] 5.29 Write unit tests for Ctrl/Cmd+F search focus
- [x] 5.30 Write unit tests for Ctrl/Cmd+E toggle all expand/collapse
- [x] 5.31 Write unit tests for Escape to clear search
- [x] 5.32 Write integration test for full keyboard workflow (navigate, expand, collapse, toggle status)
