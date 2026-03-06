import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export type UserRole = "admin" | "judge" | "guest";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  webPushSubscriptions?: any[];
}

interface UserState {
  users: IUser[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

/* =========================
   ASYNC THUNKS
========================= */

// Fetch all users (Admin)
export const fetchUsers = createAsyncThunk<IUser[], void, { rejectValue: string }>(
  "users/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/users/get");
      return res.data.users;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch users");
    }
  }
);

// Create a new user (Admin)
export const createUser = createAsyncThunk<IUser, { name: string; email: string; role: UserRole }, { rejectValue: string }>(
  "users/createUser",
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axios.post("/users/create", userData);
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to create user");
    }
  }
);

// Update a user (Admin)
export const updateUser = createAsyncThunk<IUser, { id: string; updates: Partial<IUser> }, { rejectValue: string }>(
  "users/updateUser",
  async ({ id, updates }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(`/users/${id}`, updates);
      return res.data.user;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update user");
    }
  }
);

// Delete a user (Admin)
export const deleteUser = createAsyncThunk<string, string, { rejectValue: string }>(
  "users/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`/users/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete user");
    }
  }
);

/* =========================
   SLICE
========================= */

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUserError(state) {
      state.error = null;
    },
    resetUsers(state) {
      state.users = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    /* ---------- FETCH USERS ---------- */
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action: PayloadAction<IUser[]>) => {
      state.loading = false;
      state.users = action.payload;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to fetch users";
    });

    /* ---------- CREATE USER ---------- */
    builder.addCase(createUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createUser.fulfilled, (state, action: PayloadAction<IUser>) => {
      state.loading = false;
      state.users.push(action.payload);
    });
    builder.addCase(createUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to create user";
    });

    /* ---------- UPDATE USER ---------- */
    builder.addCase(updateUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateUser.fulfilled, (state, action: PayloadAction<IUser>) => {
      state.loading = false;
      state.users = state.users.map((u) => (u._id === action.payload._id ? action.payload : u));
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to update user";
    });

    /* ---------- DELETE USER ---------- */
    builder.addCase(deleteUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteUser.fulfilled, (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.users = state.users.filter((u) => u._id !== action.payload);
    });
    builder.addCase(deleteUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload || "Failed to delete user";
    });
  },
});

/* =========================
   EXPORTS
========================= */

export const { clearUserError, resetUsers } = userSlice.actions;
export default userSlice.reducer;