import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* ===========================
   TYPES
=========================== */
export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "judge" | "guest";
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean; // Tracks if we've attempted the first refresh
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isInitialized: false,
};

/* ===========================
   ASYNC THUNKS
=========================== */

// Standard Login
export const loginUser = createAsyncThunk<User, { email: string; password: string }, { rejectValue: string }>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      // Note: withCredentials is now handled globally in your axios instance (recommended)
      const res = await api.post("/auth/login", { email, password });
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Invalid credentials.");
    }
  }
);

// Temporary Login (First time setup)
export const tempLoginUser = createAsyncThunk<User, { email: string; token: string; newPassword: string }, { rejectValue: string }>(
  "auth/tempLoginUser",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/temp-login", payload);
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Temporary login failed.");
    }
  }
);

// Session Refresh (The one causing 401s)
export const refreshUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/refresh");
      return res.data.user;
    } catch (err: any) {
      // We don't return a custom string here to avoid UI error messages on boot
      return rejectWithValue("NO_SESSION"); 
    }
  }
);

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
    } catch (err: any) {
      return rejectWithValue("Logout failed.");
    }
  }
);

/* ===========================
   SLICE
=========================== */

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
    }
  },
  extraReducers: (builder) => {
    builder
      /* LOGIN */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* REFRESH - Handled Silently */
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(refreshUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isInitialized = true; 
        // We set error to null because a 401 refresh is just a "guest" state
        state.error = null; 
      })

      /* LOGOUT */
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
      });
  },
});

export const { clearError, clearUser } = authSlice.actions;
export default authSlice.reducer;