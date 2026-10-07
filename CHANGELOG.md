# Changelog

All notable changes to the Birthday Tracker project will be documented in this file.

## [3.0.0] - 2026-10-07 — "Scrapbook Birthday Journal" redesign

### Changed
- **Complete visual redesign** in a playful handmade scrapbook style. No functionality, data logic, routes or state management was changed — only visual design, layout and markup structure.
  - New palette via CSS variables: baby blue `#B7D8F5` page background, red `#E10600` headlines/CTAs, sunshine `#FFD700` tape/stickers, ink `#1A1A1A` text, white/warm paper surfaces.
  - New typography: **Permanent Marker** (tilted red hero headings with hand-drawn underline squiggles), **Caveat Brush**, **Caveat** (handwritten notes/tags), **DM Sans** (body/UI), **Playfair Display** (small labels).
  - Birthday entries are now polaroid cards with washi tape, deterministic tilt, days-left sticker badges, "turns N" age, and a highlighted `Today!` state with party-hat/confetti doodles.
  - Calendar restyled as a taped index card; upload zone as a hand-drawn paper note; buttons as stickers with a 2px ink border and hard offset shadow.
  - New `src/components/Doodles.jsx` with lightweight decorative inline SVGs (sun, sparkles, hearts, cake, balloons, confetti, squiggles, dashed flight paths).
- Motion is subtle and fully disabled under `prefers-reduced-motion`.
- Accessibility: semantic sections, `aria-expanded`/`aria-pressed`/`aria-label` on interactive controls, keyboard-operable upload zone, and a dark + sunshine double focus ring.

### Verified
- Builds with Vite; ESLint reports the same single pre-existing warning as before the redesign.
- Automated headless-browser checks at 360px, 768px and 1280px: no horizontal overflow, all fonts load, every feature still works (upload → parse → save, calendar month nav, day selection, filtered list, empty states, parse-error banner, reminder toggle, clear/reset).
- WCAG AA contrast audit over all rendered text: 0 failures at all three widths.

---

## [2.0.0] - 2026-03-21 — Capacitor & Notification Implementation Complete

### Added
- **Android WebView app support** via Capacitor — the web app can now be built and deployed as a native Android app.
  - Uses `@capacitor/core`, `@capacitor/cli`, and `@capacitor/local-notifications` (v8.x)
  - Configuration: `capacitor.config.js` with app ID `com.birthday.tracker`
  - Target Android SDK 33+
- **Birthday reminder notifications** — local push notifications fire 1 day before each birthday at 9:00 AM.
  - Capacitor implementation for native Android notifications
  - Web fallback logs notification schedule to console for testing
- **Notification toggle UI** — enable/disable reminders with a single tap, with status banner feedback.
  - Permission request handled gracefully with user-facing feedback
  - Shows count of scheduled notifications
  - Toast-style banner with auto-dismiss
- **Contact persistence** — uploaded contacts are saved to `localStorage` and survive app restarts.
- New utility module `src/utils/notifications.js` for notification scheduling logic (158 lines).
- New `capacitor.config.js` for native Android configuration with plugin settings.

### Changed
- `App.jsx` refactored to integrate notification scheduling, localStorage persistence, and notification control UI.
- `package.json` updated with Capacitor dependencies: `@capacitor/core@^8.2.0`, `@capacitor/cli@^8.2.0`, `@capacitor/android@^8.2.0`, `@capacitor/local-notifications@^8.0.2`

### Status
- ✅ Web build complete (`dist/` generated, 669 KB bundled)
- ✅ All notification logic implemented and tested
- ✅ Capacitor configuration ready
- ⏳ Android build requires Android Studio + JDK 17+ (not available in current environment)

### Next Steps (When Android Studio Available)
```bash
npx cap add android
npm run build
npx cap sync
npx cap open android
# Build and run in Android Studio emulator or device
```

---

## [1.1.0] - 2026-03-20

### Added
- **Birthday indicator dots on DatePicker calendar** — Dates that have birthdays now display a small emerald-green dot beneath the date number, making it easy to spot birthdays at a glance without clicking through each day.
- The dot turns white when the date is selected (active state) for contrast against the highlighted background.

### Changed
- `DatePicker` component now accepts a `contacts` prop to determine which dates have birthdays.
- `App.jsx` now passes the `contacts` array to the `DatePicker` component.
- Calendar day cells updated from single-line layout to a flex-column layout to accommodate the dot indicator.

---

## [1.0.0] - Initial Release

### Features
- Upload Excel files (`.xlsx`) with Name and BirthDate columns.
- Custom date picker to select and view birthdays.
- Contact list display filtered by selected date.
- Drag-and-drop file upload with visual feedback.
- Responsive, modern UI with animations.
