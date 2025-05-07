'use client';
import { useState } from 'react';
import styles from './TaskCard.module.css';
import TaskForm from '../TaskForm/TaskForm';

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  const priorityClasses = {
    high: styles.priorityHigh,
    medium: styles.priorityMedium,
    low: styles.priorityLow
  };
  
  const statusClasses = {
    todo: styles.statusTodo,
    'in-progress': styles.statusInProgress,
    completed: styles.statusCompleted
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const getTimeRemaining = () => {
    const dueDate = new Date(task?.dueDate);
    const now = new Date();
    
    // If already overdue
    if (dueDate < now) {
      const diffTime = Math.abs(now - dueDate);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `${diffDays}d ${diffHours}h overdue`;
      } else {
        return `${diffHours}h overdue`;
      }
    }
    
    // If due in the future
    const diffTime = Math.abs(dueDate - now);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h remaining`;
    } else {
      return `${diffHours}h remaining`;
    }
  };
  
  const getRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'today';
    } else if (diffDays === 1) {
      return 'yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return formatDate(dateString);
    }
  };
  
  return (
    <div className={`${styles.card} ${statusClasses[task?.status]}`}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={`${styles.priority} ${priorityClasses[task?.priority]}`}>
            {task?.priority}
          </span>
          <h3 className={styles.title}>{task?.title}</h3>
        </div>
        <div className={styles.actions}>
          <button 
            className={styles.expandButton} 
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? "Collapse task" : "Expand task"}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {expanded ? (
                <polyline points="18 15 12 9 6 15"></polyline>
              ) : (
                <polyline points="6 9 12 15 18 9"></polyline>
              )}
            </svg>
          </button>
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
      
      <div className={styles.subheader}>
        <div className={styles.statusBadge} data-status={task?.status}>
          {task?.status.replace(/-/g, ' ')}
        </div>
        <div className={styles.timeRemaining}>
          {getTimeRemaining()}
        </div>
      </div>
      
      <p className={`${styles.description} ${expanded ? styles.expanded : ''}`}>{task?.description}</p>
      
      <div className={styles.basicInfo}>
        <div className={styles.infoItem}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span className={styles.infoText}>{task?.assignedTo?.name || 'Unassigned'}</span>
        </div>
        <div className={styles.infoItem}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span className={`${styles.infoText} ${isOverdue() ? styles.overdue : ''}`}>
            {formatDate(task?.dueDate).split(',')[0]}
            {isOverdue() && <span className={styles.overdueTag}>Overdue</span>}
          </span>
        </div>
      </div>
      
      {expanded && (
        <div className={styles.expandedContent}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Created by:</span>
              <span className={styles.detailValue}>{task?.createdBy?.name}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Created at:</span>
              <span className={styles.detailValue}>{getRelativeTime(task?.createdAt)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Updated at:</span>
              <span className={styles.detailValue}>{getRelativeTime(task?.updatedAt)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>ID:</span>
              <span className={styles.detailValue}>{task?.id}</span>
            </div>
            {task?.recurring?.isRecurring && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Recurring:</span>
                <span className={styles.detailValue}>{task?.recurring?.frequency}</span>
              </div>
            )}
          </div>
          
          <div className={styles.assigneeDetails}>
            <div className={styles.assigneeAvatar}>
              {task?.assignedTo?.name?.charAt(0) || '?'}
            </div>
            <div className={styles.assigneeInfo}>
              <div className={styles.assigneeName}>{task?.assignedTo?.name || 'Unassigned'}</div>
              <div className={styles.assigneeEmail}>{task?.assignedTo?.email}</div>
              <div className={styles.assigneeRole}>{task?.assignedTo?.role}</div>
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.cardFooter}>
        <div className={styles.statusContainer}>
          <label htmlFor={`status-${task?._id}`} className={styles.statusLabel}>Status:</label>
          <select 
            id={`status-${task?._id}`}
            className={styles.statusSelect}
            value={task?.status}
            onChange={handleStatusChange}
          >
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
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
            <button 
              className={styles.closeButton}
              onClick={() => setShowConfirmDelete(false)}
            >
              &times;
            </button>
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