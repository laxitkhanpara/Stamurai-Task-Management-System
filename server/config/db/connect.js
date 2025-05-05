const mongoose = require('mongoose');
const env = require('dotenv').config();


const connectDB = async () => {
  try {
    mongoose.connect(process.env.MONGODB_URI)
    console.log("Connected to MongoDB...")

  } catch (err) {
    console.log(err.message);

  }
}

module.exports = connectDB;