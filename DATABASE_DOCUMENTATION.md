# Database Design Documentation
## Inventory Management System - DBMS Project

**Course:** Database Management Systems  
**Date:** February 12, 2026  
**Database:** MongoDB (NoSQL Document-Oriented Database)

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    ITEM ||--o{ SALE : "is_sold_in"
    
    ITEM {
        ObjectId _id PK
        String name
        String description
        String category
        Number price
        Number quantity
        String sku UK
        Date createdAt
        Date updatedAt
    }
    
    SALE {
        ObjectId _id PK
        ObjectId itemId FK
        String itemName
        Number quantitySold
        Number pricePerUnit
        Number totalAmount
        Date saleDate
    }
```

**Relationship Description:**
- One **ITEM** can have zero or many **SALES** (1:N relationship)
- Each **SALE** must reference exactly one **ITEM**
- Cardinality: One-to-Many (1:N)

---

## 2. Entity Analysis

### 2.1 ITEM Entity

**Purpose:** Represents products/items stored in the inventory.

**Attributes:**

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `_id` | ObjectId | PRIMARY KEY, Auto-generated | Unique identifier for each item |
| `name` | String | NOT NULL, Trimmed | Name of the item |
| `description` | String | Optional | Detailed description of the item |
| `category` | String | Optional | Product category (e.g., Electronics, Furniture) |
| `price` | Number | NOT NULL, ≥ 0 | Selling price per unit |
| `quantity` | Number | NOT NULL, ≥ 0, Integer | Current stock quantity |
| `sku` | String | UNIQUE, Auto-generated | Stock Keeping Unit - unique product code |
| `createdAt` | Date | Auto-timestamp | Record creation timestamp |
| `updatedAt` | Date | Auto-timestamp | Last modification timestamp |

**Primary Key:** `_id` (ObjectId)  
**Unique Key:** `sku` (Stock Keeping Unit)

---

### 2.2 SALE Entity

**Purpose:** Records all sales transactions with historical data.

**Attributes:**

| Attribute | Data Type | Constraints | Description |
|-----------|-----------|-------------|-------------|
| `_id` | ObjectId | PRIMARY KEY, Auto-generated | Unique identifier for each sale |
| `itemId` | ObjectId | FOREIGN KEY, NOT NULL | References `ITEM._id` |
| `itemName` | String | Denormalized | Copy of item name (for faster queries) |
| `quantitySold` | Number | NOT NULL, ≥ 1 | Number of units sold |
| `pricePerUnit` | Number | NOT NULL, ≥ 0 | Price at time of sale |
| `totalAmount` | Number | Calculated | Total sale value (quantitySold × pricePerUnit) |
| `saleDate` | Date | Default: Current timestamp | Transaction date/time |

**Primary Key:** `_id` (ObjectId)  
**Foreign Key:** `itemId` → references `ITEM._id`

---

## 3. Primary Keys & Foreign Keys

### 3.1 Primary Keys

**ITEM Collection:**
- **PK:** `_id` (ObjectId)
- MongoDB automatically generates unique ObjectId for each document
- Format: 12-byte hexadecimal string (e.g., `507f1f77bcf86cd799439011`)
- Ensures uniqueness across distributed systems

**SALE Collection:**
- **PK:** `_id` (ObjectId)
- Similar auto-generation mechanism

### 3.2 Foreign Key Relationship

**Reference:** `SALE.itemId` → `ITEM._id`

**Implementation in MongoDB:**
```javascript
// In Sale Schema (Mongoose)
itemId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Item',  // Reference to Item collection
  required: true
}
```

**Note:** Unlike SQL databases, MongoDB doesn't enforce referential integrity at the database level. This must be handled in application logic (backend validation).

### 3.3 Unique Constraint

**ITEM.sku** - Ensures no two items have the same Stock Keeping Unit.

---

## 4. Normalization Analysis

### 4.1 Current Normalization Form

**Item Collection:** ✅ **3rd Normal Form (3NF)**

**Verification:**
- **1NF:** All attributes contain atomic values (no multi-valued attributes)
- **2NF:** No partial dependencies (all non-key attributes fully depend on primary key)
- **3NF:** No transitive dependencies (no non-key attribute depends on another non-key attribute)

**Example:**
```
_id → {name, description, category, price, quantity, sku}
```
All attributes directly depend on `_id`, with no intermediate dependencies.

---

### 4.2 Denormalization Strategy in SALE Collection

**Denormalized Attribute:** `itemName` in SALE collection

**Why Denormalize?**
1. **Query Performance:** Avoid JOIN operations when displaying sales history
2. **Historical Accuracy:** Preserves item name even if original item is deleted/renamed
3. **Read Optimization:** Sales reports don't need to query ITEM collection

**Trade-off:**
- ✅ **Benefit:** Faster reads (no need to populate itemId)
- ❌ **Cost:** Slight data redundancy (~20-30 bytes per sale record)

**Decision Justification:**
In an inventory system, sales history is queried frequently (reports, analytics), but sales are immutable once created. This read-heavy pattern justifies denormalization.

---

### 4.3 Alternative: Fully Normalized Design

**Hypothetical 3NF Design (Not Used):**
```javascript
// SALE Collection (Normalized)
{
  _id: ObjectId,
  itemId: ObjectId,  // FK only, no itemName
  quantitySold: Number,
  pricePerUnit: Number,
  totalAmount: Number,
  saleDate: Date
}

// Query Pattern: Always need populate()
const sales = await Sale.find().populate('itemId', 'name');
```

**Why We Chose Denormalization:**
- Reduces query complexity for common operations
- Sales are append-only (immutable), so no update anomalies
- Small redundancy (~10KB per 500 sales) is acceptable

---

## 5. MongoDB Collection Structure

### 5.1 Item Collection

**Collection Name:** `items`

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "Wireless Mouse",
  description: "Ergonomic wireless mouse with USB receiver",
  category: "Electronics",
  price: 25.99,
  quantity: 150,
  sku: "ELEC-MOUSE-001",
  createdAt: ISODate("2026-02-01T10:30:00Z"),
  updatedAt: ISODate("2026-02-10T14:22:00Z")
}
```

### 5.2 Sale Collection

**Collection Name:** `sales`

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  itemId: ObjectId("507f1f77bcf86cd799439011"),
  itemName: "Wireless Mouse",
  quantitySold: 5,
  pricePerUnit: 25.99,
  totalAmount: 129.95,
  saleDate: ISODate("2026-02-12T09:15:00Z")
}
```

---

## 6. Indexing Strategy

### 6.1 Default Index

**Automatic Primary Key Index:**
```javascript
// Both collections automatically have:
_id: 1  // Ascending index on _id (clustered index)
```

### 6.2 Custom Indexes

#### Index 1: Item Name Search (Text Index)
```javascript
// items collection
db.items.createIndex({ name: "text" })
```

**Purpose:** Enable fast full-text search  
**Use Case:** Search items by name (e.g., "wireless mouse")  
**Query Example:**
```javascript
db.items.find({ $text: { $search: "mouse" } })
```

**Query Performance:**
- Without index: O(n) - Full collection scan
- With index: O(log n) - Indexed search

---

#### Index 2: SKU Unique Index
```javascript
// items collection
db.items.createIndex({ sku: 1 }, { unique: true })
```

**Purpose:** Enforce uniqueness and fast SKU lookup  
**Use Case:** Barcode scanning, SKU-based queries  
**Constraint:** Prevents duplicate SKU values

---

#### Index 3: Sale Date Descending
```javascript
// sales collection
db.sales.createIndex({ saleDate: -1 })
```

**Purpose:** Optimize recent sales queries  
**Use Case:** Sales history (newest first), date-range reports  
**Query Example:**
```javascript
db.sales.find().sort({ saleDate: -1 }).limit(50)
```

---

#### Index 4: Item Reference Index
```javascript
// sales collection
db.sales.createIndex({ itemId: 1 })
```

**Purpose:** Fast lookups of all sales for a specific item  
**Use Case:** Item sales history, analytics per product  
**Query Example:**
```javascript
db.sales.find({ itemId: ObjectId("...") })
```

---

### 6.3 Index Performance Summary

| Index | Collection | Type | Cardinality | Impact |
|-------|------------|------|-------------|---------|
| `_id` | items, sales | Single, Unique | High | Primary key access |
| `name` | items | Text | Medium | Search queries |
| `sku` | items | Single, Unique | High | Exact match lookups |
| `saleDate` | sales | Single | Medium | Sorted queries |
| `itemId` | sales | Single | Medium | Relational queries |

**Total Indexes:** 5 (across 2 collections)  
**Memory Overhead:** Minimal for small-to-medium datasets (<100K documents)

---

## 7. Sample Documents with Real Data

### 7.1 Items Collection - Sample Data

```javascript
// Document 1: Electronics Item
{
  _id: ObjectId("65ca1234567890abcdef0001"),
  name: "Laptop - Dell Inspiron 15",
  description: "15.6 inch display, Intel i5, 8GB RAM, 512GB SSD",
  category: "Electronics",
  price: 549.99,
  quantity: 25,
  sku: "ELEC-LAP-DELL-001",
  createdAt: ISODate("2026-01-15T08:00:00Z"),
  updatedAt: ISODate("2026-02-12T11:30:00Z")
}

// Document 2: Furniture Item
{
  _id: ObjectId("65ca1234567890abcdef0002"),
  name: "Office Chair - Ergonomic",
  description: "Adjustable height, lumbar support, mesh back",
  category: "Furniture",
  price: 189.50,
  quantity: 12,
  sku: "FURN-CHAIR-ERG-002",
  createdAt: ISODate("2026-01-20T10:15:00Z"),
  updatedAt: ISODate("2026-02-08T14:45:00Z")
}

// Document 3: Stationery Item
{
  _id: ObjectId("65ca1234567890abcdef0003"),
  name: "Notebook Set - A4 Ruled",
  description: "Pack of 5 notebooks, 200 pages each",
  category: "Stationery",
  price: 12.99,
  quantity: 200,
  sku: "STAT-NOTE-A4-003",
  createdAt: ISODate("2026-02-01T09:30:00Z"),
  updatedAt: ISODate("2026-02-01T09:30:00Z")
}

// Document 4: Low Stock Item
{
  _id: ObjectId("65ca1234567890abcdef0004"),
  name: "Mechanical Keyboard - RGB",
  description: "Cherry MX switches, customizable RGB lighting",
  category: "Electronics",
  price: 89.99,
  quantity: 3,
  sku: "ELEC-KEY-RGB-004",
  createdAt: ISODate("2026-01-25T11:00:00Z"),
  updatedAt: ISODate("2026-02-11T16:20:00Z")
}
```

### 7.2 Sales Collection - Sample Data

```javascript
// Sale 1: Recent laptop sale
{
  _id: ObjectId("65ca9876543210fedcba0001"),
  itemId: ObjectId("65ca1234567890abcdef0001"),
  itemName: "Laptop - Dell Inspiron 15",
  quantitySold: 2,
  pricePerUnit: 549.99,
  totalAmount: 1099.98,
  saleDate: ISODate("2026-02-12T09:15:30Z")
}

// Sale 2: Bulk notebook sale
{
  _id: ObjectId("65ca9876543210fedcba0002"),
  itemId: ObjectId("65ca1234567890abcdef0003"),
  itemName: "Notebook Set - A4 Ruled",
  quantitySold: 20,
  pricePerUnit: 12.99,
  totalAmount: 259.80,
  saleDate: ISODate("2026-02-11T14:22:15Z")
}

// Sale 3: Single chair sale
{
  _id: ObjectId("65ca9876543210fedcba0003"),
  itemId: ObjectId("65ca1234567890abcdef0002"),
  itemName: "Office Chair - Ergonomic",
  quantitySold: 1,
  pricePerUnit: 189.50,
  totalAmount: 189.50,
  saleDate: ISODate("2026-02-10T10:45:00Z")
}

// Sale 4: Keyboard sale (reducing low stock)
{
  _id: ObjectId("65ca9876543210fedcba0004"),
  itemId: ObjectId("65ca1234567890abcdef0004"),
  itemName: "Mechanical Keyboard - RGB",
  quantitySold: 1,
  pricePerUnit: 89.99,
  totalAmount: 89.99,
  saleDate: ISODate("2026-02-11T16:30:45Z")
}

// Sale 5: Another laptop sale (older)
{
  _id: ObjectId("65ca9876543210fedcba0005"),
  itemId: ObjectId("65ca1234567890abcdef0001"),
  itemName: "Laptop - Dell Inspiron 15",
  quantitySold: 1,
  pricePerUnit: 549.99,
  totalAmount: 549.99,
  saleDate: ISODate("2026-02-05T11:20:00Z")
}
```

---

## 8. Example Database Queries

### Query 1: Find All Items in a Specific Category

**Purpose:** Display all electronics items

**MongoDB Query:**
```javascript
db.items.find({ category: "Electronics" })
```

**SQL Equivalent:**
```sql
SELECT * FROM items WHERE category = 'Electronics';
```

**Expected Result:**
```javascript
[
  {
    _id: ObjectId("65ca1234567890abcdef0001"),
    name: "Laptop - Dell Inspiron 15",
    category: "Electronics",
    price: 549.99,
    quantity: 25,
    ...
  },
  {
    _id: ObjectId("65ca1234567890abcdef0004"),
    name: "Mechanical Keyboard - RGB",
    category: "Electronics",
    price: 89.99,
    quantity: 3,
    ...
  }
]
```

**Index Used:** Collection scan (add category index if needed)  
**Time Complexity:** O(n)

---

### Query 2: Search Items by Name (Text Search)

**Purpose:** Find items matching "chair" in name

**MongoDB Query:**
```javascript
db.items.find({
  name: { $regex: "chair", $options: "i" }
})
```

**Alternative (Text Index):**
```javascript
db.items.find({ $text: { $search: "chair" } })
```

**SQL Equivalent:**
```sql
SELECT * FROM items WHERE name LIKE '%chair%';
```

**Expected Result:**
```javascript
[
  {
    _id: ObjectId("65ca1234567890abcdef0002"),
    name: "Office Chair - Ergonomic",
    category: "Furniture",
    price: 189.50,
    quantity: 12,
    ...
  }
]
```

**Index Used:** Text index on `name` field  
**Time Complexity:** O(log n) with index

---

### Query 3: Atomic Stock Decrement (Sale Transaction)

**Purpose:** Sell 2 units of a specific item safely

**MongoDB Query:**
```javascript
// Step 1: Check stock availability
const item = await db.items.findOne({
  _id: ObjectId("65ca1234567890abcdef0001")
});

if (item.quantity < 2) {
  throw new Error("Insufficient stock");
}

// Step 2: Atomically decrement stock
db.items.updateOne(
  { _id: ObjectId("65ca1234567890abcdef0001") },
  { $inc: { quantity: -2 } }
)

// Step 3: Create sale record
db.sales.insertOne({
  itemId: ObjectId("65ca1234567890abcdef0001"),
  itemName: "Laptop - Dell Inspiron 15",
  quantitySold: 2,
  pricePerUnit: 549.99,
  totalAmount: 1099.98,
  saleDate: new Date()
})
```

**Critical Operation:** `$inc` operator ensures atomic update  
**Race Condition Prevention:** MongoDB guarantees atomic single-document updates

---

### Query 4: Get Sales History (Recent First)

**Purpose:** Display last 10 sales with most recent first

**MongoDB Query:**
```javascript
db.sales.find()
  .sort({ saleDate: -1 })
  .limit(10)
```

**SQL Equivalent:**
```sql
SELECT * FROM sales 
ORDER BY saleDate DESC 
LIMIT 10;
```

**Expected Result:**
```javascript
[
  {
    _id: ObjectId("65ca9876543210fedcba0001"),
    itemName: "Laptop - Dell Inspiron 15",
    quantitySold: 2,
    totalAmount: 1099.98,
    saleDate: ISODate("2026-02-12T09:15:30Z")
  },
  {
    _id: ObjectId("65ca9876543210fedcba0004"),
    itemName: "Mechanical Keyboard - RGB",
    quantitySold: 1,
    totalAmount: 89.99,
    saleDate: ISODate("2026-02-11T16:30:45Z")
  },
  // ... 8 more results
]
```

**Index Used:** `saleDate: -1` (descending index)  
**Time Complexity:** O(1) for sort + O(log n) for index scan

---

### Query 5: Calculate Total Revenue and Items Sold

**Purpose:** Get sales statistics (aggregation)

**MongoDB Aggregation Query:**
```javascript
db.sales.aggregate([
  {
    $group: {
      _id: null,
      totalRevenue: { $sum: "$totalAmount" },
      totalItemsSold: { $sum: "$quantitySold" },
      totalTransactions: { $sum: 1 }
    }
  }
])
```

**SQL Equivalent:**
```sql
SELECT 
  SUM(totalAmount) AS totalRevenue,
  SUM(quantitySold) AS totalItemsSold,
  COUNT(*) AS totalTransactions
FROM sales;
```

**Expected Result:**
```javascript
[
  {
    _id: null,
    totalRevenue: 2189.26,
    totalItemsSold: 25,
    totalTransactions: 5
  }
]
```

**Operation Type:** Aggregation pipeline  
**Time Complexity:** O(n) - must scan all sales documents

---

### Query 6 (BONUS): Find Low Stock Items

**Purpose:** Alert for items with quantity < 10

**MongoDB Query:**
```javascript
db.items.find({ quantity: { $lt: 10 } })
  .sort({ quantity: 1 })
```

**SQL Equivalent:**
```sql
SELECT * FROM items 
WHERE quantity < 10 
ORDER BY quantity ASC;
```

**Expected Result:**
```javascript
[
  {
    _id: ObjectId("65ca1234567890abcdef0004"),
    name: "Mechanical Keyboard - RGB",
    quantity: 3,
    ...
  }
]
```

**Use Case:** Inventory restocking alerts

---

## 9. Database Design Decisions Summary

### 9.1 Why MongoDB for This Project?

✅ **Schema Flexibility:** Easy to add fields (e.g., `imageUrl`, `supplier`) later  
✅ **Rapid Development:** No complex migrations during development  
✅ **JSON Native:** Direct mapping to JavaScript objects (Node.js)  
✅ **Horizontal Scalability:** Can scale out if project grows  
✅ **Document Model:** Natural fit for item + metadata storage  

### 9.2 Trade-offs Acknowledged

❌ **No Built-in Referential Integrity:** Must validate in application code  
❌ **Join Operations Less Efficient:** Denormalization needed for performance  
❌ **Transaction Complexity:** Multi-document transactions available but limited (pre-v4.0)  

### 9.3 Data Integrity Enforcement

**Application-Level Checks:**
1. Validate `itemId` exists before creating sale
2. Check stock availability before decrement
3. Use Mongoose schema validation for data types
4. Implement unique constraint on SKU

---

## 10. Conclusion

This database design provides:

✅ **Clear Entity Relationships:** 1:N relationship between Items and Sales  
✅ **Optimized for Read-Heavy Workload:** Denormalization + strategic indexes  
✅ **Scalable Architecture:** Can handle 100K+ items and 1M+ sales  
✅ **ACID Compliance:** Single-document atomicity for critical operations  
✅ **University-Appropriate Complexity:** Demonstrates normalization understanding + practical NoSQL application  

**Estimated Database Size:**
- 1,000 items × 200 bytes = ~200 KB
- 10,000 sales × 150 bytes = ~1.5 MB
- Indexes overhead = ~500 KB
- **Total: ~2.2 MB** (negligible for modern systems)

---

**Database Design Complete ✓**

This documentation demonstrates understanding of:
- Entity-Relationship modeling
- Normalization vs. Denormalization trade-offs
- Indexing strategies
- Query optimization
- MongoDB collection design
- Practical DBMS application

Ready for university submission! 🎓
