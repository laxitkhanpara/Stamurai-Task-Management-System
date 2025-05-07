// Updated config/db/connect.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

/**
 * @function connectDB
 * @description Connect to MongoDB database using Mongoose.
 * @return {*} 
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // Timeout after 10s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      connectTimeoutMS: 10000, // Give up initial connection after 10s
      heartbeatFrequencyMS: 30000, // Check connection health every 30s
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });
    console.log("Connected to MongoDB...");
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    // Don't just log error - throw it so it can be caught by the caller
    throw err;
  }
};

module.exports = connectDB;