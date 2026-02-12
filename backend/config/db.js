const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * Uses connection string from .env file
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('1. Check if MongoDB is running (if using local)');
    console.error('2. Verify MONGODB_URI in .env file');
    console.error('3. Check internet connection (if using MongoDB Atlas)\n');
    process.exit(1);
  }
};

module.exports = connectDB;
