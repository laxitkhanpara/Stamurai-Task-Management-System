// components/TaskForm/TaskForm.jsx
'use client';
import { useState, useEffect } from 'react';
import styles from './TaskForm.module.css';

const TaskForm = ({ onSubmit, initialValues = {}, isEditing = false }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo',
    assigneeId: '',
    ...initialValues
  });
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the date to ISO string if needed
    let formattedData = { ...formData };
    if (formData.dueDate) {
      const dueDate = new Date(formData.dueDate);
      if (!isNaN(dueDate.getTime())) {
        formattedData.dueDate = dueDate.toISOString();
      }
    }
    
    onSubmit(formattedData);
  };
  
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  };
  
  return (
    <form onSubmit={handleSubmit} className={styles.form}>
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
          rows="3"
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
            <option value="inProgress">In Progress</option>
            <option value="completed">Completed</option>
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
            disabled={loading}
          >
            <option value="">Select User</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {formData.recurring && (
        <div className={styles.formRow}>
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
        </div>
      )}
      
      <div className={styles.formGroup}>
        <label className={`${styles.label} ${styles.checkboxLabel}`}>
          <input
            type="checkbox"
            name="recurring"
            checked={formData.recurring || false}
            onChange={(e) => setFormData({
              ...formData,
              recurring: e.target.checked
            })}
            className={styles.checkbox}
          />
          Make this a recurring task
        </label>
      </div>
      
      <div className={styles.formActions}>
        <button type="submit" className={styles.submitButton}>
          {isEditing ? 'Update Task' : 'Create Task'}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;