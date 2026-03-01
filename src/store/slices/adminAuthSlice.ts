// src/store/slices/authSlice.ts
import { 
  createSlice, 
  createAsyncThunk, 
  type PayloadAction, 
  type ActionReducerMapBuilder 
} from "@reduxjs/toolkit";
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
  isInitialized: boolean;
  needsPasswordReset: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isInitialized: false,
  needsPasswordReset: false,
};

/* ===========================
   ASYNC THUNKS
=========================== */

export const loginUser = createAsyncThunk<
  User,
  { email: string; password: string },
  { rejectValue: { message: string; needsReset?: boolean; resetToken?: string } }
>("auth/loginUser", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    return res.data.user;
  } catch (err: any) {
    const message = err.response?.data?.message || "Invalid credentials.";
    const needsReset = err.response?.data?.needsPasswordReset || false;
    const resetToken = err.response?.data?.resetToken;
    return rejectWithValue({ message, needsReset, resetToken });
  }
});

export const forceResetPassword = createAsyncThunk<
  User,
  { newPassword: string; resetToken: string },
  { rejectValue: string }
>(
  "auth/forceReset",
  async ({ newPassword, resetToken }, { rejectWithValue }) => {
    try {
      const res = await api.post(
        "/auth/force-reset",
        { newPassword },
        {
          headers: { Authorization: `Bearer ${resetToken}` },
        }
      );
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Reset failed");
    }
  }
);

export const refreshUser = createAsyncThunk<User, void, { rejectValue: string }>(
  "auth/refreshUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/auth/refresh", {}, { withCredentials: true });
      return res.data.user;
    } catch (err: any) {
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
      state.needsPasswordReset = false;
    },
    resetAuthFlags: (state) => {
      state.error = null;
      state.needsPasswordReset = false;
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
      /* -------- LOGIN -------- */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.needsPasswordReset = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Login failed";
        state.needsPasswordReset = action.payload?.needsReset || false;
      })

      /* -------- FORCE RESET -------- */
      .addCase(forceResetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forceResetPassword.fulfilled, (state, action: PayloadAction<User>) => {
        state.loading = false;
        state.user = action.payload;
        state.needsPasswordReset = false;
        state.error = null;
      })
      .addCase(forceResetPassword.rejected, (state, action: PayloadAction<string | undefined>) => {
        state.loading = false;
        state.error = action.payload || "Password reset failed";
      })

      /* -------- REFRESH -------- */
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
      })

      /* -------- LOGOUT -------- */
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.loading = false;
        state.needsPasswordReset = false;
      });
  },
});

export const { clearError, clearUser, resetAuthFlags } = authSlice.actions;
export default authSlice.reducer;