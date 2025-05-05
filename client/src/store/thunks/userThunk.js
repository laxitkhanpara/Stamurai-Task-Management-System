import { createAsyncThunk } from "@reduxjs/toolkit";
import * as api from "../api/apiUser";
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie';

export const addUser = createAsyncThunk("addUser", async (userData, thunkApi) => {
  try {
    const response = await api.addUser(userData);
    return response.data.content;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
})

export const getUsers = createAsyncThunk("getUsers", async (thunkApi) => {
  try {
    const response = await api.getUser();
    console.log("createAsyncThunk", response);
    return response.data;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
}
)
export const getUserById = createAsyncThunk("getUserById", async (id, thunkApi) => {
  try {
    const response = await api.getUserById(id);
    return response.data.content;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
})

export const fetchCurrentUser = createAsyncThunk("getUserById", async (thunkApi) => {
  try {
    const token = Cookies.get('token');
    const decodedToken = jwtDecode(token); // Decode the token
    const response = await api.getUserById(decodedToken.id);

    return response.data;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
})

export const deleteUserById = createAsyncThunk("deleteUserById", async (id, thunkApi) => {
  try {
    const response = await api.deleteUserById(id);
    return response.data.content;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
})
export const updateUserById = createAsyncThunk("updateUserById", async ({ id, userData }, thunkApi) => {
  try {
    const response = await api.updateUserById(id, userData);
    return response.data.content;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
})
