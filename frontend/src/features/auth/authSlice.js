import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  clearSession,
  getCurrentSession,
  loginWithCredentials,
  loginWithGoogle,
  logoutSession
} from "../../services/authService";

export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      return await getCurrentSession();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await logoutSession();
  } catch {
    clearSession();
  }
});

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
    user: null,
    status: "checking",
    error: null,
    sessionRestoreRequestId: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(restoreSession.pending, (state, action) => {
        state.sessionRestoreRequestId = action.meta.requestId;
        if (!state.user) state.status = "checking";
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        if (state.sessionRestoreRequestId !== action.meta.requestId) return;
        state.sessionRestoreRequestId = null;
        state.user = action.payload?.user ?? null;
        state.status = state.user ? "authenticated" : "idle";
      })
      .addCase(restoreSession.rejected, (state, action) => {
        if (state.sessionRestoreRequestId !== action.meta.requestId) return;
        state.sessionRestoreRequestId = null;
        state.user = null;
        state.status = "idle";
      })
      .addCase(login.pending, (state) => {
        state.sessionRestoreRequestId = null;
        state.status = "loading";
        state.error = null;
      })
      .addCase(loginGoogle.pending, (state) => {
        state.sessionRestoreRequestId = null;
        state.status = "loading";
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
      })
      .addCase(loginGoogle.fulfilled, (state, action) => {
        state.status = "authenticated";
        state.user = action.payload.user;
      })
      .addCase(logout.fulfilled, (state) => {
        state.sessionRestoreRequestId = null;
        state.user = null;
        state.status = "idle";
        state.error = null;
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

export default authSlice.reducer;
