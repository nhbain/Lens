# Lens - Markdown Progress Tracker

A lightweight desktop application for tracking progress through markdown documents, enabling seamless context switching and persistent progress tracking.

## Quick Start

```bash
cd app
npm install
npm run tauri dev
```

> **Note:** First run takes several minutes to compile Rust dependencies. Subsequent runs are much faster.

## Prerequisites

- **Node.js** 18+
- **Rust** toolchain ([install via rustup](https://rustup.rs/))
- **Platform-specific dependencies:**
  - **macOS:** Xcode Command Line Tools (`xcode-select --install`)
  - **Windows:** [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)

Verify Rust is installed:
```bash
rustc --version
cargo --version
```

## Available Scripts

All scripts run from the `app/` directory:

| Script | Description |
|--------|-------------|
| `npm run tauri dev` | Start app in development mode with hot-reload |
| `npm run tauri build` | Build production app for current platform |
| `npm run dev` | Start Vite dev server only (no Tauri) |
| `npm run build` | Build frontend only |
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without changes |

## Architecture Overview

Lens is a Tauri v2 desktop application with a React frontend. The app tracks progress on markdown documents by:

1. **Parsing** markdown files to extract trackable items (headings, list items, checkboxes)
2. **Persisting** progress state to separate JSON files (never modifies source markdown)
3. **Displaying** documents with interactive progress tracking UI

```
┌─────────────────────────────────────────────────────────────┐
│                        Tauri Shell                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   React Frontend                      │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐   │  │
│  │  │    App      │  │  Dashboard  │  │ DocumentView │   │  │
│  │  │ Components  │  │             │  │              │   │  │
│  │  └──────┬──────┘  └─────────────┘  └──────────────┘   │  │
│  │         │                                             │  │
│  │  ┌──────┴──────────────────────────────────────────┐  │  │
│  │  │                   Lib Modules                   │  │  │
│  │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐          │  │  │
│  │  │  │ parser  │  │  state  │  │  files  │          │  │  │
│  │  │  └─────────┘  └─────────┘  └─────────┘          │  │  │
│  │  │  ┌─────────┐  ┌──────────┐  ┌────────────┐      │  │  │
│  │  │  │ watcher │  │ progress │  │ navigation │      │  │  │
│  │  │  └─────────┘  └──────────┘  └────────────┘      │  │  │
│  │  │  ┌──────────┐                                   │  │  │
│  │  │  │ settings │                                   │  │  │
│  │  │  └──────────┘                                   │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                              │                              │
│                    Tauri Plugin APIs                        │
│              (dialog, fs, path, shell)                      │
└─────────────────────────────────────────────────────────────┘
```

## Project Structure

```
lens/
├── app/                          # Tauri application
│   ├── src/                      # React frontend source
│   │   ├── App.tsx               # Root component
│   │   ├── App.css               # Global styles
│   │   ├── components/           # React components
│   │   │   ├── Dashboard/        # Dashboard view components
│   │   │   ├── DocumentView/     # Document viewer components
│   │   │   ├── Settings/         # Settings UI components
│   │   │   ├── UndoToast/        # Undo notification component
│   │   │   ├── FileImportButton.tsx
│   │   │   └── TrackedFilesList.tsx
│   │   ├── hooks/                # Custom React hooks
│   │   │   ├── useDashboard.ts
│   │   │   ├── useDocumentView.ts
│   │   │   ├── useDocumentFilters.tsx    # Filter/search for document items
│   │   │   ├── useCollapseState.ts       # Tree collapse/expand state
│   │   │   ├── useTreeKeyboardNavigation.ts # Tree keyboard navigation
│   │   │   ├── useThemeApplication.ts    # Apply theme to CSS variables
│   │   │   ├── useFileImport.ts
│   │   │   ├── useInProgressItems.ts
│   │   │   ├── useItemStatus.ts
│   │   │   ├── useKeyboardNavigation.ts
│   │   │   ├── useScrollPosition.ts
│   │   │   ├── useSettings.ts
│   │   │   └── useUndo.ts
│   │   ├── lib/                  # Core business logic
│   │   │   ├── parser/           # Markdown parsing
│   │   │   ├── state/            # State persistence
│   │   │   ├── files/            # File import & tracking
│   │   │   ├── watcher/          # Directory watching
│   │   │   ├── progress/         # Status tracking & parent calculation
│   │   │   ├── navigation/       # Scroll position management
│   │   │   ├── settings/         # Settings persistence
│   │   │   ├── common-components/ # Reusable UI components (Button, Input, Card, etc.)
│   │   │   └── theme/            # Color utilities & theme derivation
│   │   └── test/                 # Test utilities
│   ├── src-tauri/                # Rust backend
│   │   ├── src/lib.rs            # Tauri plugin registration
│   │   ├── capabilities/         # Permission configuration
│   │   ├── Cargo.toml            # Rust dependencies
│   │   └── tauri.conf.json       # Tauri configuration
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── vitest.config.ts
├── docs/                         # Documentation
│   └── specs/                    # Feature specifications
│       ├── 01-spec-ui-polish-future-considerations/
│       ├── 02-spec-theme-customization/
│       └── 03-spec-documentview-redesign/
└── tasks/                        # Story & task tracking
    ├── story-list-feature-lens.md
    └── tasks-story-lens-*.md     # Individual story tasks
```

## Core Modules

### `lib/parser` - Markdown Parsing

Parses markdown files and extracts trackable items.

```typescript
import { parseMarkdown, extractItems } from './lib/parser'

const ast = parseMarkdown('# Hello\n- [ ] Task')
const items = extractItems(ast)
// items: [{ id, type: 'heading', text: 'Hello', ... }, { id, type: 'checkbox', text: 'Task', ... }]
```

**Key exports:**
- `parseMarkdown(content)` - Parse markdown string to AST
- `extractItems(ast)` - Extract trackable items from AST
- `TrackableItem` - Interface for extracted items

### `lib/state` - State Persistence

Persists tracking progress to JSON files in the app data directory.

```typescript
import { saveFileState, loadFileState, deleteFileState } from './lib/state'

// Save progress for a document
await saveFileState('/path/to/doc.md', {
  sourcePath: '/path/to/doc.md',
  contentHash: 'abc123',
  items: { 'item-1': { status: 'complete' } },
  // ...
})

// Load progress
const state = await loadFileState('/path/to/doc.md')
```

**Key exports:**
- `saveFileState(path, state)` - Persist state to disk
- `loadFileState(path)` - Load state from disk
- `deleteFileState(path)` - Remove state file
- `listTrackedFiles()` - List all tracked file paths
- `FileState` - Interface for persisted state

### `lib/files` - File Import & Tracking

Manages file picker dialogs and tracked files list.

```typescript
import {
  openMarkdownFilePicker,
  validateMarkdownFile,
  addTrackedFile,
  getTrackedFiles,
  removeTrackedFile
} from './lib/files'

// Open native file picker
const path = await openMarkdownFilePicker()

// Validate and add to tracking
const result = await addTrackedFile(path)
if (result.success) {
  console.log('Tracking:', result.file.fileName)
}

// Get all tracked files
const files = getTrackedFiles()
```

**Key exports:**
- `openMarkdownFilePicker()` - Native file picker dialog
- `validateMarkdownFile(path)` - Validate file for import
- `addTrackedFile(path)` - Add file to tracking
- `removeTrackedFile(path)` - Remove file from tracking
- `getTrackedFiles()` - Get all tracked files
- `loadTrackedFiles()` - Initialize from persisted state

### `lib/watcher` - Directory Watching

Watches directories for markdown file changes and auto-tracks files.

```typescript
import {
  loadWatchConfig,
  addWatchedDirectory,
  startAllConfiguredWatchers,
  connectEventHandler,
  onTrackedFileAdded,
} from './lib/watcher'

// Initialize on app startup
await loadWatchConfig()
startAllConfiguredWatchers()
connectEventHandler()

// Listen for auto-tracked files
onTrackedFileAdded((path, success) => {
  console.log(`File ${path} was ${success ? 'tracked' : 'failed'}`)
})

// Add a directory to watch
const result = await addWatchedDirectory('/path/to/docs')
```

**Key exports:**
- `loadWatchConfig()` - Load watch configuration from disk
- `addWatchedDirectory(path, patterns?)` - Add directory to watch list
- `removeWatchedDirectory(path)` - Remove from watch list
- `startWatching(path)` - Start watching a configured directory
- `stopAllWatchers()` - Stop all watchers (on app shutdown)
- `connectEventHandler()` - Connect watcher to tracked files module
- `onTrackedFileAdded(callback)` - Listen for auto-tracked files

### `lib/progress` - Status Tracking & Parent Calculation

Manages item status transitions and calculates parent progress from children.

```typescript
import {
  getNextStatus,
  propagateStatusChange,
  deriveParentStatus,
  calculateChildrenProgress
} from './lib/progress'

// Cycle through statuses: not-started -> in-progress -> complete
const nextStatus = getNextStatus('not-started') // 'in-progress'

// Calculate parent status from children
const parentStatus = deriveParentStatus(childItems)

// Get progress percentage
const progress = calculateChildrenProgress(childItems)
```

**Key exports:**
- `getNextStatus(status)` - Get next status in cycle
- `getPreviousStatus(status)` - Get previous status in cycle
- `propagateStatusChange(items, itemId, newStatus)` - Update item and propagate to parents
- `deriveParentStatus(children)` - Calculate parent status from children
- `calculateChildrenProgress(children)` - Calculate completion percentage

### `lib/navigation` - Scroll Position Management

Tracks and restores scroll positions for document navigation.

```typescript
import { saveScrollPosition, getScrollPosition } from './lib/navigation'

// Save current position
saveScrollPosition('/path/to/doc.md', { top: 100, itemId: 'h2-3' })

// Restore position
const position = getScrollPosition('/path/to/doc.md')
```

**Key exports:**
- `saveScrollPosition(path, position)` - Save scroll position for a file
- `getScrollPosition(path)` - Get saved scroll position
- `clearScrollPosition(path)` - Clear saved position

### `lib/settings` - Settings Persistence

Manages application settings persistence.

```typescript
import { loadSettings, saveSettings } from './lib/settings'

// Load settings
const settings = await loadSettings()

// Save settings
await saveSettings({ theme: 'dark', ...settings })
```

**Key exports:**
- `loadSettings()` - Load settings from disk
- `saveSettings(settings)` - Save settings to disk
- `getDefaultSettings()` - Get default settings object

### `lib/common-components` - Reusable UI Components

A unified component library with consistent Dark OLED Luxury theme styling.

```typescript
import { Button, Input, Select, Card, Badge, Modal } from './lib/common-components'

// Button variants: primary, secondary, danger, ghost, ghost-danger, outline, link
<Button variant="primary" size="medium" onClick={handleClick}>Save</Button>

// Form components with theme integration
<Input label="Name" placeholder="Enter name" error={errors.name} />
<Select options={options} value={selected} onChange={setSelected} />

// Display components
<Card header="Title"><p>Content</p></Card>
<Badge variant="success">Complete</Badge>
```

**Available components:**
- `Button` - 6 variants, 3 sizes, loading state
- `Input` - Text input with label, placeholder, error states
- `Select` - Styled dropdown with custom arrow
- `Checkbox` - Custom styled checkbox
- `Card` - Container with optional header/body/footer
- `Badge` - 5 variants (default, success, warning, error, info)
- `Tooltip` - 4 positions with fade animation
- `Modal` - Centered overlay with focus trap, keyboard handling
- `ColorPicker` - HSL color picker with hex input

### `lib/theme` - Color Utilities & Theme Derivation

Color manipulation utilities for dynamic theme customization.

```typescript
import { hexToHsl, deriveFullAccentPalette } from './lib/theme'

// Convert colors
const hsl = hexToHsl('#00F0F4') // { h: 181, s: 100, l: 48 }

// Derive complete palette from base color
const palette = deriveFullAccentPalette('#00F0F4')
// { base, hover, light, muted, glow, ring }
```

**Key exports:**
- `hexToHsl(hex)` / `hslToHex(hsl)` - Color space conversion
- `deriveHoverColor(hex)` - Darker variant for hover states
- `deriveLightColor(hex)` - Lighter variant
- `deriveMutedColor(hex)` - Desaturated variant
- `deriveGlowColor(hex)` - Transparent glow variant
- `deriveFullAccentPalette(hex)` - Complete palette generation

## Components

### `FileImportButton`

Button that triggers file import. Pure presentational component.

```tsx
<FileImportButton
  onClick={importFile}
  isLoading={isLoading}
  disabled={!isInitialized}
/>
```

### `TrackedFilesList`

Displays list of tracked files with remove functionality.

```tsx
<TrackedFilesList
  files={trackedFiles}
  onRemove={handleRemove}
  onSelect={handleSelect}
/>
```

### `Message`

Displays dismissible notification messages.

```tsx
<Message type="success" message="File added!" onDismiss={dismiss} />
```

## Testing

Tests use **Vitest** with **React Testing Library**. All tests are colocated with source files.

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- src/lib/parser/markdown-parser.test.ts

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test -- --coverage
```

### Test Structure

- Unit tests for lib modules mock Tauri APIs
- Component tests use `@testing-library/react`
- Integration tests verify full workflows

```
Current test count: 1329 tests across 50+ files
```

### Mocking Tauri APIs

Tests mock Tauri plugins at module level:

```typescript
vi.mock('@tauri-apps/plugin-dialog', () => ({
  open: vi.fn(),
}))

vi.mock('@tauri-apps/plugin-fs', () => ({
  readTextFile: vi.fn(),
  writeTextFile: vi.fn(),
  // ...
}))
```

## Development Progress

### Completed Stories

- [x] **STORY-LENS-001** - Project Scaffolding & Build Setup
- [x] **STORY-LENS-002** - Markdown Parser Integration
- [x] **STORY-LENS-003** - State Persistence Layer
- [x] **STORY-LENS-004** - File Import & Manual Management
- [x] **STORY-LENS-005** - Directory Watching & Auto-Discovery
- [x] **STORY-LENS-006** - Document View & Item Display
- [x] **STORY-LENS-007** - Progress Tracking Interactions
- [x] **STORY-LENS-008** - Dashboard View
- [x] **STORY-LENS-009** - Resume & Quick Navigation
- [x] **STORY-LENS-010** - Settings & Configuration UI

### Completed Specs

- [x] **SPEC-01** - UI Polish & Common Components (Button, Input, Select, Checkbox, Card, Badge, Tooltip, Modal)
- [x] **SPEC-02** - Theme Customization (ColorPicker, animation intensity, custom colors)
- [x] **SPEC-03** - DocumentView Redesign (tree view, collapse/expand, section progress, filters, search, keyboard navigation)

See `tasks/` for story breakdowns and `docs/specs/` for detailed specifications.

## Code Style

Follow the style guide in `~/.claude/rules/`:

- **TypeScript:** Arrow functions, named exports, `??` for nullish coalescing
- **React:** Small composable components, hooks for stateful logic
- **Testing:** Colocated test files, comprehensive mocking

Key patterns:
- Avoid `any` type - use proper interfaces
- Prefer `??` over `||` for fallback values
- Separate presentational components from hooks
- Use `useCallback` only when passing to child components

## Tech Stack

- **Framework:** [Tauri](https://tauri.app/) v2
- **Frontend:** React 19 + TypeScript + Vite
- **Markdown:** remark + mdast for parsing
- **Testing:** Vitest + React Testing Library
- **Linting:** ESLint 9 + Prettier

## Production Build

```bash
npm run tauri build
```

Built artifacts are located in:
- **macOS:** `app/src-tauri/target/release/bundle/dmg/`
- **Windows:** `app/src-tauri/target/release/bundle/msi/`
