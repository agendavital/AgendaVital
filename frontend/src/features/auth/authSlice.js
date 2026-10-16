import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  clearSession,
  getStoredSession,
  loginWithCredentials,
  loginWithGoogle
} from "../../services/authService";

const storedSession = getStoredSession();

export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      return await loginWithCredentials(credentials);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginGoogle = createAsyncThunk(
  "auth/loginGoogle",
  async (credential, { rejectWithValue }) => {
    try {
      return await loginWithGoogle(credential);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: storedSession?.user ?? null,
    token: storedSession?.token ?? null,
    status: "idle",
    error: null
  },
  reducers: {
    logout(state) {
      clearSession();
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginGoogle.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginGoogle.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? action.error.message;
      })
      .addCase(loginGoogle.rejected, (state, action) => {
        state.status = "error";
        state.error = action.payload ?? action.error.message;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
