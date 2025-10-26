const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      return;
    }

    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/country_currency_api';
    
    // In test environment, use a shorter timeout
    const connectOptions = {};
    
    if (process.env.NODE_ENV === 'test') {
      connectOptions.serverSelectionTimeoutMS = 2000; // 2 second timeout for tests
    }
    
    const conn = await mongoose.connect(mongoUri, connectOptions);

    if (process.env.NODE_ENV !== 'test') {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    }
  } catch (error) {
    // Silently fail in test mode
    if (process.env.NODE_ENV === 'test') {
      throw error; // Re-throw for test handling
    }
    
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB
};
