# 01-spec-common-components-responsive.md

## Introduction/Overview

This specification defines a comprehensive common component library and responsive design foundation for the Lens application. Currently, UI elements like buttons, cards, and inputs are implemented independently across components with inconsistent styling and limited responsive behavior. This work consolidates these into a unified design system at `app/src/lib/common-components/` with a full responsive breakpoint system, ensuring visual consistency and better adaptation to different window sizes.

## Goals

- Create a reusable component library with Button, Input, Card, Badge, Tooltip, and Modal components
- Establish a responsive breakpoint system (480px, 768px, 1024px, 1280px) with CSS variables
- Replace pixel-based max-widths with percentage-based values (e.g., `max-width: 90vw`)
- Migrate all existing button instances to use the new common Button component
- Maintain the existing Dark OLED Luxury theme aesthetic throughout all components

## User Stories

- **As a developer**, I want to import pre-styled UI components from a central location so that I can build new features faster without recreating button/input styles.
- **As a user**, I want the application to adapt gracefully to my window size so that I can use Lens on smaller screens or in split-view arrangements.
- **As a designer**, I want consistent button variants (primary, secondary, ghost, etc.) so that the UI maintains visual hierarchy and brand consistency.
- **As a developer**, I want responsive CSS variables and breakpoint utilities so that I can easily make components adapt to different screen sizes.

## Demoable Units of Work

### Unit 1: Responsive Foundation & Button Component

**Purpose:** Establish the responsive CSS infrastructure and create the most commonly used component (Button) with all variants and sizes.

**Functional Requirements:**
- The system shall define CSS custom properties for breakpoints: `--breakpoint-sm: 480px`, `--breakpoint-md: 768px`, `--breakpoint-lg: 1024px`, `--breakpoint-xl: 1280px`
- The system shall provide responsive utility classes or mixins for common breakpoint patterns
- The Button component shall support variants: `primary`, `secondary`, `danger`, `ghost`, `outline`, `link`
- The Button component shall support sizes: `small`, `medium` (default), `large`
- The Button component shall accept standard button props (onClick, disabled, type, children, className)
- The Button component shall apply the existing theme's glow effects, hover states, and transitions
- The system shall export Button from `app/src/lib/common-components/index.ts`

**Proof Artifacts:**
- Code: `app/src/lib/common-components/Button/Button.tsx` exists with all variants
- Code: `app/src/lib/common-components/Button/Button.test.tsx` passes all unit tests
- Code: `app/src/App.css` contains responsive breakpoint CSS variables

### Unit 2: Form Components (Input, Select, Checkbox)

**Purpose:** Provide styled form controls that match the theme and support responsive layouts.

**Functional Requirements:**
- The Input component shall support types: `text`, `search`, `number`, `password`
- The Input component shall support states: default, focused, disabled, error
- The Input component shall display optional label, placeholder, and error message
- The Select component shall render a styled dropdown with the theme's surface colors and accent highlights
- The Checkbox component shall render a styled checkbox with the theme's accent color for checked state
- All form components shall support the same three sizes as Button (small, medium, large)
- The system shall export Input, Select, and Checkbox from the common-components index

**Proof Artifacts:**
- Code: `app/src/lib/common-components/Input/Input.tsx` exists with all states
- Code: `app/src/lib/common-components/Select/Select.tsx` exists
- Code: `app/src/lib/common-components/Checkbox/Checkbox.tsx` exists
- Tests: All form component test files pass

### Unit 3: Display Components (Card, Badge, Tooltip, Modal)

**Purpose:** Provide layout and feedback components for consistent UI patterns.

**Functional Requirements:**
- The Card component shall render a themed container with optional header, body, and footer sections
- The Card component shall support hover elevation effects matching the existing FileCard style
- The Badge component shall support variants: `default`, `success`, `warning`, `error`, `info`
- The Badge component shall support sizes: `small`, `medium`
- The Tooltip component shall display on hover with configurable position (top, bottom, left, right)
- The Tooltip component shall use the theme's surface colors and subtle glow
- The Modal component shall render a centered overlay with backdrop blur
- The Modal component shall support close on backdrop click and Escape key
- The Modal component shall trap focus within the modal when open
- The system shall export Card, Badge, Tooltip, and Modal from the common-components index

**Proof Artifacts:**
- Code: All display component files exist in `app/src/lib/common-components/`
- Tests: All display component test files pass
- Code: Modal includes keyboard trap and accessibility attributes (aria-modal, role="dialog")

### Unit 4: Migration & Responsive Application

**Purpose:** Replace all existing UI element instances with common components and apply responsive patterns throughout.

**Functional Requirements:**
- The system shall replace all `<button>` elements in Settings components with the common Button component
- The system shall replace all `<button>` elements in Dashboard components with the common Button component
- The system shall replace all `<button>` elements in DocumentView components with the common Button component
- The system shall replace all `<input>` elements with the common Input component where applicable
- The system shall update container max-widths from pixel values to percentage-based values (e.g., `max-width: 90vw`)
- The system shall apply responsive breakpoint adjustments to Dashboard grid layouts
- The system shall apply responsive breakpoint adjustments to Settings form layouts
- All existing tests shall continue to pass after migration

**Proof Artifacts:**
- Code: `git diff` shows no raw `<button>` elements in component files (excluding test mocks)
- Tests: `npm run test` passes with 0 failures
- Build: `npm run build` succeeds without errors

## Non-Goals (Out of Scope)

1. **Theme customization UI** - User-configurable colors will be addressed in Spec 02
2. **Animation preferences** - User-controlled animation intensity will be addressed in Spec 02
3. **DocumentView visual redesign** - Complete redesign will be addressed in Spec 03
4. **New features** - This spec only consolidates existing patterns, no new functionality
5. **Storybook or component documentation site** - Components documented via TypeScript types only

## Design Considerations

All components must strictly adhere to the **Dark OLED Luxury Theme** established in `ui-update.md` (STORY-LENS-011). This theme is the visual foundation of Lens and must be preserved.

### Theme Reference (from ui-update.md)

**Color System:**
| Token | Value | Usage |
|-------|-------|-------|
| `--color-accent` | `#00F0F4` (Cyan) | Primary interactive elements, focus states |
| `--color-accent-hover` | `#00D4D8` | Primary hover states |
| `--color-accent-muted` | `#0A3A3B` | Subtle backgrounds for primary elements |
| `--color-accent-secondary` | `#10B981` (Emerald) | Success states, completion indicators |
| `--color-accent-secondary-hover` | `#059669` | Success hover states |
| `--color-surface-1` | `#0a0a0a` | Base surface |
| `--color-surface-2` | `#111111` | Elevated surface |
| `--color-surface-3` | `#1a1a1a` | Card/modal backgrounds |

**Glow System:**
- `--glow-accent`: Cyan glow for interactive elements (`0 0 30px rgba(0, 240, 244, 0.3)`)
- `--glow-emerald`: Emerald glow for completion states (`0 0 25px rgba(16, 185, 129, 0.3)`)
- Breathing animations for in-progress/loading states (toned to ~30% intensity)

**Animation System:**
- Entrance: `fadeInUp`, `scaleIn`, `staggerFadeIn` with 30-50ms stagger delays
- Interactive: `glowBreathing`, `shimmer`, `borderGlow`
- Timing: `--ease-out-expo`, `--ease-spring` for premium feel
- **Must respect `prefers-reduced-motion`** media query

**Signature Effects:**
- Grain texture overlay (1.5% opacity SVG noise)
- Custom scrollbar (glows cyan on hover)
- Card depth via gradient backgrounds + shadow system
- Hover lift effects (translateY + enhanced shadow)

### Component-Specific Requirements

- **Buttons**: Use cyan accent for primary, emerald for success, apply hover lift + glow
- **Inputs**: Surface-2 background, cyan border on focus with subtle glow ring
- **Cards**: Surface-3 background with gradient, hover elevation matching FileCard
- **Badges**: Solid background colors with subtle text-shadow
- **Tooltips**: Surface-3 background, subtle glow, smooth fade-in animation
- **Modals**: Backdrop blur, surface-3 content area, focus trap with ring highlight
- All interactive elements must have visible focus states for accessibility

## Repository Standards

- **Component structure**: Each component in its own folder with `ComponentName.tsx`, `ComponentName.css`, `ComponentName.test.tsx`
- **Naming**: BEM convention for CSS classes (e.g., `.button--primary`, `.button--size-small`)
- **Types**: Props interfaces defined in component file or co-located `types.ts`
- **Exports**: Public API through `index.ts` barrel files
- **Testing**: Use Vitest + React Testing Library; follow existing mock component pattern for Tauri compatibility
- **CSS Variables**: Use existing theme variables; add new ones to `App.css` root scope

## Technical Considerations

- Components must work within the Tauri + React 19 environment
- Testing must follow the established mock component pattern to avoid React hook errors with Tauri module mocking
- CSS should use the existing variable system rather than introducing new theming approaches
- Modal component requires portal rendering to escape parent overflow constraints
- Tooltip positioning may require useLayoutEffect for accurate placement calculations

## Security Considerations

No specific security considerations identified. All components are presentational with no data persistence or external API calls.

## Success Metrics

1. **Component coverage**: 6 common components created (Button, Input, Select, Checkbox, Card, Badge, Tooltip, Modal = 8 total, but Select/Checkbox are sub-components of form inputs)
2. **Migration completeness**: 0 raw `<button>` or inconsistently-styled elements remain in component files
3. **Test stability**: All 949+ existing tests continue to pass
4. **Build success**: Production build completes without errors or warnings
5. **Responsive coverage**: All major views (Dashboard, Settings, DocumentView) respond to window resize

## Open Questions

1. Should the Tooltip use a portal (like Modal) or render inline with position:absolute?
2. Should form components support a "fullWidth" prop for responsive contexts?
3. Are there any existing button instances that intentionally deviate from the standard patterns?

---

*Generated: 2025-12-06*
*Spec ID: 01-spec-common-components-responsive*
*Next Step: Run `/generate-task-list-from-spec` after approval*
