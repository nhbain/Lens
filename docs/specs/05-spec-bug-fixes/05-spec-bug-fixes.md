# 05-spec-bug-fixes.md

## Introduction/Overview

This specification addresses five bugs identified in the Lens application that impact core functionality and visual consistency. The bugs affect markdown editing (content overwrite), status tracking (spacebar interaction after editor use), configuration (auto-save causing issues), visual theming (57 hardcoded color instances), and progress display (FileCard item counts).

**This specification follows Test-Driven Development (TDD) practices.** For each bug fix, we will write failing tests first that reproduce the bug, then implement the fix to make the tests pass.

## Goals

- Fix markdown content overwrite bug that corrupts documents when editing sections via EditorModal
- Resolve spacebar state change regression that occurs after first EditorModal interaction
- Disable and hide auto-save functionality to eliminate buggy behavior while preserving code for future restoration
- Achieve comprehensive theme compliance by replacing all 57 hardcoded color instances with CSS custom properties
- Correct FileCard progress display to show accurate remaining item counts
- **Write comprehensive regression tests for each bug to prevent future recurrence**

## User Stories

**As a user editing markdown content**, I want my edits to be saved to the correct section of the document so that other sections remain intact.

**As a user navigating the document tree**, I want to press spacebar to cycle item status at any time so that I can efficiently track progress without using the mouse.

**As a user with custom theme colors**, I want all UI elements to reflect my chosen colors so that the application has a consistent visual appearance.

**As a user viewing the dashboard**, I want FileCards to show accurate counts of remaining items so that I can prioritize which documents to work on.

## Testing Strategy

### TDD Approach

For each bug fix, follow this workflow:

1. **Write failing test(s)** that reproduce the bug behavior
2. **Run tests** to confirm they fail (proving the bug exists)
3. **Implement the fix** with minimal code changes
4. **Run tests** to confirm they pass
5. **Refactor** if needed while keeping tests green

### Test File Locations

Tests are colocated with source files following repository convention:

| Source File | Test File |
|-------------|-----------|
| `lib/editor/markdown-slice.ts` | `lib/editor/markdown-slice.test.ts` |
| `hooks/useTreeKeyboardNavigation.ts` | `hooks/useTreeKeyboardNavigation.test.ts` |
| `hooks/useDashboard.ts` | `hooks/useDashboard.test.ts` |
| `components/Settings/EditorSettingsSection.tsx` | `components/Settings/EditorSettingsSection.test.tsx` |
| `components/Dashboard/FileCard.tsx` | `components/Dashboard/FileCard.test.tsx` |

### Mock Component Pattern

Per `quickstart.md`, components with React hooks combined with Tauri mocking may fail with "Invalid hook call" errors. Use the established mock component pattern when needed for integration tests.

## Demoable Units of Work

### Unit 1: Fix Markdown Content Overwrite Bug

**Purpose:** Ensure that editing a section via EditorModal correctly updates only that section without affecting other content in the document.

**Functional Requirements:**
- The system shall correctly track line numbers when extracting content slices for editing
- The system shall properly update line number references after content is saved to account for added/removed lines
- The system shall re-parse the document after save to obtain fresh position data before allowing subsequent edits
- The user shall be able to edit multiple sections sequentially without content corruption

**Test Requirements:**

```typescript
// markdown-slice.test.ts - Add these test cases

describe('extractMarkdownSlice - regression tests', () => {
  it('extracts correct slice after previous edit added lines', () => {
    // Simulate: document was edited, now extracting second section
    // Should use CURRENT line numbers, not stale ones
  })

  it('extracts correct slice after previous edit removed lines', () => {
    // Simulate: document was edited to remove lines
    // Should handle reduced document length correctly
  })

  it('handles sequential edits to different sections without corruption', () => {
    // Edit section A (lines 1-5), save
    // Edit section B (lines 10-15), save
    // Verify both sections have correct content
  })
})

// useMarkdownEditor.test.ts - Add these test cases

describe('useMarkdownEditor - content integrity', () => {
  it('prevents opening editor with stale position data', () => {
    // After save, attempting to open editor should use refreshed positions
  })

  it('waits for document re-parse before allowing subsequent edit', () => {
    // Save triggers refresh, editor cannot open until refresh completes
  })
})
```

**Proof Artifacts:**
- Test file: `markdown-slice.test.ts` with sequential edit test cases passing
- Test file: `useMarkdownEditor.test.ts` with content integrity tests passing
- Manual test: Edit section A, save, edit section B, save - both sections retain correct content

### Unit 2: Fix Spacebar State Change After EditorModal

**Purpose:** Ensure spacebar continues to cycle item status correctly after the user has opened and closed the EditorModal.

**Functional Requirements:**
- The system shall maintain keyboard event handler bindings after EditorModal closes
- The system shall correctly restore focus to the DocumentView tree after EditorModal closes
- The user shall be able to press spacebar to cycle status before and after any EditorModal interaction

**Test Requirements:**

```typescript
// useTreeKeyboardNavigation.test.ts - Add these test cases

describe('useTreeKeyboardNavigation - spacebar after modal', () => {
  it('cycles status with spacebar before any modal interaction', () => {
    // Initial state: spacebar should work
  })

  it('cycles status with spacebar after modal opens and closes', () => {
    // Simulate: modal opened, then closed
    // Spacebar should still cycle status
  })

  it('maintains handleKeyDown binding after focus restoration', () => {
    // After externalFocusedItemId changes, handlers remain bound
  })

  it('restores focus to correct item after modal close', () => {
    // focusedItemId should match externalFocusedItemId after modal closes
  })
})

// DocumentView.test.ts - Add integration test

describe('DocumentView - keyboard after editor', () => {
  it('responds to spacebar after editor modal interaction', () => {
    // Render DocumentView with mock editor open/close cycle
    // Verify spacebar key event triggers status change
  })
})
```

**Proof Artifacts:**
- Test file: `useTreeKeyboardNavigation.test.ts` with post-modal spacebar tests passing
- Test file: `DocumentView.test.ts` with keyboard integration test passing
- Manual test: Double-click item to open editor, close editor, press spacebar - status changes

### Unit 3: Disable Auto-save and Hide Settings

**Purpose:** Remove the buggy auto-save behavior while preserving code for future restoration.

**Functional Requirements:**
- The system shall default `autoSave` to `false` in settings
- The system shall hide the auto-save checkbox and delay input from EditorSettingsSection UI
- The system shall retain auto-save backend code (commented or conditional) for future re-enablement
- The user shall only see the View Mode setting in the Editor settings section

**Test Requirements:**

```typescript
// EditorSettingsSection.test.tsx - Update existing tests

describe('EditorSettingsSection', () => {
  it('renders view mode select', () => {
    // Should still render the view mode dropdown
  })

  it('does not render auto-save checkbox', () => {
    // Auto-save checkbox should not be in the DOM
    expect(screen.queryByLabelText(/auto-save/i)).not.toBeInTheDocument()
  })

  it('does not render auto-save delay input', () => {
    // Auto-save delay input should not be in the DOM
    expect(screen.queryByLabelText(/delay/i)).not.toBeInTheDocument()
  })
})

// settings/types.test.ts or settings-manager.test.ts

describe('default settings', () => {
  it('defaults autoSave to false', () => {
    const defaults = getDefaultSettings()
    expect(defaults.editor.autoSave).toBe(false)
  })
})
```

**Proof Artifacts:**
- Test file: `EditorSettingsSection.test.tsx` with hidden UI tests passing
- Test file: Settings default test confirming `autoSave: false`
- Screenshot: Editor settings section showing only "View Mode" dropdown

### Unit 4: Theme Compliance - Replace Hardcoded Colors

**Purpose:** Ensure all UI elements use CSS custom properties from the theme system for consistent appearance.

**Functional Requirements:**
- The system shall replace all hardcoded HEX color values (#ffffff, #DC2626, #D10467, etc.) with theme variables
- The system shall replace all hardcoded RGBA color values with theme-based alternatives
- The system shall define any missing CSS custom properties needed (e.g., `--color-white`, glow variants)
- The system shall ensure shimmer effects, shadows, and hover states derive from theme variables

**Files requiring updates (57 instances across 14 files):**

| File | Issues |
|------|--------|
| Settings.css | #ffffff, #DC2626, hardcoded rgba gradients |
| Button.css | #ffffff, #DC2626, hardcoded glow rgba |
| Badge.css | #D10467, multiple hardcoded rgba values |
| FilterButtons.css | Undefined `var(--color-white)` |
| App.css | Hardcoded cyan rgba in animations |
| DocumentView.css | Hardcoded rgba in gradients, hover, animations |
| DocumentHeader.css | Hardcoded cyan text-shadow |
| EditorModal.css | Hardcoded backdrop and overlay colors |
| EditorToolbar.css | Hardcoded cyan in hover states |
| Dashboard.css | Hardcoded white in shimmer effect |
| SectionProgressBar.css | Hardcoded white shimmer, emerald glow |
| ColorPicker.css | Hardcoded white border |
| Modal.css | Hardcoded black backdrop |
| InProgressItem.css | Minor gradient optimization |

**Test Requirements:**

```typescript
// css-theme-compliance.test.ts - New test file for CSS validation

describe('CSS Theme Compliance', () => {
  const cssFiles = [
    'Settings.css',
    'Button.css',
    'Badge.css',
    // ... all 14 files
  ]

  it.each(cssFiles)('%s contains no hardcoded HEX colors', async (file) => {
    const content = await readCssFile(file)
    // Match #fff, #ffffff, #000, #DC2626, etc. but NOT inside var() or comments
    const hardcodedHex = content.match(/#[0-9a-fA-F]{3,6}(?![^(]*\))/g)
    expect(hardcodedHex).toBeNull()
  })

  it.each(cssFiles)('%s uses theme variables for colors', async (file) => {
    const content = await readCssFile(file)
    // All color properties should use var(--color-*) or var(--accent-*)
    // This is a lint-style check
  })
})

// Snapshot test for theme variable definitions
describe('Theme Variables', () => {
  it('defines all required CSS custom properties', () => {
    // Verify App.css :root contains all expected variables
    const rootVariables = extractRootVariables('App.css')
    expect(rootVariables).toContain('--shimmer-color')
    expect(rootVariables).toContain('--backdrop-color')
    expect(rootVariables).toContain('--color-white')
  })
})
```

**Proof Artifacts:**
- Test file: `css-theme-compliance.test.ts` with all CSS files passing
- Code grep result: `grep -r "#[0-9a-fA-F]\{3,6\}" --include="*.css"` returns zero matches (excluding comments)
- Screenshot: Settings page with custom accent color showing themed "Enabled" button

### Unit 5: Fix FileCard Remaining Items Count

**Purpose:** Display accurate count of remaining (incomplete) items on dashboard FileCards.

**Functional Requirements:**
- The system shall calculate remaining items as `total - complete` (not comparing complete vs in_progress)
- The system shall display the count of items that are not yet complete (pending + in_progress)
- The user shall see accurate remaining counts that match the actual document state

**Test Requirements:**

```typescript
// useDashboard.test.ts - Add/update calculateProgress tests

describe('calculateProgress', () => {
  it('calculates remaining as total minus complete', () => {
    const state = {
      items: {
        'item-1': { status: 'complete', updatedAt: '2024-01-01' },
        'item-2': { status: 'in_progress', updatedAt: '2024-01-01' },
        'item-3': { status: 'pending', updatedAt: '2024-01-01' },
      }
    }
    const progress = calculateProgress(state, 10)

    expect(progress.total).toBe(10)
    expect(progress.complete).toBe(1)
    expect(progress.inProgress).toBe(1)
    expect(progress.pending).toBe(8) // 10 - 1 - 1 = 8
  })

  it('shows correct remaining when no items tracked yet', () => {
    const progress = calculateProgress(null, 10)
    expect(progress.pending).toBe(10) // All items are pending
  })
})

// FileCard.test.tsx - Add remaining count tests

describe('FileCard', () => {
  it('displays remaining count as total minus complete', () => {
    const file = {
      progress: { total: 10, complete: 3, inProgress: 2, pending: 5, percentage: 30 },
      // ...other props
    }
    render(<FileCard file={file} />)

    // Remaining should be 7 (10 - 3 = 7, not 3 vs 2)
    expect(screen.getByText('7 remaining')).toBeInTheDocument()
  })

  it('displays 0 remaining when all items complete', () => {
    const file = {
      progress: { total: 10, complete: 10, inProgress: 0, pending: 0, percentage: 100 },
    }
    render(<FileCard file={file} />)
    expect(screen.getByText('0 remaining')).toBeInTheDocument()
  })
})
```

**Proof Artifacts:**
- Test file: `useDashboard.test.ts` with calculateProgress tests passing
- Test file: `FileCard.test.tsx` with remaining count display tests passing
- Manual test: Mark items complete in document, return to dashboard - remaining count decreases

## Non-Goals (Out of Scope)

1. **Re-implementing auto-save**: This spec disables auto-save; a future spec may re-enable it with a proper implementation
2. **Adding new theme customization options**: We're fixing existing elements to use current theme variables, not adding new customizable properties
3. **Refactoring the editor architecture**: We're fixing the slice extraction/save logic, not redesigning the editor
4. **Adding undo/redo for status changes**: Spacebar fix restores existing functionality only
5. **Performance optimization of progress calculation**: We're fixing correctness, not optimizing speed
6. **100% code coverage**: We're writing targeted regression tests, not exhaustive coverage

## Design Considerations

No specific design changes required. All fixes maintain the existing Dark OLED Luxury aesthetic while ensuring theme variables are applied consistently.

## Repository Standards

Follow established repository patterns and conventions:
- TypeScript with strict typing (no `any` types)
- React functional components with hooks
- CSS custom properties for theming (prefix: `--color-*`, `--accent-*`)
- Colocated test files with `*.test.ts(x)` naming
- ESLint and Prettier formatting compliance
- **TDD: Write failing tests before implementing fixes**

## Technical Considerations

**Bug 1 - Markdown Overwrite:**
- Root cause: Line numbers in `item.position` become stale after content is saved
- Solution: Force document re-parse after save before allowing subsequent edits; ensure `refreshFileContent()` completes and triggers re-parse before editor can be opened again
- Key files: `useMarkdownEditor.ts`, `markdown-slice.ts`, `App.tsx`

**Bug 2 - Spacebar After EditorModal:**
- Root cause: Focus or event handler state not properly restored after modal closes
- Investigation needed: Check if `externalFocusedItemId` restoration is working; verify `handleKeyDown` is still bound after modal close
- Key files: `useTreeKeyboardNavigation.ts`, `DocumentView.tsx`, `App.tsx`

**Bug 3 - Auto-save:**
- Approach: Comment out UI in `EditorSettingsSection.tsx`; change default `autoSave` to `false` in settings types/defaults
- Key files: `EditorSettingsSection.tsx`, `lib/settings/types.ts`

**Bug 4 - Theme Compliance:**
- Approach: Define missing CSS variables in root theme; update each CSS file to use variables
- New variables needed: `--shimmer-color`, `--backdrop-color`, opacity variants for accent colors
- Key files: `App.css` (root variables), all 14 identified CSS files

**Bug 5 - FileCard Count:**
- Root cause: Progress text shows `complete` vs `in_progress` comparison instead of `total - complete`
- Solution: Update `FileCard.tsx` line 109 calculation or verify `calculateProgress` in `useDashboard.ts`
- Key files: `FileCard.tsx`, `useDashboard.ts`

## Security Considerations

No specific security considerations identified. These are UI/UX bug fixes with no changes to data handling, authentication, or file system operations.

## Success Metrics

1. **Zero content corruption**: Users can edit any section in any order without overwriting other content
2. **100% spacebar reliability**: Spacebar cycles status in all scenarios (before/after editor use)
3. **Hidden auto-save UI**: No auto-save settings visible in Settings page
4. **Full theme compliance**: Zero hardcoded colors in CSS files (verified by grep and tests)
5. **Accurate FileCard counts**: Remaining count matches `total - complete` for all files
6. **All regression tests passing**: New tests prevent bugs from recurring

## Open Questions

1. **Spacebar bug root cause**: Need to investigate whether the issue is focus management, event handler binding, or state synchronization - may require debugging to pinpoint exact cause
2. **Theme variable naming**: Should we create generic variables like `--shimmer-color` or derive all from existing accent variables with opacity?
3. **Auto-save future restoration**: Should we add a feature flag for auto-save or simply leave the code commented for manual re-enablement?
4. **CSS compliance test approach**: Should we use a static analysis script, jest-based CSS parsing, or a custom lint rule?

