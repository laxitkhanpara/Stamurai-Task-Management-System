import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchTasks, createNewTask, deleteTaskThunk, fetchUserTasks, getTask, fetchDashboardStats, updateTaskThunkStatus, updateTaskThunk } from '../thunks/taskThunk';

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    selectedTask: null,
    dashboardStats: null,
    isLoading: false,
    error: null
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Option 1: Increase the warning threshold (simplest fix)
      immutableCheckOptions: {
        warnAfter: 100, // Increase from default 32ms to 100ms
      },

      // Option 2: Disable the middleware completely (if performance is critical in dev)
      // immutableCheck: false,

      // Option 3: Configure serializable check if needed
      serializableCheck: {
        // Ignore specific action types that might contain non-serializable data
        ignoredActions: ['some/action/type'],
        // Ignore specific paths in your state that might contain non-serializable data
        ignoredPaths: ['some.path.in.state'],
      },
    }),

  // Keep DevTools enabled in development
  devTools: process.env.NODE_ENV !== 'production',
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
      // Fetch all tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch user tasks
      .addCase(fetchUserTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchUserTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Create task
      .addCase(createNewTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createNewTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update task
      .addCase(updateTaskThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.selectedTask && state.selectedTask._id === action.payload._id) {
          state.selectedTask = action.payload;
        }
      })
      .addCase(updateTaskThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update task status
      // .addCase(updateTaskThunkStatus.pending, (state) => {
      //   state.isLoading = true;
      //   state.error = null;
      // })
      // .addCase(updateTaskThunkStatus.fulfilled, (state, action) => {
      //   state.isLoading = false;
      //   const index = state.tasks.findIndex(task => task._id === action.payload._id);
      //   if (index !== -1) {
      //     state.tasks[index] = action.payload;
      //   }
      //   if (state.selectedTask && state.selectedTask._id === action.payload._id) {
      //     state.selectedTask = action.payload;
      //   }
      // })
      // .addCase(updateTaskThunkStatus.rejected, (state, action) => {
      //   state.isLoading = false;
      //   state.error = action.payload;
      // })

      // Delete task
      .addCase(deleteTaskThunk.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTaskThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter(task => task._id !== action.payload);
        if (state.selectedTask && state.selectedTask._id === action.payload) {
          state.selectedTask = null;
        }
      })
      .addCase(deleteTaskThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
        console.log("state.dashboardStats", state.dashboardStats);
        
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});


export const { setSelectedTask, clearSelectedTask } = taskSlice.actions;
export default taskSlice.reducer;
