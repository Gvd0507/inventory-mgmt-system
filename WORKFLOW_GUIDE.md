# Inventory Management System - User Workflow Guide

This guide explains how to use the system for daily shop operations.

---

## 🚀 Initial Setup

### 1. First Time Setup
1. **Register Account:**
   - Go to Login page
   - Click "Register"
   - Enter username, email, password
   - All users have equal access (no roles)

2. **Configure Basic Info:**
   - No settings needed! System ready to use immediately
   - Each item has its own reorder point (customizable)

---

## 📦 Managing Inventory

### Adding New Items

**When:** You get a new product to sell

**Steps:**
1. Go to **Items** page
2. Click "Add New Item" (or expand form if collapsed)
3. Fill in details:
   - **Name:** Product name (e.g., "Wireless Mouse")
   - **Description:** Optional details
   - **Category:** e.g., Electronics, Stationery, Groceries
   - **Price:** Selling price (₹)
   - **Quantity:** Initial stock
   - **SKU:** Auto-generated if left blank
   - **Reorder Point:** When to restock (default: 10)
   - **Preferred Supplier:** Who to buy from
4. Click **Save**

**Result:**
- Item appears in catalog
- SKU auto-generated (format: CATEGORY-RANDOM-TIMESTAMP)

---

### Editing Items

**When:** Price changes, update description, etc.

**Steps:**
1. Find item in Items page (use search if needed)
2. Click **Edit** button on item card
3. Modify fields
4. Click **Save**

**Note:** Quantity should be updated via Sales or Restock, not direct edit

---

### Searching Items

**Methods:**
- **Search bar:** Type product name
- **Category filter:** Dropdown to filter by category
- **Price filter:** Min/Max price range

---

## 💰 Recording Sales

### Daily Sales Flow

**When:** Customer buys a product

**Steps:**
1. Go to **Sales** page
2. Fill in sale form:
   - **Select Item:** Choose from dropdown
   - **Quantity:** How many sold
   - System shows: Price per unit, Total amount
3. Click **Record Sale**

**What Happens:**
- ✅ Sale recorded with timestamp
- ✅ Stock decremented **atomically** (race-condition safe)
- ✅ Item name saved (even if item renamed later)
- ✅ Price at time of sale recorded

**Error Handling:**
- If quantity > available stock → Error: "Insufficient stock"
- If item not found → Error message

---

### Viewing Sales History

**Location:** Sales page (below form)

**Features:**
- **Date filter:** Show sales from specific date range
- **Item filter:** See sales of specific product
- **Stats:** Total revenue, items sold, transaction count
- **Export:** Download as CSV for Excel

---

## 🛒 Restocking Inventory (Purchase Module)

### When to Restock

**Automatic Alerts:**
- Dashboard shows **Low Stock Banner** when items need restocking
- Banner shows count and item names
- Click "View Low Stock Items" → Goes to Items page

**Manual Check:**
- Items page shows quantity on each card
- Items below reorder point highlighted (if implemented in UI)

---

### Recording a Purchase

**When:** You buy inventory from supplier

**Methods:**

#### Method 1: From Items Page (Recommended)
1. Go to **Items** page
2. Find item that needs restocking
3. Click **Restock** button on item card
4. Modal opens with pre-filled data:
   - Item name (auto-filled)
   - Last cost per unit (from previous purchase)
   - Preferred supplier (from item data)
5. Fill/adjust:
   - **Quantity Purchased:** How many units
   - **Cost Per Unit:** What you paid
   - **Supplier:** Vendor name
   - **Notes:** Optional (delivery info, quality, etc.)
6. System shows **Total Cost** preview
7. Click **Record Purchase**

**What Happens:**
- ✅ Purchase record created with timestamp
- ✅ Stock incremented **atomically**
- ✅ Cost price updated (for profit margin calculation)
- ✅ Supplier tracked for next reorder

#### Method 2: Direct Purchase Entry (if implemented)
1. Go to **Purchases** page
2. Select item from dropdown
3. Fill purchase details
4. Submit

---

### Viewing Purchase History

**Location:** Backend tracks all purchases

**What's Recorded:**
- Date/time of purchase
- Item name
- Supplier
- Quantity bought
- Cost per unit
- Total cost
- Notes

**Use Cases:**
- Audit trail: "Who did we buy from last time?"
- Cost analysis: "How much spent on inventory this month?"
- Supplier evaluation: "Which supplier do we use most?"

---

## 📊 Dashboard Overview

### At-a-Glance Stats

**Main Metrics:**
- **Total Items:** Count of products in catalog
- **Low Stock Items:** Items below reorder point
- **Total Revenue:** Sum of all sales
- **Total Sales:** Number of transactions

**Low Stock Banner:**
- **Red banner** appears when items need restocking
- Shows count: "⚠️ 5 items running low!"
- Shows preview: First 3 item names with quantities
- **Action button:** Navigate to Items page to restock

**Recent Activity:**
- Latest sales
- Quick links to actions

---

## 📈 Reports & Analytics

### Sales Charts

**Types:**
- **Daily Sales:** Bar chart of sales per day
- **Weekly Trends:** Line chart
- **Category Distribution:** Pie chart
- **Top Sellers:** Best-selling items

### Exporting Data

**CSV Export:**
1. Go to Reports page
2. Select data type (Items, Sales)
3. Choose date range (if applicable)
4. Click **Export CSV**
5. Open in Excel/Google Sheets

**Print Reports:**
- Use browser print (Ctrl+P)
- System has print-friendly CSS
- Headers/footers automatically included

---

## 🔧 Tips & Best Practices

### Daily Operations

**Morning Routine:**
1. Check Dashboard for low stock alerts
2. Plan restocking for items below threshold

**During Day:**
1. Record sales as they happen (real-time stock updates)
2. Quick search for items customers ask about

**Evening Routine:**
1. Review daily sales in Reports
2. Export data for backup (weekly)

---

### Inventory Management

**Stock Level Guidelines:**
- **Fast-moving items:** Higher reorder point (e.g., 50)
- **Slow-moving items:** Lower reorder point (e.g., 10)
- **Perishables:** Tighter reorder point, frequent restocking
- **Non-perishables:** Can stock more, less frequent orders

**Customize Reorder Points:**
- Milk (sells 20/day) → Reorder at 40 units (2-day buffer)
- Notebooks (sells 2/week) → Reorder at 5 units
- Adjust based on supplier delivery time

---

### Supplier Management

**Track Preferred Suppliers:**
- Set preferred supplier for each item
- Restock modal auto-fills supplier name
- Consistent ordering, faster process

**Multiple Suppliers:**
- You can change supplier per purchase
- History tracks which supplier used when
- Compare costs across suppliers

---

### Profit Tracking

**Automatic Calculation:**
- System shows **Profit Margin** on item cards
- Formula: (Selling Price - Cost Price) / Selling Price × 100%
- Cost Price = Last purchase cost

**Example:**
- Selling Price: ₹100
- Cost Price: ₹70 (from last restock)
- Profit Margin: ₹30 (30%)

**Use Case:**
- Identify high-margin products
- Adjust pricing strategy
- Negotiate better supplier costs

---

## 🔐 Security & Access

### Authentication

**Login:**
- Required for all modifications (add, edit, delete, sales, purchases)
- Public read access to items (browse catalog)

**Logout:**
- Click logout in navbar
- Session expired automatically (JWT 30-day expiry)

**Password Security:**
- Hashed with bcrypt (10 salt rounds)
- Never stored in plain text
- Change in database directly if forgot (no reset feature in basic version)

---

## 🚨 Troubleshooting

### Common Issues

#### "Insufficient stock" error
- **Cause:** Trying to sell more than available
- **Fix:** Check item quantity, restock if needed

#### Item not appearing in dropdown
- **Cause:** Item might be deleted or no items exist
- **Fix:** Add items first in Items page

#### "Network Error" on action
- **Cause:** Backend server not running
- **Fix:** Ensure backend is running on port 5000

#### Stats not updating
- **Cause:** Cache or data not refreshed
- **Fix:** Refresh page (F5)

---

## 📖 Advanced Features

### Atomic Operations (Behind the Scenes)

**What It Means:**
- Multiple users can sell the same item simultaneously
- Stock updates are **atomic** (MongoDB `$inc` operator)
- No chance of negative stock or double-selling

**Example:**
- User A sells 3 units
- User B sells 2 units (at same moment)
- Stock decrements by 5 total (not lost updates)

---

### Denormalization (Why itemName in Sales/Purchases)

**Design Decision:**
- Sales and Purchases store **both** `itemId` AND `itemName`
- Even if item renamed/deleted, old records show original name

**Benefits:**
- Faster queries (no join needed)
- Historical accuracy
- Can delete items without affecting sales history

---

## 🎯 Workflow Summary

### Complete Cycle

```
1. ADD ITEM
   ↓
2. RESTOCK (Purchase from supplier)
   ↓ (stock increases, cost price recorded)
3. SELL (Customer buys)
   ↓ (stock decreases, revenue recorded)
4. LOW STOCK ALERT
   ↓ (dashboard banner, check reorder point)
5. RESTOCK AGAIN
   ↓ (cycle continues)
6. VIEW REPORTS
   (analyze trends, profit margins)
```

---

## 📞 Support

For technical issues:
- Check error messages in browser console (F12)
- Verify backend/frontend both running
- Review SETUP_INSTRUCTIONS.md

For feature requests:
- See Future Enhancements in README.md
- Current focus: Core functionality (keep it simple!)

---

**Happy Inventory Managing! 🎉**
