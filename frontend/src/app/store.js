import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import candidatesReducer from "../features/candidates/candidatesSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    candidates: candidatesReducer
  }
});
