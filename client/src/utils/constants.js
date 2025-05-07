/**
 * Constants : Shared constants across the application.
 */

// Request status enum for tracking API call states

export const  API_BASE_URL= "https://stamurai-task-management-system-w5a1.onrender.com/api/";
// export const API_BASE_URL = "http://localhost:5000/api/";

export const AUTH_ENDPOINTS = {
  LOGIN: `/auth/login`,
  REGISTER: `/auth/register`,
  REFRESH_TOKEN: `/auth/refresh`,
};


export const RequestStatus = {
  IDLE: 'idle',      // No request has been made yet
  LOADING: 'loading', // Request is in progress
  SUCCEEDED: 'succeeded', // Request completed successfully
  FAILED: 'failed',   // Request failed
};

// API endpoints
export const API_ENDPOINTS = {
  USERS: '/users',
  POSTS: '/posts',

  //tasks
  GET_TASKS:'/tasks',
  GET_TASK:'/tasks/:id',
  CREATE_TASK:'/tasks',
  UPDATE_TASK:'/tasks/',
  DELETE_TASK: '/tasks/',
  GET_USER_TASKS:'/tasks/user/',
  UPDATE_TASK_STATUS:'/tasks/',
  GETDASHBOARD_STATS:'/tasks/dashboard',
  GET_USER:'/auth/users'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

export const TOAST_DURATION = 3000;