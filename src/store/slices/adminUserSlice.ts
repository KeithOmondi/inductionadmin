import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* =========================================================
   Types
========================================================= */

export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "judge" | "guest";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserState {
  profile: IUser | null;
  users: IUser[];
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  users: [],
  loading: false,
  error: null,
};

/* =========================================================
   👤 GET CURRENT USER PROFILE
========================================================= */

export const fetchProfile = createAsyncThunk(
  "users/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/users/me");
      return data.user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

/* =========================================================
   ✏️ UPDATE PROFILE
========================================================= */

export const updateProfile = createAsyncThunk(
  "users/updateProfile",
  async (updates: { name?: string; email?: string }, thunkAPI) => {
    try {
      const { data } = await api.patch("/users/me", updates);
      return data.user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

/* =========================================================
   🛡 ADMIN — GET ALL USERS
========================================================= */

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/users");
      return data.users;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

/* =========================================================
   🔎 ADMIN — GET USER BY ID
========================================================= */

export const fetchUserById = createAsyncThunk(
  "users/fetchUserById",
  async (id: string, thunkAPI) => {
    try {
      const { data } = await api.get(`/users/${id}`);
      return data.user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

/* =========================================================
   🛠 ADMIN — UPDATE USER
========================================================= */

export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (
    { id, updates }: { id: string; updates: Partial<IUser> },
    thunkAPI,
  ) => {
    try {
      const { data } = await api.patch(`/users/${id}`, updates);
      return data.user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

/* =========================================================
   ❌ ADMIN — DELETE USER
========================================================= */

export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  },
);

/* =========================================================
   Slice
========================================================= */

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ===== PROFILE ===== */

      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchProfile.fulfilled,
        (state, action: PayloadAction<IUser>) => {
          state.loading = false;
          state.profile = action.payload;
        },
      )
      .addCase(fetchProfile.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      })

      /* ===== ADMIN USERS ===== */

      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchUsers.fulfilled,
        (state, action: PayloadAction<IUser[]>) => {
          state.loading = false;
          state.users = action.payload;
        },
      )
      .addCase(fetchUsers.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u._id === action.payload._id ? action.payload : u,
        );
      })

      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
      });
  },
});

export const { clearUserError } = userSlice.actions;

export default userSlice.reducer;
