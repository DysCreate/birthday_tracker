# Changelog

All notable changes to the Birthday Tracker project will be documented in this file.

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
