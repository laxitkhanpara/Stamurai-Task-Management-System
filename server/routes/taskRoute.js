const express = require('express');
const { check } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getUserTasks,
  updateTaskStatus,
  getDashboardStats
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Task validation
const taskValidation = [
  check('title', 'Title is required').not().isEmpty(),
  check('description', 'Description is required').not().isEmpty(),
  check('dueDate', 'Due date is required').not().isEmpty()
];

// Status validation
const statusValidation = [
  check('status', 'Status is required')
    .not().isEmpty()
    .isIn(['todo', 'in-progress', 'review', 'completed'])
    .withMessage('Status must be one of: todo, in-progress, review, completed')
];

// Apply the auth middleware to all routes
router.use(protect);

// Get dashboard stats
router.get('/dashboard', getDashboardStats);

// Get tasks for a specific user - restricted to admin and managers
router.get('/user/:userId', getUserTasks);

// Task routes
router.route('/')
  .get(getTasks)
  .post(taskValidation, createTask);

// Task status update route
router.patch('/:id/status', statusValidation, updateTaskStatus);

// Task detail routes
router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;