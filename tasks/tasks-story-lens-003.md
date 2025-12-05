# Task List for STORY-LENS-003: State Persistence Layer

> Generated from: story-list-feature-lens.md
> Story: As a developer, I want my progress saved to a separate file so that my tracking doesn't modify the original markdown.
> Acceptance Criteria: Progress state persists across app restarts; state files are valid JSON matching schema; source markdown files are never modified; state correctly re-associates after source file edits.

## Relevant Files

- `app/src/lib/state/types.ts` - TypeScript interfaces for tracking state and file state
- `app/src/lib/state/types.test.ts` - Type validation tests
- `app/src/lib/state/state-manager.ts` - Core state CRUD operations
- `app/src/lib/state/state-manager.test.ts` - Unit tests for state manager
- `app/src/lib/state/file-hash.ts` - Content hashing for file change detection
- `app/src/lib/state/file-hash.test.ts` - Hash function tests
- `app/src/lib/state/index.ts` - Public API exports
- `app/src-tauri/src/lib.rs` - Tauri commands for file system access

### Notes

- Unit tests should be placed alongside the code files they test
- Use `npm run test` to run all tests
- State files stored in platform-appropriate app data directory via Tauri APIs
- Use content hash to detect when source markdown has changed significantly
- Implement atomic writes to prevent corruption on crash/power loss

## Tasks

- [x] 1.0 Define State Schema & Types
  - [x] 1.1 Create `ItemTrackingState` interface (itemId, status: pending/in_progress/complete, updatedAt)
  - [x] 1.2 Create `FileTrackingState` interface (sourcePath, contentHash, items map, createdAt, updatedAt)
  - [x] 1.3 Create `AppState` interface (version number, files map keyed by sourcePath)
  - [x] 1.4 Add JSDoc comments explaining each field's purpose
  - [x] 1.5 Write type guard functions for runtime validation
  - [x] 1.6 Write unit tests for type guards

- [x] 2.0 Implement App Data Directory Access
  - [x] 2.1 Research Tauri's `@tauri-apps/api/path` for app data directory
  - [x] 2.2 Create utility function `getStateDirectory()` returning platform-appropriate path
  - [x] 2.3 Create Tauri command in Rust for file read/write operations
  - [x] 2.4 Create TypeScript wrapper functions to invoke Tauri commands
  - [x] 2.5 Ensure state directory is created on first access
  - [x] 2.6 Write tests verifying directory access (may need mocking for unit tests)

- [x] 3.0 Create State File CRUD Operations
  - [x] 3.1 Create `generateStateFilePath(sourcePath)` to derive state filename from source
  - [x] 3.2 Implement `saveFileState(fileState)` - serialize and write to disk
  - [x] 3.3 Implement `loadFileState(sourcePath)` - read and deserialize from disk
  - [x] 3.4 Implement `deleteFileState(sourcePath)` - remove state file
  - [x] 3.5 Implement `listTrackedFiles()` - enumerate all state files
  - [x] 3.6 Handle file-not-found gracefully (return null, not throw)
  - [x] 3.7 Write unit tests for each CRUD operation

- [x] 4.0 Implement File-to-State Association
  - [x] 4.1 Create `computeContentHash(content)` function using simple hash algorithm
  - [x] 4.2 Store contentHash in FileTrackingState when saving
  - [x] 4.3 Create `hasSourceChanged(sourcePath, storedHash)` to detect file modifications
  - [x] 4.4 Create `updateItemStatus(sourcePath, itemId, status)` function
  - [x] 4.5 Handle case where source file is moved/renamed (orphaned state)
  - [x] 4.6 Write tests for hash computation and change detection

- [x] 5.0 Add Atomic Writes & Corruption Recovery
  - [x] 5.1 Implement atomic write: write to `.tmp` file, then rename
  - [x] 5.2 Validate JSON structure before saving (catch serialization errors)
  - [x] 5.3 Validate JSON structure when loading (catch parse errors)
  - [x] 5.4 Create backup of previous state before overwriting (`.bak` file)
  - [x] 5.5 Implement recovery: if main file corrupted, try loading from backup
  - [x] 5.6 Write tests for corruption scenarios

- [x] 6.0 Integration & Testing
  - [x] 6.1 Create `index.ts` exporting public API
  - [x] 6.2 Add comprehensive JSDoc comments to all exported functions
  - [x] 6.3 Run full test suite and ensure all tests pass
  - [x] 6.4 Run linter and fix any issues
  - [x] 6.5 Evaluate code against `~/.claude/rules` style guide and React standards
  - [x] 6.6 Integration test: verify state persistence workflow (create, save, load, update)
