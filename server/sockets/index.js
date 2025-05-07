// sockets/index.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

const setupSocket = (server) => {
  // Initialize Socket.IO with CORS configuration
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    // Prevent multiple connections from the same client
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    }
  });

  // Track connected users
  const connectedUsers = new Map();

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      return next(new Error(`Authentication error: ${error.message}`));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    
    console.log(`User connected: ${socket.user.name} (${userId}), Socket ID: ${socket.id}`);
    
    // Store user connection
    connectedUsers.set(userId, socket.id);
    
    // Join user-specific room for direct notifications
    const userRoom = `user-${userId}`;
    socket.join(userRoom);
    console.log(`User joined room: ${userRoom}`);
    
    // Send connection confirmation to client
    socket.emit('connected', { status: 'connected', userId });
    
    // Handle task room joining
    socket.on('joinTask', (taskId) => {
      if (!taskId) {
        socket.emit('error', { message: 'Invalid task ID provided' });
        return;
      }
      
      const roomName = `task-${taskId}`;
      socket.join(roomName);
      console.log(`${socket.user.name} joined task room: ${roomName}`);
      
      // Confirm joining
      socket.emit('joinedTask', { taskId });
    });
    
    // Handle leaving task room
    socket.on('leaveTask', (taskId) => {
      if (!taskId) {
        socket.emit('error', { message: 'Invalid task ID provided' });
        return;
      }
      
      const roomName = `task-${taskId}`;
      socket.leave(roomName);
      console.log(`${socket.user.name} left task room: ${roomName}`);
      
      // Confirm leaving
      socket.emit('leftTask', { taskId });
    });
    
    // Handle client pings to keep connection alive
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: new Date().toISOString() });
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user.name} (${userId}), reason: ${reason}`);
      
      // Remove from connected users
      if (connectedUsers.get(userId) === socket.id) {
        connectedUsers.delete(userId);
      }
    });
  });

  // Utility to check if a user is connected
  const isUserConnected = (userId) => {
    return connectedUsers.has(userId.toString());
  };

  return {
    // Function to send notification to a specific user
    sendNotification: (userId, notification) => {
      if (!userId || !notification) {
        console.error('Invalid parameters for sendNotification');
        return false;
      }
      
      const userIdString = userId.toString();
      
      // Log whether user is connected
      const isConnected = isUserConnected(userIdString);
      console.log(`Sending notification to user-${userIdString} (connected: ${isConnected}):`, notification);
      
      // Send notification
      io.to(`user-${userIdString}`).emit('notification', notification);
      return true;
    },
    
    // Function to broadcast task updates to all users in a task room
    taskUpdated: (taskId, task) => {
      if (!taskId || !task) {
        console.error('Invalid parameters for taskUpdated');
        return false;
      }
      
      console.log(`Broadcasting task update to task-${taskId}`);
      io.to(`task-${taskId}`).emit('taskUpdated', task);
      return true;
    },
    
    // Function to check if a specific user is connected
    isUserConnected,
    
    // Get the socket.io instance
    getIO: () => io
  };
};

module.exports = setupSocket;