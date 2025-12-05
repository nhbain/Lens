# Lens - Agent Quickstart

Lens is a Tauri v2 desktop app for tracking progress through markdown documents without modifying source files.

## Project Status

**Completed:** Stories 1-9 (scaffolding, parser, state, file import, directory watching, document view, progress tracking, dashboard, resume & navigation)
**Remaining:** Story 10 (settings)

## Key Files to Read

### Project Overview
- `README.md` - Architecture, modules, and usage examples
- `tasks/story-list-feature-lens.md` - All stories and implementation order
- `tasks/prd-feature-lens.md` - Full product requirements

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

### Components (in `app/src/components/`)

**DocumentView** - Renders trackable items with status
- `DocumentView/DocumentView.tsx` - Main document viewer
- `DocumentView/TrackableItemRow.tsx` - Individual item row

**App Integration**
- `App.tsx` - Main app with file list and document view

### Task Lists
- `tasks/tasks-story-lens-008.md` - Dashboard View (next story)
- `tasks/tasks-story-lens-009.md` - Resume Functionality
- `tasks/tasks-story-lens-010.md` - Settings

## Quick Commands

```bash
cd app
npm install
npm run test          # 780 tests
npm run lint          # ESLint
npm run tauri dev     # Run app
```

## Tech Stack

- Tauri v2 + React 19 + TypeScript
- remark/mdast for markdown parsing
- Vitest + React Testing Library

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
