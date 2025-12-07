# 01 Questions Round 1 - Common Components & Responsive Foundation

Please answer each question below (select one or more options, or add your own notes). Feel free to add additional context under any question.

---

## 1. Common Component Scope

Which UI elements should be extracted into a shared component library?

- [ ] (A) **Buttons only** - Primary, secondary, danger, ghost button variants
- [ ] (B) **Buttons + Form inputs** - Buttons plus text inputs, checkboxes, selects
- [x] (C) **Full design system** - Buttons, inputs, cards, badges, tooltips, modals
- [ ] (D) **Incremental** - Start with buttons, add others as needed during implementation
- [ ] (E) Other (describe)

---

## 2. Component Library Location

Where should shared components live in the codebase?

- [ ] (A) **`app/src/components/common/`** - Dedicated common folder alongside feature components
- [ ] (B) **`app/src/components/ui/`** - "ui" naming convention (common in React projects)
- [ ] (C) **`app/src/lib/components/`** - Inside lib folder with other shared code
- [x] (D) **`app/src/lib/common-components/`** - Inside lib folder with other components

---

## 3. Responsive Breakpoints

What breakpoints should the responsive system support?

- [ ] (A) **Single mobile breakpoint** - Keep current 600px breakpoint, just apply more consistently
- [ ] (B) **Mobile + Tablet** - 600px (mobile) + 900px (tablet) breakpoints
- [x] (C) **Full responsive system** - 480px (small mobile), 768px (tablet), 1024px (desktop), 1280px (large)
- [ ] (D) Other (describe)

---

## 4. Max-Width Strategy

How should container max-widths be handled?

- [ ] (A) **Remove all max-widths** - Let content fill available space with percentage-based padding
- [x] (B) **Percentage-based max-widths** - e.g., `max-width: 90vw` instead of `max-width: 1200px`
- [ ] (C) **Hybrid approach** - Percentage widths with reasonable pixel maximums (e.g., `max-width: min(90vw, 1400px)`)
- [ ] (D) Other (describe)

---

## 5. Button Variants Needed

What button styles/variants should the common Button component support?

- [ ] (A) **Minimal** - Primary (accent color), Secondary (muted), Danger (red)
- [ ] (B) **Standard** - Primary, Secondary, Danger, Ghost (transparent background)
- [x] (C) **Comprehensive** - Primary, Secondary, Danger, Ghost, Outline, Link-style
- [ ] (D) Other (describe)

---

## 6. Button Sizes

Should buttons support multiple sizes?

- [ ] (A) **Single size** - One consistent button size throughout the app
- [ ] (B) **Two sizes** - Default + Small (for compact areas like table rows)
- [x] (C) **Three sizes** - Small, Medium (default), Large
- [ ] (D) Other (describe)

---

## 7. Testing Approach

How should the new common components be tested?

- [x] (A) **Unit tests only** - Test component rendering and interactions with Vitest
- [ ] (B) **Unit + Visual snapshots** - Add snapshot tests for visual regression
- [ ] (C) **Minimal testing** - Basic smoke tests, rely on existing app tests to catch issues
- [ ] (D) Other (describe)

---

## 8. Migration Strategy

How should existing button instances be migrated to the new common component?

- [x] (A) **All at once** - Replace all button instances in a single pass
- [ ] (B) **Incremental** - Replace buttons component-by-component over multiple commits
- [ ] (C) **New only** - Use common components for new code, migrate existing gradually
- [ ] (D) Other (describe)

---

## 9. Proof Artifacts

What would best demonstrate this feature is complete?

- [ ] (A) **Screenshots** - Before/after screenshots showing consistent buttons and responsive behavior
- [ ] (B) **Screen recording** - Video showing responsive behavior at different window sizes
- [x] (C) **Code diff** - Show the consolidated component usage across the app
- [ ] (D) **All of the above**
- [ ] (E) Other (describe)

---

## Additional Notes

Please add any other requirements, preferences, or context that would help shape this specification:

```
(Your notes here)
```
