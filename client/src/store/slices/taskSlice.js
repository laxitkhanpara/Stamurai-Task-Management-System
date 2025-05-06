import { createSlice } from "@reduxjs/toolkit";
import { fetchTasks, fetchUserTasks, updateTaskThunk, deleteTaskThunk,fetchDashboardStats } from "../thunks/taskThunk";

const initialState = {
  tasks: [],
  selectedTask: null,
  isLoading: false,
  error: null
};

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    clearSelectedTask: (state) => {
      state.selectedTask = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchUserTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateTaskThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log("action.payload", action.payload);
        
        if (action.payload && action.payload._id) {
          const taskIndex = state.tasks.findIndex(task => task._id === action.payload._id);
          if (taskIndex !== -1) {
            state.tasks[taskIndex] = action.payload;
          }
          if (state.selectedTask && state.selectedTask._id === action.payload._id) {
            state.selectedTask = action.payload;
          }
        }
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteTaskThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload && action.payload._id) {
          state.tasks = state.tasks.filter(task => task._id !== action.payload._id);
          if (state.selectedTask && state.selectedTask._id === action.payload._id) {
            state.selectedTask = null;
          }
        }
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchDashboardStats.pending , (state,action ) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state,action) => {
        state.isLoading = false;
        console.log("action.payload", action.payload);
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state,action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
  }
});
export const { setSelectedTask, clearSelectedTask } = taskSlice.actions;
export default taskSlice.reducer;
