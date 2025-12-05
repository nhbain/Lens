# Story List for Lens: Markdown Progress Tracker

> Purpose: Break down feature into implementable user stories for sprint planning. Stories are the smallest, user-centric units of value that fit within a single sprint.
> Parent Feature: FEAT-LENS
> Parent Epic: N/A (Standalone Feature)
> Generated: 2025-12-03

## Story Writing Guidelines
- Use who/what/why: "As a [persona], I want [capability], so that [benefit]."
- Ensure INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable.
- Each story must complete within one sprint and have clear acceptance criteria.

## Definition of Ready (for this Feature's stories)
- [x] Persona and user value identified
- [x] Acceptance criteria drafted (Given/When/Then)
- [x] Dependencies identified
- [x] Test and telemetry considerations noted

## Stories

#### 1. STORY-LENS-001: Project Scaffolding & Build Setup
- **User Story:** As a developer, I want a properly configured cross-platform desktop app foundation so that I can build features on a solid base.
- **Summary:** Initialize the desktop app project with chosen framework (Tauri or Electron), configure build pipelines for macOS and Windows, set up development tooling (TypeScript, linting, testing).
- **Acceptance Criteria:** App launches on both macOS and Windows; hot-reload works in development; production builds generate installable artifacts for both platforms.
- **Dependencies:** None - foundation story
- **Technical Notes:** Evaluate Tauri vs Electron based on bundle size, performance, and development velocity. Tauri recommended for smaller bundle and better performance.

#### 2. STORY-LENS-002: Markdown Parser Integration
- **User Story:** As a developer, I want a robust markdown parsing system so that I can extract trackable items from any markdown file.
- **Summary:** Integrate markdown parser library, create AST traversal logic to identify headers (H1-H6), list items (ordered/unordered), and checkboxes. Build data model for trackable items with parent/child relationships.
- **Acceptance Criteria:** Parser correctly identifies all headers, list items, and checkboxes; nested structures maintain hierarchy; parser handles edge cases gracefully (empty files, malformed markdown).
- **Dependencies:** STORY-LENS-001
- **Technical Notes:** Use `remark` or `markdown-it` with AST access. Create unified `TrackableItem` interface regardless of source element type.

#### 3. STORY-LENS-003: State Persistence Layer
- **User Story:** As a developer, I want my progress saved to a separate file so that my tracking doesn't modify the original markdown.
- **Summary:** Implement state file management: create, read, update state files in app data directory. Handle file-to-state association via path and content hash. Implement atomic writes and basic corruption recovery.
- **Acceptance Criteria:** Progress state persists across app restarts; state files are valid JSON matching schema; source markdown files are never modified; state correctly re-associates after source file edits.
- **Dependencies:** STORY-LENS-002
- **Technical Notes:** Store in platform-appropriate app data directory. Use content hash to detect when source file changed significantly.

#### 4. STORY-LENS-004: File Import & Manual Management
- **User Story:** As a user, I want to manually add markdown files to track so that I can start tracking specific documents immediately.
- **Summary:** Implement file picker dialog, file validation (is markdown), add to tracked files list, trigger initial parse and state creation.
- **Acceptance Criteria:** User can open file picker and select .md files; selected files appear in tracked list; invalid files show helpful error; duplicate imports are handled gracefully.
- **Dependencies:** STORY-LENS-002, STORY-LENS-003
- **Technical Notes:** Use native file dialogs via Tauri/Electron APIs.

#### 5. STORY-LENS-005: Directory Watching & Auto-Discovery
- **User Story:** As a user, I want to configure watched directories so that new markdown files are automatically available for tracking.
- **Summary:** Implement directory watcher with configurable paths and glob patterns. Detect file additions, modifications, and deletions. Update tracked files list accordingly.
- **Acceptance Criteria:** User can add/remove watched directories; new files matching patterns appear automatically; deleted files are handled gracefully; file modifications trigger re-parse.
- **Dependencies:** STORY-LENS-004
- **Technical Notes:** Use `chokidar` or native FS watch APIs. Implement debouncing to handle rapid changes.

#### 6. STORY-LENS-006: Document View & Item Display
- **User Story:** As a user, I want to view my markdown documents with trackable items clearly displayed so that I can see what needs to be done.
- **Summary:** Create document viewer component that renders parsed markdown with trackable items. Display hierarchy visually (indentation, nesting). Show item type indicators (header level, list type, checkbox).
- **Acceptance Criteria:** Document renders with correct hierarchy; all trackable items are visually distinct; scrolling is smooth; keyboard navigation works.
- **Dependencies:** STORY-LENS-002
- **Technical Notes:** Use virtualized list for large documents. Minimal styling - focus on readability.

#### 7. STORY-LENS-007: Progress Tracking Interactions
- **User Story:** As a user, I want to mark items as complete or in-progress so that I can track my work through a document.
- **Summary:** Add click/keyboard handlers to toggle item status (pending → in-progress → complete → pending). Update state file on change. Calculate and update parent completion based on children.
- **Acceptance Criteria:** Clicking item cycles through statuses; status changes persist immediately; parent items auto-update when children change; visual feedback confirms state change.
- **Dependencies:** STORY-LENS-003, STORY-LENS-006
- **Technical Notes:** Optimistic UI updates with background persistence. Consider undo functionality.

#### 8. STORY-LENS-008: Dashboard View
- **User Story:** As a user, I want a dashboard showing all my tracked files with progress so that I can see overall status at a glance.
- **Summary:** Create dashboard component displaying all tracked files as cards/rows. Show file name, path, progress bar/percentage, last-worked timestamp, in-progress indicator.
- **Acceptance Criteria:** All tracked files visible; progress percentages accurate; sorting by name/progress/date works; clicking file opens document view.
- **Dependencies:** STORY-LENS-003, STORY-LENS-004
- **Technical Notes:** Dashboard is the app's home/landing view.

#### 9. STORY-LENS-009: Resume & Quick Navigation
- **User Story:** As a user, I want to see my in-progress items highlighted so that I can resume work instantly after a context switch.
- **Summary:** Dashboard highlights files with in-progress items. "Resume" section shows all in-progress items across all files. Clicking navigates directly to that item in the document view.
- **Acceptance Criteria:** In-progress items surfaced on dashboard; clicking jumps to correct position; scroll position preserved when returning to document.
- **Dependencies:** STORY-LENS-007, STORY-LENS-008
- **Technical Notes:** Store last scroll position per document. Consider "last worked" timestamp per item.

#### 10. STORY-LENS-010: Settings & Configuration UI
- **User Story:** As a user, I want to configure app settings (watched directories, preferences) so that the app works the way I need.
- **Summary:** Create settings view with: watched directory management, file pattern configuration, theme toggle (if applicable), data management (clear state, export/import).
- **Acceptance Criteria:** Settings persist across restarts; directory picker works; changes take effect immediately or with clear indication of when they will.
- **Dependencies:** STORY-LENS-005
- **Technical Notes:** Store settings in separate config file in app data directory.

## Implementation Order

```
Critical Path:
1. STORY-LENS-001 - Project scaffolding
   └─> 2. STORY-LENS-002 - Markdown parser
       ├─> 3. STORY-LENS-003 - State persistence
       │   └─> 4. STORY-LENS-004 - File import
       │       └─> 5. STORY-LENS-005 - Directory watching
       │           └─> 10. STORY-LENS-010 - Settings UI
       └─> 6. STORY-LENS-006 - Document view
           └─> 7. STORY-LENS-007 - Progress tracking
               └─> 8. STORY-LENS-008 - Dashboard
                   └─> 9. STORY-LENS-009 - Resume navigation

Parallel Work (after dependencies met):
- STORY-LENS-006 can start once STORY-LENS-002 is complete (parallel with 003/004)
- STORY-LENS-008 can partially develop UI while waiting for full data layer
```

## Technical Breakdown by Component

### Core/Backend (Tauri Rust or Electron Node)
- STORY-LENS-001: Project structure, build config
- STORY-LENS-003: File I/O, state management
- STORY-LENS-005: File system watching

### Parser Module
- STORY-LENS-002: Markdown parsing, AST traversal, data modeling

### Frontend/UI (React/Vue/Svelte)
- STORY-LENS-006: Document viewer component
- STORY-LENS-007: Interaction handlers, status toggling
- STORY-LENS-008: Dashboard component
- STORY-LENS-009: Navigation, scroll management
- STORY-LENS-010: Settings view

### Data Layer
- STORY-LENS-003: State file schema, persistence logic
- STORY-LENS-004: File import logic
- STORY-LENS-005: Watch configuration

## Risk Assessment

| Story | Risk | Impact | Mitigation |
|-------|------|--------|------------|
| STORY-LENS-001 | Framework choice affects development velocity | High | Spike/POC to validate Tauri capabilities before committing |
| STORY-LENS-002 | Edge cases in markdown parsing | Med | Use battle-tested parser; define supported syntax subset |
| STORY-LENS-003 | State file corruption | Med | Atomic writes, backup mechanism, recovery logic |
| STORY-LENS-005 | File watcher performance with many files | Med | Debouncing, ignore patterns, lazy loading |
| STORY-LENS-006 | Performance with very large documents | Med | Virtualized rendering, pagination |

## Definition of Done for Feature

- [ ] All stories completed
- [ ] App builds and runs on macOS and Windows
- [ ] Unit tests for parser and state management
- [ ] Integration tests for file watching
- [ ] Manual QA on both platforms
- [ ] User documentation (basic README/help)
- [ ] Installers generated for both platforms

## Notes

- **POC Required:** Yes - STORY-LENS-001 should include a brief Tauri vs Electron evaluation spike
- **Reusable Patterns:** Standard desktop app patterns; markdown parsing is well-established
- **Technical Debt:** Initial version may have limited theme/styling options - acceptable for MVP
- **Cross-team Dependencies:** None - standalone tool

---
**Next Steps:** Create individual Story PRDs for sprint planning (if needed), or proceed directly to task breakdown using `generate-task-list-from-prd.md` workflow.
**Refinement Schedule:** Review stories before starting implementation
