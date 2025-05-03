/**
 * Constants : Shared constants across the application.
 */

// Request status enum for tracking API call states

export const API_BASE_URL = "http://localhost:5000/api/";

export const AUTH_ENDPOINTS = {
  LOGIN: `/auth/login`,
  REGISTER: `/auth/register`,
  REFRESH_TOKEN: `/auth/refresh`,
};

export const PRODUCT_ENDPOINTS = {
  GET_ALL: `${API_BASE_URL}/products`,
  UPLOAD: `${API_BASE_URL}/products/upload`,
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
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

// Toast notification duration (ms)
export const TOAST_DURATION = 3000;