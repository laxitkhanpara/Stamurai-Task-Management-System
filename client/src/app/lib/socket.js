import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialize socket connection with authentication
 * @param {string} token - JWT authentication token
 * @returns {object} - The socket instance
 */
export const initializeSocket = (token) => {
  if (!token) {
    console.error('Cannot initialize socket: No token provided');
    return null;
  }

  // Close existing socket if it exists
  if (socket) {
    console.log('Closing existing socket connection before reinitializing');
    socket.disconnect();
    socket = null;
  }

  console.log("Initializing socket connection to:", API_URL);
  
  // Create socket connection with authentication
  socket = io(API_URL, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 3000,
    timeout: 10000 // Add timeout to detect connection issues faster
  });

  // Enhanced Socket event handlers
  socket.on('connect', () => {
    console.log('Socket connected successfully with ID:', socket.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error.message);
    // You might want to attempt token refresh here if it's an auth error
  });

  socket.on('error', (error) => {
    console.error('Socket general error:', error);
  });

  socket.on('disconnect', (reason) => {
    console.log(`Socket disconnected: ${reason}`);
    
    // If server disconnected us, try to reconnect automatically
    if (reason === 'io server disconnect') {
      console.log('Attempting to reconnect...');
      socket.connect();
    }
  });

  socket.on('reconnect', (attemptNumber) => {
    console.log(`Socket reconnected after ${attemptNumber} attempts`);
  });

  socket.on('reconnect_error', (error) => {
    console.error('Socket reconnection error:', error);
  });

  socket.on('reconnect_failed', () => {
    console.error('Socket reconnection failed - maximum attempts reached');
  });

  return socket;
};

/**
 * Get the current socket instance
 * @returns {object|null} - The socket instance or null if not initialized
 */
export const getSocket = () => socket;

/**
 * Check if socket is connected
 * @returns {boolean} - Socket connection status
 */
export const isSocketConnected = () => {
  return socket && socket.connected;
};

/**
 * Reconnect socket if disconnected
 * @param {string} token - JWT authentication token
 * @returns {object} - The socket instance
 */
export const ensureSocketConnection = (token) => {
  if (!socket || !socket.connected) {
    console.log('Socket not connected, reinitializing...');
    return initializeSocket(token);
  }
  return socket;
};

/**
 * Disconnect the socket
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected by client');
  }
};

/**
 * Join a task room to receive task-specific updates
 * @param {string} taskId - The ID of the task to join
 */
export const joinTaskRoom = (taskId) => {
  if (!taskId) {
    console.error('Cannot join task room: No taskId provided');
    return;
  }

  if (!socket) {
    console.error('Cannot join task room: Socket not initialized');
    return;
  }

  if (!socket.connected) {
    console.warn('Socket disconnected when trying to join task room. Connection status:', socket.connected);
    return;
  }

  socket.emit('joinTask', taskId);
  console.log(`Joined task room: ${taskId}`);
};

/**
 * Leave a task room
 * @param {string} taskId - The ID of the task to leave
 */
export const leaveTaskRoom = (taskId) => {
  if (!taskId) {
    console.error('Cannot leave task room: No taskId provided');
    return;
  }

  if (!socket) {
    console.error('Cannot leave task room: Socket not initialized');
    return;
  }

  if (!socket.connected) {
    console.warn('Socket disconnected when trying to leave task room');
    return;
  }

  socket.emit('leaveTask', taskId);
  console.log(`Left task room: ${taskId}`);
};

/**
 * Subscribe to notifications
 * @param {function} callback - Function to call when a notification is received
 * @returns {function} - Unsubscribe function
 */
export const subscribeToNotifications = (callback) => {
  if (!socket) {
    console.error('Socket not initialized when subscribing to notifications');
    return () => {};
  }
  
  if (!socket.connected) {
    console.warn('Socket disconnected when subscribing to notifications');
  }
  
  // Remove existing listeners to prevent duplicates
  socket.off('notification');
  
  // Add new listener
  socket.on('notification', (data) => {
    console.log('Received notification:', data);
    if (typeof callback === 'function') {
      callback(data);
    } else {
      console.error('Notification callback is not a function');
    }
  });
  
  // Return unsubscribe function
  return () => {
    socket.off('notification');
  };
};

// Rest of your functions...

/**
 * Fetch notifications from the API
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise that resolves to notifications data
 */
export const fetchNotifications = async (token) => {
  if (!token) {
    console.error('No token provided for fetching notifications');
    return { success: false, error: 'No authentication token' };
  }

  try {
    console.log(`Fetching notifications from ${API_URL}/api/notifications`);
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error response: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Notifications fetch response:', data);
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message };
  }
};