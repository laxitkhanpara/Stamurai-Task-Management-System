// sockets/index.js
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

const setupSocket = (server) => {
  // Initialize Socket.IO with CORS configuration
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true
    },
    // Prevent multiple connections from the same client
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    }
  });

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
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);
    
    // Join user-specific room for direct notifications
    const userRoom = `user-${socket.user._id}`;
    socket.join(userRoom);
    console.log(`User joined room: ${userRoom}`);
    
    // Handle task room joining
    socket.on('joinTask', (taskId) => {
      if (!taskId) return;
      
      const roomName = `task-${taskId}`;
      socket.join(roomName);
      console.log(`${socket.user.name} joined task room: ${roomName}`);
    });
    
    // Handle leaving task room
    socket.on('leaveTask', (taskId) => {
      if (!taskId) return;
      
      const roomName = `task-${taskId}`;
      socket.leave(roomName);
      console.log(`${socket.user.name} left task room: ${roomName}`);
    });
    
    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`User disconnected: ${socket.user.name} (${socket.user._id}), reason: ${reason}`);
    });
  });

  return {
    // Function to send notification to a specific user
    sendNotification: (userId, notification) => {
      if (!userId || !notification) {
        console.error('Invalid parameters for sendNotification');
        return;
      }
      
      console.log(`Sending notification to user-${userId}:`, notification);
      io.to(`user-${userId}`).emit('notification', notification);
    },
    
    // Function to broadcast task updates to all users in a task room
    taskUpdated: (taskId, task) => {
      if (!taskId || !task) {
        console.error('Invalid parameters for taskUpdated');
        return;
      }
      
      console.log(`Broadcasting task update to task-${taskId}`);
      io.to(`task-${taskId}`).emit('taskUpdated', task);
    },
    
    // Get the socket.io instance
    getIO: () => io
  };
};

module.exports = setupSocket;