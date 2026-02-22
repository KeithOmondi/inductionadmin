import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* ===========================
   TYPES
=========================== */

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "admin"; // strictly admin only
}

interface AuthState {
  user: User | null;
  token: string | null; // 🔹 store JWT separately
  loading: boolean;
  error: string | null;
}

/* ===========================
   INITIAL STATE
=========================== */

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

/* ===========================
   1️⃣ ADMIN LOGIN
=========================== */

export const loginUser = createAsyncThunk<
  { user: User; token: string },
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async ({ email, password }, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/login", { email, password });
    // Backend must return { user, token }
    return res.data as { user: User; token: string };
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Authentication failed. Please verify credentials."
    );
  }
});

/* ===========================
   2️⃣ REFRESH SESSION
=========================== */

export const refreshUser = createAsyncThunk<
  { user: User; token: string },
  void,
  { rejectValue: string }
>("auth/refreshUser", async (_, { rejectWithValue }) => {
  try {
    const res = await api.post("/auth/refresh");
    return res.data as { user: User; token: string };
  } catch (err: any) {
    return rejectWithValue("Session expired. Please re-authenticate.");
  }
});

/* ===========================
   3️⃣ LOGOUT
=========================== */

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
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* ================= LOGIN ================= */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token; // 🔹 store token separately
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = action.payload ?? "Internal Server Error";
      })

      /* ================= REFRESH ================= */
      .addCase(refreshUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token; // 🔹 store token separately
      })
      .addCase(refreshUser.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })

      /* ================= LOGOUT ================= */
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Logout failed.";
      });
  },
});

export const { setUser, clearError } = authSlice.actions;
export default authSlice.reducer;