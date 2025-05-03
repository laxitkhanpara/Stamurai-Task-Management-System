import apiClient from "./apiClient";
import { API_BASE_URL,AUTH_ENDPOINTS } from '../../utils/constants';

export const loginUser = async (credentials) => {
  console.log("credentials", credentials);
  const response = await apiClient.post(`${AUTH_ENDPOINTS.LOGIN}`, credentials);
  return response.data;
};

export const registerUser = async (userData) => {
  console.log("userData", userData);
  
  const response = await apiClient.post(`${AUTH_ENDPOINTS.REGISTER}`, userData);
  return response.data;
};