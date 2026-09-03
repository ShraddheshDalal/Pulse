const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pulse';

let isConnected = false;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn('MongoDB connection failed. Running in demo mode with in-memory data.');
    console.warn(`Error: ${error.message}`);
    isConnected = false;
    return false;
  }
};

const getConnectionStatus = () => isConnected;

module.exports = { connectDB, getConnectionStatus };
