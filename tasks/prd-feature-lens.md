# Feature PRD — Lens: Markdown Progress Tracker

[Purpose: A lightweight desktop application for tracking progress through markdown documents, enabling seamless context switching and persistent progress tracking across spec-driven development workflows.]

## 1. Summary
- **Goal:** Reduce context-switching friction by providing a unified dashboard to track progress across multiple markdown files (PRDs, task lists, documentation) with persistent state and visual progress indicators.
- **Users:** Developers, technical leads, and product managers working with markdown-based spec-driven development workflows.
- **Success Criteria:**
  - Users can resume work within 5 seconds of opening the app (vs. manually finding their place in files)
  - 100% of progress state persisted across sessions
  - Support for tracking any markdown structure (headers, lists, checkboxes)

## 2. User Stories (representative)
- As a **developer**, I want **to see all my in-progress tasks across multiple PRDs in one dashboard** so that **I can quickly resume work after a context switch**.
- As a **squad lead**, I want **to see progress percentages for each tracked document** so that **I can understand overall completion status at a glance**.
- As a **developer**, I want **my progress to be saved separately from source files** so that **I don't pollute the original markdown with my personal tracking state**.
- As a **technical lead**, I want **to watch a directory for new markdown files** so that **newly created PRDs are automatically available for tracking**.

## 3. Acceptance Criteria

### Dashboard View
- **Given** I have multiple markdown files being tracked
  **When** I open Lens
  **Then** I see a dashboard showing all tracked files with progress percentages and last-worked timestamps

### Progress Tracking
- **Given** I am viewing a markdown file in Lens
  **When** I mark a trackable item (header, list item, checkbox) as complete
  **Then** the progress is saved to a separate state file and the UI updates immediately

### Resume Functionality
- **Given** I was working on a specific task in a markdown file
  **When** I reopen Lens after a context switch
  **Then** the dashboard highlights my in-progress items and I can click to jump directly to where I left off

### File Discovery
- **Given** I have configured a watched directory (e.g., `/tasks/`)
  **When** a new markdown file is added to that directory
  **Then** Lens detects it and makes it available for tracking

### Cross-Platform
- **Given** Lens is installed
  **When** running on macOS or Windows
  **Then** all features work identically on both platforms

## 4. Functional Requirements

### File Management
1. The system shall allow users to manually import individual markdown files for tracking.
2. The system shall allow users to configure watched directories that are scanned for markdown files.
3. The system shall support glob patterns for file matching (e.g., `prd-*.md`, `tasks-*.md`).
4. The system shall detect new/modified/deleted files in watched directories.

### Markdown Parsing
5. The system shall parse and display markdown headers (H1-H6) as trackable items.
6. The system shall parse and display markdown list items (ordered and unordered) as trackable items.
7. The system shall parse and display markdown checkboxes (`- [ ]` / `- [x]`) as trackable items.
8. The system shall support nested/hierarchical structures (e.g., sub-tasks under parent tasks).
9. The system shall preserve the original markdown structure in the display.

### Progress Tracking
10. The system shall allow users to mark any trackable item as "complete" or "in-progress".
11. The system shall automatically calculate parent item completion based on child item status.
12. The system shall persist all progress state to a separate JSON/YAML file (not modifying source markdown).
13. The system shall associate state files with their source markdown files by path/hash.

### Dashboard & Navigation
14. The system shall display a dashboard showing all tracked files with:
    - File name and path
    - Progress percentage (completed / total trackable items)
    - Last modified timestamp
    - "In Progress" indicator for files with active work
15. The system shall allow users to filter/sort the dashboard by progress, name, or last-worked date.
16. The system shall highlight items marked as "in-progress" for quick resume.
17. The user shall be able to click any in-progress item to navigate directly to that position.

### User Interface
18. The system shall provide a minimal, distraction-free UI focused on content.
19. The system shall display progress bars/indicators for visual completion status.
20. The system shall support keyboard navigation for efficient workflow.

## 5. Assumptions
- Users have markdown files following standard CommonMark or GFM syntax.
- Users have read access to the directories they want to watch.
- State files can be stored in a user-writable location (app data directory or alongside source files).

## 6. Risks & Mitigations

- **Risk:** Markdown parsing edge cases (non-standard syntax, complex nesting)
  - **Mitigation:** Use a proven markdown parser library (e.g., `remark`, `markdown-it`); define supported syntax subset in docs.

- **Risk:** File sync conflicts if same file is edited externally while Lens is open
  - **Mitigation:** Implement file watcher with debouncing; detect external changes and prompt user to reload.

- **Risk:** State file corruption or loss
  - **Mitigation:** Use atomic writes; implement simple backup/recovery mechanism.

- **Risk:** Performance degradation with large numbers of files or very large markdown documents
  - **Mitigation:** Implement virtualized list rendering; lazy-load file contents; set reasonable limits with user feedback.

## 7. API/Contract Surface
- **Not applicable:** This is a standalone desktop application with no external API surface.
- **Internal:** State files will use a documented JSON schema for progress data.

### State File Schema (Draft)
```json
{
  "version": "1.0",
  "sourceFile": "/path/to/original.md",
  "sourceHash": "sha256:abc123...",
  "lastModified": "2025-12-03T10:30:00Z",
  "items": [
    {
      "id": "h1-0",
      "type": "header",
      "level": 1,
      "text": "Feature PRD — Lens",
      "status": "complete",
      "children": ["h2-0", "h2-1"]
    },
    {
      "id": "li-5",
      "type": "list-item",
      "text": "Sub-task description",
      "status": "in-progress",
      "parent": "li-4"
    }
  ]
}
```

## 8. Data & Schema
- **Entities:**
  - `TrackedFile`: Represents a markdown file being tracked (path, hash, metadata)
  - `TrackableItem`: Represents a header/list item (id, type, text, status, parent/children)
  - `UserSettings`: App configuration (watched directories, theme preferences)
- **Storage:** Local filesystem (JSON files in app data directory)
- **Migrations:** Version field in state files enables future schema migrations
- **Retention & privacy:** All data stays local; no cloud sync; user controls all files

## 9. NFRs (Feature-level targets)
- **Performance:**
  - App launch to dashboard render: < 2 seconds
  - File open to content render: < 500ms for files under 10,000 lines
  - Smooth scrolling (60fps) for documents with 1,000+ items
- **Security:**
  - No network access required (fully offline capable)
  - State files readable only by current user (appropriate file permissions)
- **Observability:**
  - Local error logging for debugging
  - Optional anonymous usage analytics (opt-in only)
- **Compatibility:**
  - macOS 14+ (Sonoma and later)
  - Windows 11+

---
**Outputs:** Stories to be created; see `story-list-feature-lens.md` for breakdown.
