# Task List for STORY-LENS-005: Directory Watching & Auto-Discovery

> Generated from: story-list-feature-lens.md
> Story: As a user, I want to configure watched directories so that new markdown files are automatically available for tracking.
> Acceptance Criteria: User can add/remove watched directories; new files matching patterns appear automatically; deleted files are handled gracefully; file modifications trigger re-parse.

## Relevant Files

- `app/src/lib/watcher/types.ts` - TypeScript interfaces for watch configuration and type guards
- `app/src/lib/watcher/types.test.ts` - Unit tests for types (53 tests)
- `app/src/lib/watcher/watch-config.ts` - Watch configuration persistence and management
- `app/src/lib/watcher/watch-config.test.ts` - Unit tests for config (45 tests)
- `app/src/lib/watcher/directory-watcher.ts` - Directory watching logic using chokidar
- `app/src/lib/watcher/directory-watcher.test.ts` - Unit tests for watcher (34 tests)
- `app/src/lib/watcher/event-handler.ts` - Event handler bridging watcher to tracked files
- `app/src/lib/watcher/event-handler.test.ts` - Unit tests for event handler (21 tests)
- `app/src/lib/watcher/integration.test.ts` - Integration tests for full workflows (10 tests)
- `app/src/lib/watcher/index.ts` - Public API exports

### Notes

- Uses `chokidar` v5 for cross-platform file system watching
- Implements 200ms debouncing for rapid file changes
- Leverages existing `lib/files` module for file validation
- Leverages existing `lib/state` module for persistence
- Stores watch configuration in app data directory alongside state files
- Follows style guide (arrow functions, named exports, `??` for nullish)
- Total: 163 new tests added

## Tasks

- [x] 1.0 Configure File System Watching Dependencies
  - [x] 1.1 Install `chokidar` npm package for cross-platform file watching
  - [x] 1.2 Add file system permissions to Tauri capabilities if needed
  - [x] 1.3 Verify chokidar works in Tauri environment with basic test

- [x] 2.0 Define Watch Configuration Types
  - [x] 2.1 Create `app/src/lib/watcher/types.ts` with `WatchedDirectory` interface
  - [x] 2.2 Define `WatchConfig` interface for storing all watched directories
  - [x] 2.3 Define `FileChangeEvent` type for change notifications (add/modify/delete)
  - [x] 2.4 Define glob pattern types for file filtering
  - [x] 2.5 Create type guards for runtime validation
  - [x] 2.6 Write unit tests for type guards

- [x] 3.0 Implement Watch Configuration Management
  - [x] 3.1 Create `watch-config.ts` with in-memory config store
  - [x] 3.2 Implement `addWatchedDirectory(path, patterns?)` - add directory to watch list
  - [x] 3.3 Implement `removeWatchedDirectory(path)` - remove from watch list
  - [x] 3.4 Implement `getWatchedDirectories()` - return all watched directories
  - [x] 3.5 Implement `loadWatchConfig()` - load config from persisted file on startup
  - [x] 3.6 Implement `saveWatchConfig()` - persist config to app data directory
  - [x] 3.7 Implement `isDirectoryWatched(path)` - check if already watching
  - [x] 3.8 Handle nested directories gracefully (don't double-watch)
  - [x] 3.9 Write unit tests for config management

- [x] 4.0 Implement Directory Watcher
  - [x] 4.1 Create `directory-watcher.ts` with watcher instance management
  - [x] 4.2 Implement `startWatching(directory)` - create chokidar watcher for directory
  - [x] 4.3 Implement `stopWatching(directory)` - close watcher for directory
  - [x] 4.4 Implement `stopAllWatchers()` - cleanup on app shutdown
  - [x] 4.5 Configure glob patterns for markdown files (`*.md`, `*.markdown`)
  - [x] 4.6 Implement debouncing for rapid file changes (use 200ms default)
  - [x] 4.7 Handle watcher errors gracefully (permission denied, directory deleted)
  - [x] 4.8 Write unit tests with mocked chokidar

- [x] 5.0 Implement File Change Event Handling
  - [x] 5.1 Create event emitter or callback system for file changes
  - [x] 5.2 Handle `add` events - new markdown file detected
  - [x] 5.3 Handle `change` events - existing file modified, trigger re-parse
  - [x] 5.4 Handle `unlink` events - file deleted, update tracked files
  - [x] 5.5 Filter events by configured glob patterns
  - [x] 5.6 Integrate with `lib/files` module to validate discovered files
  - [x] 5.7 Integrate with `lib/state` module to handle state updates
  - [x] 5.8 Write integration tests for event handling

- [x] 6.0 Integration & Testing
  - [x] 6.1 Create `app/src/lib/watcher/index.ts` exporting public API
  - [x] 6.2 Add comprehensive JSDoc comments to all exported functions
  - [x] 6.3 Run full test suite and ensure all tests pass
  - [x] 6.4 Run linter and fix any issues
  - [x] 6.5 Evaluate code against `~/.claude/rules` style guide
  - [x] 6.6 Integration test: add directory → detect new file → track automatically
  - [x] 6.7 Integration test: file modified → re-parse triggered
  - [x] 6.8 Integration test: file deleted → handled gracefully
