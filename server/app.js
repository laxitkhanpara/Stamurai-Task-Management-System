const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const setupSocket = require('./sockets');

// Load environment variables
dotenv.config();
const port = process.env.PORT || 4000;

const app = express();
const server = http.createServer(app);
const io = setupSocket(server);

// Make io accessible to routes
app.set('io', io);

const connectDB = require('./config/db/connect.js');
const authRoutes = require('./routes/authRoute.js');
const taskRoutes = require('./routes/taskRoute.js');
const notificationRoutes = require('./routes/notificationRoute.js');

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

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
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Set up database connection
connectDB()
  .then(() => {
    // Start server after successful DB connection
    server.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });

    // Configure timeouts
    server.timeout = 120000; // 2 minutes
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