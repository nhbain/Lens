# 04-tasks-markdown-editor.md

Task breakdown for the Markdown Editor feature as specified in `04-spec-markdown-editor.md`.

---

## Parallelization Guide

This task list is designed for **multi-agent parallel execution**. Use this guide to assign work to concurrent agents.

### Phase 1: Foundation (Parallel)
**Can run simultaneously with 2 agents:**

| Agent | Task | Files Touched | Duration |
|-------|------|---------------|----------|
| **Agent A** | 1.0 Parser Enhancement | `lib/parser/*`, `lib/editor/markdown-slice.ts` | ~2-3 hours |
| **Agent B** | 2.0 Tauri File Write | `lib/editor/source-file-operations.ts`, `src-tauri/capabilities/*` | ~1-2 hours |

**No conflicts** - these tasks touch completely separate files.

### Phase 2: Main Feature (Sequential after Phase 1)
**Requires Phase 1 completion:**

| Agent | Task | Depends On | Duration |
|-------|------|------------|----------|
| **Agent A** | 3.0 Editor Modal | 1.0 complete | ~3-4 hours |
| **Agent B** | 5.0 Settings Integration | None (can start early) | ~1-2 hours |

**Note:** Task 5.0 can start in Phase 1 if Agent B finishes 2.0 early, since settings types don't depend on parser/write.

### Phase 3: Integration (Sequential after Phase 2)
**Requires all prior tasks:**

| Agent | Task | Depends On | Duration |
|-------|------|------------|----------|
| **Single Agent** | 4.0 Save Integration | 1.0, 2.0, 3.0, 5.0 | ~2-3 hours |

### Visual Timeline

```
Time ──────────────────────────────────────────────────────────►

Agent A: [═══ 1.0 Parser ═══]──────[═══════ 3.0 Editor Modal ═══════]
Agent B: [═══ 2.0 Tauri ═══][═ 5.0 Settings ═]
                                                    ↓
                                        [═══ 4.0 Save Integration ═══]
```

---

## Relevant Files

### New Files to Create

- `app/src/lib/editor/index.ts` - Public API for editor module
- `app/src/lib/editor/markdown-slice.ts` - Extract markdown slice for item + children
- `app/src/lib/editor/markdown-slice.test.ts` - Tests for slice extraction
- `app/src/lib/editor/source-file-operations.ts` - Write/backup source files
- `app/src/lib/editor/source-file-operations.test.ts` - Tests for file operations
- `app/src/lib/editor/types.ts` - Editor-related types
- `app/src/components/EditorModal/EditorModal.tsx` - Main editor modal component
- `app/src/components/EditorModal/EditorModal.css` - Editor modal styles
- `app/src/components/EditorModal/EditorModal.test.tsx` - Editor modal tests
- `app/src/components/EditorModal/EditorToolbar.tsx` - Formatting toolbar component
- `app/src/components/EditorModal/EditorToolbar.css` - Toolbar styles
- `app/src/components/EditorModal/index.ts` - Public exports
- `app/src/components/Settings/EditorSettingsSection.tsx` - Editor settings UI
- `app/src/components/Settings/EditorSettingsSection.test.tsx` - Settings section tests
- `app/src/hooks/useMarkdownEditor.ts` - Editor state and save logic hook
- `app/src/hooks/useMarkdownEditor.test.ts` - Hook tests

### Existing Files to Modify

- `app/src/lib/parser/types.ts` - Add `endPosition` to Position, `rawContent` to TrackableItem
- `app/src/lib/parser/types.test.ts` - Add tests for new type guards
- `app/src/lib/parser/item-extractor.ts` - Track end positions during extraction
- `app/src/lib/parser/item-extractor.test.ts` - Add end position tests
- `app/src/lib/parser/index.ts` - Export new types/functions
- `app/src/lib/settings/types.ts` - Add `EditorSettings` interface
- `app/src/lib/settings/settings-manager.ts` - Handle editor settings migration
- `app/src/lib/settings/settings-manager.test.ts` - Add editor settings tests
- `app/src-tauri/capabilities/default.json` - Add `fs:allow-write-text-file` permission
- `app/src/components/DocumentView/TrackableItemRow.tsx` - Change click to open editor, Shift+click for status
- `app/src/components/DocumentView/DocumentView.tsx` - Add editor state and modal rendering
- `app/src/components/Settings/Settings.tsx` - Add EditorSettingsSection
- `app/src/App.tsx` - Integrate editor modal and handle save refresh
- `app/package.json` - Add Milkdown dependencies

### Notes

- Unit tests should be placed alongside source files (e.g., `EditorModal.tsx` and `EditorModal.test.tsx`)
- Use `npm run test` to run all tests, `npm run test -- path/to/file.test.ts` for specific files
- Follow existing mock component pattern for Tauri-dependent tests (see `DocumentView.test.tsx`)
- Use CSS custom properties for theming (reference `App.css` for variable names)

---

## Tasks

### [x] 1.0 Parser Enhancement for Editing Support

**🏷️ Agent Assignment: Agent A (Phase 1)**

Extend the markdown parser to track end positions and preserve raw markdown content, enabling precise content extraction for the editor.

#### 1.0 Proof Artifact(s)

- Test: `item-extractor.test.ts` passes with new tests for end position tracking demonstrates parser correctly identifies item boundaries
- Test: `markdown-slice.test.ts` passes demonstrates slice extraction function works correctly
- Console: Log output showing TrackableItem with `position.line`, `position.column`, `endPosition.line`, `endPosition.column` demonstrates position tracking works

#### 1.0 Tasks

- [x] 1.1 Extend `Position` interface in `lib/parser/types.ts` to add optional `endLine` and `endColumn` fields
- [x] 1.2 Add optional `rawContent` field to `TrackableItem` interface in `lib/parser/types.ts`
- [x] 1.3 Update `isPosition` type guard to handle new optional end fields
- [x] 1.4 Add tests for updated type guards in `types.test.ts`
- [x] 1.5 Modify `extractItems()` in `item-extractor.ts` to capture end positions from mdast `position.end`
- [x] 1.6 For items with children, calculate end position as the end of the last descendant
- [x] 1.7 Add tests in `item-extractor.test.ts` for end position extraction (headers, list items, nested items)
- [x] 1.8 Create `lib/editor/` directory structure with `index.ts`, `types.ts`
- [x] 1.9 Create `markdown-slice.ts` with `extractMarkdownSlice(sourceContent: string, item: TrackableItem): string` function
- [x] 1.10 Implement slice extraction using line numbers to cut exact content for item + children
- [x] 1.11 Add comprehensive tests in `markdown-slice.test.ts` for various item types and nesting levels
- [x] 1.12 Export new functions from `lib/editor/index.ts` and `lib/parser/index.ts`

---

### [x] 2.0 Tauri File Write Capability

**🏷️ Agent Assignment: Agent B (Phase 1)**

Add the ability to write changes back to source markdown files with proper Tauri permissions, atomic writes, and backup mechanisms.

#### 2.0 Proof Artifact(s)

- Test: `source-file-operations.test.ts` passes for write/backup functions demonstrates write capability works in isolation
- File: Modified markdown file on disk after calling `writeSourceFile()` demonstrates end-to-end write works
- File: Backup file (`.md.bak`) created alongside source file demonstrates backup mechanism works
- Config: `default.json` shows `fs:allow-write-text-file` permission added demonstrates Tauri capability configured

#### 2.0 Tasks

- [x] 2.1 Add `fs:allow-write-text-file` permission to `src-tauri/capabilities/default.json` with path pattern `**/*.md`
- [x] 2.2 Create `lib/editor/source-file-operations.ts` with type definitions for write operations
- [x] 2.3 Implement `createBackup(sourcePath: string): Promise<string>` - copies source to `.md.bak`
- [x] 2.4 Implement `writeSourceFileAtomic(path: string, content: string): Promise<void>` - write to temp, then rename
- [x] 2.5 Implement `writeSourceFile(path: string, content: string, createBackup?: boolean): Promise<WriteResult>` - main API
- [x] 2.6 Add validation to ensure path ends with `.md` or `.markdown` before writing
- [x] 2.7 Add error handling for permission denied, file not found, disk full scenarios
- [x] 2.8 Create `source-file-operations.test.ts` with mocked Tauri fs functions
- [x] 2.9 Test atomic write behavior (temp file creation, rename)
- [x] 2.10 Test backup creation and error scenarios
- [x] 2.11 Export write functions from `lib/editor/index.ts`

---

### [x] 3.0 Editor Modal Component with Milkdown Integration

**🏷️ Agent Assignment: Agent A (Phase 2) - Requires 1.0 complete**

Create the EditorModal component that displays when a user clicks an item, integrating Milkdown for WYSIWYG markdown editing with both overlay and split-view display modes.

#### 3.0 Proof Artifact(s)

- Screenshot: EditorModal in overlay mode with Milkdown editor and toolbar visible demonstrates component renders correctly
- Screenshot: EditorModal in split-view mode (side-by-side with tree) demonstrates alternative layout works
- Screenshot: Milkdown editor with formatted content (bold text, heading, bullet list, checkbox) demonstrates WYSIWYG editing works
- Test: `EditorModal.test.tsx` passes demonstrates component behavior is tested

#### 3.0 Tasks

- [x] 3.1 Install Milkdown packages: `npm install @milkdown/core @milkdown/react @milkdown/preset-commonmark @milkdown/preset-gfm @milkdown/plugin-listener`
- [x] 3.2 Create `components/EditorModal/` directory with `index.ts`
- [x] 3.3 Create `EditorModal.tsx` with basic structure: header (title, close button), content area, footer (save/cancel buttons)
- [x] 3.4 Implement overlay mode: centered modal with backdrop, max-width 800px, scrollable content
- [x] 3.5 Implement split-view mode: editor takes right 50-60% of viewport, CSS class toggle
- [x] 3.6 Add `mode` prop to EditorModal (`'overlay' | 'split'`) with appropriate layout switching
- [x] 3.7 Create `EditorToolbar.tsx` with formatting buttons: bold, italic, headings (H1-H6 dropdown), bullet list, ordered list, checkbox, code inline
- [x] 3.8 Style toolbar with ghost buttons, cyan accent on hover (matching Dark OLED Luxury theme)
- [x] 3.9 Integrate Milkdown editor into EditorModal content area
- [x] 3.10 Configure Milkdown with commonmark + gfm presets for checkboxes support
- [x] 3.11 Create custom Milkdown theme CSS to match Dark OLED Luxury (true black bg, lighter editor surface #111111)
- [x] 3.12 Wire toolbar buttons to Milkdown commands (bold, italic, etc.)
- [x] 3.13 Add `initialContent` prop to load markdown into editor on mount
- [x] 3.14 Add `onContentChange` callback prop to notify parent of edits
- [x] 3.15 Implement close behavior: Escape key and backdrop click (overlay mode only)
- [x] 3.16 Add unsaved changes detection: compare current content vs initial
- [x] 3.17 Show confirmation dialog on close if unsaved changes exist
- [x] 3.18 Create `EditorModal.css` with all styles (overlay, split-view, toolbar, editor area)
- [x] 3.19 Create `EditorModal.test.tsx` using mock component pattern (avoid hook issues)
- [x] 3.20 Test: renders in overlay mode, renders in split mode, toolbar buttons visible, close button works

---

### [x] 4.0 Save Integration and Click Behavior Change

**🏷️ Agent Assignment: Single Agent (Phase 3) - Requires 1.0, 2.0, 3.0, 5.0 complete**

Wire the editor to save changes back to the source file, refresh the document view, and change click behavior so clicking opens editor while Shift+click cycles status.

#### 4.0 Proof Artifact(s)

- Screenshot: Unsaved indicator (amber dot) visible in editor header when content changed demonstrates change detection works
- Screenshot: Success toast after save operation demonstrates save feedback works
- Demo: Click item → editor opens → edit content → save → tree view updates with new content demonstrates full edit-save-refresh flow
- Demo: Shift+click item → status cycles (not-started → in-progress → complete) demonstrates status cycling still works
- Test: `useMarkdownEditor.test.ts` passes demonstrates save/edit logic works correctly

#### 4.0 Tasks

- [x] 4.1 Create `hooks/useMarkdownEditor.ts` with state: `editingItem`, `originalContent`, `currentContent`, `isDirty`, `isSaving`
- [x] 4.2 Implement `openEditor(item: TrackableItem, sourcePath: string)` - loads content using `extractMarkdownSlice`
- [x] 4.3 Implement `closeEditor()` - clears state, prompts if dirty
- [x] 4.4 Implement `updateContent(content: string)` - updates current content, sets dirty flag
- [x] 4.5 Implement `saveContent(): Promise<SaveResult>` - calls write functions, handles errors
- [x] 4.6 Implement content replacement logic: read full file, replace slice at correct line positions, write back
- [x] 4.7 Add auto-save with debounce using `settings.editorAutoSave` and `settings.editorAutoSaveDelay`
- [x] 4.8 Add manual save keyboard shortcut: Cmd/Ctrl+S when editor is focused
- [x] 4.9 Create `useMarkdownEditor.test.ts` testing open, edit, save, auto-save flows
- [x] 4.10 Modify `TrackableItemRow.tsx`: change `onClick` to call `onEdit(item)` instead of status change
- [x] 4.11 Add `onShiftClick` handler to `TrackableItemRow.tsx` for status cycling
- [x] 4.12 Update `DocumentView.tsx` to pass `onEdit` handler and manage editor state
- [x] 4.13 Integrate `EditorModal` into `DocumentView.tsx` or `App.tsx` (render when `editingItem` is set)
- [x] 4.14 Add unsaved indicator (amber dot) to EditorModal header when `isDirty` is true
- [x] 4.15 After successful save, trigger document re-parse: call existing `loadDocument()` or similar
- [x] 4.16 Preserve collapse state across document refresh (already handled by `useCollapseState`)
- [x] 4.17 Show success toast after save using existing toast/notification pattern
- [x] 4.18 Show error toast on save failure with error message
- [x] 4.19 Handle edge case: item positions change after edit (IDs regenerate) - close editor gracefully

---

### [x] 5.0 Settings Integration

**🏷️ Agent Assignment: Agent B (Phase 2) - Can start after 2.0 or in parallel**

Add user preferences for editor display mode (overlay/split) and auto-save behavior to the Settings panel, with persistence across app restarts.

#### 5.0 Proof Artifact(s)

- Screenshot: Settings panel with "Editor" section showing view mode and auto-save options demonstrates UI exists
- Screenshot: EditorModal respecting split-view setting (after changing in settings) demonstrates setting applies correctly
- Test: `settings-manager.test.ts` passes with editor settings demonstrates settings persistence works
- Test: `useMarkdownEditor.test.ts` includes auto-save tests demonstrates auto-save logic works

#### 5.0 Tasks

- [x] 5.1 Add `EditorViewMode` type to `lib/settings/types.ts`: `'overlay' | 'split'`
- [x] 5.2 Add `EditorSettings` interface to `lib/settings/types.ts`: `viewMode`, `autoSave`, `autoSaveDelay`
- [x] 5.3 Extend `AppSettings` interface to include `editor: EditorSettings`
- [x] 5.4 Update `CURRENT_SETTINGS_VERSION` to 3 in `types.ts`
- [x] 5.5 Add default editor settings to `createDefaultSettings()`: `{ viewMode: 'overlay', autoSave: true, autoSaveDelay: 2000 }`
- [x] 5.6 Add type guards: `isEditorViewMode()`, `isEditorSettings()`
- [x] 5.7 Update `isAppSettings()` type guard to validate editor settings
- [x] 5.8 Add migration logic in `settings-manager.ts` for v2 → v3 (add default editor settings if missing)
- [x] 5.9 Add tests for new type guards and migration in `settings-manager.test.ts`
- [x] 5.10 Create `EditorSettingsSection.tsx` component with:
  - View mode select: "Overlay" / "Split View"
  - Auto-save toggle checkbox
  - Auto-save delay input (1-10 seconds, disabled when auto-save off)
- [x] 5.11 Style `EditorSettingsSection` to match existing settings sections (use Card, Select, Checkbox, Input components)
- [x] 5.12 Add `EditorSettingsSection` to `Settings.tsx` in the appropriate location
- [x] 5.13 Create `EditorSettingsSection.test.tsx` with render and interaction tests
- [x] 5.14 Update `useSettings.ts` hook to expose editor settings (if not already generic)
- [x] 5.15 Wire EditorModal to read `settings.editor.viewMode` and apply correct mode

---

## Summary

| Task | Sub-tasks | Est. Duration | Agent | Phase |
|------|-----------|---------------|-------|-------|
| 1.0 Parser Enhancement | 12 | 2-3 hours | A | 1 |
| 2.0 Tauri File Write | 11 | 1-2 hours | B | 1 |
| 3.0 Editor Modal | 20 | 3-4 hours | A | 2 |
| 4.0 Save Integration | 19 | 2-3 hours | Any | 3 |
| 5.0 Settings Integration | 15 | 1-2 hours | B | 2 |
| **Total** | **77** | **9-14 hours** | | |

---

## Execution Commands

```bash
# Phase 1 - Run in parallel terminals
# Terminal 1 (Agent A): Parser Enhancement
npm run test -- src/lib/parser/

# Terminal 2 (Agent B): Tauri File Write
npm run test -- src/lib/editor/source-file-operations.test.ts

# Phase 2 - After Phase 1 complete
# Agent A: Editor Modal
npm run test -- src/components/EditorModal/

# Agent B: Settings
npm run test -- src/lib/settings/ src/components/Settings/EditorSettingsSection.test.tsx

# Phase 3 - After Phase 2 complete
npm run test -- src/hooks/useMarkdownEditor.test.ts

# Final validation
npm run test
npm run lint
```
