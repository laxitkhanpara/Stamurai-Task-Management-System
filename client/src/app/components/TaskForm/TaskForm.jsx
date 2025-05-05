// components/TaskForm/TaskForm.jsx
'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUsers } from '../../../store/thunks/userThunk';
import { updateTaskThunk, createNewTask } from '../../../store/thunks/taskThunk';
import styles from './TaskForm.module.css';

const TaskForm = ({ initialValues = {}, isEditing = false, onClose }) => {
  console.log("initialValues", initialValues._id);
  const dispatch = useDispatch();
  const { items: users, loading: usersLoading } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    assigneeId: '',
    recurring: false,
    recurrenceType: 'daily',
    ...initialValues
  });
  
  useEffect(() => {
    // Fetch users from Redux store if not already loaded    
    if (users.length === 0 && !usersLoading) {
      
      dispatch(getUsers());
    }
  }, [dispatch, users, usersLoading]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
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
      
      
      if (isEditing) {
        console.log(initialValues._id);
        await dispatch(updateTaskThunk({taskId:initialValues._id},{taskData:formattedData}))
      } else {
        await dispatch(createNewTask(formattedData))
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
          value={formData.title}
          onChange={handleChange}
          required
          className={styles.input}
          placeholder="Enter task title"
        />
      </div>
      
      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={styles.textarea}
          rows="4"
          placeholder="Enter task description"
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
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="priority" className={styles.label}>
            Priority
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className={styles.select}
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
            value={formData.status}
            onChange={handleChange}
            className={styles.select}
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
            disabled={usersLoading || users.length === 0}
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
            checked={formData.recurring || false}
            onChange={handleChange}
            className={styles.checkbox}
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
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;