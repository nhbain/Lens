# 03-spec-documentview-redesign.md

## Introduction/Overview

This specification defines a comprehensive redesign of the DocumentView component to improve visual hierarchy, progress visualization, layout, and interactivity. The current flat list display will be replaced with a collapsible tree view that shows parent-child relationships, section progress bars, and completion summaries. The document header will be enhanced with overall progress, quick filters, and search functionality. All visual elements must integrate with the theme customization system from Spec 02, respecting animation intensity and custom color settings.

## Goals

- Transform the flat item list into a collapsible tree view showing document structure
- Add progress bars for each section header showing child item completion
- Display completion summaries on headers (e.g., "3/7 complete")
- Add document-level progress bar and statistics in the header area
- Implement quick filter buttons (All, Pending, In Progress, Complete)
- Add search functionality to filter items by text content
- Integrate with Spec 02 theme customization (colors, animation intensity)
- Improve visual hierarchy between headers, lists, and checkboxes
- Enhance spacing and readability throughout the component

## User Stories

- **As a user reviewing a long document**, I want to collapse completed sections so that I can focus on remaining work without scrolling past finished items.
- **As a user tracking progress**, I want to see section-level progress bars so that I can quickly understand how much of each section is complete.
- **As a user with many items**, I want to filter by status so that I can see only the items I need to work on.
- **As a user searching for specific content**, I want to search within the document so that I can quickly find items by name.
- **As a user who customized theme colors**, I want the DocumentView to use my custom accent colors so that the entire app feels cohesive.
- **As a user with reduced motion preference**, I want expand/collapse animations to respect my animation settings so that the interface doesn't cause discomfort.

## Demoable Units of Work

### Unit 1: Tree Structure & Collapse/Expand

**Purpose:** Transform the flat list into a hierarchical tree view with collapsible sections.

**Functional Requirements:**
- The system shall render items in a tree structure preserving markdown document hierarchy
- Headers (H1-H6) shall act as collapsible section containers for their child items
- Each header shall display a chevron icon indicating expanded/collapsed state
- Clicking a header's chevron or double-clicking the header shall toggle collapse/expand
- Collapsed sections shall hide all child items while keeping the header visible
- The system shall persist collapse state per document in the file state
- Expand/collapse shall animate smoothly when animation intensity is "full" or "reduced"
- When animation intensity is "off", expand/collapse shall be instant with no animation
- Nested headers shall support independent collapse (collapsing H2 doesn't affect H3 children's internal state)
- The system shall provide "Expand All" and "Collapse All" actions

**Proof Artifacts:**
- Test: `DocumentView.test.tsx` includes tests for collapse/expand behavior
- Test: Collapse state persists across component remounts
- Code: `git diff` shows tree structure implementation in DocumentView components

### Unit 2: Section Progress Bars & Summaries

**Purpose:** Show completion progress for each section to provide quick visual feedback on document progress.

**Functional Requirements:**
- Each header item shall display a mini progress bar showing child item completion percentage
- The progress bar shall use theme accent colors (primary for in-progress, secondary for complete)
- Each header shall display a completion summary text (e.g., "3/7" or "3 of 7 complete")
- Progress calculation shall include all descendant items (children, grandchildren, etc.)
- Progress bars shall update in real-time when item statuses change
- Progress bars shall respect animation intensity (shimmer effect on "full", static on "reduced"/"off")
- Completed sections (100%) shall show the secondary accent color (emerald) with optional glow
- The progress bar shall be positioned inline with the header, not taking extra vertical space

**Proof Artifacts:**
- Test: Progress calculation correctly counts nested items
- Test: Progress bar updates when child item status changes
- Code: `SectionProgressBar` component exists with theme integration

### Unit 3: Document Header Enhancement

**Purpose:** Provide document-level progress overview, filtering, and search capabilities.

**Functional Requirements:**
- The document header shall display an overall progress bar showing total document completion
- The header shall display completion statistics (e.g., "47 of 128 items complete (37%)")
- The header shall include quick filter buttons: "All", "Pending", "In Progress", "Complete"
- Only one filter can be active at a time; "All" is the default
- Active filter button shall be visually highlighted using theme accent color
- Filtering shall show/hide items based on their status while preserving tree structure
- When filtering, parent headers shall remain visible if any descendants match the filter
- The header shall include a search input field for filtering items by text content
- Search shall filter items whose content contains the search term (case-insensitive)
- Search and status filter shall work together (AND logic)
- Clearing search or changing filter shall be instant; results shall update in real-time
- The search input shall use the Input component from common-components

**Proof Artifacts:**
- Test: Filter buttons correctly filter items by status
- Test: Search filters items by content text
- Test: Combined filter + search works correctly
- Code: `DocumentHeader` component includes progress, filters, and search

### Unit 4: Visual Hierarchy & Theme Integration

**Purpose:** Improve visual differentiation between item types and ensure full theme customization support.

**Functional Requirements:**
- Headers shall have distinct visual treatment: larger typography, section divider lines, background tint
- List items shall have subtle indentation lines connecting to their parent
- Checkboxes shall display a styled checkbox icon that animates on status change
- Item hover states shall use theme surface colors with subtle glow on "full" animation
- Focus states shall use theme accent ring color for accessibility
- All colors shall read from CSS variables set by the theme customization system
- All animations shall respect the `data-animation` attribute from Spec 02
- In-progress items shall use the breathing glow animation when animation intensity is "full"
- Complete items shall use the secondary accent color (customizable emerald)
- The tree indent guides shall use theme border colors
- Card/section backgrounds shall use theme surface gradients

**Proof Artifacts:**
- Test: Components render correctly with different theme color values
- Test: Animations respect `data-animation` attribute
- Code: All hardcoded colors replaced with CSS variable references

### Unit 5: Interactivity Refinements

**Purpose:** Enhance keyboard navigation and interaction patterns for the tree view.

**Functional Requirements:**
- Arrow Up/Down shall navigate between visible (non-collapsed) items
- Arrow Left on an expanded header shall collapse it
- Arrow Right on a collapsed header shall expand it
- Arrow Left on a non-header or collapsed header shall move focus to parent header
- Arrow Right on a non-header shall move to first child if expanded
- Enter/Space shall toggle item status (cycle through pending → in-progress → complete)
- Home/End shall jump to first/last visible item
- Ctrl+F or Cmd+F shall focus the search input
- Escape in search shall clear search and return focus to item list
- Tab shall move between header controls (filters, search) and the item list
- All interactive elements shall have visible focus indicators

**Proof Artifacts:**
- Test: Keyboard navigation tests for arrow keys, Enter, Space
- Test: Focus management tests for search and filters
- Code: `useTreeKeyboardNavigation` hook implements navigation logic

## Non-Goals (Out of Scope)

1. **Drag-and-drop reordering**: Items cannot be reordered; document structure is determined by source markdown
2. **Multi-select**: Selecting multiple items for bulk status changes is not included
3. **Inline editing**: Item content cannot be edited; source markdown is read-only
4. **Virtual scrolling**: Performance optimization for very large documents (1000+ items) is deferred
5. **Saved filter presets**: Users cannot save custom filter combinations
6. **Export filtered view**: Exporting only filtered items is not included

## Design Considerations

The redesigned DocumentView must align with the Dark OLED Luxury theme while being fully customizable via Spec 02 settings.

**Tree Structure Visual Design:**
- Indent guides: Thin vertical lines (1px) using `--color-border-subtle`, connecting items to parents
- Collapse chevrons: Rotatable chevron icon (▶ collapsed, ▼ expanded) using accent color on hover
- Nesting depth: Visual indent of 1.25rem per level (existing pattern)

**Section Headers:**
- Background: Subtle gradient from `--color-surface-2` to transparent
- Bottom border: Gradient divider line fading to transparent
- Progress bar: 4px height, inline after completion summary, using theme colors
- Typography: Existing header scale (H1 largest, H6 smallest)

**Document Header Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Document Title                                              │
│  /path/to/file.md                                           │
│                                                              │
│  [=============================-----] 47/128 complete (37%) │
│                                                              │
│  [All] [Pending] [In Progress] [Complete]    [🔍 Search...] │
└─────────────────────────────────────────────────────────────┘
```

**Filter Button Styling:**
- Default: Ghost button style with `--color-text-secondary`
- Active: Filled with `--color-accent-muted` background, `--color-accent` text
- Hover: Subtle background lift with accent glow (when animations enabled)

**Search Input:**
- Uses common Input component with search icon
- Positioned right-aligned in the filter row
- Compact size to not dominate the header

## Repository Standards

- **Component structure**: New components in `DocumentView/` folder with `.tsx`, `.css`, `.test.tsx`
- **Hooks**: `useTreeKeyboardNavigation`, `useDocumentFilters`, `useCollapseState` in `app/src/hooks/`
- **State**: Collapse state stored in existing `FileState` structure
- **Testing**: Comprehensive unit tests for all new logic; integration tests for filter/search
- **CSS**: Use existing theme variables; add new component-specific classes following BEM
- **Exports**: Update `DocumentView/index.ts` to export new sub-components if needed

## Technical Considerations

- **State management**: Collapse state must be persisted per-document alongside item statuses
- **Performance**: Filtering should use `useMemo` to avoid recalculating on every render
- **Tree traversal**: Efficient algorithms needed for calculating section progress (cache results)
- **Focus management**: React refs needed to programmatically focus items during keyboard navigation
- **Animation coordination**: Collapse animations must coordinate height transitions with content visibility
- **Theme reactivity**: Components must re-render when theme CSS variables change (handled by browser)

## Security Considerations

- Search input must sanitize user input before using in any operations (XSS prevention)
- Search should not use regex from user input directly (ReDoS prevention)

## Success Metrics

1. **Tree functionality**: All documents render correctly in tree view with proper nesting
2. **Collapse reliability**: Collapse/expand works on all header levels without visual glitches
3. **Progress accuracy**: Section progress bars accurately reflect descendant completion
4. **Filter correctness**: All filter combinations return expected results
5. **Search performance**: Search results appear within 100ms of typing
6. **Theme integration**: All visual elements update when theme colors change
7. **Animation respect**: All animations disable when animation intensity is "off"
8. **Test coverage**: New components have >80% test coverage
9. **Build success**: Production build completes without errors

## Open Questions

1. Should collapse state be persisted globally (all documents remember state) or reset on document switch?
2. Should the progress summary show "3/7" or "3 of 7" or "43%" format (or user preference)?
3. Should there be a keyboard shortcut to toggle all sections expanded/collapsed?
4. How should items appear when search matches only partial text (highlight matching portion)?

---

*Generated: 2025-12-07*
*Spec ID: 03-spec-documentview-redesign*
*Dependencies: 02-spec-theme-customization (must be implemented first for theme integration)*
*Next Step: Run `/generate-task-list-from-spec` after approval*
