const Notification = require('../models/NotificationSchema');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .sort('-createdAt')
      .populate([
        { path: 'sender', select: 'name' },
        { path: 'task', select: 'title' }
      ]);

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error(`Error in getNotifications: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this notification'
      });
    }

    notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error(`Error in markAsRead: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, read: false },
      { read: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error(`Error in markAllAsRead: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    // Check if notification belongs to user
    if (notification.recipient.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this notification'
      });
    }

    await notification.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(`Error in deleteNotification: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};