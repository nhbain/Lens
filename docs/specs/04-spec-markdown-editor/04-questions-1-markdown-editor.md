# 04 Questions Round 1 - Markdown Editor

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

## 1. View Mode

When you click an item in the tree, what should happen to the tree view?

- [ ] (A) Split view - Tree stays visible on left, editor opens on right (side-by-side)
- [ ] (B) Replace view - Tree is hidden, editor takes full space (with back button)
- [x] (C) Overlay/modal - Editor opens as modal overlay on top of tree
- [ ] (D) Other (describe)

**User Answer:** The editor should be a modal and the user should be able to configure between having it as an overlay or split view via the settings panel.

## 2. Editor Type

What level of markdown editing do you need?

- [x] (A) Rich text (WYSIWYG) - Format text visually with toolbar buttons, hides markdown syntax
- [ ] (B) Raw markdown - Edit raw markdown text directly with syntax highlighting
- [ ] (C) Split preview - Raw markdown on left, rendered preview on right
- [ ] (D) Other (describe)

**User Answer:** Rich text (WYSIWYG) - ensure you do thorough research to see if there are any existing libraries that can meet our needs before we build something from scratch.

**Research Result:** Recommended **Milkdown** library - built on remark (same as Lens parser), plugin-driven, ~40kb gzipped, headless/customizable. See https://milkdown.dev/

## 3. Save Behavior

Should edits save automatically or require explicit action?

- [ ] (A) Auto-save - Changes save to file automatically after a delay
- [ ] (B) Manual save - Explicit Save button required (with unsaved indicator)
- [x] (C) Both options - Auto-save with option to disable in settings
- [ ] (D) Other (describe)

**User Answer:** Both options

## 4. Edit Scope

What scope of editing should be allowed?

- [ ] (A) Selected item only - Only edit the clicked item (heading/list item/checkbox)
- [x] (B) Item + children - Edit the item and all its nested children as a block
- [ ] (C) Full document - Edit entire document (item click just scrolls to location)
- [ ] (D) Other (describe)

**User Answer:** Item + children

## 5. Editor Library

Which WYSIWYG markdown editor library should we use?

- [x] (A) Milkdown - Built on remark (same as Lens), plugin-driven, ~40kb gzipped, headless/customizable
- [ ] (B) MDXEditor - Feature-complete out-of-box, true WYSIWYG, React-native, tables/code blocks built-in
- [ ] (C) Tiptap - Most extensible, large ecosystem (100+ extensions), requires more setup for markdown
- [ ] (D) Other (describe)

**User Answer:** Milkdown
