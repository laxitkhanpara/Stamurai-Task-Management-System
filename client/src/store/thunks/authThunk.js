import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, registerUser } from "../api/authApi";

export const login = createAsyncThunk("auth/login", async (credentials, thunkAPI) => {
  try {
    const response = await loginUser(credentials);
    console.log(response);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});

export const register = createAsyncThunk("auth/register", async (userData, thunkAPI) => {
  try {
    return await registerUser(userData);
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data);
  }
});
