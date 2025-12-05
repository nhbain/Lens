# Task List for STORY-LENS-010: Settings & Configuration UI

> Generated from: story-list-feature-lens.md
> Story: As a user, I want to configure app settings (watched directories, preferences) so that the app works the way I need.
> Acceptance Criteria: Settings persist across restarts; directory picker works; changes take effect immediately or with clear indication of when they will.

## Relevant Files

- `app/src/components/Settings/Settings.tsx` - Main settings view component
- `app/src/components/Settings/Settings.test.tsx` - Component tests
- `app/src/components/Settings/Settings.css` - Settings styles
- `app/src/components/Settings/WatchedDirectoriesSection.tsx` - Directory management UI
- `app/src/components/Settings/FilePatternSection.tsx` - Glob pattern configuration
- `app/src/components/Settings/DataManagementSection.tsx` - Clear data, export/import
- `app/src/components/Settings/index.ts` - Public exports
- `app/src/hooks/useSettings.ts` - Hook for settings state management
- `app/src/lib/settings/types.ts` - Settings configuration types
- `app/src/lib/settings/settings-manager.ts` - Settings persistence logic
- `app/src/lib/watcher/` - Existing directory watcher module (from STORY-LENS-005)

### Notes

- This is a **frontend-heavy story** - read React rules and style guide first
- Depends on STORY-LENS-005 (Directory Watching)
- Settings stored in separate config file in app data directory
- Settings include:
  - Watched directories list (add/remove)
  - File patterns (glob patterns for markdown files)
  - Data management (clear all state, export/import)
  - Theme toggle (if applicable)
- Changes should take effect immediately where possible
- Use Tauri's directory picker dialog for adding directories
- Follow style guide in `~/.claude/rules`

## Tasks

- [x] 0.0 Review React Guidelines
  - [x] 0.1 Read `~/.claude/rules/style-guide.md` for TypeScript coding standards
  - [x] 0.2 Read `~/.claude/rules/react/components.md` for component patterns
  - [x] 0.3 Read `~/.claude/rules/react/forms.md` for form patterns
  - [x] 0.4 Read `~/.claude/rules/react/state-and-data.md` for state management

- [x] 1.0 Define Settings Types
  - [x] 1.1 Create `app/src/lib/settings/types.ts`
  - [x] 1.2 Define `AppSettings` interface (all user-configurable options)
  - [x] 1.3 Define `WatchedDirectory` with path and enabled flag (reusing from watcher module)
  - [x] 1.4 Define `FilePatternConfig` for glob patterns (filePatterns array in AppSettings)
  - [x] 1.5 Define default settings values
  - [x] 1.6 Create type guards for settings validation

- [x] 2.0 Implement Settings Persistence
  - [x] 2.1 Create `settings-manager.ts` for settings file management
  - [x] 2.2 Define settings file path (app data directory)
  - [x] 2.3 Implement `loadSettings()` - read from config file
  - [x] 2.4 Implement `saveSettings(settings)` - write to config file
  - [x] 2.5 Implement `resetSettings()` - restore defaults
  - [x] 2.6 Handle first-run (no config file exists)
  - [x] 2.7 Handle corrupted config file gracefully
  - [x] 2.8 Write unit tests for settings manager

- [x] 3.0 Create useSettings Hook
  - [x] 3.1 Create `useSettings.ts` hook
  - [x] 3.2 Load settings on app startup
  - [x] 3.3 Provide current settings state
  - [x] 3.4 Provide update functions for each setting category
  - [x] 3.5 Auto-save on settings change (immediate via addPattern/removePattern/setTheme)
  - [x] 3.6 Notify dependent systems (watcher) when settings change (via reload)
  - [x] 3.7 Write hook tests

- [x] 4.0 Build WatchedDirectoriesSection Component
  - [x] 4.1 Create `WatchedDirectoriesSection.tsx`
  - [x] 4.2 List current watched directories
  - [x] 4.3 "Add Directory" button opens native directory picker
  - [x] 4.4 Remove button for each directory
  - [x] 4.5 Enable/disable toggle for each directory
  - [x] 4.6 Show validation errors (directory doesn't exist, etc.)
  - [x] 4.7 Integrate with directory watcher module
  - [x] 4.8 Write component tests

- [x] 5.0 Build FilePatternSection Component
  - [x] 5.1 Create `FilePatternSection.tsx`
  - [x] 5.2 Show current file patterns (e.g., `*.md`, `*.markdown`)
  - [x] 5.3 Input field to add new patterns
  - [x] 5.4 Remove button for each pattern
  - [x] 5.5 Validate pattern syntax
  - [x] 5.6 Show helpful examples/hints
  - [x] 5.7 Write component tests

- [x] 6.0 Build DataManagementSection Component
  - [x] 6.1 Create `DataManagementSection.tsx`
  - [x] 6.2 "Clear All Data" button with confirmation dialog
  - [x] 6.3 "Export Data" button - exports state to JSON file
  - [x] 6.4 "Import Data" button - imports state from JSON file
  - [x] 6.5 Show storage usage statistics (number of files, total items)
  - [x] 6.6 Implement export functionality (save dialog)
  - [x] 6.7 Implement import functionality (file picker + validation)
  - [x] 6.8 Write component tests

- [x] 7.0 Build Settings Component (Main View)
  - [x] 7.1 Create `Settings.tsx` - main settings container
  - [x] 7.2 Show settings header with back navigation
  - [x] 7.3 Organize sections with clear labels
  - [x] 7.4 Include WatchedDirectoriesSection
  - [x] 7.5 Include FilePatternSection
  - [x] 7.6 Include DataManagementSection
  - [x] 7.7 Add "About" section with app version info
  - [x] 7.8 Write component tests

- [x] 8.0 Style Settings View
  - [x] 8.1 Create `Settings.css` with layout styles
  - [x] 8.2 Style section headers and dividers
  - [x] 8.3 Style form inputs consistently
  - [x] 8.4 Style buttons with appropriate emphasis
  - [x] 8.5 Style confirmation dialogs
  - [x] 8.6 Support dark mode
  - [x] 8.7 Ensure good spacing and visual hierarchy

- [x] 9.0 Integration & Navigation
  - [x] 9.1 Create `app/src/lib/settings/index.ts` exporting public API
  - [x] 9.2 Create `app/src/components/Settings/index.ts`
  - [x] 9.3 Add settings icon/button to app header
  - [x] 9.4 Implement navigation to/from settings view
  - [x] 9.5 Wire settings changes to affect watcher behavior

- [x] 10.0 Testing & Validation
  - [x] 10.1 Add comprehensive JSDoc comments
  - [x] 10.2 Run full test suite and ensure all tests pass
  - [x] 10.3 Run linter and fix any issues
  - [x] 10.4 Evaluate code against `~/.claude/rules` style guide
  - [x] 10.5 Integration test: add directory → watcher starts watching
  - [x] 10.6 Integration test: remove directory → watcher stops
  - [x] 10.7 Integration test: settings persist across app restart
  - [x] 10.8 Integration test: export/import works correctly
  - [x] 10.9 Integration test: clear data removes all state
