# 05 Questions Round 1 - Bug Fixes

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. Markdown Content Overwrite Bug - Scope

The bug where sections get overwritten when using DocumentView + EditorModal could have multiple causes. What behavior are you observing?

- [x] (A) When saving edits, content from one section overwrites another section
- [x] (B) The wrong slice of content is extracted when opening the editor
- [x] (C) Line number tracking becomes incorrect after editing
- [ ] (D) Content is duplicated instead of replaced
- [ ] (E) Other (describe)

**Additional notes:**

## 2. Spacebar State Change Bug - Behavior

The spacebar is not correctly changing item state. What is happening?

- [ ] (A) Nothing happens when pressing spacebar
- [ ] (B) The wrong item's state changes
- [ ] (C) The state changes but UI doesn't update
- [ ] (D) State changes but reverts immediately
- [x] (E) State changes correctly until the user opens the EditorModal for the first time. 

**Additional notes:**

## 3. Auto-save Feature - Hide vs Remove

You mentioned hiding the auto-save settings. Should we:

- [ ] (A) **Comment out UI only** - Keep the backend logic but hide settings from user (can re-enable later)
- [x] (B) **Disable auto-save entirely** - Turn off auto-save by default and hide the settings
- [ ] (C) **Remove auto-save code completely** - Delete all auto-save related code (harder to restore)
- [ ] (D) Other (describe)

**Additional notes:**

## 4. Unthemed Elements - Priority

My analysis found 57 instances of hardcoded colors across 14 files. Should we:

- [x] (A) **Fix all instances** - Comprehensive theme compliance across entire codebase
- [ ] (B) **Fix critical UI elements only** - Enabled/Disabled buttons, success/error messages, badges
- [ ] (C) **Fix only the two examples mentioned** - WatchedDirectoriesSection "Enabled" button and success message
- [ ] (D) Other (describe)

**Key files with hardcoded colors identified:**
- Settings.css - #ffffff (white), #DC2626 (red)
- Button.css - #ffffff (white), #DC2626 (red)
- Badge.css - #D10467 (intermediary), multiple rgba values
- FilterButtons.css - Uses undefined `var(--color-white)`
- App.css, DocumentView.css - Multiple hardcoded rgba in animations/effects
- EditorModal.css, EditorToolbar.css - Hardcoded overlay/hover colors
- Dashboard.css, SectionProgressBar.css - Hardcoded white in shimmer effects

**Additional notes:**
- FileCards on the primary dashboard do not show the correct total number of items left to work through. It seems to be a comparison of complete items vs in progress items. 
