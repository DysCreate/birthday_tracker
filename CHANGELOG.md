# Changelog

All notable changes to the Birthday Tracker project will be documented in this file.

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
