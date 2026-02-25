// src/store/slices/adminAuthSlice.ts
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
  isInitialized: boolean; // Tracks if first refresh attempt has run
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
export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: string }
>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    console.log("[THUNK LOGIN] Attempting login for:", email); // ✅ clg
    try {
      const res = await api.post("/auth/login", { email, password });
      console.log("[THUNK LOGIN] Login successful:", res.data.user); // ✅ clg
      return res.data.user;
    } catch (err: any) {
      console.log("[THUNK LOGIN] Login failed:", err.response?.data?.message); // ✅ clg
      return rejectWithValue(err.response?.data?.message || "Invalid credentials.");
    }
  }
);

// Temporary Login (One-time link)
export const tempLoginUser = createAsyncThunk<
  User,
  { email: string; token: string; newPassword: string },
  { rejectValue: string }
>(
  "auth/tempLoginUser",
  async (payload, { rejectWithValue }) => {
    console.log("[THUNK TEMP LOGIN] Attempting temp login for:", payload.email); // ✅ clg
    try {
      const res = await api.post("/auth/temp-login", payload);
      console.log("[THUNK TEMP LOGIN] Temp login successful:", res.data.user); // ✅ clg
      return res.data.user;
    } catch (err: any) {
      console.log("[THUNK TEMP LOGIN] Temp login failed:", err.response?.data?.message); // ✅ clg
      return rejectWithValue(err.response?.data?.message || "Temporary login failed.");
    }
  }
);

// Session Refresh (causing 401s)
export const refreshUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    console.log("[THUNK REFRESH] Attempting session refresh");

    try {
      const res = await api.post(
        "/auth/refresh",
        {},
        { withCredentials: true } // ✅ CRITICAL FIX
      );

      console.log("[THUNK REFRESH] Refresh successful:", res.data.user);
      return res.data.user;
    } catch (err: any) {
      console.log(
        "[THUNK REFRESH] Refresh failed:",
        err.response?.status,
        err.response?.data
      );
      return rejectWithValue("NO_SESSION");
    }
  }
);

// Logout
export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    console.log("[THUNK LOGOUT] Logging out"); // ✅ clg
    try {
      await api.post("/auth/logout");
      console.log("[THUNK LOGOUT] Logout successful"); // ✅ clg
    } catch (err: any) {
      console.log("[THUNK LOGOUT] Logout failed:", err); // ✅ clg
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
      console.log("[SLICE] clearError called"); // ✅ clg
      state.error = null;
    },
    clearUser: (state) => {
      console.log("[SLICE] clearUser called"); // ✅ clg
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* LOGIN */
      .addCase(loginUser.pending, (state) => {
        console.log("[SLICE LOGIN] Pending"); // ✅ clg
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log("[SLICE LOGIN] Fulfilled:", action.payload); // ✅ clg
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        console.log("[SLICE LOGIN] Rejected:", action.payload); // ✅ clg
        state.loading = false;
        state.error = action.payload as string;
      })

      /* REFRESH */
      .addCase(refreshUser.pending, (state) => {
        console.log("[SLICE REFRESH] Pending"); // ✅ clg
        state.loading = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        console.log("[SLICE REFRESH] Fulfilled:", action.payload); // ✅ clg
        state.loading = false;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(refreshUser.rejected, (state) => {
        console.log("[SLICE REFRESH] Rejected"); // ✅ clg
        state.loading = false;
        state.user = null;
        state.isInitialized = true;
        state.error = null; // silent fail
      })

      /* LOGOUT */
      .addCase(logoutUser.fulfilled, (state) => {
        console.log("[SLICE LOGOUT] Fulfilled"); // ✅ clg
        state.user = null;
        state.loading = false;
      });
  },
});

export const { clearError, clearUser } = authSlice.actions;
export default authSlice.reducer;