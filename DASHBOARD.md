# Dashboard Documentation

## Overview
The dashboard is a modern, Material UI-inspired interface with the following components:

### Navigation Bar (Top)
- **Logo**: "TAB" branded rectangular logo with gradient
- **User Info**: Displays current logged-in user name and email
- **Logout Button**: Red button to logout from the system

### Main Dashboard Structure

#### Left Sidebar - Accordion Lists
The sidebar contains three main accordion sections:

1. **Titles Accordion** (Orange)
   - Simple list of titles
   - Click on any title to view its details
   - Example titles: Senior Manager, Project Lead, Developer, Designer, Analyst

2. **Categories Accordion** (Purple - Tree-like)
   - Click on a category to expand and see sub-titles
   - Three categories: Management, Technical, Creative
   - Each category contains related titles
   - Click on a specific title under a category to view details

3. **Campuses Accordion** (Blue - Tree-like)
   - Click on a campus to expand and see its locations
   - Three campuses: Main Campus, North Campus, South Campus
   - Each campus contains multiple buildings/locations
   - Click on a specific location to view details

#### Right Content Area
- **Title Details**: When you select a title, detailed information is displayed
- **Scoring Procedure Button**: Located on the right side of the details section
  - Large, prominent button with award icon
  - Styled with orange-to-purple gradient
  - Ready for further functionality implementation
- **Info Cards**: Shows statistics like Total Items, Completed items, and Progress percentage

### Features
✨ Fully Responsive
- Mobile-optimized layout
- Tablet-friendly interface
- Desktop with full 3-column grid

✨ Interactive Elements
- Smooth accordion animations
- Hover effects on all buttons
- Active state highlighting
- Loading states ready for implementation

✨ Styling
- Poppins font throughout
- Material UI design principles
- Color-coded sections (orange, purple, blue)
- Shadow effects and rounded corners

### File Structure
```
app/
├── components/
│   ├── login.tsx      (Login component with redirect to dashboard)
│   └── dashboard.tsx  (Main dashboard component)
├── dashboard/
│   └── page.tsx       (Dashboard page route)
└── page.tsx           (Home/Login page)
```

### Navigation Flow
1. User lands on `/` (home page) - sees login screen
2. User enters access code (4+ characters)
3. On successful login, user is redirected to `/dashboard`
4. Dashboard displays all accordion sections
5. User can interact with titles, categories, and campuses
6. Clicking on a title shows details and the Scoring Procedure button

### Dummy Data
All data is currently hardcoded. To connect to a real backend:
1. Create an API route in `/app/api/`
2. Replace the dummy arrays with actual data from your backend
3. Add loading states while fetching data
4. Handle errors appropriately

### Scoring Procedure Button
Currently non-functional - ready for implementation. Can be connected to:
- A modal showing scoring details
- A new page with scoring information
- An API endpoint fetching scoring rules
- Print functionality for scoring sheets

