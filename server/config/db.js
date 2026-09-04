const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const getMongoUri = () => {
  return process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pulse';
};

let isConnected = false;

const connectDB = async () => {
  const uri = getMongoUri();
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    console.log(`MongoDB connected: ${conn.connection.host}:${conn.connection.port || 27017}/${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`MongoDB connection failed (${uri}). Running in demo mode with in-memory data.`);
    console.warn(`Error: ${error.message}`);
    isConnected = false;
    return false;
  }
};

const getConnectionStatus = () => isConnected;

module.exports = { connectDB, getConnectionStatus };
