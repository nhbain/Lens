# Task List for STORY-LENS-006: Document View & Item Display

> Generated from: story-list-feature-lens.md
> Story: As a user, I want to view my markdown documents with trackable items clearly displayed so that I can see what needs to be done.
> Acceptance Criteria: Document renders with correct hierarchy; all trackable items are visually distinct; scrolling is smooth; keyboard navigation works.

## Relevant Files

- `app/src/components/DocumentView/DocumentView.tsx` - Main document viewer component
- `app/src/components/DocumentView/DocumentView.test.tsx` - Component tests (26 tests)
- `app/src/components/DocumentView/DocumentView.css` - Styles for document view with dark mode support
- `app/src/components/DocumentView/TrackableItemRow.tsx` - Individual item row component
- `app/src/components/DocumentView/TrackableItemRow.test.tsx` - Item component tests (28 tests)
- `app/src/components/DocumentView/types.ts` - TypeScript interfaces (DocumentViewProps, TrackableItemRowProps)
- `app/src/components/DocumentView/index.ts` - Public exports
- `app/src/hooks/useDocumentView.ts` - Hook for document view state management
- `app/src/hooks/useKeyboardNavigation.ts` - Hook for keyboard navigation
- `app/src/lib/parser/` - Existing parser module for markdown parsing

### Notes

- Virtualized rendering **deferred** - target documents are 66-162 lines (~20-80 items)
- Keyboard navigation hook implemented, integration with DocumentView deferred to Story 7
- All 495 tests pass, lint passes

## Tasks

- [x] 0.0 Review React Guidelines
  - [x] 0.1 Read `~/.claude/rules/style-guide.md` for TypeScript coding standards
  - [x] 0.2 Read `~/.claude/rules/react/components.md` for component patterns
  - [x] 0.3 Read `~/.claude/rules/react/state-and-data.md` for state management
  - [x] 0.4 Read `~/.claude/rules/react/code-quality.md` for quality standards

- [x] 1.0 Define Document View Types
  - [x] 1.1 Create `app/src/components/DocumentView/types.ts` with view-specific interfaces
  - [x] 1.2 Define `DocumentViewProps` interface (file path, parsed content, callbacks)
  - [x] 1.3 Define `TrackableItemRowProps` interface (item data, depth, status, callbacks)
  - [x] 1.4 Define status and callback types

- [x] 2.0 Build TrackableItemRow Component
  - [x] 2.1 Create `TrackableItemRow.tsx` - renders single trackable item
  - [x] 2.2 Show item text content with appropriate typography
  - [x] 2.3 Display type indicator (H1-H6 badge, bullet/number, checkbox)
  - [x] 2.4 Apply indentation based on item depth in hierarchy
  - [x] 2.5 Support different visual states (pending, in-progress, complete)
  - [x] 2.6 Add `data-item-id` attribute for keyboard navigation targeting
  - [x] 2.7 Make item focusable for accessibility (tabIndex, role, aria-label)
  - [x] 2.8 Write component tests for all item types and states (28 tests)

- [x] 3.0 Build DocumentView Component
  - [x] 3.1 Create `DocumentView.tsx` - main container component
  - [x] 3.2 Accept parsed document items as prop
  - [x] 3.3 Render list of TrackableItemRow components with correct hierarchy
  - [x] 3.4 Implement smooth scrolling container
  - [x] 3.5 Show document title/header section
  - [x] 3.6 Show empty state when no items
  - [x] 3.7 Show loading state while parsing
  - [x] 3.8 Write component tests for various document structures (26 tests)

- [x] 4.0 Implement Virtualized Rendering (DEFERRED)
  - [x] 4.1 Decision: Skip for now - target documents are small (~20-80 items)
  - [ ] 4.2 Install react-window (deferred to future story if needed)
  - [ ] 4.3-4.6 (deferred)

- [x] 5.0 Implement Keyboard Navigation
  - [x] 5.1 Create `useKeyboardNavigation` hook
  - [x] 5.2 Arrow Up/Down moves focus between items
  - [x] 5.3 Home/End jumps to first/last item
  - [x] 5.4 Enter/Space activates focused item (for status toggle in future)
  - [x] 5.5 Escape clears focus
  - [x] 5.6 Auto-scroll to keep focused item visible
  - [x] 5.7 Hook ready for integration (deferred to Story 7 for full integration)
  - [ ] 5.8 Integration tests (blocked by React 19 hook testing issue - deferred)

- [x] 6.0 Style Document View
  - [x] 6.1 Create `DocumentView.css` with base styles
  - [x] 6.2 Style header type indicators (H1 largest, H6 smallest)
  - [x] 6.3 Style list item indicators (bullet, number)
  - [x] 6.4 Style checkbox indicators with status colors
  - [x] 6.5 Define indentation scale for nested items (CSS custom property)
  - [x] 6.6 Add hover and focus states
  - [x] 6.7 Support dark mode via CSS media query
  - [x] 6.8 Ensure readable typography and spacing

- [x] 7.0 Integration & Testing
  - [x] 7.1 Create `app/src/components/DocumentView/index.ts` exporting public API
  - [x] 7.2 Create `useDocumentView` hook for loading and managing document state
  - [x] 7.3 Add JSDoc comments to components
  - [x] 7.4 Run full test suite and ensure all tests pass (495 tests)
  - [x] 7.5 Run linter and fix any issues
  - [x] 7.6 Follow patterns from existing codebase (named exports, arrow functions)
  - [x] 7.7 Manual test with various markdown structures (requires app integration)
  - [ ] 7.8 Performance test with large documents (deferred)
