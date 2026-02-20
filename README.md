# Inventory Management System

A full-stack inventory management system for DBMS Assignment.

## 🚀 Quick Setup (After Cloning)

**Important:** After cloning this repository, you MUST configure environment variables:

### Backend Setup
1. Navigate to backend folder: `cd backend`
2. Install dependencies: `npm install`
3. **Create `.env` file:** `cp .env.example .env`
4. Update MongoDB connection and other settings in `.env`
5. Start server: `npm start`

### Frontend Setup  
1. Navigate to frontend folder: `cd frontend-react`
2. Install dependencies: `npm install`
3. **Create `.env` file:** `cp .env.example .env`
4. Update API URL if needed (default: `http://localhost:5000/api`)
5. Start app: `npm start`

## 🔧 Common Issues

### "Network Error" on Login
- Ensure backend server is running on port 5000
- Check `frontend-react/.env` has correct `REACT_APP_API_URL`
- After changing `.env`, restart the frontend (`Ctrl+C` then `npm start`)

### Database Connection Error
- Verify MongoDB is running locally or update `MONGO_URI` in `backend/.env`

📖 See [SETUP_INSTRUCTIONS.md](SETUP_INSTRUCTIONS.md) for detailed setup guide.
