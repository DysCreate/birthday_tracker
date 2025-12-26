# 🎂 Birthday Tracker

A modern, elegant React application for tracking and managing birthdays. Upload your contacts list and never miss a birthday again!

## ✨ Features

- 📁 **Excel File Upload** - Support for .xlsx, .xls, and .csv files with drag-and-drop functionality
- 📅 **Interactive Calendar** - Beautiful, minimalist date picker for browsing birthdays
- 🎯 **Smart Filtering** - Automatically matches birthdays by month and day (year-independent)
- 🎨 **Modern UI** - Apple-inspired design with smooth animations and glass-morphism effects
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🔒 **Privacy First** - All data processing happens locally in your browser
- ⚡ **Fast & Smooth** - Built with Vite for lightning-fast performance

## 🛠️ Tech Stack

- **React 19** - Modern UI library
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS v4** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **XLSX** - Excel file parsing
- **Lucide React** - Beautiful icon library

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## 🚀 Installation

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

## 📝 Usage

1. **Prepare Your Data**
   - Create an Excel file with two columns
   - Column 1: Names of people
   - Column 2: Birth dates in DD-MM-YYYY format (e.g., 25-12-2000)
   - No headers needed (the app auto-detects data)

2. **Upload Your File**
   - Click or drag-and-drop your Excel file into the upload zone
   - The calendar will automatically open after upload

3. **View Birthdays**
   - The app automatically shows today's birthdays
   - Click any date in the calendar to see birthdays on that date
   - Navigate between months using the arrow buttons

## 📊 Excel File Format

Your Excel file should have two columns:

| Column A (Name) | Column B (BirthDate) |
|-----------------|---------------------|
| John Doe        | 15-03-1990         |
| Jane Smith      | 22-07-1985         |
| Mike Johnson    | 08-11-1992         |

**Important:** Dates must be in **DD-MM-YYYY** format (e.g., 26-12-2025 or 26/12/2025)

## 🏗️ Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## 🌐 Deployment

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

## 🎨 Customization

### Colors

Edit `src/index.css` to change the color scheme:

```css
body {
  background: linear-gradient(to bottom right, #your-colors-here);
}
```

### Animations

Modify animation settings in `src/components/ContactList.jsx` and other components using Framer Motion variants.

## 📁 Project Structure

```
bday_app/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── ContactList.jsx
│   │   ├── DatePicker.jsx
│   │   └── FileUpload.jsx
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── package.json
└── vite.config.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**DysCreate**

- GitHub: [@DysCreate](https://github.com/DysCreate)

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Animations by [Framer Motion](https://www.framer.com/motion/)
- Styling by [Tailwind CSS](https://tailwindcss.com/)

---

Made with ❤️ and React
