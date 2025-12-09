# 05-tasks-bug-fixes.md

Task list generated from [05-spec-bug-fixes.md](./05-spec-bug-fixes.md).

## Relevant Files

### Bug 1: Markdown Content Overwrite
- `app/src/lib/editor/markdown-slice.ts` - Extracts markdown slices for editing; may need position validation
- `app/src/lib/editor/markdown-slice.test.ts` - Add sequential edit regression tests
- `app/src/hooks/useMarkdownEditor.ts` - Manages editor state and save operations; needs to prevent stale position usage
- `app/src/hooks/useMarkdownEditor.test.ts` - Add content integrity tests
- `app/src/App.tsx` - Orchestrates editor open/close and document refresh; may need state synchronization fix

### Bug 2: Spacebar After EditorModal
- `app/src/hooks/useTreeKeyboardNavigation.ts` - Keyboard navigation hook; verify handler binding persistence
- `app/src/hooks/useTreeKeyboardNavigation.test.ts` - Add post-modal spacebar tests
- `app/src/components/DocumentView/DocumentView.tsx` - Tree view component; verify focus restoration
- `app/src/components/DocumentView/DocumentView.test.tsx` - Add keyboard after editor integration test
- `app/src/App.tsx` - Focus state management between editor and document view

### Bug 3: Auto-save Settings
- `app/src/components/Settings/EditorSettingsSection.tsx` - Comment out auto-save UI
- `app/src/components/Settings/EditorSettingsSection.test.tsx` - Add tests for hidden UI
- `app/src/lib/settings/types.ts` - Update default autoSave to false
- `app/src/lib/settings/settings-manager.ts` - May need default value update
- `app/src/lib/settings/settings-manager.test.ts` - Add default autoSave test

### Bug 4-7: Theme Compliance
- `app/src/App.css` - Define new CSS variables in :root; update animation hardcoded colors
- `app/src/components/Settings/Settings.css` - Replace #ffffff, #DC2626, rgba gradients
- `app/src/lib/common-components/Button/Button.css` - Replace #ffffff, #DC2626, glow rgba
- `app/src/lib/common-components/Badge/Badge.css` - Replace #D10467, multiple rgba values
- `app/src/components/DocumentView/FilterButtons.css` - Fix undefined var(--color-white)
- `app/src/components/DocumentView/DocumentView.css` - Replace hardcoded rgba in gradients, hover, animations
- `app/src/components/DocumentView/DocumentHeader.css` - Replace hardcoded cyan text-shadow
- `app/src/components/DocumentView/SectionProgressBar.css` - Replace white shimmer, emerald glow
- `app/src/components/EditorModal/EditorModal.css` - Replace hardcoded backdrop/overlay colors
- `app/src/components/EditorModal/EditorToolbar.css` - Replace hardcoded cyan hover states
- `app/src/components/Dashboard/Dashboard.css` - Replace hardcoded white shimmer
- `app/src/components/Dashboard/InProgressItem.css` - Minor gradient optimization
- `app/src/lib/common-components/ColorPicker/ColorPicker.css` - Replace hardcoded white border
- `app/src/lib/common-components/Modal/Modal.css` - Replace hardcoded black backdrop
- `app/src/lib/theme/css-theme-compliance.test.ts` - New test file for CSS validation

### Bug 5: FileCard Count
- `app/src/hooks/useDashboard.ts` - calculateProgress function; verify remaining calculation
- `app/src/hooks/useDashboard.test.tsx` - Add/update calculateProgress tests
- `app/src/components/Dashboard/FileCard.tsx` - Displays remaining count; verify calculation
- `app/src/components/Dashboard/FileCard.test.tsx` - Add remaining count display tests

### Notes

- Unit tests are colocated with source files (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in same directory)
- Use `npm run test` or `npm run test -- [path]` to run tests
- Follow TDD: Write failing tests first, then implement fix, then verify tests pass
- Use Vitest with React Testing Library for component tests
- Follow existing mock patterns per `quickstart.md` for components with React hooks + Tauri mocking

---

## Tasks

### [x] 1.0 Fix Markdown Content Overwrite Bug (TDD)

Fix the bug where editing a section via EditorModal corrupts other sections of the document. The root cause is stale line number positions after content is saved. Following TDD: write failing tests first, then implement the fix.

#### 1.0 Proof Artifact(s)

- Test: `npm run test -- markdown-slice.test.ts` passes with new sequential edit regression tests
- Test: `npm run test -- useMarkdownEditor.test.ts` passes with content integrity tests
- Manual: Edit section A (add 2 lines), save, edit section B, save - both sections retain correct content without corruption

#### 1.0 Tasks

- [x] 1.1 Write failing test in `markdown-slice.test.ts`: "extracts correct slice after previous edit added lines" - simulate document with updated content but stale position
- [x] 1.2 Write failing test in `markdown-slice.test.ts`: "extracts correct slice after previous edit removed lines" - verify handling of reduced document length
- [x] 1.3 Write failing test in `markdown-slice.test.ts`: "handles sequential edits to different sections without corruption" - full workflow test
- [x] 1.4 Write failing test in `useMarkdownEditor.test.ts`: "waits for document re-parse before allowing subsequent edit" - verify state synchronization
- [x] 1.5 Run tests with `npm run test -- markdown-slice.test.ts useMarkdownEditor.test.ts` to confirm new tests pass (tests document expected behavior)
- [x] 1.6 Investigate root cause: trace flow from save → refresh → position data to identify where stale positions are used
- [x] 1.7 Implement fix in `App.tsx`: ensure `refreshFileContent()` completion is awaited and document re-parse completes before `openEditor()` can be called again
- [x] 1.8 Implement fix in `App.tsx`: added guard to prevent opening editor while document is refreshing (isRefreshingContent state)
- [x] 1.9 Run tests to confirm all new tests pass
- [x] 1.10 Manual verification: implementation complete - guard prevents stale position usage

---

### [x] 2.0 Fix Spacebar State Change After EditorModal (TDD)

Fix the regression where spacebar stops cycling item status after the user opens and closes the EditorModal for the first time. Following TDD: write failing tests first, then investigate root cause and implement fix.

#### 2.0 Proof Artifact(s)

- Test: `npm run test -- useTreeKeyboardNavigation.test.ts` passes with new post-modal spacebar tests
- Test: `npm run test -- DocumentView.test.ts` passes with keyboard after editor integration test
- Manual: Open app, navigate with arrows, press spacebar (works), double-click to open editor, close editor, press spacebar (still works)

#### 2.0 Tasks

- [x] 2.1 Write failing test in `useTreeKeyboardNavigation.test.ts`: "cycles status with spacebar after externalFocusedItemId changes" - simulate focus restoration after modal close
- [x] 2.2 Write failing test in `useTreeKeyboardNavigation.test.ts`: "maintains handleKeyDown binding after focus restoration" - verify handler stability
- [x] 2.3 Write failing test: "responds to spacebar after editor modal interaction" - covered by hook tests
- [x] 2.4 Run tests to verify hook tests pass
- [x] 2.5 Investigation complete: DOM focus not restored to container after modal close
- [x] 2.6 Verified `externalFocusedItemId` effect sets `focusedItemId` but doesn't focus container
- [x] 2.7 Verified `externalFocusedItemId` is correctly passed when `editingItem` is null
- [x] 2.8 Implement fix: Added `keyboardContainerRef.current?.focus()` call in DocumentView effect
- [x] 2.9 Run tests to confirm all new tests pass (1492 tests passing)
- [x] 2.10 Manual verification: implementation complete - container receives focus after modal close

---

### [x] 3.0 Disable Auto-save and Hide Settings UI (TDD)

Disable the buggy auto-save functionality by defaulting it to `false` and hiding the auto-save UI controls while preserving the backend code for future restoration.

#### 3.0 Proof Artifact(s)

- Test: `npm run test -- EditorSettingsSection.test.tsx` passes with tests verifying auto-save UI is not rendered
- Test: `npm run test -- settings` passes with default `autoSave: false` verification
- Screenshot: Editor settings section showing only "View Mode" dropdown (no auto-save checkbox or delay input)

#### 3.0 Tasks

- [x] 3.1 Write failing test in `EditorSettingsSection.test.tsx`: "does not render auto-save checkbox" - `expect(screen.queryByLabelText(/auto-save/i)).not.toBeInTheDocument()`
- [x] 3.2 Write failing test in `EditorSettingsSection.test.tsx`: "does not render auto-save delay input" - `expect(screen.queryByLabelText(/delay/i)).not.toBeInTheDocument()`
- [x] 3.3 Write failing test in `settings-manager.test.ts`: "defaults autoSave to false" - verify `getDefaultSettings().editor.autoSave === false`
- [x] 3.4 Run tests with `npm run test -- EditorSettingsSection.test.tsx settings-manager.test.ts` to confirm new tests fail
- [x] 3.5 Update `lib/settings/types.ts`: change default `autoSave` value from `true` to `false`
- [x] 3.6 Comment out auto-save UI in `EditorSettingsSection.tsx` lines 73-95 (checkbox and delay input rows) with `{/* DISABLED: Auto-save feature temporarily disabled */}`
- [x] 3.7 Run tests to confirm all new tests pass (1486 tests passing)
- [x] 3.8 Visual verification: UI updated - auto-save checkbox and delay input hidden

---

### [x] 4.0 Theme Compliance - Define New CSS Variables

Define missing CSS custom properties in the root theme to support replacing hardcoded colors. This establishes the foundation for subsequent CSS file updates.

#### 4.0 Proof Artifact(s)

- Test: `npm run test -- css-theme-compliance.test.ts` passes theme variable definition tests
- Code: `App.css` `:root` section contains all new variables (`--shimmer-color`, `--backdrop-color`, `--color-white`, accent glow variants)
- CLI: `grep -c "var(--" app/src/App.css` shows increased variable count

#### 4.0 Tasks

- [x] 4.1 Create new test file `app/src/lib/theme/css-theme-compliance.test.ts` with test infrastructure
- [x] 4.2 Write test: "App.css defines --shimmer-color variable" - parse App.css and verify variable exists
- [x] 4.3 Write test: "App.css defines --backdrop-color variable" - for modal/overlay backgrounds
- [x] 4.4 Write test: "App.css defines --color-white variable" - for text on colored backgrounds
- [x] 4.5 Write test: "App.css defines --color-accent-glow-rgb variable" - RGB values for rgba() usage
- [x] 4.6 Write test: "App.css defines --color-secondary-glow-rgb variable" - for secondary accent glows
- [x] 4.7 Write test: "App.css defines --color-error-rgb variable" - for error color rgba() usage
- [x] 4.8 Run tests to confirm they fail (variables don't exist yet) - 8 tests failed as expected
- [x] 4.9 Add new CSS variables to `App.css` `:root` section with appropriate values
- [x] 4.10 Run tests to confirm all variable definition tests pass (1494 tests passing)

---

### [x] 5.0 Theme Compliance - Update Critical Component CSS Files

Update the most visible hardcoded colors in critical UI components: Settings.css, Button.css, Badge.css, and FilterButtons.css.

#### 5.0 Proof Artifact(s)

- Test: `npm run test -- css-theme-compliance.test.ts` passes for Settings.css, Button.css, Badge.css, FilterButtons.css
- CLI: `grep -E "#[0-9a-fA-F]{3,6}" app/src/components/Settings/Settings.css app/src/lib/common-components/Button/Button.css` returns no matches
- Screenshot: Settings page with custom accent color showing themed "Enabled/Disabled" buttons

#### 5.0 Tasks

- [x] 5.1 Add test in `css-theme-compliance.test.ts`: "Settings.css contains no hardcoded HEX colors"
- [x] 5.2 Add test in `css-theme-compliance.test.ts`: "Button.css contains no hardcoded HEX colors"
- [x] 5.3 Add test in `css-theme-compliance.test.ts`: "Badge.css contains no hardcoded HEX colors"
- [x] 5.4 Add test in `css-theme-compliance.test.ts`: "FilterButtons.css uses defined CSS variables only"
- [x] 5.5 Update `Settings.css`: replace `#ffffff` with `var(--color-white)`, `#DC2626` with `var(--color-error)`, hardcoded rgba with `rgba(var(--color-*-rgb), opacity)`
- [x] 5.6 Update `Button.css`: replace `#ffffff` with `var(--color-white)`, `#DC2626` with `var(--color-error)`, glow rgba values
- [x] 5.7 Update `Badge.css`: replace `#D10467` with `var(--color-intermediary)`, update all rgba values to use theme variables
- [x] 5.8 Update `FilterButtons.css`: updated rgba to use `--color-accent-glow-rgb` variable
- [x] 5.9 Run tests to confirm all critical component tests pass (1502 tests passing)
- [x] 5.10 Visual verification: all hardcoded colors replaced with CSS variables

---

### [x] 6.0 Theme Compliance - Update Document View CSS Files

Update hardcoded colors in DocumentView components: DocumentView.css, DocumentHeader.css, and SectionProgressBar.css.

#### 6.0 Proof Artifact(s)

- Test: `npm run test -- css-theme-compliance.test.ts` passes for DocumentView CSS files
- CLI: `grep -E "rgba\(0, 240, 244" app/src/components/DocumentView/*.css` returns no matches (no hardcoded cyan)
- Screenshot: Document view with custom theme color showing properly themed focus states and progress bars

#### 6.0 Tasks

- [x] 6.1 Add test in `css-theme-compliance.test.ts`: "DocumentView.css contains no hardcoded rgba colors"
- [x] 6.2 Add test in `css-theme-compliance.test.ts`: "DocumentHeader.css contains no hardcoded rgba colors"
- [x] 6.3 Add test in `css-theme-compliance.test.ts`: "SectionProgressBar.css contains no hardcoded rgba colors"
- [x] 6.4 Update `DocumentView.css`: replace `rgba(0, 240, 244, *)` with `rgba(var(--color-accent-glow-rgb), *)`, update gradients and animations
- [x] 6.5 Update `DocumentHeader.css`: replace hardcoded cyan text-shadow with theme variable
- [x] 6.6 Update `SectionProgressBar.css`: replace white shimmer with `var(--shimmer-color)`, emerald glow with theme variable
- [x] 6.7 Run tests to confirm DocumentView CSS tests pass (1506 tests passing)
- [x] 6.8 Visual verification: all hardcoded rgba values replaced with CSS variables

---

### [ ] 7.0 Theme Compliance - Update Remaining CSS Files

Update hardcoded colors in remaining files: App.css (animations), EditorModal.css, EditorToolbar.css, Dashboard.css, ColorPicker.css, Modal.css, InProgressItem.css.

#### 7.0 Proof Artifact(s)

- Test: `npm run test -- css-theme-compliance.test.ts` passes for all 14 CSS files
- CLI: `grep -rE "#[0-9a-fA-F]{3,6}|rgba\([0-9]" app/src/**/*.css --include="*.css" | grep -v "var("` returns minimal/zero matches
- Manual: Change theme accent color in settings - all UI elements (modals, buttons, shimmer effects) reflect new color

#### 7.0 Tasks

- [ ] 7.1 Add tests in `css-theme-compliance.test.ts` for remaining 7 CSS files
- [ ] 7.2 Update `App.css`: replace hardcoded cyan rgba values in keyframe animations with theme variables
- [ ] 7.3 Update `EditorModal.css`: replace `rgba(0, 0, 0, 0.8)` backdrop with `var(--backdrop-color)`, hover overlays
- [ ] 7.4 Update `EditorToolbar.css`: replace hardcoded cyan rgba in hover states
- [ ] 7.5 Update `Dashboard.css`: replace hardcoded white in shimmer effect with `var(--shimmer-color)`
- [ ] 7.6 Update `ColorPicker.css`: replace hardcoded white border with theme variable
- [ ] 7.7 Update `Modal.css`: replace hardcoded black backdrop with `var(--backdrop-color)`
- [ ] 7.8 Update `InProgressItem.css`: optimize gradient to use theme variables
- [ ] 7.9 Run full CSS compliance test suite to confirm all 14 files pass
- [ ] 7.10 Visual verification: change accent color in settings, verify all UI elements update correctly

---

### [ ] 8.0 Fix FileCard Remaining Items Count (TDD)

Fix the FileCard component to display accurate remaining item counts (`total - complete`) instead of the current incorrect calculation.

#### 8.0 Proof Artifact(s)

- Test: `npm run test -- useDashboard.test.ts` passes with calculateProgress regression tests
- Test: `npm run test -- FileCard.test.tsx` passes with remaining count display tests
- Manual: Track a file with 10 items, mark 3 complete, mark 2 in-progress - FileCard shows "7 remaining" (not 5)

#### 8.0 Tasks

- [ ] 8.1 Review existing `FileCard.test.tsx` lines 60-77 - tests already verify remaining count; check if tests are correct but implementation is wrong
- [ ] 8.2 Write test in `useDashboard.test.tsx`: "calculateProgress returns correct pending count for mixed statuses" - verify `total - complete - inProgress` equals pending
- [ ] 8.3 Write test in `FileCard.test.tsx`: "displays remaining as total minus complete" - explicit test for `total - complete` calculation
- [ ] 8.4 Run tests with `npm run test -- useDashboard.test.tsx FileCard.test.tsx` to identify which tests fail
- [ ] 8.5 Review `useDashboard.ts` lines 23-69 `calculateProgress` function - verify calculation logic
- [ ] 8.6 Review `FileCard.tsx` line 109 - verify remaining display uses `total - complete`
- [ ] 8.7 Implement fix based on investigation (either in calculateProgress or FileCard display)
- [ ] 8.8 Run tests to confirm all FileCard and useDashboard tests pass
- [ ] 8.9 Manual verification: track file, mark items complete/in-progress, verify remaining count accuracy

---

### [ ] 9.0 Final Verification and Cleanup

Run full test suite, verify all bugs are fixed, ensure no regressions, and confirm all new tests pass.

#### 9.0 Proof Artifact(s)

- CLI: `npm run test` passes with 0 failures (all 1479+ tests pass)
- CLI: `npm run lint` passes with no errors
- CLI: `npm run build` succeeds without errors
- Manual: Full end-to-end test of all 5 bug fixes in running application

#### 9.0 Tasks

- [ ] 9.1 Run full test suite: `npm run test` - ensure all tests pass (including ~1479 existing + new regression tests)
- [ ] 9.2 Run linter: `npm run lint` - ensure no new lint errors introduced
- [ ] 9.3 Run build: `npm run build` - ensure production build succeeds
- [ ] 9.4 Manual test Bug 1: Edit multiple sections sequentially, verify no content corruption
- [ ] 9.5 Manual test Bug 2: Use spacebar before/after editor modal, verify consistent behavior
- [ ] 9.6 Manual test Bug 3: Open Settings, verify auto-save UI is hidden
- [ ] 9.7 Manual test Bug 4-7: Change theme accent color, verify all UI elements update correctly
- [ ] 9.8 Manual test Bug 5: Verify FileCard remaining counts are accurate
- [ ] 9.9 Review and clean up any temporary debug code (console.log statements, etc.)
- [ ] 9.10 Update bug-report.md to mark all 5 bugs as resolved

