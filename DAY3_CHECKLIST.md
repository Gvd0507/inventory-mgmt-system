# Day 3 Checklist - React Frontend (MERN Stack)
## Inventory Management System

**Goal:** Build modern React UI with professional design, Apple-style fonts, and proper backend integration  
**Time:** 5-6 hours (includes design polish)  
**Date:** February 14, 2026

---

## 📋 What You Need to Know Before Starting

### Backend API Endpoints (Already Built - Days 1 & 2):

**Items API (`http://localhost:5000/api/items`):**
- `GET /api/items` - Get all items (with optional ?search=term)
- `GET /api/items/:id` - Get single item
- `POST /api/items` - Create new item
  - Body: `{ name, description, category, price, quantity, sku }`
- `PUT /api/items/:id` - Update item
  - Body: Any fields to update
- `DELETE /api/items/:id` - Delete item

**Sales API (`http://localhost:5000/api/sales`):**
- `POST /api/sales` - Record a sale (auto-decrements stock)
  - Body: `{ itemId, quantitySold }`
- `GET /api/sales` - Get all sales history
- `GET /api/sales/stats` - Get sales statistics

### Design Requirements:

**Typography:**
- Primary Font: **SF Pro / San Francisco** (Apple's font family)
- Fallback: **-apple-system, BlinkMacSystemFont, Segoe UI**
- Font Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
- Modern, clean, highly readable

**Color Palette (Modern, Not Dead):**
- Primary: `#007AFF` (iOS Blue) - buttons, highlights
- Success: `#34C759` (iOS Green) - success states
- Danger: `#FF3B30` (iOS Red) - errors, delete
- Warning: `#FF9500` (iOS Orange) - warnings, low stock
- Background: `#F2F2F7` (iOS Light Gray) - page background
- Card Background: `#FFFFFF` (White) - card surfaces
- Text Primary: `#1C1C1E` (Almost Black)
- Text Secondary: `#8E8E93` (Gray)
- Border: `#C6C6C8` (Light Gray)

**UI Style:**
- Apple-inspired minimalist design
- Subtle shadows (not heavy drop shadows)
- Rounded corners (8-12px radius)
- Smooth animations (0.2-0.3s transitions)
- Clean spacing (consistent padding/margins)
- Card-based layout
- Responsive grid system

### Tech Stack Confirmation:

✅ **Frontend:** React 18.2 (already installed)  
✅ **Backend:** Node.js + Express  
✅ **Database:** MongoDB  
✅ **Icons:** lucide-react (already installed)  
✅ **Charts:** Chart.js (already installed, for Day 4+)  
✅ **Routing:** React Router (already installed)  
✅ **State:** React Hooks (useState, useEffect)  
✅ **API:** Fetch with proxy to localhost:5000

---

## ✅ Tasks (Check them off as you complete)

### Part 1: Verify Setup (10 minutes)

- [ ] **Backend is running**
  ```powershell
  cd backend
  npm run dev
  ```
  Should show: "🚀 Server running on http://localhost:5000"

- [ ] **React dependencies installed**
  ```powershell
  cd frontend-react
  npm install
  ```
  (Already done, but verify node_modules exists)

- [ ] **Test backend API**
  - Open browser: http://localhost:5000
  - Should see API info page

---

### Part 2: Create Global Styles & Design System (30 minutes)

- [ ] **Update `src/index.css`**
  - Apple-style SF Pro font stack
  - CSS variables for color palette
  - Reset styles
  - Global animations (fadeIn, slideIn)
  - Utility classes (container, card, button)
  - Responsive scrollbar styling

**Key CSS Variables to Define:**
```css
--color-primary: #007AFF;
--color-success: #34C759;
--color-danger: #FF3B30;
--color-warning: #FF9500;
--bg-primary: #F2F2F7;
--bg-card: #FFFFFF;
--text-primary: #1C1C1E;
--text-secondary: #8E8E93;
--border-color: #C6C6C8;
--radius: 12px;
--shadow: 0 1px 3px rgba(0,0,0,0.08);
```

---

### Part 3: Build Core Components (90 minutes)

- [ ] **Create `src/App.js` - Main Application**
  - Tab/route state management
  - Toast notification system
  - Layout structure
  - Connect all components

- [ ] **Create `src/App.css` - Component Styles**
  - Navbar styles (sticky, clean)
  - Tab navigation (active states)
  - Card styles (clean shadows)
  - Form styles (Apple-inspired inputs)
  - Table styles (readable, sortable)
  - Button styles (multiple variants)
  - Responsive breakpoints

- [ ] **Update `src/api.js` - API Service (if needed)**
  - Already has itemsAPI, salesAPI
  - Has formatCurrency, formatDate helpers
  - Verify all endpoints are covered

- [ ] **Update `src/components/Navbar.js`**
  - Clean Apple-style navigation
  - Tab switching (Dashboard, Items, Sales, Reports)
  - Active tab highlighting
  - Logo/brand section

- [ ] **Update `src/components/Dashboard.js`**
  - 4 stat cards: Total Items, Total Stock, Total Value, Sales Count
  - Clean card design with icons
  - Refresh button
  - Loading states

---

### Part 4: Build Items Management (60 minutes)

- [ ] **Create `src/components/Items.js`**
  - **Top Section:** Add/Edit Item Form
    - Fields: Name, Description, Category, Price, Quantity, SKU
    - Apple-style form inputs
    - Clear validation messages
    - Submit button with loading state
  
  - **Middle Section:** Search Bar
    - Live search filtering
    - Clean input design
  
  - **Bottom Section:** Items Grid/List
    - Responsive grid (3-4 columns desktop, 1-2 mobile)
    - Each item card shows:
      - Name, Category
      - Price, Stock quantity
      - Edit and Delete buttons
    - Empty state message if no items
  
  - **Functionality:**
    - Load all items on mount
    - Create new item
    - Edit existing item
    - Delete item (with confirmation)
    - Search/filter items

---

### Part 5: Build Sales Recording (45 minutes)

- [ ] **Create `src/components/Sales.js`**
  - **Top Section:** Record Sale Form
    - Dropdown: Select Item (shows name + current stock)
    - Input: Quantity to sell
    - Show: Live calculation of total price
    - Warning: If insufficient stock
    - Submit button: "Record Sale"
  
  - **Bottom Section:** Sales History Table
    - Columns: Date, Item, Quantity, Total Amount
    - Sorted by newest first
    - Clean table design
    - Show "No sales yet" if empty
  
  - **Functionality:**
    - Load all items for dropdown
    - Load all sales for history
    - Submit sale (POST to `/api/sales`)
    - Stock auto-updates on backend
    - Show success toast
    - Refresh lists after sale

---

### Part 6: Build Reports & Analytics (45 minutes)

- [ ] **Create `src/components/Reports.js`**
  - **Card 1:** Low Stock Alert
    - Show items with quantity < 10
    - Orange warning badge
    - "Restock needed" message
  
  - **Card 2:** Sales Summary
    - Total Revenue (sum of all sales)
    - Total Orders (count)
    - Average Order Value
    - Total Items Sold
  
  - **Card 3:** Top Selling Items
    - Top 5 items by quantity sold
    - Shows item name, quantity, revenue
    - Ranking (#1, #2, etc.)
  
  - **Card 4:** Category Breakdown
    - Items grouped by category
    - Shows count and total value per category
  
  - **Layout:** 2x2 grid, responsive

---

### Part 7: Add Toast Notifications (15 minutes)

- [ ] **Create `src/components/Toast.js`**
  - Shows at top-right corner
  - Auto-dismisses after 3 seconds
  - Types: success (green), error (red)
  - Smooth slide-in animation
  - Clean, Apple-style design

---

### Part 8: Testing & Polish (45 minutes)

- [ ] **Functional Testing**
  - Add 3-4 different items
  - Edit an item
  - Delete an item
  - Record 2-3 sales
  - Check dashboard stats update
  - Check reports show correct data
  - Test search functionality

- [ ] **UI/UX Testing**
  - All buttons have hover effects
  - Forms show validation errors clearly
  - Loading states work correctly
  - Empty states are informative
  - Mobile responsive (resize browser)
  - No console errors (F12)

- [ ] **Design Polish**
  - Consistent spacing everywhere
  - Font sizes are readable
  - Colors match palette
  - Icons are aligned properly
  - Shadows are subtle
  - Animations are smooth

---

## 📁 File Structure (What You'll Have After Day 3)

```
frontend-react/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Navbar.js          ← Navigation bar
│   │   ├── Dashboard.js       ← Dashboard with stats
│   │   ├── Items.js           ← Item CRUD management
│   │   ├── Sales.js           ← Sales recording
│   │   ├── Reports.js         ← Reports & analytics
│   │   └── Toast.js           ← Notification toasts
│   ├── App.js                 ← Main app component
│   ├── App.css                ← Component styles
│   ├── api.js                 ← API service layer
│   ├── index.js               ← React entry point
│   └── index.css              ← Global styles (Apple design system)
├── package.json
└── README.md
```

---

## 🎨 Design Checklist

Before calling it done, verify:

- [ ] Font looks clean and modern (SF Pro style)
- [ ] Colors match iOS/Apple aesthetic
- [ ] Buttons have smooth hover effects
- [ ] Cards have subtle shadows (not heavy)
- [ ] Spacing is consistent (8px, 12px, 16px, 24px multiples)
- [ ] Inputs have proper focus states
- [ ] Forms are well-aligned
- [ ] Mobile responsive (test at 375px width)
- [ ] No harsh color contrasts
- [ ] Overall feel is "clean" and "minimal"

---

## 🚀 Running the Application

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```powershell
cd frontend-react
npm start
```

**Access:** http://localhost:3000

---

## ❓ Questions to Answer Before Coding

1. **Font Strategy:** Use system fonts (-apple-system) or load SF Pro from CDN?
   - ✅ Answer: Use `-apple-system, BlinkMacSystemFont` for best performance

2. **Color Palette:** Use iOS colors or custom palette?
   - ✅ Answer: iOS-inspired colors for professional, familiar feel

3. **Layout:** Single-page with tabs or multi-page with routing?
   - ✅ Answer: Single-page with tabs (simpler for now, add routing Day 4+)

4. **State Management:** Just useState or add Context API?
   - ✅ Answer: useState for now (Context if needed later)

5. **API Error Handling:** Toast notifications or inline errors?
   - ✅ Answer: Both - toasts for success/errors, inline for form validation

---

## ✅ Day 3 Success Criteria

You're done when:
1. ✅ React app runs at localhost:3000
2. ✅ Can add, edit, delete items from UI
3. ✅ Can record sales from UI
4. ✅ Dashboard shows correct stats
5. ✅ Reports display data
6. ✅ Design looks modern, clean, Apple-inspired
7. ✅ No console errors
8. ✅ Mobile responsive

**Estimated Time:** 5-6 hours (with breaks)

---

**Next:** Day 4 will add Charts, CSV Export, Print functionality, and polish!
