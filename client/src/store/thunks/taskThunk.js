import { createAsyncThunk } from "@reduxjs/toolkit";
import { createTask, deleteTask, getUserTasks, getTasks, getTask, getDashboardStats, updateTaskStatus, updateTask } from "../api/apiTask";

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (thunkApi) => {
  try {
    const response = await getTasks();
    return response.data.content;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
}
);

export const fetchUserTasks = createAsyncThunk('tasks/fetchUserTasks', async (userId, thunkApi) => {
  try {
    const response = await getUserTasks(userId);
    return response.data.data;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
}

);
export const fetchTask = createAsyncThunk('tasks/fetchTask', async (taskId, thunkApi) => {
  try {
    const response = await getTask(taskId);
    return response.data.content;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
}
);

export const fetchDashboardStats = createAsyncThunk('tasks/fetchDashboardStats', async (thunkApi) => {
  try {
    const response = await getDashboardStats();
    return response.data;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
}

);
export const createNewTask = createAsyncThunk('tasks/createNewTask', async (taskData, thunkApi) => {
  try {
    const response = await createTask(taskData);
    return response.data.content;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
}

);
export const updateTaskStatusThunk = createAsyncThunk('tasks/updateTaskStatus', async ({ taskId, status }, thunkApi) => {
  try {
    const response = await updateTaskStatus(taskId, status);
    return response.data;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
}
);
export const updateTaskThunk = createAsyncThunk('tasks/updateTask', async ({ taskId, taskData }, thunkApi) => {
  try {
    const response = await updateTask(taskId, taskData);
    return response.data.data;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
}

);
export const deleteTaskThunk = createAsyncThunk('tasks/deleteTask', async (taskId, thunkApi) => {
  try {
    const response = await deleteTask(taskId);
    return response.data.content;
  }
  catch (error) {
    return thunkApi.rejectWithValue(error.response.data);
  }
}
);

