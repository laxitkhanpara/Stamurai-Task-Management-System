import api from "./api"
import { API_ENDPOINTS } from '../../utils/constants';


export const createTask = async (taskData) => {
  const response = await api.post(`${API_ENDPOINTS.CREATE_TASK}`, taskData);
  return response;
}
export const deleteTask = async (id) => {
  const response = await api.delete(`${API_ENDPOINTS.DELETE_TASK}${id}`);
  return response;
}
export const getDashboardStats = async () => {
  const response = await api.get(`${API_ENDPOINTS.GETDASHBOARD_STATS}`);
  return response;
}
export const getTask = async (userData) => {
  const response = await api.get(`${API_ENDPOINTS.GET_TASK}`);
  return response;
}
export const getTasks = async () => {
  const response = await api.get(`${API_ENDPOINTS.GET_TASKS}`);
  return response;
}
export const getUserTasks = async (userId) => {
  const response = await api.get(`${API_ENDPOINTS.GET_USER_TASKS}${userId}`);
  
  return response;
}
export const updateTask = async (taskId, userData) => {
  const response = await api.put(`${API_ENDPOINTS.UPDATE_TASK}${taskId}`, userData);
  return response;
}
export const updateTaskStatus = async (taskId, status) => {
  const response = await api.put(`${API_ENDPOINTS.UPDATE_TASK_STATUS}${taskId}/${status}`, userData);
  return response;
}