const express = require('express');
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Apply the auth middleware to all routes
router.use(protect);

// Get all notifications
router.get('/', getNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Mark single notification as read/delete notification
router.route('/:id')
  .put(markAsRead)
  .delete(deleteNotification);

module.exports = router;