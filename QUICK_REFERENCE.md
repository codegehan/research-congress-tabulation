# Quick Reference Guide

## 🚀 Quick Start

### View the Dashboard
1. Navigate to: `http://localhost:3000`
2. Enter any access code (minimum 4 characters)
3. Click "Enter Access"
4. You'll be redirected to `/dashboard`

### Dashboard Navigation
- **Left Sidebar**: Expand "Research Presentation" or "Poster Presentation"
- **Categories**: Click a category to expand and see titles
- **Titles**: Click any title to view details
- **Campuses**: Select any campus from the list
- **Right Panel**: View selected title details and scoring button

---

## 📊 Data Summary

### Total Items: 30 Titles
- **AI & Data-Driven Systems**: 10 titles
- **IoT & Embedded Technologies**: 10 titles
- **Automation & Enterprise Systems**: 10 titles

### Presentation Types: 2
- Research Presentation (with 3 categories)
- Poster Presentation (with 3 categories)

### Campuses: 4
- Dapitan - Main Campus
- Katipunan
- Tampilisan
- Siocon

---

## 🎨 Design Elements

### Color Scheme
- **Primary**: Orange (#f97316) & Purple (#a855f7)
- **Accent**: Blue (#3b82f6), Green (#22c55e)
- **Background**: Gray-50 to Gray-100

### Icons
- All icons use **FontAwesome** library
- Consistent icon sizing (w-4 to w-10)
- Smooth transitions on interactions

### Typography
- **Font**: Poppins (via Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Sizes**: Responsive (sm:, lg: breakpoints)

---

## ⚡ Performance Features

### Memoization
```tsx
✅ ChevronIcon
✅ ListItem
✅ AccordionHeader
✅ CategoryItem
✅ AccordionSection
✅ NavBar
✅ StatsCard
```

### Callbacks
```tsx
✅ togglePresentation - Opens/closes presentation type
✅ toggleCategory - Expands/collapses category
```

### Data Memoization
```tsx
✅ titlesData - 30 dummy titles
✅ campusesData - 4 campuses
✅ presentationsData - 2 presentation types
```

---

## 🔐 Login Credentials

Currently accepts any access code with:
- **Minimum length**: 4 characters
- **Example**: "1234", "test", "abcd"

⚠️ **Note**: Replace with actual authentication in production

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `app/components/login.tsx` | Login screen with redirect |
| `app/components/dashboard.tsx` | Main optimized dashboard |
| `app/dashboard/page.tsx` | Dashboard route |
| `app/page.tsx` | Home/login page |
| `package.json` | Dependencies (includes FontAwesome) |

---

## 🔧 Common Tasks

### Add New Title
Edit `DUMMY_DATA` in `dashboard.tsx`:
```tsx
{
  id: 'ai-research',
  name: 'Artificial Intelligence & Data-Driven Systems',
  titles: [
    'Existing Title',
    'NEW TITLE HERE' // Add here
  ]
}
```

### Change Colors
Update Tailwind classes:
```tsx
// Orange-to-Purple gradient
className="bg-gradient-to-r from-orange-500 to-purple-500"

// Change to Blue-to-Green
className="bg-gradient-to-r from-blue-500 to-green-500"
```

### Add New Icon
Import from FontAwesome:
```tsx
import { faNewIcon } from '@fortawesome/free-solid-svg-icons';
// Then use: <FontAwesomeIcon icon={faNewIcon} />
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
npm run build
```
Make sure all dependencies are installed:
```bash
npm install
```

### Icons Not Showing
Verify FontAwesome is installed:
```bash
npm list @fortawesome/react-fontawesome
```

### Styling Issues
Clear Next.js cache:
```bash
rm -r .next
npm run build
```

---

## 📈 Development Mode

Run development server:
```bash
npm run dev
```

Then open: `http://localhost:3000`

---

## 🎯 Tips & Tricks

1. **Sticky Sidebar**: Sidebar stays visible while scrolling (see `sticky top-24`)
2. **Smooth Animations**: Chevron rotates 180° on accordion toggle
3. **Selection Highlight**: Selected items show gradient background
4. **Responsive Icons**: All icons scale properly on mobile
5. **Font Awesome Icons**: 1700+ icons available to use

---

## 📚 Resources

- [FontAwesome Icons](https://fontawesome.com/icons)
- [Tailwind CSS](https://tailwindcss.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)

---

**Last Updated**: April 16, 2026  
**Version**: 2.0 (Optimized)
