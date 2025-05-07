const mongoose = require('mongoose');

/**
 * @typedef {Object} Notification
 * @description Notification schema representing a notification in the system.
 * @author Laxit Khanpara
 */
const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['task_assigned', 'task_updated', 'task_completed', 'comment_added', 'due_soon'],
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for querying notifications
NotificationSchema.index({ recipient: 1, read: 1 });

const Notification = mongoose.model('Notification', NotificationSchema);
module.exports = Notification;