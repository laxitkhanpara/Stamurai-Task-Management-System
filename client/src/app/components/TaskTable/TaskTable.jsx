// components/TaskTable/TaskTable.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './TaskTable.module.css';
import TaskCard from '../TaskCard/TaskCard';
import TaskForm from '../TaskForm/TaskForm';
import { fetchTasks, fetchUserTasks, updateTaskThunk, deleteTaskThunk } from '../../../store/thunks/taskThunk';
import { fetchCurrentUser } from '../../../store/thunks/userThunk';

const TaskTable = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading, error } = useSelector((state) => state.task);
  console.log("tasks:",tasks);
  const currentUser = useSelector((state) => state.user?.currentUser);

  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('dueDate');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const tasksInitiallyFetched = useRef(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(10);

  useEffect(() => {
    if (currentUser && !tasksInitiallyFetched.current) {
      // Fetch tasks based on user role
      if (currentUser.role === 'admin' || currentUser.role === 'manager') {
        dispatch(fetchTasks());
      } else {
        // Regular user - only fetch their assigned tasks
        dispatch(fetchUserTasks(currentUser.data?._id));
      }
      tasksInitiallyFetched.current = true;
    }
  }, [dispatch, currentUser]); // Will only fetch once after currentUser is available

  const handleTaskUpdate = (updatedTask) => {
    dispatch(updateTaskThunk({ taskId: updatedTask._id, taskData: updatedTask }))
      .unwrap()
      .then(() => {
        closeAllModals();
        // Refresh tasks list
        if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
          dispatch(fetchTasks());
        } else {
          dispatch(fetchUserTasks(currentUser.data?._id));
        }
      })
      .catch(error => {
        console.error('Failed to update task:', error);
      });
  };

  const handleTaskDelete = (taskId) => {
    dispatch(deleteTaskThunk(taskId))
      .unwrap()
      .then(() => {
        closeAllModals();
        // Refresh tasks list after deletion
        if (currentUser?.role === 'admin' || currentUser?.role === 'manager') {
          dispatch(fetchTasks());
        } else {
          dispatch(fetchUserTasks(currentUser.data?._id));
        }
      })
      .catch(error => {
        console.error('Failed to delete task:', error);
      });
  };

  const handleTaskClick = (task, e) => {
    if (e) e.preventDefault();
    setSelectedTask(task);
    setShowTaskDetails(true);
  };

  const handleEditTask = (task, e) => {
    if (e) e.preventDefault();
    setSelectedTask(task);
    setIsEditingTask(true);
    setShowTaskForm(true);
    setShowTaskDetails(false);
  };

  const handleCreateTask = (e) => {
    if (e) e.preventDefault();
    setSelectedTask(null);
    setIsEditingTask(false);
    setShowTaskForm(true);
  };

  const closeAllModals = () => {
    setShowTaskDetails(false);
    setShowTaskForm(false);
  };

  const handleStatusFilter = (e) => {
    setFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSort = (e) => {
    setSort(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleTasksPerPageChange = (e) => {
    setTasksPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Add a safety check for tasks
  const taskList = Array.isArray(tasks) ? tasks : [];

  // Filter and sort tasks
  const filteredTasks = taskList.filter(task => {
    // Apply status filter
    if (filter !== 'all' && task.status !== filter) return false;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        (task?.assignedTo?.name && task?.assignedTo.name.toLowerCase().includes(query))
      );
    }

    return true;
  });

  // Sort tasks
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    switch (sort) {
      case 'dueDate':
        return new Date(a.dueDate) - new Date(b.dueDate);
      case 'priority':
        const priorityValues = { high: 3, medium: 2, low: 1 };
        return priorityValues[b.priority] - priorityValues[a.priority];
      case 'status':
        const statusValues = { todo: 1, inProgress: 2, review: 3, completed: 4 };
        return statusValues[a.status] - statusValues[b.status];
      case 'title':
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Pagination logic
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = sortedTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(sortedTasks.length / tasksPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Go to previous page
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Go to next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const isOverdue = (task) => {
    if (task?.status === 'completed') return false;
    const dueDate = new Date(task?.dueDate);
    const today = new Date();
    return dueDate < today;
  };
  
  
  
  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.searchAndAddContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={handleSearch}
            />
            <svg className={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>

          <button
            className={styles.addTaskButton}
            onClick={handleCreateTask}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Task
          </button>
        </div>

        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label htmlFor="statusFilter">Status:</label>
            <select
              id="statusFilter"
              className={styles.select}
              value={filter}
              onChange={handleStatusFilter}
            >
              <option value="all">All</option>
              <option value="todo">To Do</option>
              <option value="inProgress">In Progress</option>
              <option value="review">Review</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="sortBy">Sort by:</label>
            <select
              id="sortBy"
              className={styles.select}
              value={sort}
              onChange={handleSort}
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="title">Title</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="rowsPerPage">Show:</label>
            <select
              id="rowsPerPage"
              className={styles.select}
              value={tasksPerPage}
              onChange={handleTasksPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Loading tasks...</p>
        </div>
      ) : error ? (
        <div className={styles.error}>{typeof error === 'object' ? JSON.stringify(error) : error}</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Assigned To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedTasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className={styles.noTasks}>
                    <div className={styles.emptyState}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line>
                        <line x1="9" y1="15" x2="15" y2="15"></line>
                      </svg>
                      <p>No tasks found</p>
                      <button onClick={handleCreateTask} className={styles.emptyStateButton}>
                        Create a new task
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                currentTasks.map(task => (                  
                  <tr
                    key={task._id}
                    className={`${styles.taskRow} ${isOverdue(task) ? styles.overdue : ''}`}
                    onClick={() => handleTaskClick(task)}
                  >
                    <td className={styles.taskTitle}>{task?.title}</td>
                    <td>
                      <span className={`${styles.priority} ${styles[`priority${task?.priority?.charAt(0).toUpperCase() + task?.priority?.slice(1)}`]}`}>
                        {task?.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[`status${task?.status?.charAt(0).toUpperCase() + task?.status?.slice(1)}`]}`}>
                        {task?.status === 'inProgress' ? 'In Progress' :
                          task?.status === 'in-progress' ? 'In Progress' :
                            task?.status?.charAt(0).toUpperCase() + task?.status?.slice(1)}
                      </span>
                    </td>
                    <td className={isOverdue(task) ? styles.overdueDate : ''}>
                      {new Date(task?.dueDate).toLocaleDateString()}
                      {isOverdue(task) && <span className={styles.overdueTag}>Overdue</span>}
                    </td>
                    <td>{task?.assignedTo?.name || task.assignedTo || 'Unassigned'}</td>
                    <td className={styles.actions}>
                      <button
                        className={`${styles.actionButton} ${styles.viewButton}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task, e);
                        }}
                        aria-label="View task details">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.editButton}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task, e);
                        }}
                        aria-label="Edit task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                
                      <button
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Are you sure you want to delete this task?')) {
                            handleTaskDelete(task._id);
                          }
                        }}
                        aria-label="Delete task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"></path>
                          <path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {/* Pagination Component */}
          {sortedTasks.length > 0 && (
            <div className={styles.pagination}>
              <div className={styles.paginationInfo}>
                Showing {indexOfFirstTask + 1} to {Math.min(indexOfLastTask, sortedTasks.length)} of {sortedTasks.length} tasks
              </div>
              <div className={styles.paginationControls}>
                <button 
                  onClick={goToPreviousPage} 
                  disabled={currentPage === 1}
                  className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"></polyline>
                  </svg>
                </button>
                
                <div className={styles.pageNumbers}>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(pageNum => {
                      // Show current page, first and last pages, and pages close to current page
                      return (
                        pageNum === 1 || 
                        pageNum === totalPages || 
                        Math.abs(pageNum - currentPage) <= 1
                      );
                    })
                    .map((pageNum, index, array) => {
                      // Add ellipsis when there are gaps
                      if (index > 0 && pageNum - array[index - 1] > 1) {
                        return (
                          <React.Fragment key={`ellipsis-${pageNum}`}>
                            <span className={styles.ellipsis}>...</span>
                            <button
                              key={pageNum}
                              onClick={() => paginate(pageNum)}
                              className={`${styles.pageNumber} ${currentPage === pageNum ? styles.activePage : ''}`}
                            >
                              {pageNum}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`${styles.pageNumber} ${currentPage === pageNum ? styles.activePage : ''}`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                </div>
                
                <button 
                  onClick={goToNextPage} 
                  disabled={currentPage >= totalPages}
                  className={`${styles.paginationButton} ${currentPage >= totalPages ? styles.disabled : ''}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Details Modal */}
      {showTaskDetails && selectedTask && (
        <div className={styles.modalBackdrop} onClick={closeAllModals}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={closeAllModals}
              aria-label="Close modal">
              &times;
            </button>
            <TaskCard
              task={selectedTask}
              onUpdate={handleTaskUpdate}
              onDelete={handleTaskDelete}
              onEdit={() => {
                setShowTaskDetails(false);
                setIsEditingTask(true);
                setShowTaskForm(true);
              }}
            />
          </div>
        </div>
      )}

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className={styles.modalBackdrop} onClick={closeAllModals}>
          <div
            className={`${styles.modalContent} ${styles.formModalContent}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeButton}
              onClick={closeAllModals}
              aria-label="Close form"
            >
              &times;
            </button>
            <TaskForm
              initialValues={isEditingTask ? selectedTask : {}}
              isEditing={isEditingTask}
              onClose={closeAllModals}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskTable;