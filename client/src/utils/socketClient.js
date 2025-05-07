import { io } from 'socket.io-client';

// Set the API URL with fallback
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let socket = null;
let reconnectTimer = null;

/**
 * Initialize socket connection with authentication
 * @param {string} token - JWT authentication token
 * @returns {object} - The socket instance
 */
export const initializeSocket = (token) => {
  if (socket?.connected) {
    console.log("Socket already connected");
    return socket;
  }

  if (!token) {
    console.error("No token provided for socket connection");
    return null;
  }

  try {
    console.log("Initializing socket connection to:", API_URL);
    
    // Clear any existing reconnect timer
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    // Close existing socket if it exists
    if (socket) {
      socket.disconnect();
      socket = null;
    }
    
    // Create socket connection with authentication
    socket = io(API_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });

    // Socket event handlers
    socket.on('connect', () => {
      console.log('Socket connected successfully with ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      
      // Set up a manual reconnect if socket.io's built-in reconnect fails
      if (!reconnectTimer) {
        reconnectTimer = setTimeout(() => {
          console.log("Attempting manual reconnection...");
          initializeSocket(token);
        }, 5000);
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      
      // If server disconnected us, try to reconnect
      if (reason === 'io server disconnect') {
        if (!reconnectTimer) {
          reconnectTimer = setTimeout(() => {
            console.log("Attempting manual reconnection after server disconnect...");
            initializeSocket(token);
          }, 5000);
        }
      }
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket reconnected after ${attemptNumber} attempts`);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  } catch (error) {
    console.error('Error initializing socket:', error);
    return null;
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
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  
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
  if (!socket) {
    console.error('Socket not initialized when trying to join task room');
    return;
  }
  
  if (!taskId) {
    console.error('Invalid taskId provided to joinTaskRoom');
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
  if (!socket) {
    console.error('Socket not initialized when trying to leave task room');
    return;
  }
  
  if (!taskId) {
    console.error('Invalid taskId provided to leaveTaskRoom');
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
  
  if (typeof callback !== 'function') {
    console.error('Callback must be a function');
    return () => {};
  }
  
  // Remove existing listeners to prevent duplicates
  socket.off('notification');
  
  // Add new listener
  socket.on('notification', (data) => {
    console.log('Received notification:', data);
    if (data && typeof data === 'object') {
      callback(data);
    } else {
      console.error('Received invalid notification data:', data);
    }
  });
  
  // Return unsubscribe function
  return () => {
    if (socket) {
      socket.off('notification');
    }
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
  
  if (typeof callback !== 'function') {
    console.error('Callback must be a function');
    return () => {};
  }
  
  // Remove existing listeners to prevent duplicates
  socket.off('taskUpdated');
  
  // Add new listener
  socket.on('taskUpdated', (data) => {
    console.log('Received task update:', data);
    if (data && typeof data === 'object') {
      callback(data);
    } else {
      console.error('Received invalid task update data:', data);
    }
  });
  
  // Return unsubscribe function
  return () => {
    if (socket) {
      socket.off('taskUpdated');
    }
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
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
    }

    const data = await response.json();
    return data;
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
      },
      body: JSON.stringify({ read: true })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
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
      const errorText = await response.text();
      throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return { success: false, error: error.message };
  }
};