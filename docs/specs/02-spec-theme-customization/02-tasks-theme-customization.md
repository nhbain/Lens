# 02-tasks-theme-customization.md

Task list for implementing theme customization features as defined in `02-spec-theme-customization.md`.

## Relevant Files

- `app/src/lib/settings/types.ts` - Extend `AppSettings` interface with `animationIntensity` and color fields
- `app/src/lib/settings/types.test.ts` - Tests for new type guards and validation
- `app/src/lib/settings/settings-manager.ts` - Add v1→v2 migration logic and new update functions
- `app/src/lib/settings/settings-manager.test.ts` - Tests for migration and settings persistence
- `app/src/lib/settings/index.ts` - Export new functions
- `app/src/hooks/useSettings.ts` - Expose animation intensity and color update functions
- `app/src/hooks/useSettings.test.tsx` - Tests for useSettings hook
- `app/src/App.css` - Add `[data-animation]` CSS selectors for animation control
- `app/src/App.tsx` - Apply `data-animation` attribute and integrate theme hook
- `app/src/components/Settings/Settings.tsx` - Add Motion dropdown, ColorPickers, Reset button
- `app/src/components/Settings/Settings.css` - Styling for expanded Appearance section
- `app/src/components/Settings/Settings.test.tsx` - Tests for Settings component
- `app/src/components/Settings/ResetThemeModal.tsx` - Reset confirmation modal component (new)
- `app/src/components/Settings/ResetThemeModal.css` - ResetThemeModal styling (new)
- `app/src/components/Settings/types.ts` - Settings component types including ResetThemeModalProps
- `app/src/lib/common-components/ColorPicker/ColorPicker.tsx` - ColorPicker component using react-colorful
- `app/src/lib/common-components/ColorPicker/ColorPicker.css` - ColorPicker styling with Dark OLED theme
- `app/src/lib/common-components/ColorPicker/ColorPicker.test.tsx` - ColorPicker tests (45 tests)
- `app/src/lib/common-components/index.ts` - Export ColorPicker
- `app/src/lib/theme/color-utils.ts` - Color derivation utility functions (hexToHsl, hslToHex, derive*)
- `app/src/lib/theme/color-utils.test.ts` - Tests for color utilities (35 tests)
- `app/src/lib/theme/index.ts` - Export theme utilities
- `app/src/hooks/useThemeApplication.ts` - Hook for applying theme settings to CSS variables
- `app/src/components/Dashboard/Dashboard.css` - Updated progress bar to use theme CSS variables
- `app/package.json` - Added react-colorful dependency

### Notes

- Unit tests should be placed alongside the code files they test (e.g., `ColorPicker.tsx` and `ColorPicker.test.tsx` in the same directory)
- Use `npm run test` to run tests; `npm run test -- path/to/file.test.ts` for specific files
- Follow existing component patterns in `app/src/lib/common-components/` for ColorPicker structure
- Settings version must be incremented from 1 to 2 with proper migration handling
- All CSS should use existing theme variables where possible; new variables added to `:root` in `App.css`

## Tasks

### [x] 1.0 Animation Intensity Setting

Implement a user-configurable animation intensity setting with three levels (Off, Reduced, Full) that controls all app animations.

#### 1.0 Proof Artifact(s)

- Test: `app/src/lib/settings/types.test.ts` includes tests for `animationIntensity` type validation
- Test: `app/src/lib/settings/settings-manager.test.ts` verifies animation intensity saves/loads correctly with v1→v2 migration
- Code: `app/src/App.css` includes `[data-animation="off"]` and `[data-animation="reduced"]` selectors that disable/reduce animations
- Code: Settings UI displays Motion dropdown with Off/Reduced/Full options

#### 1.0 Tasks

- [x] 1.1 Add `AnimationIntensity` type (`'off' | 'reduced' | 'full'`) and `isAnimationIntensity` type guard to `app/src/lib/settings/types.ts`
- [x] 1.2 Add `animationIntensity` field to `AppSettings` interface with default value `'full'` in `createDefaultSettings()`
- [x] 1.3 Update `isAppSettings` type guard to validate the new `animationIntensity` field
- [x] 1.4 Increment `CURRENT_SETTINGS_VERSION` to 2 in `types.ts`
- [x] 1.5 Add migration logic in `settings-manager.ts` `migrateSettings()` to handle v1→v2 (add `animationIntensity: 'full'` if missing)
- [x] 1.6 Add `updateAnimationIntensity()` function to `settings-manager.ts` and export from `index.ts`
- [x] 1.7 Add `setAnimationIntensity` function to `useSettings` hook that calls `updateAnimationIntensity()` and updates local state
- [x] 1.8 Write unit tests for `AnimationIntensity` type guard in `types.test.ts`
- [x] 1.9 Write unit tests for v1→v2 migration in `settings-manager.test.ts`
- [x] 1.10 Add `[data-animation="off"]` CSS selector to `App.css` that sets `animation: none !important`, `transition: none !important` on all elements
- [x] 1.11 Add `[data-animation="reduced"]` CSS selector to `App.css` that disables entrance animations, breathing glows, and shimmer but keeps hover/focus transitions
- [x] 1.12 Create `useAnimationIntensity` hook in `app/src/hooks/useAnimationIntensity.ts` that reads settings and applies `data-animation` attribute to `document.documentElement` (consolidated into `useThemeApplication`)
- [x] 1.13 Integrate `useAnimationIntensity` hook in `App.tsx` to apply animation setting on mount and when settings change (via `useThemeApplication`)
- [x] 1.14 Add Motion dropdown (Select component) to Settings Appearance section with options: Off, Reduced, Full
- [x] 1.15 Wire Motion dropdown `onChange` to call `setAnimationIntensity` from useSettings hook

### [x] 2.0 ColorPicker Component

Create a reusable ColorPicker component with HSL sliders and hex input for selecting custom colors.

**Implementation Note:** Used `react-colorful` library (2.8KB, zero deps) instead of custom HSL sliders for cross-platform compatibility with Tauri/WebKit. Native `<input type="color">` doesn't work reliably in WebKit WebViews.

#### 2.0 Proof Artifact(s)

- Test: `app/src/lib/common-components/ColorPicker/ColorPicker.test.tsx` passes all tests (swatch display, popover open/close, HSL slider changes, hex input, keyboard navigation)
- Code: `app/src/lib/common-components/index.ts` exports `ColorPicker` and `ColorPickerProps`
- Code: ColorPicker component renders with Dark OLED Luxury theme styling

#### 2.0 Tasks

- [x] 2.1 Create `app/src/lib/common-components/ColorPicker/` directory structure
- [x] 2.2 Define `ColorPickerProps` interface with: `value` (hex string), `onChange` (callback), `label` (optional string), `disabled` (optional boolean), `className` (optional string)
- [x] 2.3 Create basic `ColorPicker.tsx` component that renders a color swatch button showing the current color
- [x] 2.4 Implement popover state management (open/close) with click on swatch to toggle
- [x] 2.5 Create popover container with Surface-3 background, gradient, and subtle glow styling
- [x] 2.6 Implement Hue slider (0-360) using styled range input with gradient track (via react-colorful HexColorPicker)
- [x] 2.7 Implement Saturation slider (0-100) using styled range input (via react-colorful HexColorPicker)
- [x] 2.8 Implement Lightness slider (0-100) using styled range input (via react-colorful HexColorPicker)
- [x] 2.9 Create hex input field using the Input component from common-components
- [x] 2.10 Implement hex validation (sanitize input to valid hex characters only, validate 3 or 6 character hex)
- [x] 2.11 Implement HSL ↔ Hex conversion utility functions (in `app/src/lib/theme/color-utils.ts`)
- [x] 2.12 Wire slider changes to update hex value and call `onChange`
- [x] 2.13 Wire hex input changes to update sliders and call `onChange`
- [x] 2.14 Add live color preview swatch in popover showing selected color
- [x] 2.15 Implement click-outside detection to close popover (useEffect with document click listener)
- [x] 2.16 Implement Escape key to close popover
- [x] 2.17 Implement keyboard navigation: Tab between sliders and hex input, Enter to confirm
- [x] 2.18 Add focus trap within popover when open
- [x] 2.19 Create `ColorPicker.css` with Dark OLED Luxury styling (surface backgrounds, accent-colored slider thumbs, glow effects)
- [x] 2.20 Write unit tests for ColorPicker: renders swatch, opens/closes popover, slider changes update value, hex input updates value, keyboard navigation works (45 tests)
- [x] 2.21 Export `ColorPicker` and `ColorPickerProps` from `app/src/lib/common-components/index.ts`

### [x] 3.0 Color Customization Settings

Extend settings to support color customization and add ColorPicker controls to the Settings UI Appearance section.

**Implementation Note:** Added `accentWarning` (amber #F59E0B) as a 6th customizable color for progress bar medium state, making all progress bar colors user-configurable.

#### 3.0 Proof Artifact(s)

- Test: `app/src/lib/settings/types.test.ts` includes tests for color field validation (accentPrimary, accentSecondary, accentWarning, surfaceBase, surfaceElevated, surfaceCard)
- Test: `app/src/lib/settings/settings-manager.test.ts` verifies color fields save/load correctly
- Code: Settings Appearance section displays 6 ColorPicker instances with labels (3 accents + 3 surfaces)
- Code: `app/src/hooks/useSettings.ts` includes color update functions

#### 3.0 Tasks

- [x] 3.1 Add `ThemeColors` interface to `types.ts` with fields: `accentPrimary`, `accentSecondary`, `accentWarning`, `surfaceBase`, `surfaceElevated`, `surfaceCard` (all `string | null`)
- [x] 3.2 Add `DEFAULT_THEME_COLORS` constant with default hex values (#00F0F4, #10B981, #F59E0B, #0a0a0a, #111111, #1a1a1a)
- [x] 3.3 Add `isHexColor` type guard to validate hex color strings (accepts 3 or 6 character hex with #)
- [x] 3.4 Add `isThemeColors` type guard to validate ThemeColors object (allows missing fields for migration)
- [x] 3.5 Add color fields to `AppSettings` interface (nested `themeColors` object)
- [x] 3.6 Update `createDefaultSettings()` to include default color values (null for "use defaults")
- [x] 3.7 Update `isAppSettings` type guard to validate color fields
- [x] 3.8 Update migration logic to handle missing color fields (set to null)
- [x] 3.9 Add `updateThemeColor()` function to `settings-manager.ts` that updates a single color field
- [x] 3.10 Add `updateThemeColors()` function to update multiple colors at once
- [x] 3.11 Export new functions from `app/src/lib/settings/index.ts`
- [x] 3.12 Add `setThemeColor` function to `useSettings` hook
- [x] 3.13 Write unit tests for `isHexColor` type guard
- [x] 3.14 Write unit tests for color fields in `isAppSettings`
- [x] 3.15 Write unit tests for color persistence (save and load)
- [x] 3.16 Create "Colors" subsection in Settings Appearance section (below Motion dropdown)
- [x] 3.17 Add ColorPicker for "Primary Accent" with label and current value display
- [x] 3.18 Add ColorPicker for "Secondary Accent" with label and current value display
- [x] 3.18a Add ColorPicker for "Warning" accent with label and current value display
- [x] 3.19 Add ColorPicker for "Base Surface" with label and current value display
- [x] 3.20 Add ColorPicker for "Elevated Surface" with label and current value display
- [x] 3.21 Add ColorPicker for "Card Surface" with label and current value display
- [x] 3.22 Wire each ColorPicker `onChange` to call `setThemeColor` with appropriate field name
- [x] 3.23 Style the Colors subsection grid/list layout in `Settings.css`

### [x] 4.0 Theme Application Hook & Reset

Create a hook that applies theme settings to CSS variables in real-time and implement reset functionality with confirmation.

**Implementation Note:** Added `deriveLightColor()` and `applyWarningColors()` functions to support dynamic warning color theming. Reset modal extracted to `ResetThemeModal` component per project standards.

#### 4.0 Proof Artifact(s)

- Test: `app/src/hooks/useThemeApplication.test.ts` verifies CSS variables update when settings change
- Test: `app/src/lib/theme/color-utils.test.ts` verifies color derivation logic (hover, muted, glow, light variants) - 35 tests
- Code: `app/src/App.tsx` uses `useThemeApplication` hook to apply theme on load
- Code: Settings Appearance section includes "Reset to Defaults" button with confirmation modal (`ResetThemeModal` component)
- Test: Reset function restores all theme fields to default values

#### 4.0 Tasks

- [x] 4.1 Create `app/src/lib/theme/` directory for theme utilities
- [x] 4.2 Create `color-utils.ts` with `hexToHsl()` function to convert hex to HSL object
- [x] 4.3 Create `hslToHex()` function to convert HSL back to hex
- [x] 4.4 Create `deriveHoverColor()` function that shifts lightness by -10%
- [x] 4.4a Create `deriveLightColor()` function that shifts lightness by +15%
- [x] 4.5 Create `deriveMutedColor()` function that sets saturation to 20% and lightness to 15%
- [x] 4.6 Create `deriveGlowColor()` function that returns rgba with 15-30% opacity
- [x] 4.7 Create `deriveAccentRingColor()` function that returns rgba with 25% opacity
- [x] 4.8 Create `deriveFullAccentPalette()` function that returns all derived colors from a base color
- [x] 4.9 Write unit tests for all color derivation functions in `color-utils.test.ts` (35 tests)
- [x] 4.10 Create `app/src/lib/theme/index.ts` to export utilities
- [x] 4.11 Create `useThemeApplication.ts` hook that accepts settings and applies CSS variables
- [x] 4.12 Implement `applyAccentColors()` internal function that sets `--color-accent`, `--color-accent-hover`, `--color-accent-muted`, `--color-accent-glow`, `--color-accent-ring`, and glow variables
- [x] 4.13 Implement `applySecondaryAccentColors()` for secondary accent palette (includes `--color-accent-secondary-light`)
- [x] 4.13a Implement `applyWarningColors()` for warning/tertiary accent palette
- [x] 4.14 Implement `applySurfaceColors()` that sets `--color-surface-1`, `--color-surface-2`, `--color-surface-3`
- [x] 4.15 Implement `applyAnimationIntensity()` that sets `data-animation` attribute (consolidated into useThemeApplication)
- [x] 4.16 Call all apply functions in useEffect when settings change
- [x] 4.17 Handle null color values by using DEFAULT_THEME_COLORS
- [x] 4.18 Write unit tests for `useThemeApplication` hook (mock document.documentElement.style.setProperty)
- [x] 4.19 Integrate `useThemeApplication` hook in `App.tsx`, passing settings from `useSettings`
- [x] 4.20 Add "Reset to Defaults" button at bottom of Appearance section using Button component with `variant="ghost-danger"`
- [x] 4.21 Create confirmation modal using Modal component via `ResetThemeModal` component: "Reset theme settings to defaults?"
- [x] 4.22 Implement `resetThemeSettings()` function in `settings-manager.ts` that resets only theme-related fields (animationIntensity, colors) to defaults
- [x] 4.23 Wire Reset button to show confirmation modal, and confirm action to call `resetThemeSettings()`
- [x] 4.24 Write unit test for `resetThemeSettings()` function
- [x] 4.25 Verify end-to-end: change colors, restart app, colors persist; reset to defaults, colors return to original values
