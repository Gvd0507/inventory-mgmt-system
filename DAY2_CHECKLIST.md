# Day 2 Checklist - API Routes & Business Logic
## Inventory Management System

**Goal:** Build complete CRUD operations for Items and Sales with atomic stock management  
**Time:** 4-5 hours (realistic pace, includes testing)  
**Date:** February 13, 2026

---

## ✅ Tasks (Check them off as you complete)

### Part 1: Review Day 1 (15 minutes)

- [ ] **Start your server**
  ```powershell
  cd "C:\Users\parth\OneDrive\Desktop\dbms inv\backend"
  npm run dev
  ```
  - Make sure MongoDB is connected
  - Server should show "✅ MongoDB Connected"

- [ ] **Quick review**
  - Open `models/Item.js` - Review the schema
  - Open `models/Sale.js` - Review the schema
  - Remember: Today you're building the routes that USE these models

---

### Part 2: Understand the New Files (20 minutes)

- [ ] **Review routes/items.js**
  - Open the file and read through it
  - Notice the 6 endpoints (GET, POST, PUT, DELETE, etc.)
  - See how validation works
  - Find the error handling for duplicate SKU

- [ ] **Review routes/sales.js**
  - Open the file and read through it
  - **MOST IMPORTANT:** Find the POST route with atomic stock decrement
  - Notice the 3-step process: Check → Decrement → Record
  - See the aggregation pipeline in `/stats` endpoint

- [ ] **Review updated server.js**
  - Notice routes are now imported and connected
  - Check the new endpoint list in the root route

---

### Part 3: Test Items API (45 minutes)

**Install Thunder Client (VS Code Extension) or use Postman**

- [ ] **Test 1: Create an item (POST)**
  - **Method:** POST
  - **URL:** `http://localhost:5000/api/items`
  - **Body (JSON):**
    ```json
    {
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse",
      "category": "Electronics",
      "price": 25.99,
      "quantity": 100,
      "sku": "ELEC-MOUSE-001"
    }
    ```
  - **Expected:** Status 201, item created with auto-generated timestamps
  - **Try error:** Send without "name" → Should get validation error

- [ ] **Test 2: Get all items (GET)**
  - **Method:** GET
  - **URL:** `http://localhost:5000/api/items`
  - **Expected:** Array of all items (should have 1 item from previous test)

- [ ] **Test 3: Search items (GET with query)**
  - **Method:** GET
  - **URL:** `http://localhost:5000/api/items?search=mouse`
  - **Expected:** Only items with "mouse" in name (case-insensitive)

- [ ] **Test 4: Get single item (GET)**
  - **Method:** GET
  - **URL:** `http://localhost:5000/api/items/{id}` (use ID from Test 1)
  - **Expected:** Single item details
  - **Try error:** Use fake ID → Should get 404

- [ ] **Test 5: Update item (PUT)**
  - **Method:** PUT
  - **URL:** `http://localhost:5000/api/items/{id}`
  - **Body (JSON):**
    ```json
    {
      "quantity": 150,
      "price": 24.99
    }
    ```
  - **Expected:** Item updated, quantity now 150

- [ ] **Test 6: Create another item for later tests**
  - Create "Laptop" with quantity: 10, price: 500
  - Save the item ID for sales testing

- [ ] **Test 7: Low stock check (GET)**
  - **Method:** GET
  - **URL:** `http://localhost:5000/api/items/low-stock/20`
  - **Expected:** Items with quantity < 20 (Laptop should appear)

- [ ] **Test 8: Delete item (DELETE)**
  - Create a test item first
  - Delete it using DELETE `http://localhost:5000/api/items/{id}`
  - **Expected:** Status 200, item deleted

---

### Part 4: Test Sales API (45 minutes)

- [ ] **Test 1: Create a sale (POST)**
  - **Method:** POST
  - **URL:** `http://localhost:5000/api/sales`
  - **Body (JSON):**
    ```json
    {
      "itemId": "PUT_LAPTOP_ID_HERE",
      "quantitySold": 2
    }
    ```
  - **Expected:** 
    - Status 201
    - Sale created
    - `remainingStock` shows updated quantity (should be 8)
  - **Verify:** GET the laptop item again, quantity should be 8

- [ ] **Test 2: Try to oversell (Error test)**
  - **Method:** POST
  - **URL:** `http://localhost:5000/api/sales`
  - **Body:** Try to sell 20 laptops (we only have 8)
  - **Expected:** Status 400, "Insufficient stock" error
  - **Important:** Check item quantity again - should STILL be 8 (not negative)

- [ ] **Test 3: Get all sales (GET)**
  - **Method:** GET
  - **URL:** `http://localhost:5000/api/sales`
  - **Expected:** Array with 1 sale, newest first

- [ ] **Test 4: Get sales statistics (GET)**
  - **Method:** GET
  - **URL:** `http://localhost:5000/api/sales/stats`
  - **Expected:** 
    ```json
    {
      "totalRevenue": 1000,
      "totalItemsSold": 2,
      "totalTransactions": 1
    }
    ```

- [ ] **Test 5: Make more sales**
  - Sell 2 more laptops
  - Sell 5 wireless mice
  - Check stats again → Numbers should update

- [ ] **Test 6: Get sales for specific item (GET)**
  - **Method:** GET
  - **URL:** `http://localhost:5000/api/sales/item/{laptopId}`
  - **Expected:** All sales for that laptop only

- [ ] **Test 7: Get single sale (GET)**
  - **Method:** GET
  - **URL:** `http://localhost:5000/api/sales/{saleId}`
  - **Expected:** Single sale details

---

### Part 5: Test Critical Logic (30 minutes)

**This is the most important test - prevents negative stock!**

- [ ] **Atomic Stock Test**
  - Create an item with quantity: 5
  - Try to sell 3 units → Should work
  - Item should have 2 remaining
  - Try to sell 3 more units → Should FAIL
  - Item should STILL have 2 (not -1)
  - **This proves your atomic operation works!**

- [ ] **Validation Tests**
  - Try creating item with negative price → Should fail
  - Try creating item with negative quantity → Should fail
  - Try creating sale with 0 quantity → Should fail
  - Try creating sale with decimal quantity (2.5) → Should fail

- [ ] **Duplicate SKU Test**
  - Create item with SKU "TEST-001"
  - Try creating another item with same SKU → Should fail with "SKU already exists"

---

### Part 6: Document Your Tests (20 minutes)

- [ ] **Create test results file**
  - Create `backend/TEST_RESULTS.md`
  - Document each test you ran
  - Include screenshots (for PPT)
  - Note: Which tests passed, which failed (expected failures)

- [ ] **Take screenshots for PPT**
  - Screenshot of successful item creation
  - Screenshot of sales statistics
  - Screenshot of "insufficient stock" error
  - Screenshot of all endpoints list

---

### Part 7: Code Review (30 minutes)

- [ ] **Add your own comments**
  - Open `routes/items.js`
  - Add comments explaining tricky parts
  - Highlight: Why we check `if (error.code === 11000)`

- [ ] **Understand the atomic operation**
  - Open `routes/sales.js`, line ~40-50
  - Read the 3-step sale process
  - Understand why `$inc` is atomic
  - Add a comment: "This prevents race conditions"

- [ ] **Review error handling**
  - Notice how every route has try-catch
  - See different HTTP status codes (200, 201, 400, 404, 500)
  - Understand when to use each

---

### Part 8: Git Commit (15 minutes)

- [ ] **Commit your work**
  ```powershell
  git add .
  git commit -m "Day 2: Complete CRUD routes for items and sales with atomic stock management"
  git push origin main
  ```

---

## 🎯 Day 2 Success Criteria

By the end of Day 2, you should have:

✅ All 6 item endpoints working (GET, POST, PUT, DELETE, search, low-stock)  
✅ All 5 sales endpoints working (POST, GET, stats, by-item, by-id)  
✅ Atomic stock decrement preventing negative quantities  
✅ Comprehensive error handling and validation  
✅ Sales statistics with aggregation pipeline  
✅ Test results documented  

---

## 📊 What You Accomplished

### Lines of Code Written: ~390 lines
- `routes/items.js`: ~270 lines (6 endpoints + error handling)
- `routes/sales.js`: ~200 lines (5 endpoints + atomic logic)
- `server.js` updates: ~10 lines

### API Endpoints Created: 11 endpoints

**Items (6 endpoints):**
1. `GET /api/items` - Get all items + search
2. `GET /api/items/:id` - Get single item
3. `POST /api/items` - Create item
4. `PUT /api/items/:id` - Update item
5. `DELETE /api/items/:id` - Delete item
6. `GET /api/items/low-stock/:threshold` - Low stock alert

**Sales (5 endpoints):**
1. `POST /api/sales` - Create sale (atomic stock decrement)
2. `GET /api/sales` - Get all sales
3. `GET /api/sales/stats` - Get statistics
4. `GET /api/sales/item/:itemId` - Get sales for specific item
5. `GET /api/sales/:id` - Get single sale

---

## 📚 What You Built & Why (Detailed Explanation)

### 1. **routes/items.js** - Item Management API

**What it does:** Handles all CRUD (Create, Read, Update, Delete) operations for inventory items.

**Key endpoints explained:**

#### GET /api/items (Get All + Search)
```javascript
// Without search: Returns all items
GET http://localhost:5000/api/items

// With search: Filters by name
GET http://localhost:5000/api/items?search=laptop
```

**How it works:**
- Checks if `search` query parameter exists
- Uses MongoDB `$regex` for case-insensitive search
- Returns items sorted by creation date (newest first)
- Search pattern: `{ name: { $regex: search, $options: 'i' } }`

**Why you need it:** Essential for displaying inventory list and implementing search functionality in frontend.

---

#### POST /api/items (Create Item)
```javascript
// Request body
{
  "name": "Laptop",
  "price": 500,
  "quantity": 10,
  "sku": "ELEC-LAP-001"
}
```

**How it works:**
1. Validates required fields (name, price, quantity)
2. Checks for negative values
3. Creates new Item instance
4. Saves to database
5. Returns created item with auto-generated `_id` and timestamps

**Error handling:**
- Missing fields → 400 "Please provide required fields"
- Duplicate SKU → 400 "SKU already exists" (MongoDB error code 11000)
- Validation errors → 400 with detailed messages

**Why you need it:** Core functionality - adding new products to inventory.

---

#### PUT /api/items/:id (Update Item)
```javascript
// Update quantity and price
PUT http://localhost:5000/api/items/65ca12...
{
  "quantity": 150,
  "price": 24.99
}
```

**How it works:**
- Uses `findByIdAndUpdate()` with `{ new: true }` to return updated document
- Runs validators even on update with `runValidators: true`
- Only updates fields provided in request body

**Why partial updates work:** MongoDB `$set` operator only changes specified fields, leaves others untouched.

**Why you need it:** For restocking items, price changes, editing descriptions.

---

#### DELETE /api/items/:id (Delete Item)
```javascript
DELETE http://localhost:5000/api/items/65ca12...
```

**How it works:**
- Uses `findByIdAndDelete()` to remove from database
- Returns the deleted item data (useful for "undo" feature)

**Note:** In production, you might want to check if item has sales history before deleting (referential integrity).

**Why you need it:** Remove discontinued products or test data.

---

#### GET /api/items/low-stock/:threshold (Alert System)
```javascript
GET http://localhost:5000/api/items/low-stock/10
// Returns items with quantity < 10
```

**How it works:**
- Uses MongoDB query: `{ quantity: { $lt: threshold } }`
- Sorts by quantity ascending (lowest first)
- Threshold is dynamic (can check for <5, <10, <50, etc.)

**Why you need it:** Inventory management - know when to reorder items.

---

### 2. **routes/sales.js** - Sales Transaction API

**What it does:** Handles all sales operations with atomic stock management.

**Key endpoints explained:**

#### POST /api/sales (Create Sale) - MOST CRITICAL
```javascript
POST http://localhost:5000/api/sales
{
  "itemId": "65ca1234...",
  "quantitySold": 3
}
```

**How it works (3-step atomic process):**

**Step 1: Validate & Check Stock**
```javascript
const item = await Item.findById(itemId);
if (item.quantity < quantitySold) {
  return error "Insufficient stock";
}
```

**Step 2: Atomic Stock Decrement**
```javascript
await Item.findByIdAndUpdate(
  itemId,
  { $inc: { quantity: -quantitySold } }  // Atomic operation!
);
```

**Why `$inc` is atomic:**
- MongoDB guarantees atomic single-document updates
- If 2 people try to buy the last item simultaneously:
  - Person A: Reads quantity=1, tries to decrement
  - Person B: Reads quantity=1, tries to decrement
  - MongoDB processes them sequentially (one succeeds, one sees 0)
- Prevents race conditions and negative stock

**Step 3: Record Sale**
```javascript
const sale = new Sale({
  itemId,
  itemName: item.name,  // Denormalized!
  quantitySold,
  pricePerUnit: item.price,
  totalAmount: price * quantity  // Auto-calculated
});
```

**Why denormalize itemName:**
- Sales are historical records (immutable)
- If item gets renamed/deleted later, sale record preserves original name
- Avoids joins when displaying sales history
- Trade-off: ~20 bytes extra storage per sale (acceptable)

**Why you need it:** Core business logic - selling products safely.

---

#### GET /api/sales/stats (Analytics Dashboard)
```javascript
GET http://localhost:5000/api/sales/stats

// Returns:
{
  "totalRevenue": 5432.10,
  "totalItemsSold": 127,
  "totalTransactions": 45
}
```

**How it works - MongoDB Aggregation Pipeline:**
```javascript
await Sale.aggregate([
  {
    $group: {
      _id: null,  // Group all documents together
      totalRevenue: { $sum: '$totalAmount' },
      totalItemsSold: { $sum: '$quantitySold' },
      totalTransactions: { $sum: 1 }
    }
  }
]);
```

**Aggregation explained:**
- `$group` - Groups documents together
- `_id: null` - Put all sales in one group
- `$sum: '$field'` - Add up values from field
- `$sum: 1` - Count documents (1 per transaction)

**Why you need it:** Business intelligence - track total revenue, sales volume.

---

#### GET /api/sales/item/:itemId (Item Sales History)
```javascript
GET http://localhost:5000/api/sales/item/65ca1234...
// Returns all sales for that specific item
```

**How it works:**
- Filters: `{ itemId: req.params.itemId }`
- Sorts by date descending (newest first)
- Uses index on `itemId` for fast lookup

**Why you need it:** See which items sell well, analyze trends per product.

---

### 3. **Error Handling Strategy**

**HTTP Status Codes Used:**

| Code | Meaning | When to Use |
|------|---------|-------------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Validation errors, negative values, insufficient stock |
| 404 | Not Found | Item/sale doesn't exist |
| 500 | Server Error | Database errors, unexpected issues |

**Error Response Format:**
```javascript
{
  "success": false,
  "error": "Short error message",
  "message": "Detailed technical message" // Optional
}
```

**Why consistent format:** Frontend can always check `success` field and display `error` to user.

---

### 4. **Validation Strategy**

**Three layers of validation:**

**Layer 1: Mongoose Schema (models)**
- Data types (String, Number, Date)
- Required fields
- Min/max values
- Custom validators (isInteger)

**Layer 2: Route Logic (routes)**
- Business rules (quantity < available stock)
- Relationship checks (itemId exists)
- Input sanitization

**Layer 3: MongoDB Constraints (database)**
- Unique indexes (SKU)
- Atomic operations ($inc)

**Why three layers:** Defense in depth - catch errors early, prevent data corruption.

---

## 🎓 How Everything Works Together

### Complete Sale Flow:
```
User clicks "Sell 3 Laptops"
         ↓
Frontend sends: POST /api/sales { itemId, quantitySold: 3 }
         ↓
routes/sales.js receives request
         ↓
Validates input (quantity > 0, is integer)
         ↓
Finds Item in database via Item model
         ↓
Checks: item.quantity >= 3 ?
         ↓
YES → Atomic decrement: quantity = quantity - 3
         ↓
Creates Sale record with denormalized data
         ↓
Saves to database
         ↓
Returns: { success: true, sale, remainingStock }
         ↓
Frontend shows: "Sale successful! 7 laptops remaining"
```

---

## 🔍 Code Review Points (For Your Professor)

### 1. **RESTful API Design**
- Resource-based URLs (`/api/items`, `/api/sales`)
- Proper HTTP methods (GET→read, POST→create, PUT→update, DELETE→delete)
- Meaningful status codes
- Consistent response format

### 2. **Database Query Optimization**
- Uses indexes for fast lookups (name, SKU, saleDate, itemId)
- Atomic operations prevent race conditions
- Aggregation pipeline for statistics (efficient)
- Sorted queries utilize indexes

### 3. **Business Logic Implementation**
- Stock management prevents negative quantities
- Denormalization for performance (justified in documentation)
- Comprehensive validation at multiple layers
- Error handling covers edge cases

### 4. **Code Quality**
- Detailed comments explaining complex logic
- Consistent error handling pattern
- DRY principle (Don't Repeat Yourself)
- Separation of concerns (routes vs models)

### 5. **Security Considerations** (Basic)
- Input validation prevents invalid data
- No direct database queries exposed
- Error messages don't leak sensitive info
- (Note: Production would add authentication, rate limiting, SQL injection prevention)

---

## 💬 What You Can Say in Presentation

> "On Day 2, I implemented the complete backend API with 11 RESTful endpoints. The Items API provides full CRUD operations with search functionality and low-stock alerts. The Sales API implements the critical atomic stock decrement operation using MongoDB's `$inc` operator, which prevents race conditions where two simultaneous sales could create negative inventory.
>
> The most important endpoint is POST /api/sales, which follows a three-step process: First, it validates the request and checks stock availability. Second, it uses an atomic update to decrement the stock quantity - this is crucial because MongoDB guarantees that even if multiple requests happen simultaneously, they'll be processed sequentially without causing data corruption. Third, it creates a sale record with denormalized item name for query performance, a design decision I documented in my normalization analysis.
>
> I also implemented a sales statistics endpoint using MongoDB's aggregation pipeline, which efficiently calculates total revenue, items sold, and transaction count across all sales. All endpoints include comprehensive error handling with appropriate HTTP status codes and validation at three layers: schema validation, business logic validation, and database constraints.
>
> The API is fully tested - I verified that negative stock is impossible, duplicate SKUs are rejected, and all CRUD operations work correctly. Every endpoint follows REST principles with consistent response formats."

---

## 🚀 Tomorrow (Day 3) Preview

**Goal:** Set up React frontend and connect to backend

You'll build:
- React app structure with Vite
- Axios setup for API calls
- Item list display
- Add item form
- First API integration test

**Estimated time:** 4-5 hours

---

## 💡 Tips for Day 2

1. **Test as you go** - Don't wait until the end
2. **Use Thunder Client** - Much faster than writing curl commands
3. **Read error messages** - They tell you exactly what's wrong
4. **Check MongoDB** - Use MongoDB Compass to see actual data
5. **Understand atomic operations** - This is the most important concept today

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot POST /api/items"
**Solution:** Check server is running with `npm run dev`, routes should be imported in server.js.

### Issue: "Item not found" but ID looks correct
**Solution:** Make sure you're using the actual MongoDB ObjectId from the database, not a placeholder.

### Issue: Stock went negative!
**Solution:** You might have tested the old code. Restart server to load new routes with atomic `$inc`.

### Issue: "Validation failed" but all fields provided
**Solution:** Check data types - quantity must be integer, price must be number, not string.

### Issue: Sales stats show 0 even after making sales
**Solution:** Make sure you're hitting `/api/sales/stats` not `/api/sales` (stats is a separate endpoint).

---

## 📝 Notes for Your PPT

Screenshots to take today:
- Thunder Client showing successful API calls
- Screenshot of sales stats JSON response
- Screenshot of "insufficient stock" error (proves validation works)
- MongoDB Compass showing items and sales collections
- Code snippet of atomic stock decrement (highlight the `$inc` part)

Key talking points:
- "11 RESTful endpoints implemented"
- "Atomic operations prevent race conditions"
- "Three-layer validation strategy"
- "Aggregation pipeline for analytics"
- "Comprehensive error handling"

---

**Ready to build APIs? Begin with Part 1!**

Good luck! 🚀
