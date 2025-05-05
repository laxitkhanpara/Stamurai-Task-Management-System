// Updated app.js with improved timeout and error handling

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
// Load environment variables
dotenv.config();
const port = process.env.PORT || 4000 

const app = express();
const connectDB = require('./config/db/connect.js');
const authRoutes = require('./routes/authRoute.js');
const taskRoute = require('./routes/taskRoute.js');
const notificationRoute = require('./routes/notificationRoute.js');

// Middleware
app.use(cors());
app.use(express.json());

// Basic health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Monitor MongoDB connection
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
  // Attempt to reconnect
  setTimeout(() => {
    connectDB();
  }, 5000);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoute);
app.use('/api/notification', notificationRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Set up database connection
connectDB()
  .then(() => {
    // Only start server after successful DB connection
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Configure timeouts
    server.timeout = 120000; // 2 minutes

    // Keep alive settings
    server.keepAliveTimeout = 65000; // 65 seconds
    server.headersTimeout = 66000; // slightly more than keepAliveTimeout

    // Handle server errors
    server.on('error', (error) => {
      console.error('Server error:', error);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });