const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

const setupSocket = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      // Get token from handshake auth
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find user
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('User not found'));
      }
      
      // Attach user to socket
      socket.user = user;
      next();
    } catch (error) {
      return next(new Error('Authentication error'));
    }
  });
  
  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.name} (${socket.user._id})`);
    
    // Join user-specific room
    socket.join(`user-${socket.user._id}`);
    
    // Listen for task-related events
    socket.on('joinTask', (taskId) => {
      socket.join(`task-${taskId}`);
      console.log(`${socket.user.name} joined task room: ${taskId}`);
    });
    
    socket.on('leaveTask', (taskId) => {
      socket.leave(`task-${taskId}`);
      console.log(`${socket.user.name} left task room: ${taskId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.name}`);
    });
  });
  
  return {
    // Function to send notification to a user
    sendNotification: (userId, notification) => {
      io.to(`user-${userId}`).emit('notification', notification);
    },
    
    // Function to broadcast task updates
    taskUpdated: (taskId, task) => {
      io.to(`task-${taskId}`).emit('taskUpdated', task);
    }
  };
};

module.exports = setupSocket;