// components/TaskCard/TaskCard.jsx
'use client';
import { useState } from 'react';
import styles from './TaskCard.module.css';
import TaskForm from '../TaskForm/TaskForm';

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  
  const priorityClasses = {
    high: styles.priorityHigh,
    medium: styles.priorityMedium,
    low: styles.priorityLow
  };
  
  const statusClasses = {
    todo: styles.statusTodo,
    inProgress: styles.statusInProgress,
    completed: styles.statusCompleted
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const isOverdue = () => {
    if (task?.status === 'completed') return false;
    const dueDate = new Date(task?.dueDate);
    const today = new Date();
    return dueDate < today;
  };
  
  const handleStatusChange = (e) => {
    const updatedTask = {
      ...task,
      status: e.target.value
    };
    onUpdate(updatedTask);
  };
  
  const handleEditSubmit = (updatedTask) => {
    onUpdate({ ...task, ...updatedTask });
    setShowEditForm(false);
  };
  
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={`${styles.priority} ${priorityClasses[task?.priority]}`}>
          {task?.priority}
        </span>
        <div className={styles.actions}>
          <button 
            className={styles.editButton} 
            onClick={() => setShowEditForm(true)}
            aria-label="Edit task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button 
            className={styles.deleteButton} 
            onClick={() => setShowConfirmDelete(true)}
            aria-label="Delete task"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <h3 className={styles.title}>{task?.title}</h3>
      <p className={styles.description}>{task?.description}</p>
      
      <div className={styles.details}>
        <div className={styles.assignee}>
          <span className={styles.label}>Assigned to:</span>
          <span className={styles.value}>{task?.assignee?.name || 'Unassigned'}</span>
        </div>
        
        <div className={styles.dueDate}>
          <span className={styles.label}>Due:</span>
          <span className={`${styles.value} ${isOverdue() ? styles.overdue : ''}`}>
            {formatDate(task?.dueDate)}
            {isOverdue() && <span className={styles.overdueTag}>Overdue</span>}
          </span>
        </div>
      </div>
      
      <div className={styles.statusContainer}>
        <label htmlFor={`status-${task?._id}`} className={styles.statusLabel}>Status:</label>
        <select 
          id={`status-${task?._id}`}
          className={`${styles.statusSelect} ${statusClasses[task?.status]}`}
          value={task?.status}
          onChange={handleStatusChange}
        >
          <option value="todo">To Do</option>
          <option value="inProgress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      
      {showEditForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowEditForm(false)}
            >
              &times;
            </button>
            <h2 className={styles.modalTitle}>Edit Task</h2>
            <TaskForm 
              initialValues={task}
              onSubmit={handleEditSubmit}
              isEditing={true}
            />
          </div>
        </div>
      )}
      
      {showConfirmDelete && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Delete Task</h2>
            <p>Are you sure you want to delete this task? This action cannot be undone.</p>
            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowConfirmDelete(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.confirmButton}
                onClick={() => {
                  onDelete(task?._id);
                  setShowConfirmDelete(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;