# Task List for STORY-LENS-011: Dark OLED Luxury UI Redesign

> Generated from: story-list-feature-lens.md
> Story: As a user, I want a premium dark interface optimized for OLED displays so that the app feels luxurious and is easier on my eyes in low-light environments.
> Acceptance Criteria: All surfaces use true black or near-black backgrounds; cyan accent provides visual hierarchy; Satoshi font family used; WCAG AA contrast compliance; all existing functionality preserved; responsive design maintained.

## Relevant Files

- `app/src/App.css` - Global styles, design system tokens, header, messages
- `app/src/components/Dashboard/Dashboard.css` - Dashboard grid, file cards, progress bars
- `app/src/components/Dashboard/ResumeSection.css` - Resume section styling
- `app/src/components/Dashboard/InProgressItem.css` - In-progress item cards
- `app/src/components/DocumentView/DocumentView.css` - Document viewer, item rows, badges
- `app/src/components/Settings/Settings.css` - Settings panel and form controls
- `app/src/components/UndoToast/UndoToast.css` - Toast notifications
- `app/index.html` - Font preloading

### Notes

- This is a **CSS-only story** - no component logic changes
- No dependencies - can run in parallel with other work
- Removes light mode in favor of dark-only premium theme
- Design tokens:
  - Background: #000000 (true black), #0a0a0a, #111111, #1a1a1a (surfaces)
  - Accent: #00F0F4 (cyan) with hover/glow variants
  - Text: #FAFAFA (primary), #A1A1AA (secondary), #52525B (muted)
- Typography: Satoshi (primary), JetBrains Mono (monospace)
- Animations: Subtle 150-200ms transitions
- Must maintain WCAG AA contrast compliance

## Tasks

- [ ] 1.0 Design System Foundation
  - [ ] 1.1 Add Google Fonts import for Satoshi + JetBrains Mono to App.css
  - [ ] 1.2 Define complete CSS custom properties palette in :root
  - [ ] 1.3 Set body background to true black (#000000)
  - [ ] 1.4 Update font-family to Satoshi
  - [ ] 1.5 Style monospace elements with JetBrains Mono
  - [ ] 1.6 Remove light mode defaults (dark-only theme)

- [ ] 2.0 App.css Components
  - [ ] 2.1 Restyle `.app-header` with dark surface
  - [ ] 2.2 Update `.back-button` with cyan accent border
  - [ ] 2.3 Update `.settings-icon-button` hover states
  - [ ] 2.4 Refine focus states with cyan glow ring
  - [ ] 2.5 Update `.message-error`, `.message-info`, `.message-success`
  - [ ] 2.6 Update `.tracked-file-item` and `.selected` state
  - [ ] 2.7 Update remove button hover states
  - [ ] 2.8 Remove dark mode media query (now default)

- [ ] 3.0 Dashboard.css Styling
  - [ ] 3.1 Update `.dashboard` container styling
  - [ ] 3.2 Restyle `.dashboard__title` with refined typography
  - [ ] 3.3 Update `.dashboard__summary-highlight` to cyan
  - [ ] 3.4 Restyle `.dashboard__add-button` with accent colors
  - [ ] 3.5 Update empty state with dark surface
  - [ ] 3.6 Update `.file-card` background to surface-2
  - [ ] 3.7 Restyle hover with cyan border glow
  - [ ] 3.8 Update `.file-card--selected` with cyan accent
  - [ ] 3.9 Update `.file-card__badge--in-progress` with cyan
  - [ ] 3.10 Update `.progress-bar__track` to surface-3
  - [ ] 3.11 Create gradient fills for progress bar states
  - [ ] 3.12 Update sort controls styling
  - [ ] 3.13 Remove dark mode media query (now default)

- [ ] 4.0 ResumeSection & InProgressItem Styling
  - [ ] 4.1 Update ResumeSection header styling
  - [ ] 4.2 Restyle in-progress items with cyan accent
  - [ ] 4.3 Add subtle glow on hover

- [ ] 5.0 DocumentView.css Styling
  - [ ] 5.1 Update `.document-view-header` with dark surface
  - [ ] 5.2 Refine title and filepath typography
  - [ ] 5.3 Update hover states with surface-2 background
  - [ ] 5.4 Restyle focus states with cyan outline
  - [ ] 5.5 Update `.trackable-item-row--in-progress` with cyan accent
  - [ ] 5.6 Refine complete state opacity and colors
  - [ ] 5.7 Restyle header badges with cyan tones
  - [ ] 5.8 Update list item and checkbox badges
  - [ ] 5.9 Update spinner with cyan accent
  - [ ] 5.10 Remove dark mode media query (now default)

- [ ] 6.0 Settings.css Styling
  - [ ] 6.1 Update all CSS custom properties for dark OLED
  - [ ] 6.2 Ensure consistency with global design system
  - [ ] 6.3 Restyle buttons with accent colors
  - [ ] 6.4 Update form inputs with dark surfaces
  - [ ] 6.5 Update `.watched-directory` cards
  - [ ] 6.6 Restyle toggle and remove buttons
  - [ ] 6.7 Update enabled state with cyan
  - [ ] 6.8 Update pattern chips styling
  - [ ] 6.9 Update stats card styling
  - [ ] 6.10 Refine danger zone treatment
  - [ ] 6.11 Remove dark mode media query (now default)

- [ ] 7.0 UndoToast.css Styling
  - [ ] 7.1 Update background to surface-2
  - [ ] 7.2 Add cyan accent border
  - [ ] 7.3 Refine animation timing

- [ ] 8.0 Font Loading & Final Polish
  - [ ] 8.1 Add font preload links to index.html
  - [ ] 8.2 Final consistency pass across all files
  - [ ] 8.3 Verify WCAG AA contrast compliance

- [ ] 9.0 Verification
  - [ ] 9.1 Run `npm run test` to ensure no regressions
  - [ ] 9.2 Run `npm run lint` to check for issues
  - [ ] 9.3 Visual verification in `npm run tauri dev`
