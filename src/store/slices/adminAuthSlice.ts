// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* ===========================
   TYPES
=========================== */

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "judge" | "guest"; // reflect all possible roles
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

/* ===========================
   INITIAL STATE
=========================== */

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

/* ===========================
   1️⃣ LOGIN (NORMAL / TEMP)
      Frontend sends credentials or temp token
=========================== */

export const loginUser = createAsyncThunk<User, { email: string; password: string }, { rejectValue: string }>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/login", { email, password }, { withCredentials: true });
      // Backend returns user object (cookies hold token)
      return res.data.user as User;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Authentication failed. Please verify credentials.");
    }
  }
);

export const tempLoginUser = createAsyncThunk<User, { email: string; token: string; newPassword: string }, { rejectValue: string }>(
  "auth/tempLoginUser",
  async ({ email, token, newPassword }, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/temp-login", { email, token, newPassword }, { withCredentials: true });
      return res.data.user as User;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Temporary login failed.");
    }
  }
);

/* ===========================
   2️⃣ REFRESH SESSION
=========================== */

export const refreshUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/refresh", {}, { withCredentials: true });
      return res.data.user as User;
    } catch (err: any) {
      return rejectWithValue("Session expired. Please re-authenticate.");
    }
  }
);

/* ===========================
   3️⃣ LOGOUT (SINGLE DEVICE)
=========================== */

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
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
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ===== LOGIN ===== */
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
        state.user = null;
        state.error = action.payload ?? "Internal Server Error";
      })

      /* ===== TEMP LOGIN ===== */
      .addCase(tempLoginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(tempLoginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(tempLoginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.error = action.payload ?? "Temporary login failed";
      })

      /* ===== REFRESH ===== */
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(refreshUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
      })

      /* ===== LOGOUT ===== */
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Logout failed";
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;