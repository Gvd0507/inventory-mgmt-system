# Inventory Management System - Backend Design

## 🎯 Project Goal
Build a complete, understandable DBMS project in 3 weeks using Node.js, Express, and MongoDB.

---

## 📁 Backend Structure

```
backend/
├── server.js              # Entry point (~50 lines)
├── config/
│   └── db.js             # MongoDB connection (~15 lines)
├── models/
│   ├── Item.js           # Item schema (~30 lines)
│   └── Sale.js           # Sale schema (~25 lines)
├── routes/
│   ├── items.js          # Item routes (~120 lines)
│   └── sales.js          # Sales routes (~80 lines)
├── middleware/
│   └── errorHandler.js   # Error handling (~20 lines)
└── package.json

Total: ~340 lines (well under 500!)
```

---

## 🗄️ Database Schemas

### 1. Item Schema
```javascript
{
  name: String (required, trimmed)
  description: String
  category: String (e.g., "Electronics", "Furniture")
  price: Number (required, min: 0)
  quantity: Number (required, min: 0, integer)
  sku: String (unique, auto-generated if not provided)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Indexes:** 
- `name` (text index for search)
- `sku` (unique)

### 2. Sale Schema
```javascript
{
  itemId: ObjectId (ref: 'Item', required)
  itemName: String (denormalized for faster queries)
  quantitySold: Number (required, min: 1)
  pricePerUnit: Number (required)
  totalAmount: Number (calculated: quantitySold * pricePerUnit)
  saleDate: Date (default: now)
}
```

---

## 🛤️ API Routes

### Items Routes (`/api/items`)

| Method | Endpoint | Description | Key Logic |
|--------|----------|-------------|-----------|
| GET | `/api/items` | Get all items + search | Query by name (regex) |
| GET | `/api/items/:id` | Get single item | findById |
| POST | `/api/items` | Add new item | Validate + save |
| PUT | `/api/items/:id` | Update item | findByIdAndUpdate |
| DELETE | `/api/items/:id` | Delete item | Check if quantity > 0 (optional safety) |

**Search Feature:**
- Query param: `?search=laptop`
- Use MongoDB regex: `{ name: { $regex: search, $options: 'i' } }`

### Sales Routes (`/api/sales`)

| Method | Endpoint | Description | Key Logic |
|--------|----------|-------------|-----------|
| POST | `/api/sales` | Sell item | **Critical: Atomic stock decrement** |
| GET | `/api/sales` | Get sales history | Sort by date (descending) |
| GET | `/api/sales/stats` | Get summary stats | Optional: total revenue, items sold |

---

## 🔐 Critical Logic: Safe Stock Decrement

**Problem:** Prevent race conditions when selling items.

**Solution:** Use MongoDB's atomic operations

```javascript
// POST /api/sales
// 1. Find item and check stock
const item = await Item.findById(itemId);
if (!item) return res.status(404).json({ error: 'Item not found' });
if (item.quantity < quantitySold) {
  return res.status(400).json({ error: 'Insufficient stock' });
}

// 2. Atomically decrement stock
const updatedItem = await Item.findByIdAndUpdate(
  itemId,
  { $inc: { quantity: -quantitySold } },
  { new: true }
);

// 3. Create sale record
const sale = new Sale({
  itemId,
  itemName: item.name,
  quantitySold,
  pricePerUnit: item.price,
  totalAmount: item.price * quantitySold
});
await sale.save();
```

**Why this works:**
- `$inc` is atomic in MongoDB
- If two sales happen simultaneously, MongoDB handles it correctly
- No negative stock possible

---

## 🛡️ Input Validation

**Keep it simple - use basic Express validation:**

```javascript
// Example for adding item
if (!name || !price || quantity === undefined) {
  return res.status(400).json({ error: 'Missing required fields' });
}

if (price < 0 || quantity < 0) {
  return res.status(400).json({ error: 'Price and quantity must be non-negative' });
}
```

**Optional Enhancement:** Use `express-validator` if time permits (Week 3).

---

## 🔧 Middleware

### Error Handler (Global)
```javascript
// Catch all errors and send consistent response
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});
```

---

## 📦 Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
```

**That's it!** No unnecessary packages.

---

## 🚀 Development Timeline (3 Weeks)

### Week 1: Backend Foundation
- **Day 1-2:** Setup + Database schemas + Connection
- **Day 3-4:** Items CRUD routes
- **Day 5-7:** Sales routes + Stock logic testing

### Week 2: Frontend Core
- **Day 8-10:** React setup + Item list/form
- **Day 11-12:** Search + Edit/Delete
- **Day 13-14:** Sales interface

### Week 3: Polish & Testing
- **Day 15-17:** Bug fixes + Error handling
- **Day 18-19:** UI improvements + Validation
- **Day 20-21:** Final testing + Documentation

---

## 🎯 Success Criteria

✅ All CRUD operations work  
✅ Stock never goes negative  
✅ Search returns correct results  
✅ Sales history displays properly  
✅ Code is readable and commented  
✅ You can explain every line of code  

---

## 🚨 What NOT to Add (Avoid Feature Creep!)

❌ User authentication (unless required)  
❌ Image uploads  
❌ PDF reports  
❌ Real-time notifications  
❌ Complex analytics dashboard  
❌ Multiple warehouses  
❌ Barcode scanning  

**Keep these in mind:**
- You can mention them as "Future Enhancements" in documentation
- Focus on core functionality first
- A working simple system > broken complex system

---

## 📝 Environment Variables

```env
# .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/inventory_db
NODE_ENV=development
```

---

## Next Steps

1. ✅ Review this design document
2. 🔨 Implement backend structure (I can help!)
3. 🧪 Test with Postman/Thunder Client
4. 🎨 Build frontend (after backend is solid)

**Ready to start coding? Let me know and I'll generate the complete backend code!**
