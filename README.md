# Birthday Tracker

A bold, neobrutalist React application for tracking and managing birthdays. Upload your contacts from an Excel file, view birthdays on an interactive calendar, and never miss one again.

## Live Demo

[https://dob-track.netlify.app/](https://dob-track.netlify.app/)

## Tech Stack

- **React 19** - Modern UI library
- **Vite (Rolldown)** - Next-generation frontend tooling
- **Capacitor 8** - Native Android wrapper with local notifications
- **Tailwind CSS v4** - CSS-first utility styling with custom theme tokens
- **Framer Motion** - Animation transitions (AnimatePresence)
- **XLSX** - Excel and CSV file parsing
- **date-fns** - Date utility library
- **Lucide React** - Icon library

## Features

- **Excel/CSV Upload** - Drag-and-drop or click to browse. Supports .xlsx, .xls, and .csv files up to 10 MB. Auto-detects headers and validates data.
- **Interactive Calendar** - Custom date picker with month navigation. Birthday indicator dots highlight dates with upcoming birthdays.
- **Birthday Reminders** - Native Android local notifications scheduled 1 day before each birthday at 9:00 AM. Enable/disable toggle with status banner.
- **Local Persistence** - Contacts are saved to localStorage and survive app restarts (up to 5,000 contacts).
- **Neobrutalist UI** - Bold borders, hard-offset shadows, slab typography, and a high-contrast color palette built on a custom design token system.
- **Reduced Motion Support** - All animations and transitions are disabled when the user prefers reduced motion.

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/DysCreate/birthday_tracker.git
cd birthday_tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Prepare Your Data**
   - Create an Excel file with two columns
   - Column 1: Names of people
   - Column 2: Birth dates in DD-MM-YYYY format (e.g., 25-12-2000)
   - No headers needed (the app auto-detects data)

2. **Upload Your File**
   - Click or drag-and-drop your Excel file into the upload zone
   - The calendar will automatically open after upload

3. **View Birthdays**
   - The app automatically shows today's birthdays on load
   - Click any date in the calendar to see birthdays on that date
   - Dates with birthdays are marked with indicator dots
   - Navigate between months using the arrow buttons

## Excel File Format

Your Excel file should have two columns:

| Column A (Name) | Column B (BirthDate) |
|-----------------|---------------------|
| John Doe        | 15-03-1990         |
| Jane Smith      | 22-07-1985         |
| Mike Johnson    | 08-11-1992         |

**Important:** Dates must be in **DD-MM-YYYY** or **DD/MM/YYYY** format. Excel serial number dates are also supported.

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Android

This project uses Capacitor to run as a native Android app with local notification support.

### Prerequisites

- Android Studio (latest stable)
- Android SDK (minSdk 24, compileSdk/targetSdk 36)
- Java 21

### Build and Sync

```bash
npm run build
npx cap sync android
```

### Open in Android Studio

```bash
npx cap open android
```

From Android Studio:

1. Wait for Gradle sync to finish
2. Select an emulator or connected device
3. Click **Run** to launch the app

### Live Reload on Android

```bash
npx cap run android -l --external
```

## Deployment

### Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Deploy!

### Vercel

1. Push your code to GitHub
2. Import project to Vercel
3. Framework preset: Vite
4. Deploy!

## Customization

### Design Tokens

The neobrutalist theme is defined via CSS custom properties in `src/index.css` using Tailwind v4's `@theme` block:

```css
@theme {
  --color-bg: #FFF9EC;
  --color-ink: #111111;
  --color-surface: #FFFFFF;
  --color-accent-primary: #FF5C5C;
  --color-accent-secondary: #4C6EF5;
  --color-accent-tertiary: #FFD23F;
  --color-success: #2FBF71;
  --color-danger: #E63946;
}
```

### Fonts

- **Archivo Black** - Display headlines (all-uppercase)
- **Space Grotesk** - Body text
- **JetBrains Mono** - Labels and numbers

### Brutalist Utilities

Custom CSS classes available in `index.css`:

- `.brutal-border`, `.brutal-border-thin`, `.brutal-border-thick` - Solid black borders
- `.brutal-shadow`, `.brutal-shadow-sm`, `.brutal-shadow-lg` - Hard-offset drop shadows
- `.brutal-button` - Interactive button with press effect
- `.brutal-divider` - Full-width black rule
- `.animate-slap` - Entrance animation (scale + rotation)

## Project Structure

```
birthday_tracker/
├── public/                      # Static assets
├── src/
│   ├── components/
│   │   ├── ContactList.jsx      # Birthday list with avatar badges
│   │   ├── DatePicker.jsx       # Custom calendar with birthday dots
│   │   └── FileUpload.jsx       # Drag-and-drop upload zone
│   ├── utils/
│   │   └── notifications.js     # Capacitor notifications + localStorage
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # Entry point
│   └── index.css                # Design tokens and brutalist utilities
├── android/                     # Capacitor Android project
├── capacitor.config.json        # Capacitor configuration
├── package.json
└── vite.config.js
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

**DysCreate**

- GitHub: [@DysCreate](https://github.com/DysCreate)

## Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

---

Made with React
