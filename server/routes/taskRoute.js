const express = require('express');
const { check } = require('express-validator');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
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

// Apply the auth middleware to all routes
router.use(protect);

// Get dashboard stats
router.get('/dashboard', getDashboardStats);

// Task routes
router.route('/')
  .get(getTasks)
  .post(taskValidation, createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;