import { createSlice } from "@reduxjs/toolkit";
import { addUser, fetchCurrentUser, deleteUserById, getUserById, getUsers, updateUserById } from "../thunks/userThunk";

const initialState = {
  items: [],
  currentUser: null,
  loading: false,
  error: null,
  lastFetchTime: null
};

/** @type {UserState} */
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetLastFetchTime: (state) => {
      state.lastFetchTime = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload :
          (Array.isArray(action.payload?.data) ? action.payload.data : []);
        state.lastFetchTime = Date.now();
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteUserById.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteUserById.fulfilled, (state, action) => {
        if (Array.isArray(state.items) && action.payload?._id) {
          state.items = state.items.filter(user => user._id !== action.payload._id);
        }
      })
      .addCase(deleteUserById.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(updateUserById.pending, (state) => {

        state.error = null;
      })
      .addCase(updateUserById.fulfilled, (state, action) => {
        if (Array.isArray(state.items) && action.payload?._id) {
          state.items = state.items.map(user =>
            user._id === action.payload._id ? action.payload : user
          );
        }
      })
      .addCase(updateUserById.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(addUser.pending, (state) => {
        state.error = null;
      })
      .addCase(addUser.fulfilled, (state, action) => {
        console.log("addUser.fulfilled", action.payload);
        if (action.payload && Array.isArray(state.items)) {
          state.items = [...state.items, action.payload.user];
        }
      })
      .addCase(addUser.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCurrentUser, clearError, resetLastFetchTime } = userSlice.actions;
export default userSlice.reducer;
