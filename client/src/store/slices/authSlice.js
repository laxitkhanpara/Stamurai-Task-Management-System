import { createSlice } from "@reduxjs/toolkit";
import { login, register } from "../thunks/authThunk";
import Cookies from "js-cookie";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: [], token: null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = [];
      state.token = null;
      Cookies.remove("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; })
      .addCase(login.fulfilled, (state, action) => {
        console.log("action.payload", action.payload);
        
        state.loading = false;
        state.user = action.payload.user;
        console.log("user:",state.user);
        state.token = action.payload.token;
        Cookies.set("token", state.token, {
          expires: 7,
          secure: true,
          sameSite: "Strict",
        });
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(register.pending, (state) => { state.loading = true; })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
