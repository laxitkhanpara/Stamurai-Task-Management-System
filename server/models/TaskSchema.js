const mongoose = require('mongoose');
/**
 * @typedef {Object} Task
 * @description Task schema representing a task in the system.
 * @author Laxit Khanpara
 */
const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'review', 'completed'],
    default: 'todo'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    required: [true, 'Please add a due date']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', ''],
      default: ''
    },
    endDate: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create index for search functionality
TaskSchema.index({ title: 'text', description: 'text' });

// Pre save middleware - Update the updatedAt timestamp
TaskSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Add a virtual property to check if task is overdue
TaskSchema.virtual('isOverdue').get(function () {
  return this.status !== 'completed' && this.dueDate < new Date();
});

// Ensure virtuals are included when converting to JSON
TaskSchema.set('toJSON', { virtuals: true });
TaskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', TaskSchema);
module.exports = Task;