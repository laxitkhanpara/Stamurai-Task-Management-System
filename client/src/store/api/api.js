/**
 * API Service
 * 
 * Centralized Axios instance for making HTTP requests.
 * Includes interceptors for authentication and error handling.
 */

import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { toast } from "react-toastify";
import Cookies from "js-cookie";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    // Add authorization token to headers if available
    const token = Cookies.get('token'); 
    console.log(token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error)
    toast.error("Request error: " + error.message, {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }
);

// Response interceptor for handling errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    if (error.response) {
      // Handle specific error codes
      switch (error.response.status) {
        case 401: // Unauthorized
          // Clear token and redirect to login
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403: // Forbidden
          toast.error('Permission denied');
          break;
        case 500: // Server error
          toast.error('Server error occurred');
          break;
        default:
          // Handle other errors
          toast.error(`Request failed with status: ${error.response.status}`);
      }
    } else if (error.request) {
      // Request was made but no response received (network issues)
      toast.error('Network error, no response received');
    } else {
      // Error in setting up the request
      toast.error('Error setting up the request:', error.message);
    }

    // Return the error to be handled by the calling function
    return Promise.reject(error);
  }
);

export default api;