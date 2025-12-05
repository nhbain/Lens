# Task List for STORY-LENS-004: File Import & Manual Management

> Generated from: story-list-feature-lens.md
> Story: As a user, I want to manually add markdown files to track so that I can start tracking specific documents immediately.
> Acceptance Criteria: User can open file picker and select .md files; selected files appear in tracked list; invalid files show helpful error; duplicate imports are handled gracefully.

## Relevant Files

- `app/src/lib/files/file-picker.ts` - File picker dialog and validation logic
- `app/src/lib/files/file-picker.test.ts` - Unit tests for file picker
- `app/src/lib/files/tracked-files.ts` - Tracked files list management
- `app/src/lib/files/tracked-files.test.ts` - Unit tests for tracked files
- `app/src/lib/files/types.ts` - TypeScript interfaces for file management
- `app/src/lib/files/index.ts` - Public API exports
- `app/src/components/TrackedFilesList.tsx` - UI component for displaying tracked files
- `app/src/components/TrackedFilesList.test.tsx` - Component tests
- `app/src/components/FileImportButton.tsx` - Button to trigger file picker
- `app/src/components/FileImportButton.test.tsx` - Component tests
- `app/src/App.tsx` - Main app integration
- `app/src-tauri/src/lib.rs` - Tauri plugin registration
- `app/src-tauri/capabilities/default.json` - Tauri dialog permissions
- `app/src-tauri/Cargo.toml` - Rust dependencies

### Notes

- Unit tests should be placed alongside the code files they test
- Use `npm run test` to run all tests
- Tauri's dialog plugin provides native file picker dialogs
- Leverage existing parser module (`lib/parser`) for file validation
- Leverage existing state module (`lib/state`) for persistence
- Follow style guide in `~/.claude/rules` (arrow functions, named exports, `??` for nullish)

## Tasks

- [x] 1.0 Configure Tauri Dialog Plugin
  - [x] 1.1 Install `@tauri-apps/plugin-dialog` npm package
  - [x] 1.2 Add `tauri-plugin-dialog` to Cargo.toml dependencies
  - [x] 1.3 Register dialog plugin in `lib.rs` with `.plugin(tauri_plugin_dialog::init())`
  - [x] 1.4 Add dialog permissions to `capabilities/default.json` (`dialog:default`, `dialog:allow-open`)
  - [x] 1.5 Verify plugin works by testing dialog opens in dev mode

- [x] 2.0 Implement File Picker & Validation Logic
  - [x] 2.1 Create `app/src/lib/files/types.ts` with `FileValidationResult` and `TrackedFile` interfaces
  - [x] 2.2 Create `openMarkdownFilePicker()` function using Tauri's `open` dialog with .md filter
  - [x] 2.3 Create `validateMarkdownFile(path)` function that reads and parses the file
  - [x] 2.4 Return validation result with success/error status and parsed item count
  - [x] 2.5 Handle file read errors gracefully (file not found, permission denied, etc.)
  - [x] 2.6 Handle dialog cancellation (user clicks Cancel) - return null, not error
  - [x] 2.7 Write unit tests for validation logic (mock Tauri APIs)

- [x] 3.0 Create Tracked Files Management
  - [x] 3.1 Create `TrackedFilesManager` with in-memory list of tracked files
  - [x] 3.2 Implement `addTrackedFile(path)` - validate, check duplicates, add to list
  - [x] 3.3 Implement `removeTrackedFile(path)` - remove from list and delete state file
  - [x] 3.4 Implement `getTrackedFiles()` - return list of all tracked files
  - [x] 3.5 Implement `isFileTracked(path)` - check if file already in list
  - [x] 3.6 Implement `loadTrackedFiles()` - restore list from persisted state files on startup
  - [x] 3.7 Handle duplicate import gracefully - return existing file info, don't error
  - [x] 3.8 Write unit tests for tracked files management

- [x] 4.0 Build UI Components
  - [x] 4.1 Create `FileImportButton` component with "Add File" button
  - [x] 4.2 Wire button click to `openMarkdownFilePicker()` and handle result
  - [x] 4.3 Create `TrackedFilesList` component displaying all tracked files
  - [x] 4.4 Show file name, path (truncated), and item count for each file
  - [x] 4.5 Add "Remove" button for each tracked file
  - [x] 4.6 Show empty state message when no files are tracked
  - [x] 4.7 Display error message when file validation fails (toast or inline)
  - [x] 4.8 Display info message when duplicate file is selected
  - [x] 4.9 Write component tests for both components

- [x] 5.0 Integration & Testing
  - [x] 5.1 Create `app/src/lib/files/index.ts` exporting public API
  - [x] 5.2 Integrate components into `App.tsx` with basic layout
  - [x] 5.3 Add comprehensive JSDoc comments to all exported functions
  - [x] 5.4 Run full test suite and ensure all tests pass
  - [x] 5.5 Run linter and fix any issues
  - [x] 5.6 Evaluate code against `~/.claude/rules` style guide
  - [x] 5.7 Integration test: verify file import workflow (pick, validate, track, display, remove)
