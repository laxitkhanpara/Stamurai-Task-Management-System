// lib/socket.js
import { io } from 'socket.io-client';

let socket;

export const initializeSocket = (token) => {
  if (socket) return socket;

  // Create socket connection
  socket = io(process.env.NEXT_PUBLIC_API_URL || '', {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // Setup event listeners
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

export const joinTaskRoom = (taskId) => {
  if (socket) {
    socket.emit('joinTask', taskId);
  }
};

export const leaveTaskRoom = (taskId) => {
  if (socket) {
    socket.emit('leaveTask', taskId);
  }
};

export const subscribeToNotifications = (callback) => {
  if (socket) {
    socket.on('notification', callback);
    return () => socket.off('notification', callback);
  }
  return () => { };
};

export const subscribeToTaskUpdates = (callback) => {
  if (socket) {
    socket.on('taskUpdated', callback);
    return () => socket.off('taskUpdated', callback);
  }
  return () => { };
};