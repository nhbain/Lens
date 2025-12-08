# 04-spec-markdown-editor.md

## Introduction/Overview

This feature adds a rich text WYSIWYG markdown editor to Lens that opens when clicking an item in the document tree. Users can edit the selected item and its children directly, with changes saved back to the source markdown file. This transforms Lens from a read-only progress tracker into an interactive editing tool for iteratively working through markdown documents.

The editor uses **Milkdown**, a plugin-driven WYSIWYG editor built on remark (the same library Lens uses for parsing), ensuring seamless integration and consistent markdown handling.

## Goals

- Enable inline editing of markdown content without leaving the Lens application
- Provide a true WYSIWYG editing experience that hides markdown syntax from users
- Support both auto-save and manual save workflows with user preference
- Allow flexible display modes (modal overlay or split view) configurable via settings
- Maintain data integrity with atomic writes and backup mechanisms
- Preserve the existing progress tracking workflow while adding editing capability

## User Stories

**As a user working through a markdown document**, I want to click on an item and edit it directly so that I can make corrections or additions without switching to an external editor.

**As a user who prefers different workflows**, I want to choose between overlay modal and split-view modes so that I can work in a way that suits my screen size and preference.

**As a user making frequent small edits**, I want auto-save functionality so that my changes are preserved automatically without explicit save actions.

**As a user making careful edits**, I want manual save with an unsaved indicator so that I can review my changes before committing them to the file.

**As a user editing nested content**, I want to edit a heading and all its children as a single block so that I can work with logical sections of my document.

## Demoable Units of Work

### Unit 1: Editor Modal Component with Milkdown Integration

**Purpose:** Create the foundational editor component that displays when a user clicks an item, providing WYSIWYG markdown editing capability.

**Functional Requirements:**
- The system shall display an EditorModal component when the user clicks an item in the document tree
- The EditorModal shall integrate Milkdown editor with basic formatting toolbar (bold, italic, headings, lists, checkboxes)
- The EditorModal shall support two display modes: overlay (centered modal) and split-view (side-by-side with tree)
- The EditorModal shall include a close button that prompts for unsaved changes if applicable
- The user shall be able to dismiss the modal by pressing Escape or clicking outside (overlay mode only)
- The editor shall load the raw markdown content for the selected item and its children

**Proof Artifacts:**
- Screenshot: EditorModal in overlay mode with toolbar visible demonstrates component renders correctly
- Screenshot: EditorModal in split-view mode demonstrates alternative layout works
- Screenshot: Milkdown editor with formatted content (bold, headings, list) demonstrates WYSIWYG editing works

### Unit 2: Parser Enhancement for Editing Support

**Purpose:** Extend the parser to track end positions and preserve raw markdown, enabling precise content extraction for editing.

**Functional Requirements:**
- The parser shall track both start and end positions (line and column) for all TrackableItems
- The parser shall preserve the raw markdown content for each item in addition to plain text
- The system shall provide a `extractMarkdownSlice(sourcePath, item)` function that returns the exact markdown for an item and its children
- The Position interface shall be extended to include optional `endLine` and `endColumn` fields
- The TrackableItem interface shall include an optional `rawContent` field

**Proof Artifacts:**
- Test: `item-extractor.test.ts` passes with new end position tracking demonstrates parser correctly identifies item boundaries
- Test: `markdown-slice.test.ts` passes demonstrates slice extraction works correctly
- CLI/Console: Log output showing item with start/end positions demonstrates position tracking works

### Unit 3: Tauri File Write Capability

**Purpose:** Add the ability to write changes back to source markdown files with proper permissions and safety mechanisms.

**Functional Requirements:**
- The Tauri capabilities shall include `fs:allow-write-text-file` permission for markdown files
- The system shall provide a `writeSourceFile(path, content)` function for saving edited content
- The write operation shall use atomic write (temp file + rename) to prevent data corruption
- The system shall create a backup of the original file before writing changes
- The system shall validate that the target path is a markdown file before writing

**Proof Artifacts:**
- Test: `file-operations.test.ts` passes for write functions demonstrates write capability works
- File: Modified markdown file on disk after save demonstrates end-to-end write works
- File: Backup file (`.bak`) created demonstrates backup mechanism works

### Unit 4: Save Integration and Document Refresh

**Purpose:** Wire the editor to save changes back to the source file and refresh the document view with updated content.

**Functional Requirements:**
- The system shall save editor content back to the source file, replacing only the edited section
- The system shall support auto-save with configurable debounce delay (default 2 seconds)
- The system shall support manual save via Save button or Cmd/Ctrl+S keyboard shortcut
- The EditorModal shall display an unsaved changes indicator (dot or asterisk) when content differs from saved
- The system shall re-parse the document after successful save to update the tree view
- The system shall display a success/error toast after save operation

**Proof Artifacts:**
- Screenshot: Unsaved indicator visible in editor header demonstrates change detection works
- Screenshot: Success toast after save demonstrates save feedback works
- Test: `useMarkdownEditor.test.ts` passes demonstrates save logic works correctly
- Demo: Edit item → save → tree updates with new content demonstrates full flow works

### Unit 5: Settings Integration

**Purpose:** Add user preferences for editor display mode and auto-save behavior to the Settings panel.

**Functional Requirements:**
- The Settings panel shall include an "Editor" section with editor-related preferences
- The user shall be able to select editor view mode: "Overlay" or "Split View"
- The user shall be able to toggle auto-save on/off
- The user shall be able to configure auto-save delay (1-10 seconds) when auto-save is enabled
- The settings shall persist across application restarts
- The EditorModal shall respect the user's view mode preference

**Proof Artifacts:**
- Screenshot: Settings panel with Editor section visible demonstrates UI exists
- Screenshot: EditorModal respecting split-view setting demonstrates setting applies
- Test: Settings persistence test passes demonstrates settings save/load correctly

## Non-Goals (Out of Scope)

1. **Full document editing**: This spec covers editing individual items and their children only, not the entire document at once
2. **Collaborative editing**: No real-time collaboration or conflict resolution between multiple users
3. **Version history**: No undo/redo across save operations or version tracking
4. **Image upload/embedding**: No image insertion or management within the editor
5. **MDX/JSX support**: No support for React components or MDX-specific syntax
6. **Syntax highlighting for code blocks**: Basic code block support only, no language-specific highlighting
7. **Table editing**: Tables are not supported in initial implementation (may be added later)

## Design Considerations

**EditorModal Layout:**
- Overlay mode: Centered modal with semi-transparent backdrop, max-width 800px, scrollable content
- Split-view mode: Editor takes right 50-60% of viewport, tree remains on left with reduced width
- Toolbar: Horizontal bar at top with icon buttons for formatting (matches Dark OLED Luxury theme)
- Footer: Save button (primary), Cancel button (ghost), unsaved indicator, auto-save status

**Visual Styling:**
- Follow existing Dark OLED Luxury theme (true black surfaces, cyan/emerald accents)
- Editor content area: Slightly lighter surface (#111111) for readability
- Toolbar buttons: Ghost style, cyan accent on hover/active
- Unsaved indicator: Small amber dot next to title

**Interaction Patterns:**
- Click item in tree → opens editor (behavior change from current status cycling)
- Shift+click item → cycles status (not-started → in-progress → complete)
- Escape or click backdrop → closes editor (with unsaved changes prompt if applicable)

## Repository Standards

Follow established repository patterns and conventions:

- **Component structure**: Create `EditorModal/` directory with `.tsx`, `.css`, `.test.tsx`, `index.ts`
- **Hooks**: Create `useMarkdownEditor.ts` in `hooks/` directory
- **Lib modules**: Create `editor/` module in `lib/` with `index.ts` public API
- **Testing**: Use mock components pattern for Tauri-dependent tests (see `DocumentView.test.tsx`)
- **CSS**: Use CSS custom properties for theming, BEM-like class naming
- **TypeScript**: Arrow functions, named exports, proper interfaces (no `any`)

## Technical Considerations

**Milkdown Integration:**
- Install: `@milkdown/core`, `@milkdown/react`, `@milkdown/preset-commonmark`, `@milkdown/theme-nord` (or custom theme)
- Milkdown uses ProseMirror internally; editor state is separate from React state
- Need to handle bidirectional sync: markdown → editor on load, editor → markdown on save

**Parser Changes:**
- mdast nodes have `position.start` and `position.end` properties; need to extract both
- For items with children, end position is the end of the last child
- Raw content extraction requires reading source file and slicing by line numbers

**File Write Safety:**
- Atomic write: write to `.tmp` file, then rename to target
- Backup: copy original to `.bak` before modifying
- Tauri capability: Add to `capabilities/default.json`:
  ```json
  {
    "identifier": "fs:allow-write-text-file",
    "allow": [{ "path": "**/*.md" }]
  }
  ```

**Document Refresh:**
- After save, re-read and re-parse the file
- Need to preserve scroll position and collapse state across refresh
- Item IDs may change if positions change; need strategy for this

## Security Considerations

- **File write permissions**: Limited to `.md` files only via Tauri capability path pattern
- **Backup files**: `.bak` files may accumulate; consider cleanup strategy
- **No external data**: Editor operates only on local files, no network requests
- **Proof artifacts**: Screenshots may contain user content; user discretion advised

## Success Metrics

1. **Editor opens correctly**: User can click any item and see editor with correct content loaded
2. **WYSIWYG works**: Formatting toolbar produces correct markdown output
3. **Save works**: Changes persist to disk and tree updates after save
4. **Settings work**: View mode and auto-save preferences apply correctly
5. **No data loss**: Atomic writes and backups prevent corruption
6. **Test coverage**: New code has >80% test coverage matching existing patterns

## Open Questions

1. ~~**Click interaction change**~~: **RESOLVED** - Click opens editor, Shift+click cycles status (changes existing click behavior)

2. **Editor toolbar scope**: Should the toolbar include all Milkdown-supported formatting, or a minimal set? Recommended minimal: bold, italic, headings (H1-H6), bullet list, ordered list, checkbox, code inline.

3. **Backup retention**: Should we keep only the most recent backup, or maintain a history? Recommended: single `.bak` file, overwritten on each save.

4. **Split-view resize**: Should the split-view divider be resizable by the user? Recommended: Fixed ratio initially, resize as future enhancement.
