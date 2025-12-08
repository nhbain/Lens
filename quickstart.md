# Lens - Agent Quickstart

Lens is a Tauri v2 desktop app for tracking progress through markdown documents without modifying source files.

## Project Status

**Completed Stories:** 1-10 (scaffolding, parser, state, file import, directory watching, document view, progress tracking, dashboard, resume & navigation, settings)

**Completed Specs:**
- Spec 01: UI Polish & Common Components (Button, Input, Select, Card, Badge, Tooltip, Modal)
- Spec 02: Theme Customization (ColorPicker, animation intensity, custom colors)
- Spec 03: DocumentView Redesign (tree view, collapse/expand, section progress, filters, search)

## Key Files to Read

### Project Overview
- `README.md` - Architecture, modules, and usage examples
- `tasks/story-list-feature-lens.md` - All stories and implementation order
- `tasks/prd-feature-lens.md` - Full product requirements

### Feature Specifications (in `docs/specs/`)
- `01-spec-ui-polish-future-considerations/` - Common components library
- `02-spec-theme-customization/` - Theme colors & animation controls
- `03-spec-documentview-redesign/` - Hierarchical tree view with filters

### Core Modules (in `app/src/lib/`)

**Parser** - Markdown parsing and item extraction
- `parser/types.ts` - TrackableItem, TrackingStatus, ParsedDocument
- `parser/index.ts` - Public API

**State** - Progress persistence
- `state/types.ts` - FileTrackingState, ItemTrackingState
- `state/index.ts` - Public API

**Files** - File import and tracking
- `files/types.ts` - TrackedFile, validation types
- `files/index.ts` - Public API

**Watcher** - Directory watching
- `watcher/types.ts` - WatchedDirectory, WatchConfig
- `watcher/index.ts` - Public API

**Progress** - Status tracking and parent calculation
- `progress/types.ts` - StatusChangeEvent, ParentProgress, getNextStatus
- `progress/calculator.ts` - propagateStatusChange, deriveParentStatus
- `progress/index.ts` - Public API

**Navigation** - Scroll position management
- `navigation/types.ts` - ScrollPosition interfaces
- `navigation/scroll-manager.ts` - Position tracking and restoration
- `navigation/index.ts` - Public API

**Settings** - Settings persistence
- `settings/types.ts` - Settings data structures
- `settings/settings-manager.ts` - Settings persistence and retrieval
- `settings/index.ts` - Public API

**Common Components** - Reusable UI components
- `common-components/Button/` - 6 variants (primary, secondary, danger, ghost, ghost-danger, outline, link)
- `common-components/Input/`, `Select/`, `Checkbox/` - Form components
- `common-components/Card/`, `Badge/`, `Tooltip/`, `Modal/` - Display components
- `common-components/ColorPicker/` - Theme color picker

**Theme** - Color utilities
- `theme/color-utils.ts` - HSL/Hex conversion, palette derivation
- `theme/index.ts` - Public API

### Components (in `app/src/components/`)

**Dashboard** - Main dashboard view
- `Dashboard/Dashboard.tsx` - Dashboard container
- `Dashboard/FileCard.tsx` - Individual file card
- `Dashboard/ProgressBar.tsx` - Progress visualization
- `Dashboard/ResumeSection.tsx` - In-progress items for quick resume

**DocumentView** - Renders trackable items with status (redesigned in Spec 03)
- `DocumentView/DocumentView.tsx` - Main document viewer with tree structure
- `DocumentView/DocumentHeader.tsx` - Progress bar, filters, search
- `DocumentView/SectionProgressBar.tsx` - Section-level progress display
- `DocumentView/FilterButtons.tsx` - Quick filter toggles
- `DocumentView/TrackableItemRow.tsx` - Individual item row with collapse

**Settings** - Application settings UI
- `Settings/Settings.tsx` - Settings container
- `Settings/WatchedDirectoriesSection.tsx` - Directory watching config

**App Integration**
- `App.tsx` - Main app with file list and document view

### Key Hooks (in `app/src/hooks/`)
- `useDocumentView.ts` - Parsed document state and status updates
- `useDocumentFilters.tsx` - Filter/search logic for document items
- `useCollapseState.ts` - Tree collapse/expand state persistence
- `useTreeKeyboardNavigation.ts` - Keyboard navigation (arrows, Home/End, Ctrl+F)
- `useThemeApplication.ts` - Apply theme to CSS variables
- `useDashboard.ts` - Dashboard data loading
- `useSettings.ts` - Application settings management

### Task Lists
- `tasks/tasks-story-lens-*.md` - Individual story task files

## Quick Commands

```bash
cd app
npm install
npm run test          # 1329 tests
npm run lint          # ESLint
npm run tauri dev     # Run app
```

## Tech Stack

- Tauri v2 + React 19 + TypeScript
- remark/mdast for markdown parsing
- Vitest + React Testing Library
- react-colorful for color picker

## Theme System

**Default Theme:** Dark OLED Luxury
- Primary accent: Cyan (#00F0F4)
- Secondary accent: Emerald (#10B981)
- Warning: Amber (#F59E0B)
- Surface colors: True black (#0a0a0a, #111111, #1a1a1a)

**Animation Intensity:** off | reduced | full (respects OS prefers-reduced-motion)

**Customization:** Users can override colors via Settings > Theme Customization

## Testing Notes

### React Hook Testing Issue

Components that import React hooks directly from 'react' (useRef, useState, useEffect, useMemo, etc.) will fail with "Invalid hook call" errors in Vitest when combined with Tauri module mocking. The error looks like:

```
TypeError: Cannot read properties of null (reading 'useRef')
```

**Workaround:** Use mock components in tests that mirror the real component behavior without React hooks.

**Examples of this pattern:**
- `Dashboard.test.tsx` - Uses `MockDashboard` instead of real Dashboard
- `DocumentView.test.tsx` - Uses `MockDocumentView` instead of real DocumentView
- `App.test.tsx` - Uses `MockApp` instead of real App

**For hooks:** Test helper functions directly instead of the hook itself. See `useDashboard.test.tsx` which tests sorting/calculation logic without rendering the hook.

**Pattern:**
```tsx
// Create a mock that mirrors component structure without hooks
const MockComponent = (props: ComponentProps) => {
  // Implement same logic but without hooks
  return <div>...</div>
}

// Use mock in tests
const Component = MockComponent

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component {...props} />)
  })
})
```
