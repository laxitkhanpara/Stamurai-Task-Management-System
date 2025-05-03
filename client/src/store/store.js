import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import userReducer from "./slices/userSlice";
import productReducer from "./slices/ProductSlice";
import cartReducer from "./slices/cartSlice";
import rentalReducer from "./slices/rentalSlice";


const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    product: productReducer,
    cart: cartReducer,
    rentals: rentalReducer,
  },
});

export default store;
