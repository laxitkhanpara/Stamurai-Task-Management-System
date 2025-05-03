const Task = require('../models/TaskSchema');
const User = require('../models/UserSchema');
const Notification = require('../models/NotificationSchema');
const { validationResult } = require('express-validator');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    // Add user to req.body
    req.body.createdBy = req.user.id;

    // Validate assignee exists
    if (req.body.assignedTo) {
      const assignee = await User.findById(req.body.assignedTo);
      if (!assignee) {
        return res.status(400).json({
          success: false,
          error: 'Assigned user not found'
        });
      }
    } else {
      // Default to self if no assignee provided
      req.body.assignedTo = req.user.id;
    }

    // Create task
    const task = await Task.create(req.body);

    // Create notification for assigned user (if not self-assigned)
    if (req.body.assignedTo.toString() !== req.user.id.toString()) {
      await Notification.create({
        recipient: req.body.assignedTo,
        sender: req.user.id,
        task: task._id,
        message: `You have been assigned a new task: ${task.title}`,
        type: 'task_assigned'
      });
    }

    res.status(201).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(`Error in createTask: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from matching
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Base query - only fetch tasks created by or assigned to user
    query = Task.find({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ]
    });

    // Apply filters if present
    if (Object.keys(JSON.parse(queryStr)).length > 0) {
      query = query.find(JSON.parse(queryStr));
    }

    // Text search
    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Task.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Populate
    query = query.populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    // Execute query
    const tasks = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination,
      data: tasks
    });
  } catch (error) {
    console.error(`Error in getTasks: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user is authorized to view the task
    if (task.createdBy._id.toString() !== req.user.id &&
      task.assignedTo._id.toString() !== req.user.id &&
      req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this task'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(`Error in getTask: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user is authorized to update the task
    if (task.createdBy.toString() !== req.user.id &&
      task.assignedTo.toString() !== req.user.id &&
      req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    // Check if task assignment has changed
    const assignmentChanged = req.body.assignedTo &&
      req.body.assignedTo !== task.assignedTo.toString();

    // Update task
    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    // Create notification for newly assigned user
    if (assignmentChanged) {
      await Notification.create({
        recipient: req.body.assignedTo,
        sender: req.user.id,
        task: task._id,
        message: `You have been assigned to the task: ${task.title}`,
        type: 'task_assigned'
      });
    }

    // Create notification for task update
    if (task.assignedTo.toString() !== req.user.id) {
      await Notification.create({
        recipient: task.assignedTo,
        sender: req.user.id,
        task: task._id,
        message: `Task "${task.title}" has been updated`,
        type: 'task_updated'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(`Error in updateTask: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user is the creator or admin
    if (task.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this task'
      });
    }

    // Delete associated notifications
    await Notification.deleteMany({ task: task._id });

    // Delete task
    await task.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(`Error in deleteTask: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get tasks for a specific user
// @route   GET /api/tasks/user/:userId
// @access  Private (Admin and Manager Only)
exports.getUserTasks = async (req, res) => {
  try {
    // Only admin and managers can view other users' tasks
    if (req.user.role !== 'admin' && req.user.role !== 'manager' &&
      req.user.id !== req.params.userId) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this user\'s tasks'
      });
    }

    // Check if user exists
    const userExists = await User.findById(req.params.userId);
    if (!userExists) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Build query
    let query = Task.find({
      $or: [
        { createdBy: req.params.userId },
        { assignedTo: req.params.userId }
      ]
    });

    // Apply filters, pagination, sorting and search
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from matching
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Apply filters if present
    if (Object.keys(JSON.parse(queryStr)).length > 0) {
      query = query.find(JSON.parse(queryStr));
    }

    // Text search
    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    // Select fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Task.countDocuments({
      $or: [
        { createdBy: req.params.userId },
        { assignedTo: req.params.userId }
      ]
    });

    query = query.skip(startIndex).limit(limit);

    // Populate
    query = query.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' }
    ]);

    // Execute query
    const tasks = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: tasks.length,
      pagination,
      data: tasks
    });
  } catch (error) {
    console.error(`Error in getUserTasks: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Update task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status
    if (!status || !['todo', 'in-progress', 'review', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid status (todo, in-progress, review, completed)'
      });
    }

    // Find task
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    // Check if user is authorized to update the task
    if (task.createdBy.toString() !== req.user.id &&
      task.assignedTo.toString() !== req.user.id &&
      req.user.role !== 'admin' && req.user.role !== 'manager') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this task'
      });
    }

    // Update status
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      {
        new: true,
        runValidators: true
      }
    ).populate([
      { path: 'createdBy', select: 'name email' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    // Create notification for status change
    if (task.assignedTo._id.toString() !== req.user.id) {
      await Notification.create({
        recipient: task.assignedTo._id,
        sender: req.user.id,
        task: task._id,
        message: `Task "${task.title}" status changed to ${status}`,
        type: 'task_status_updated'
      });
    }

    // Also notify creator if different from both assignee and updater
    if (task.createdBy._id.toString() !== req.user.id &&
      task.createdBy._id.toString() !== task.assignedTo._id.toString()) {
      await Notification.create({
        recipient: task.createdBy._id,
        sender: req.user.id,
        task: task._id,
        message: `Task "${task.title}" status changed to ${status}`,
        type: 'task_status_updated'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error(`Error in updateTaskStatus: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// @desc    Get dashboard stats
// @route   GET /api/tasks/dashboard
// @access  Private
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total tasks count
    const totalTasks = await Task.countDocuments({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ]
    });

    // Get status counts
    const statusCounts = await Task.aggregate([
      {
        $match: {
          $or: [
            { createdBy: mongoose.Types.ObjectId(req.user.id) },
            { assignedTo: mongoose.Types.ObjectId(req.user.id) }
          ]
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get priority counts
    const priorityCounts = await Task.aggregate([
      {
        $match: {
          $or: [
            { createdBy: mongoose.Types.ObjectId(req.user.id) },
            { assignedTo: mongoose.Types.ObjectId(req.user.id) }
          ]
        }
      },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get overdue tasks
    const overdueTasks = await Task.countDocuments({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ],
      status: { $ne: 'completed' },
      dueDate: { $lt: new Date() }
    });

    // Get tasks due today
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueToday = await Task.countDocuments({
      $or: [
        { createdBy: req.user.id },
        { assignedTo: req.user.id }
      ],
      status: { $ne: 'completed' },
      dueDate: {
        $gte: new Date(today.setHours(0, 0, 0, 0)),
        $lt: new Date(tomorrow.setHours(0, 0, 0, 0))
      }
    });

    // Format the status counts for easier frontend consumption
    const formattedStatusCounts = {
      todo: 0,
      'in-progress': 0,
      review: 0,
      completed: 0
    };

    statusCounts.forEach(item => {
      formattedStatusCounts[item._id] = item.count;
    });

    // Format the priority counts
    const formattedPriorityCounts = {
      low: 0,
      medium: 0,
      high: 0
    };

    priorityCounts.forEach(item => {
      formattedPriorityCounts[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalTasks,
        statusCounts: formattedStatusCounts,
        priorityCounts: formattedPriorityCounts,
        overdueTasks,
        dueToday
      }
    });
  } catch (error) {
    console.error(`Error in getDashboardStats: ${error.message}`);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};