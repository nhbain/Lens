# 01-tasks-common-components-responsive.md

Task list for implementing common components library and responsive design foundation.

**Spec Reference:** `01-spec-common-components-responsive.md`

---

## Relevant Files

### Files to Create

**Common Components Library (`app/src/lib/common-components/`)**

- `app/src/lib/common-components/index.ts` - Barrel file exporting all common components
- `app/src/lib/common-components/Button/Button.tsx` - Button component with 6 variants and 3 sizes
- `app/src/lib/common-components/Button/Button.css` - Button styles following Dark OLED Luxury theme
- `app/src/lib/common-components/Button/Button.test.tsx` - Unit tests for Button component
- `app/src/lib/common-components/Input/Input.tsx` - Text input with label, error, and states
- `app/src/lib/common-components/Input/Input.css` - Input styles with focus ring and error states
- `app/src/lib/common-components/Input/Input.test.tsx` - Unit tests for Input component
- `app/src/lib/common-components/Select/Select.tsx` - Styled dropdown select component
- `app/src/lib/common-components/Select/Select.css` - Select styles matching theme
- `app/src/lib/common-components/Select/Select.test.tsx` - Unit tests for Select component
- `app/src/lib/common-components/Checkbox/Checkbox.tsx` - Styled checkbox with label
- `app/src/lib/common-components/Checkbox/Checkbox.css` - Checkbox styles with accent checked state
- `app/src/lib/common-components/Checkbox/Checkbox.test.tsx` - Unit tests for Checkbox component
- `app/src/lib/common-components/Card/Card.tsx` - Container with header/body/footer sections
- `app/src/lib/common-components/Card/Card.css` - Card styles with hover elevation
- `app/src/lib/common-components/Card/Card.test.tsx` - Unit tests for Card component
- `app/src/lib/common-components/Badge/Badge.tsx` - Status badge with 5 variants and 2 sizes
- `app/src/lib/common-components/Badge/Badge.css` - Badge styles for each variant
- `app/src/lib/common-components/Badge/Badge.test.tsx` - Unit tests for Badge component
- `app/src/lib/common-components/Tooltip/Tooltip.tsx` - Hover tooltip with 4 positions
- `app/src/lib/common-components/Tooltip/Tooltip.css` - Tooltip styles with fade animation
- `app/src/lib/common-components/Tooltip/Tooltip.test.tsx` - Unit tests for Tooltip component
- `app/src/lib/common-components/Modal/Modal.tsx` - Modal dialog with focus trap and portal
- `app/src/lib/common-components/Modal/Modal.css` - Modal styles with backdrop blur
- `app/src/lib/common-components/Modal/Modal.test.tsx` - Unit tests for Modal component

### Files to Modify

**Global Styles**

- `app/src/App.css` - Add responsive breakpoint CSS variables; update max-width from `800px` to percentage-based

**Components with Buttons to Migrate**

- `app/src/App.tsx` - Replace 3 button elements (back button, settings icon, file import)
- `app/src/components/FileImportButton.tsx` - Replace button with common Button component
- `app/src/components/TrackedFilesList.tsx` - Replace 2 buttons (file selection, remove)
- `app/src/components/UndoToast/UndoToast.tsx` - Replace 2 buttons (undo, dismiss)
- `app/src/components/Settings/FilePatternSection.tsx` - Replace 2 buttons (add, remove pattern)
- `app/src/components/Settings/WatchedDirectoriesSection.tsx` - Replace 3 buttons (toggle, remove, add)
- `app/src/components/Settings/DataManagementSection.tsx` - Replace 5+ buttons (export, import, clear, cancel, confirm)
- `app/src/components/Dashboard/Dashboard.tsx` - Replace 2 add file buttons
- `app/src/components/Dashboard/SortControls.tsx` - Replace direction toggle button
- `app/src/components/Dashboard/ResumeSection.tsx` - Replace show-all button

**Components with Inputs/Selects to Migrate**

- `app/src/components/Settings/FilePatternSection.tsx` - Replace text input with common Input
- `app/src/components/Settings/Settings.tsx` - Replace theme select with common Select
- `app/src/components/Dashboard/SortControls.tsx` - Replace sort field select with common Select

**CSS Files to Update for Responsive Design**

- `app/src/components/Dashboard/Dashboard.css` - Add responsive breakpoint media queries for grid layout
- `app/src/components/Settings/Settings.css` - Add responsive breakpoint media queries for form layout

### Notes

- Unit tests should be placed alongside the component files (e.g., `Button.tsx` and `Button.test.tsx` in same directory)
- Use `npm run test` to run all tests, or `npm run test -- path/to/test` for specific tests
- Follow existing BEM naming convention for CSS classes (e.g., `.button--primary`, `.button--size-small`)
- Follow existing mock component pattern in tests to avoid React hook errors with Tauri mocking
- All components must use CSS variables from App.css for theming consistency

---

## Tasks

### [x] 1.0 Responsive Foundation & Button Component

Establish the responsive CSS infrastructure with breakpoint variables and create the Button component with all 6 variants (primary, secondary, danger, ghost, outline, link) and 3 sizes (small, medium, large).

#### 1.0 Proof Artifact(s)

- Code: `app/src/lib/common-components/Button/Button.tsx` exists with all variants and sizes
- Code: `app/src/lib/common-components/Button/Button.css` contains themed styles with hover/focus/disabled states
- Code: `app/src/App.css` contains responsive breakpoint CSS variables (`--breakpoint-sm`, `--breakpoint-md`, `--breakpoint-lg`, `--breakpoint-xl`)
- Test: `npm run test -- app/src/lib/common-components/Button/Button.test.tsx` passes all unit tests
- Code: `app/src/lib/common-components/index.ts` exports Button component

#### 1.0 Tasks

- [x] 1.1 Create directory structure `app/src/lib/common-components/Button/`
- [x] 1.2 Add responsive breakpoint CSS variables to `app/src/App.css` `:root` selector:
  - `--breakpoint-sm: 480px`
  - `--breakpoint-md: 768px`
  - `--breakpoint-lg: 1024px`
  - `--breakpoint-xl: 1280px`
- [x] 1.3 Create `Button.tsx` with TypeScript interface:
  - Props: `variant` (primary | secondary | danger | ghost | outline | link), `size` (small | medium | large), `disabled`, `isLoading`, `type`, `onClick`, `children`, `className`, `aria-label`
  - Default variant: `primary`, default size: `medium`
- [x] 1.4 Create `Button.css` with styles for all variants following Dark OLED Luxury theme:
  - Primary: cyan accent (`--color-accent`) background with glow on hover
  - Secondary: surface-3 background with border
  - Danger: error color background
  - Ghost: transparent background, accent text
  - Outline: transparent background with accent border
  - Link: no background, underline on hover
  - All variants: hover lift effect (translateY), focus-visible ring, disabled opacity
  - Three sizes with appropriate padding/font-size
  - `prefers-reduced-motion` support
- [x] 1.5 Create `Button.test.tsx` with unit tests:
  - Renders with default props
  - Renders each variant correctly (6 variants)
  - Renders each size correctly (3 sizes)
  - Calls onClick when clicked and not disabled
  - Does not call onClick when disabled
  - Shows loading state when isLoading is true
  - Applies custom className
  - Has correct ARIA attributes
- [x] 1.6 Create `app/src/lib/common-components/index.ts` barrel file exporting Button
- [x] 1.7 Verify all Button tests pass with `npm run test -- app/src/lib/common-components/Button`

---

### [x] 2.0 Form Components (Input, Select, Checkbox)

Create styled form controls that match the Dark OLED Luxury theme, supporting all input states (default, focused, disabled, error) and three sizes.

#### 2.0 Proof Artifact(s)

- Code: `app/src/lib/common-components/Input/Input.tsx` exists with label, placeholder, error message support
- Code: `app/src/lib/common-components/Select/Select.tsx` exists with themed dropdown styling
- Code: `app/src/lib/common-components/Checkbox/Checkbox.tsx` exists with accent-colored checked state
- Test: `npm run test -- app/src/lib/common-components/Input` passes all unit tests
- Test: `npm run test -- app/src/lib/common-components/Select` passes all unit tests
- Test: `npm run test -- app/src/lib/common-components/Checkbox` passes all unit tests
- Code: `app/src/lib/common-components/index.ts` exports Input, Select, Checkbox components

#### 2.0 Tasks

- [x] 2.1 Create directory structure `app/src/lib/common-components/Input/`
- [x] 2.2 Create `Input.tsx` with TypeScript interface:
  - Props: `type` (text | search | number | password), `size` (small | medium | large), `label`, `placeholder`, `value`, `onChange`, `disabled`, `error`, `errorMessage`, `fullWidth`, `id`, `name`, `aria-label`, `aria-describedby`
  - Render optional label above input
  - Render optional error message below input
  - Connect label to input via `id`/`htmlFor`
- [x] 2.3 Create `Input.css` with styles:
  - Surface-2 background, surface-3 border
  - Cyan border + glow ring on focus
  - Error state with red border and error color
  - Disabled state with reduced opacity
  - Three sizes matching Button sizes
  - `prefers-reduced-motion` support
- [x] 2.4 Create `Input.test.tsx` with unit tests:
  - Renders with default props
  - Renders label when provided
  - Renders error message when error is true
  - Calls onChange when value changes
  - Renders disabled state
  - Renders each size correctly
  - Has correct ARIA attributes for error state
- [x] 2.5 Create directory structure `app/src/lib/common-components/Select/`
- [x] 2.6 Create `Select.tsx` with TypeScript interface:
  - Props: `options` (array of {value, label}), `size` (small | medium | large), `label`, `value`, `onChange`, `disabled`, `placeholder`, `fullWidth`, `id`, `name`
  - Render optional label above select
  - Render custom dropdown arrow icon
- [x] 2.7 Create `Select.css` with styles:
  - Surface-2 background matching Input
  - Custom dropdown arrow with accent color
  - Cyan border on focus
  - Option styling with hover highlight
  - Three sizes matching Button/Input sizes
- [x] 2.8 Create `Select.test.tsx` with unit tests:
  - Renders with options
  - Renders label when provided
  - Calls onChange when selection changes
  - Renders disabled state
  - Renders placeholder option when provided
- [x] 2.9 Create directory structure `app/src/lib/common-components/Checkbox/`
- [x] 2.10 Create `Checkbox.tsx` with TypeScript interface:
  - Props: `label`, `checked`, `onChange`, `disabled`, `size` (small | medium), `id`, `name`
  - Render checkbox with label inline
  - Custom styled checkbox replacing native appearance
- [x] 2.11 Create `Checkbox.css` with styles:
  - Custom checkbox appearance (hide native, use pseudo-elements)
  - Unchecked: surface-2 background with border
  - Checked: accent background with checkmark icon
  - Disabled state with reduced opacity
  - Focus ring on keyboard navigation
- [x] 2.12 Create `Checkbox.test.tsx` with unit tests:
  - Renders with label
  - Calls onChange when clicked
  - Renders checked state
  - Renders disabled state
- [x] 2.13 Update `app/src/lib/common-components/index.ts` to export Input, Select, Checkbox
- [x] 2.14 Verify all form component tests pass with `npm run test -- app/src/lib/common-components`

---

### [ ] 3.0 Display Components (Card, Badge, Tooltip, Modal)

Create layout and feedback components for consistent UI patterns, including accessible Modal with focus trap and keyboard handling.

#### 3.0 Proof Artifact(s)

- Code: `app/src/lib/common-components/Card/Card.tsx` exists with header/body/footer sections and hover elevation
- Code: `app/src/lib/common-components/Badge/Badge.tsx` exists with 5 variants (default, success, warning, error, info) and 2 sizes
- Code: `app/src/lib/common-components/Tooltip/Tooltip.tsx` exists with 4 positions (top, bottom, left, right)
- Code: `app/src/lib/common-components/Modal/Modal.tsx` exists with backdrop blur, focus trap, and Escape key handling
- Test: `npm run test -- app/src/lib/common-components/Card` passes
- Test: `npm run test -- app/src/lib/common-components/Badge` passes
- Test: `npm run test -- app/src/lib/common-components/Tooltip` passes
- Test: `npm run test -- app/src/lib/common-components/Modal` passes
- Code: Modal includes `aria-modal="true"` and `role="dialog"` attributes

#### 3.0 Tasks

- [ ] 3.1 Create directory structure `app/src/lib/common-components/Card/`
- [ ] 3.2 Create `Card.tsx` with TypeScript interface:
  - Props: `children`, `header`, `footer`, `className`, `hoverable` (boolean for hover effects)
  - Render optional header section
  - Render children as body content
  - Render optional footer section
- [ ] 3.3 Create `Card.css` with styles:
  - Surface-3 background with gradient
  - Shadow system matching FileCard
  - Hover elevation effect (lift + enhanced shadow) when hoverable
  - Optional header/footer with border separators
  - `prefers-reduced-motion` support
- [ ] 3.4 Create `Card.test.tsx` with unit tests:
  - Renders children content
  - Renders header when provided
  - Renders footer when provided
  - Applies hover styles when hoverable is true
- [ ] 3.5 Create directory structure `app/src/lib/common-components/Badge/`
- [ ] 3.6 Create `Badge.tsx` with TypeScript interface:
  - Props: `variant` (default | success | warning | error | info), `size` (small | medium), `children`, `className`
  - Default variant: `default`, default size: `medium`
- [ ] 3.7 Create `Badge.css` with styles:
  - Inline-block display with pill shape (border-radius)
  - Variant colors: default (surface-3), success (emerald), warning (yellow), error (red), info (cyan)
  - Two sizes with appropriate padding/font-size
  - Subtle text-shadow for depth
- [ ] 3.8 Create `Badge.test.tsx` with unit tests:
  - Renders children content
  - Renders each variant correctly (5 variants)
  - Renders each size correctly (2 sizes)
- [ ] 3.9 Create directory structure `app/src/lib/common-components/Tooltip/`
- [ ] 3.10 Create `Tooltip.tsx` with TypeScript interface:
  - Props: `content` (tooltip text), `position` (top | bottom | left | right), `children` (trigger element), `delay` (ms before showing)
  - Manage hover state to show/hide tooltip
  - Position tooltip relative to trigger element
  - Use portal rendering to avoid overflow issues
- [ ] 3.11 Create `Tooltip.css` with styles:
  - Surface-3 background with subtle border
  - Subtle glow effect
  - Fade-in animation on show
  - Arrow pointer toward trigger
  - Position variants (top, bottom, left, right)
  - `prefers-reduced-motion` support
- [ ] 3.12 Create `Tooltip.test.tsx` with unit tests:
  - Renders trigger element
  - Shows tooltip on hover
  - Hides tooltip on mouse leave
  - Renders in correct position
- [ ] 3.13 Create directory structure `app/src/lib/common-components/Modal/`
- [ ] 3.14 Create `Modal.tsx` with TypeScript interface:
  - Props: `isOpen`, `onClose`, `title`, `children`, `footer`, `size` (small | medium | large), `closeOnBackdropClick`, `closeOnEscape`
  - Use React portal to render at document root
  - Implement focus trap (trap Tab key within modal)
  - Handle Escape key to close when `closeOnEscape` is true
  - Handle backdrop click to close when `closeOnBackdropClick` is true
  - Add `aria-modal="true"`, `role="dialog"`, `aria-labelledby` attributes
- [ ] 3.15 Create `Modal.css` with styles:
  - Fixed overlay covering viewport
  - Backdrop with blur effect and semi-transparent black
  - Centered content container with surface-3 background
  - Header with title and close button
  - Body with scrollable content area
  - Optional footer section
  - Entrance animation (scale + fade)
  - `prefers-reduced-motion` support
- [ ] 3.16 Create `Modal.test.tsx` with unit tests:
  - Does not render when isOpen is false
  - Renders when isOpen is true
  - Renders title and content
  - Calls onClose when Escape is pressed (if closeOnEscape)
  - Calls onClose when backdrop is clicked (if closeOnBackdropClick)
  - Has correct ARIA attributes
  - Traps focus within modal
- [ ] 3.17 Update `app/src/lib/common-components/index.ts` to export Card, Badge, Tooltip, Modal
- [ ] 3.18 Verify all display component tests pass with `npm run test -- app/src/lib/common-components`

---

### [ ] 4.0 Migration & Responsive Application

Replace all existing button and input instances with common components, update container max-widths to percentage-based values, and apply responsive breakpoints throughout Dashboard and Settings.

#### 4.0 Proof Artifact(s)

- Code: `grep -r "<button" app/src/components --include="*.tsx" | grep -v ".test.tsx"` returns no results (all buttons migrated)
- Code: Container max-widths use percentage values (e.g., `max-width: 90vw`) instead of pixel values
- Test: `npm run test` passes with 0 failures (all 949+ existing tests still pass)
- Build: `npm run build` succeeds without errors or warnings
- Code: Dashboard grid responds to breakpoints (visible in CSS media queries)
- Code: Settings layout responds to breakpoints (visible in CSS media queries)

#### 4.0 Tasks

**Button Migration**

- [ ] 4.1 Migrate `app/src/App.tsx`:
  - Replace back button with `<Button variant="ghost" size="small">`
  - Replace settings icon button with `<Button variant="ghost" size="small">`
  - Update imports to include Button from common-components
- [ ] 4.2 Migrate `app/src/components/FileImportButton.tsx`:
  - Replace native button with `<Button variant="primary">`
  - Pass through isLoading, disabled, onClick props
- [ ] 4.3 Migrate `app/src/components/TrackedFilesList.tsx`:
  - Replace file selection button with `<Button variant="ghost">`
  - Replace remove button with `<Button variant="ghost" size="small">`
- [ ] 4.4 Migrate `app/src/components/UndoToast/UndoToast.tsx`:
  - Replace undo button with `<Button variant="primary" size="small">`
  - Replace dismiss button with `<Button variant="ghost" size="small">`
- [ ] 4.5 Migrate `app/src/components/Settings/FilePatternSection.tsx`:
  - Replace add pattern button with `<Button variant="primary">`
  - Replace remove pattern buttons with `<Button variant="ghost" size="small">`
- [ ] 4.6 Migrate `app/src/components/Settings/WatchedDirectoriesSection.tsx`:
  - Replace toggle enabled button with `<Button variant="ghost" size="small">`
  - Replace remove button with `<Button variant="ghost" size="small">`
  - Replace add directory button with `<Button variant="primary">`
- [ ] 4.7 Migrate `app/src/components/Settings/DataManagementSection.tsx`:
  - Replace export button with `<Button variant="secondary">`
  - Replace import button with `<Button variant="secondary">`
  - Replace clear data button with `<Button variant="danger">`
  - Replace cancel button with `<Button variant="secondary">`
  - Replace confirm button with `<Button variant="danger">`
- [ ] 4.8 Migrate `app/src/components/Dashboard/Dashboard.tsx`:
  - Replace add file buttons with `<Button variant="primary">` and `<Button variant="outline">`
- [ ] 4.9 Migrate `app/src/components/Dashboard/SortControls.tsx`:
  - Replace direction toggle button with `<Button variant="ghost" size="small">`
- [ ] 4.10 Migrate `app/src/components/Dashboard/ResumeSection.tsx`:
  - Replace show-all button with `<Button variant="link" size="small">`

**Form Component Migration**

- [ ] 4.11 Migrate `app/src/components/Settings/FilePatternSection.tsx`:
  - Replace native input with `<Input>` component
  - Pass through value, onChange, placeholder, disabled, error, errorMessage props
- [ ] 4.12 Migrate `app/src/components/Settings/Settings.tsx`:
  - Replace native select with `<Select>` component for theme selection
  - Pass through options, value, onChange, disabled props
- [ ] 4.13 Migrate `app/src/components/Dashboard/SortControls.tsx`:
  - Replace native select with `<Select>` component for sort field
  - Pass through options, value, onChange props

**Responsive Updates**

- [ ] 4.14 Update `app/src/App.css`:
  - Change `.container` max-width from `800px` to `max-width: 90vw`
  - Optionally add `max-width: min(90vw, 1200px)` as a reasonable upper bound
- [ ] 4.15 Update `app/src/components/Dashboard/Dashboard.css`:
  - Add media queries using breakpoint variables for grid layout:
    - `@media (max-width: 480px)`: Single column layout
    - `@media (max-width: 768px)`: 2 column layout
    - Default: 3+ column layout
  - Adjust padding and gaps at smaller breakpoints
- [ ] 4.16 Update `app/src/components/Settings/Settings.css`:
  - Enhance existing 600px breakpoint to use new breakpoint variables
  - Add additional breakpoint adjustments if needed for form layout
  - Ensure form inputs stack properly at small sizes

**Cleanup & Verification**

- [ ] 4.17 Remove or consolidate orphaned button CSS classes from component CSS files that are now handled by common Button
- [ ] 4.18 Run `npm run lint` and fix any linting errors
- [ ] 4.19 Run `npm run test` and verify all 949+ tests pass
- [ ] 4.20 Run `npm run build` and verify production build succeeds
- [ ] 4.21 Verify no raw `<button>` elements remain: `grep -r "<button" app/src/components --include="*.tsx" | grep -v ".test.tsx"` returns empty

---

## Summary

| Task | Components | Sub-tasks | Estimated Files |
|------|------------|-----------|-----------------|
| 1.0 | Button + CSS foundation | 7 | 5 files created, 1 modified |
| 2.0 | Input, Select, Checkbox | 14 | 9 files created, 1 modified |
| 3.0 | Card, Badge, Tooltip, Modal | 18 | 12 files created, 1 modified |
| 4.0 | Migration + Responsive | 21 | 0 created, 15+ modified |

**Total:** 60 sub-tasks across 4 parent tasks

**Files to Create:** 27 files (components + tests + CSS + index)
**Files to Modify:** 15+ existing files

---

*Generated: 2025-12-06*
*Spec: 01-spec-common-components-responsive*
*Next Step: Run `/manage-tasks` to begin implementation*
