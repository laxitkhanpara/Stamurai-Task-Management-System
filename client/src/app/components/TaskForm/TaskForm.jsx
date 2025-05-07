// components/TaskForm/TaskForm.jsx
'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUsers } from '../../../store/thunks/userThunk';
import { updateTaskThunk, createNewTask } from '../../../store/thunks/taskThunk';
import styles from './TaskForm.module.css';

const TaskForm = ({ initialValues = {}, isEditing = false, onClose }) => {
  const dispatch = useDispatch();
  const { items: users, loading: usersLoading } = useSelector((state) => state.user);
  // Get current user role from Redux store
  const { currentUser } = useSelector((state) => state.user);
  
  const isManagerOrAdmin = currentUser && (currentUser.data?.role === 'manager' || currentUser.data?.role === 'admin');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    assigneeId: '',
    recurring: false,
    recurrenceType: 'daily'
  });

  // Use useEffect to initialize form data from initialValues
  useEffect(() => {
    if (initialValues && Object.keys(initialValues).length > 0) {
      setFormData(prev => ({
        ...prev,
        ...initialValues,
        // Handle nested properties if needed
        assigneeId: initialValues.assigneeId || initialValues.assignedTo || ''
      }));
    }
  }, [initialValues]);

  // Fetch users only for managers/admins
  useEffect(() => {
    if (isManagerOrAdmin && users.length === 0 && !usersLoading) {
      dispatch(getUsers());
    }
  }, [dispatch, users, usersLoading, isManagerOrAdmin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // If user is not manager/admin, only allow status changes
    if (!isManagerOrAdmin && name !== 'status') {
      return;
    }
    
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Format the date to ISO string if needed
    let formattedData = { ...formData };
    
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (!isNaN(dueDate.getTime())) {
        formattedData.dueDate = dueDate.toISOString();
      }
    }
    
    try {
      if (isEditing && initialValues._id) {
        // If not manager/admin, only submit the status change
        if (!isManagerOrAdmin) {
          await dispatch(updateTaskThunk({
            taskId: initialValues._id,
            taskData: { status: formData.status }
          }));
        } else {
          await dispatch(updateTaskThunk({
            taskId: initialValues._id,
            taskData: formattedData
          }));
        }
      } else {
        // Only managers/admins can create new tasks
        if (isManagerOrAdmin) {
          await dispatch(createNewTask(formattedData));
        }
      }
      // Close modal or redirect if needed
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  };
  
  // Hide the create form for regular users
  if (!isEditing && !isManagerOrAdmin) {
    return (
      <div className={styles.form}>
        <p>You don't have permission to create new tasks.</p>
        <button type="button" onClick={onClose} className={styles.cancelButton}>
          Close
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.formTitle}>
        {isEditing ? 'Edit Task' : 'Create New Task'}
      </h2>
      
      <div className={styles.formGroup}>
        <label htmlFor="title" className={styles.label}>
          Title <span className={styles.required}>*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          required
          className={styles.input}
          placeholder="Enter task title"
          readOnly={!isManagerOrAdmin}
          disabled={!isManagerOrAdmin}
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          className={styles.textarea}
          rows="4"
          placeholder="Enter task description"
          readOnly={!isManagerOrAdmin}
          disabled={!isManagerOrAdmin}
        />
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="dueDate" className={styles.label}>
            Due Date <span className={styles.required}>*</span>
          </label>
          <input
            type="date"
            id="dueDate"
            name="dueDate"
            value={formatDateForInput(formData.dueDate)}
            onChange={handleChange}
            required
            className={styles.input}
            readOnly={!isManagerOrAdmin}
            disabled={!isManagerOrAdmin}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="priority" className={styles.label}>
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority || 'medium'}
            onChange={handleChange}
            className={styles.select}
            disabled={!isManagerOrAdmin}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      
      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="status" className={styles.label}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status || 'todo'}
            onChange={handleChange}
            className={styles.select}
            // Status is editable by all users
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="review">Review</option>
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="assigneeId" className={styles.label}>
            Assign To
          </label>
          <select
            id="assigneeId"
            name="assigneeId"
            value={formData.assigneeId || ''}
            onChange={handleChange}
            className={styles.select}
            disabled={usersLoading || users.length === 0 || !isManagerOrAdmin}
          >
            <option value="">Select User</option>
            {users && users.map(user => (
              <option key={user.id || user._id} value={user.id || user._id}>
                {user.name}
              </option>
            ))}
          </select>
          {usersLoading && <span className={styles.loadingText}>Loading users...</span>}
        </div>
      </div>
      
      <div className={styles.formGroup}>
        <label className={`${styles.label} ${styles.checkboxLabel}`}>
          <input
            type="checkbox"
            name="recurring"
            checked={Boolean(formData.recurring)}
            onChange={handleChange}
            className={styles.checkbox}
            disabled={!isManagerOrAdmin}
          />
          <span className={styles.checkboxText}>Make this a recurring task</span>
        </label>
      </div>
      
      {formData.recurring && (
        <div className={styles.formGroup}>
          <label htmlFor="recurrenceType" className={styles.label}>
            Recurrence Type
          </label>
          <select
            id="recurrenceType"
            name="recurrenceType"
            value={formData.recurrenceType || 'daily'}
            onChange={handleChange}
            className={styles.select}
            disabled={!isManagerOrAdmin}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      )}
      
      <div className={styles.formActions}>
        <button type="button" onClick={onClose} className={styles.cancelButton}>
          Cancel
        </button>
        <button type="submit" className={styles.submitButton}>
          {isEditing ? (isManagerOrAdmin ? 'Update Task' : 'Update Status') : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;