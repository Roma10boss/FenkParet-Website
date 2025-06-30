// config/database.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/haitian-ecommerce';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    const conn = await mongoose.connect(mongoUri, options);
    
    console.log(` MongoDB connected: ${conn.connection.host}`);
    console.log(`=Ê Database: ${conn.connection.name}`);
    
    return conn;
  } catch (error) {
    console.error('L MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log(' MongoDB connection closed');
  } catch (error) {
    console.error('L Error closing MongoDB connection:', error.message);
  }
};

module.exports = {
  connectDB,
  disconnectDB
};