import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/apiUser";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export const addUser = createAsyncThunk(
  "user/addUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.addUser(userData);
      return response.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUsers = createAsyncThunk(
  "user/getUsers",
  async (_, { getState, rejectWithValue }) => {
    try {
      const response = await api.getUser();
      // Return the data directly if it's an array, otherwise return the response
      return Array.isArray(response.data) ? response.data :
        (Array.isArray(response.data?.data) ? response.data.data : []);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserById = createAsyncThunk(
  "user/getUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.getUserById(userId);
      return response.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const decodedToken = jwtDecode(token);
      const response = await api.getUserById(decodedToken.id);
      return response.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteUserById = createAsyncThunk(
  "user/deleteUserById",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.deleteUserById(userId);
      // Return the deleted user's ID for the reducer to handle
      return { _id: userId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateUserById = createAsyncThunk(
  "user/updateUserById",
  async ({ id, userData }, { rejectWithValue }) => {
    try {
      const response = await api.updateUserById(id, userData);
      return response.data.data || null;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
