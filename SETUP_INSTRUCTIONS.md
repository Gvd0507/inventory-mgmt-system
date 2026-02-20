# Setup Instructions for New Devices

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file from the example:
```bash
cp .env.example .env
```

Update the `.env` file with your MongoDB connection string:
```
MONGO_URI=mongodb://localhost:27017/inventory_management
JWT_SECRET=your_secure_secret_key
PORT=5000
NODE_ENV=development
```

Start the backend:
```bash
npm start
```

### 2. Frontend Setup

```bash
cd frontend-react
npm install
```

Create `.env` file from the example:
```bash
cp .env.example .env
```

The `.env` file should contain:
```
REACT_APP_API_URL=http://localhost:5000/api
```

**Important:** If your backend is running on a different port or domain, update `REACT_APP_API_URL` accordingly.

Start the frontend:
```bash
npm start
```

### 3. MongoDB Setup

Make sure MongoDB is running on your machine:
- Local: `mongodb://localhost:27017`
- Or use MongoDB Atlas cloud connection string

## Troubleshooting Network Errors

If you encounter "Network Error" when trying to login:

1. **Check Backend is Running:** Make sure the backend server is running on the correct port
2. **Verify API URL:** Check `frontend-react/.env` has the correct `REACT_APP_API_URL`
3. **CORS Issues:** If accessing from different host, ensure backend CORS is configured
4. **MongoDB Connection:** Verify MongoDB is running and accessible
5. **After changing .env:** Restart the frontend dev server (Ctrl+C and `npm start` again)

## Environment Variables

### Backend (backend/.env)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

### Frontend (frontend-react/.env)
- `REACT_APP_API_URL`: Backend API URL (must include /api path)

## For Production Deployment

1. Update `REACT_APP_API_URL` to your production API domain
2. Change `JWT_SECRET` to a strong, random secret
3. Use MongoDB Atlas or secure MongoDB instance
4. Set `NODE_ENV=production`
