import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import rentalReducer from "./slices/rentalSlice";


const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    rentals: rentalReducer,
  },
});

export default store;
