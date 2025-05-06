import { io } from 'socket.io-client';

// Set the API URL with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket = null;

/**
 * Initialize socket connection with authentication
 * @param {string} token - JWT authentication token
 * @returns {object} - The socket instance
 */
export const initializeSocket = (token) => {
  if (!socket && token) {
    console.log("Initializing socket connection to:", API_URL);
    
    // Create socket connection with authentication
    socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000
    });

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Socket connected successfully');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });
  }

  return socket;
};

/**
 * Get the current socket instance
 * @returns {object|null} - The socket instance or null if not initialized
 */
export const getSocket = () => socket;

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
  if (socket && taskId) {
    socket.emit('joinTask', taskId);
    console.log(`Joined task room: ${taskId}`);
  } else if (!socket) {
    console.error('Socket not initialized when trying to join task room');
  }
};

/**
 * Leave a task room
 * @param {string} taskId - The ID of the task to leave
 */
export const leaveTaskRoom = (taskId) => {
  if (socket && taskId) {
    socket.emit('leaveTask', taskId);
    console.log(`Left task room: ${taskId}`);
  } else if (!socket) {
    console.error('Socket not initialized when trying to leave task room');
  }
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
  
  // Remove existing listeners to prevent duplicates
  socket.off('notification');
  
  // Add new listener
  socket.on('notification', (data) => {
    console.log('Received notification:', data);
    callback(data);
  });
  
  // Return unsubscribe function
  return () => {
    socket.off('notification');
  };
};

/**
 * Subscribe to task updates
 * @param {function} callback - Function to call when a task update is received
 * @returns {function} - Unsubscribe function
 */
export const subscribeToTaskUpdates = (callback) => {
  if (!socket) {
    console.error('Socket not initialized when subscribing to task updates');
    return () => {};
  }
  
  // Remove existing listeners to prevent duplicates
  socket.off('taskUpdated');
  
  // Add new listener
  socket.on('taskUpdated', (data) => {
    console.log('Received task update:', data);
    callback(data);
  });
  
  // Return unsubscribe function
  return () => {
    socket.off('taskUpdated');
  };
};

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
    const response = await fetch(`${API_URL}/api/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise that resolves to the updated notification
 */
export const markNotificationAsRead = async (notificationId, token) => {
  if (!token || !notificationId) {
    console.error('Missing token or notification ID');
    return { success: false, error: 'Missing required parameters' };
  }

  try {
    const response = await fetch(`${API_URL}/api/notifications/${notificationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Mark all notifications as read
 * @param {string} token - JWT authentication token
 * @returns {Promise} - Promise that resolves to success message
 */
export const markAllNotificationsAsRead = async (token) => {
  if (!token) {
    console.error('No token provided for marking all notifications as read');
    return { success: false, error: 'No authentication token' };
  }

  try {
    const response = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};