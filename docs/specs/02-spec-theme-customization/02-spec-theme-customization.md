# 02-spec-theme-customization.md

## Introduction/Overview

This specification defines user-configurable theme customization for the Lens application, allowing users to personalize animation intensity and color schemes. Currently, Lens has a fixed Dark OLED Luxury theme with hardcoded cyan/emerald accents and full animations. This work adds settings controls that let users adjust animation levels (off, reduced, full) and customize the color palette (primary accent, secondary accent, and surface colors) through color pickers, with changes applied in real-time.

## Goals

- Add an animation intensity setting with three levels: Off, Reduced, and Full
- Enable customization of primary accent color (currently cyan #00F0F4)
- Enable customization of secondary accent color (currently emerald #10B981)
- Enable customization of surface colors (background darkness levels)
- Apply theme changes in real-time without requiring app restart
- Persist custom theme settings locally and include them in data export/import
- Provide a "Reset to Defaults" button for theme settings

## User Stories

- **As a user with motion sensitivity**, I want to reduce or disable animations so that I can use Lens comfortably without visual distractions or discomfort.
- **As a user who prefers a specific color scheme**, I want to customize the accent colors so that Lens matches my personal aesthetic or other tools I use.
- **As a power user**, I want full control over the color palette including background surfaces so that I can create a completely personalized visual experience.
- **As a user who experiments with settings**, I want changes to apply immediately so that I can see the effect of my choices in real-time.
- **As a user who may make unwanted changes**, I want a reset button so that I can quickly restore the original Dark OLED Luxury theme.

## Demoable Units of Work

### Unit 1: Animation Intensity Setting

**Purpose:** Give users control over animation intensity to accommodate different preferences and accessibility needs.

**Functional Requirements:**
- The system shall add an `animationIntensity` field to `AppSettings` with values: `'off'`, `'reduced'`, `'full'` (default: `'full'`)
- The system shall display a "Motion" dropdown/select in the Appearance section with options: "Off", "Reduced", "Full"
- The system shall apply a `data-animation` attribute to the root element reflecting the current setting
- When set to `'off'`, the system shall disable all animations (entrance, breathing glows, shimmer, hover transforms)
- When set to `'reduced'`, the system shall enable only subtle transitions (hover color changes, focus states) but disable entrance animations, breathing glows, and shimmer effects
- When set to `'full'`, the system shall enable all animations as currently implemented
- The setting shall apply immediately when changed without requiring page refresh
- The system shall respect the OS `prefers-reduced-motion` setting as a default when `animationIntensity` is not explicitly set

**Proof Artifacts:**
- Code: `app/src/lib/settings/types.ts` includes `animationIntensity` field with type union
- Code: `app/src/App.css` includes `[data-animation="off"]` and `[data-animation="reduced"]` selectors
- Test: Settings persistence test verifies `animationIntensity` saves and loads correctly
- Manual: DevTools shows `data-animation` attribute changes on root element when setting changes

### Unit 2: Color Picker Component

**Purpose:** Provide a reusable color picker component for selecting custom colors.

**Functional Requirements:**
- The system shall create a `ColorPicker` component in `app/src/lib/common-components/`
- The ColorPicker shall display the current color as a clickable swatch
- The ColorPicker shall open a popover/dropdown with HSL sliders (Hue, Saturation, Lightness)
- The ColorPicker shall display a hex input field for direct color entry
- The ColorPicker shall show a live preview of the selected color
- The ColorPicker shall emit color changes via an `onChange` callback with hex value
- The ColorPicker shall support keyboard navigation and focus management
- The ColorPicker shall close when clicking outside or pressing Escape
- The ColorPicker shall match the existing Dark OLED Luxury theme styling

**Proof Artifacts:**
- Code: `app/src/lib/common-components/ColorPicker/ColorPicker.tsx` exists with all functionality
- Code: `app/src/lib/common-components/ColorPicker/ColorPicker.test.tsx` passes all tests
- Code: Component exported from `app/src/lib/common-components/index.ts`

### Unit 3: Color Customization Settings

**Purpose:** Allow users to customize the full color palette through the Settings UI.

**Functional Requirements:**
- The system shall add color fields to `AppSettings`: `accentPrimary`, `accentSecondary`, `surfaceBase`, `surfaceElevated`, `surfaceCard`
- Each color field shall store a hex color string (e.g., `"#00F0F4"`) or `null` for default
- The Appearance section shall display ColorPicker controls for each customizable color:
  - "Primary Accent" (default: #00F0F4 cyan)
  - "Secondary Accent" (default: #10B981 emerald)
  - "Base Surface" (default: #0a0a0a)
  - "Elevated Surface" (default: #111111)
  - "Card Surface" (default: #1a1a1a)
- The system shall display the color name and current value next to each picker
- Changes shall apply immediately by updating CSS custom properties on the document root
- The system shall automatically derive related colors (hover states, muted variants, glow colors) from the base colors using HSL calculations

**Proof Artifacts:**
- Code: `app/src/lib/settings/types.ts` includes all color fields
- Code: Settings component renders 5 ColorPicker instances in Appearance section
- Test: Changing a color updates the corresponding CSS variable on `:root`
- Manual: DevTools shows `--color-accent` changes when Primary Accent picker is used

### Unit 4: Theme Application & Reset

**Purpose:** Apply custom theme colors to CSS variables and provide reset functionality.

**Functional Requirements:**
- The system shall create a `useThemeApplication` hook that applies theme settings to CSS variables
- The hook shall run on app initialization to apply persisted theme settings
- The hook shall update CSS variables in real-time when settings change
- The system shall derive the following from primary accent color:
  - `--color-accent` (base color)
  - `--color-accent-hover` (10% darker)
  - `--color-accent-muted` (low saturation, dark variant)
  - `--color-accent-glow` (15% opacity)
  - `--color-accent-ring` (25% opacity)
  - `--glow-accent` and related glow variables
- The system shall derive equivalent variants for secondary accent color
- The system shall update surface colors (`--color-surface-1`, `--color-surface-2`, `--color-surface-3`)
- The Appearance section shall include a "Reset to Defaults" button
- The Reset button shall restore all theme settings to original values (cyan/emerald/OLED blacks)
- The Reset button shall require confirmation before applying

**Proof Artifacts:**
- Code: `app/src/hooks/useThemeApplication.ts` exists and is used in App.tsx
- Test: Hook correctly calculates derived colors from base colors
- Test: Reset function restores all theme fields to default values
- Manual: After changing colors and restarting app, custom colors persist

## Non-Goals (Out of Scope)

1. **Light theme support**: The base theme remains dark OLED; light mode is not part of this spec
2. **Theme presets/palettes**: Named theme presets (e.g., "Ocean", "Forest") are not included - users customize individual colors
3. **Per-component color overrides**: Colors apply globally; per-component customization is out of scope
4. **Cloud sync**: Theme settings sync via export/import only, not cloud-based sync
5. **Gradient customization**: Surface gradients remain fixed; only base colors are customizable
6. **Font customization**: Typography settings (font family, size) are not included

## Design Considerations

The color picker and settings UI must maintain the existing Dark OLED Luxury aesthetic:

**ColorPicker Styling:**
- Swatch: Rounded rectangle with subtle border, shows current color
- Popover: Surface-3 background with gradient, subtle glow on open
- Sliders: Custom-styled range inputs matching theme (accent-colored thumb, surface track)
- Hex input: Input component from common-components library

**Appearance Section Layout:**
- Expand current section to include new controls
- Group related settings: "Motion" dropdown first, then "Colors" subsection
- Color pickers arranged in a grid or vertical list with labels
- Reset button at bottom of section with danger/ghost styling

**Color Derivation Logic:**
- Hover: Shift lightness -10%
- Muted: Shift saturation to 20%, lightness to 15%
- Glow: Same hue/saturation, 15-30% opacity

## Repository Standards

- **Component structure**: ColorPicker in `app/src/lib/common-components/ColorPicker/` with `.tsx`, `.css`, `.test.tsx`
- **Hooks**: Theme application hook in `app/src/hooks/` following existing hook patterns
- **Settings version**: Increment `CURRENT_SETTINGS_VERSION` to 2 with migration logic
- **Types**: Extend `AppSettings` interface, add type guards for new fields
- **Testing**: Unit tests for color derivation logic, integration tests for settings persistence
- **CSS**: New animation selectors added to `App.css`

## Technical Considerations

- **Settings migration**: Version 1 → 2 migration must handle missing color/animation fields gracefully
- **Color math**: Use HSL color space for deriving variants; consider a small utility module for color calculations
- **Performance**: CSS variable updates should be batched to avoid layout thrashing
- **Accessibility**: ColorPicker must be keyboard accessible; color contrast should be validated
- **CSS specificity**: `[data-animation]` selectors should have sufficient specificity to override base animations

## Security Considerations

- Color values must be validated as valid hex colors before applying to prevent CSS injection
- User input in hex field should be sanitized (only allow valid hex characters)

## Success Metrics

1. **Animation control**: Users can switch between Off/Reduced/Full and see immediate visual change
2. **Color persistence**: Custom colors persist across app restarts
3. **Real-time feedback**: Color changes apply within 100ms of picker interaction
4. **Reset reliability**: Reset button restores exact original theme values
5. **Test coverage**: All new settings fields have persistence tests
6. **Build success**: Production build completes without errors

## Open Questions

1. Should the color picker include an eyedropper tool for picking colors from screen? (Platform support varies)
2. Should there be a "preview" state that doesn't persist until explicitly saved, or is real-time with auto-save sufficient?
3. Should derived colors (hover, muted, glow) be shown to users or kept as implementation details?

---

*Generated: 2025-12-07*
*Spec ID: 02-spec-theme-customization*
*Next Step: Run `/generate-task-list-from-spec` after approval*
