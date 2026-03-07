import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* =====================================
    Types
===================================== */
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "judge" | "guest";
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string; 
  hasChatted?: boolean;
}

interface UserState {
  profile: IUser | null;
  users: IUser[]; // This is your "Source of Truth" for names
  activeConversationIds: string[]; 
  loading: boolean;
  error: string | null;
}

// ✅ FIXED: Safely hydrate state from localStorage
const getPersistedActiveIds = (): string[] => {
  try {
    const saved = localStorage.getItem("active_chat_ids");
    // Explicitly check for null or the literal string "undefined"
    if (!saved || saved === "undefined") return [];
    return JSON.parse(saved);
  } catch (error) {
    console.error("Local Storage Parse Error:", error);
    return [];
  }
};

const initialState: UserState = {
  profile: null,
  users: [],
  activeConversationIds: getPersistedActiveIds(),
  loading: false,
  error: null,
};

/* =====================================
    Async Thunks
===================================== */

export const fetchProfile = createAsyncThunk("users/fetchProfile", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/users/me");
    return data.user;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch profile");
  }
});

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/users/get");
    return data.users;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || "Registry retrieval failed");
  }
});

export const createAdminUser = createAsyncThunk<
  IUser, 
  { name: string; email: string; password: string; role: "admin" | "judge" | "guest" },
  { rejectValue: string }
>(
  "users/createAdminUser",
  async (userData, thunkAPI) => {
    try {
      const { data } = await api.post("/users/create", userData);
      return data.user as IUser;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || "Failed to create user"
      );
    }
  }
);




export const updateAdminUser = createAsyncThunk(
  "users/updateUser",
  async ({ id, updates }: { id: string; updates: Partial<IUser> }, thunkAPI) => {
    try {
      const { data } = await api.patch(`/users/${id}`, updates);
      return data.user;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

export const deleteAdminUser = createAsyncThunk(
  "users/deleteUser",
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/users/${id}`);
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Deletion failed");
    }
  }
);

export const fetchActiveConversations = createAsyncThunk(
  "users/fetchActiveConversations",
  async (_, thunkAPI) => {
    try {
      // Matches the backend endpoint created in previous steps
      const { data } = await api.get("/chat/conversations/active"); 
      // If backend returns full objects, extract IDs; if just IDs, return as is.
      // Assuming backend returns an array of objects for better name resolution.
      return data; 
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch conversations");
    }
  }
);

/* =====================================
    Slice
===================================== */

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => { state.error = null; },
    
    // ✅ Updated: Add ID to active list and persist
    addToActiveConversations: (state, action: PayloadAction<string>) => {
      if (!state.activeConversationIds.includes(action.payload)) {
        state.activeConversationIds.push(action.payload);
        localStorage.setItem("active_chat_ids", JSON.stringify(state.activeConversationIds));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      /* --- Profile --- */
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.profile = action.payload;
      })
      
      /* --- Fetch Users --- */
      .addCase(fetchUsers.pending, (state) => { state.loading = true; })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<IUser[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* --- CRUD --- */
      .addCase(createAdminUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.users.unshift(action.payload);
      })
      .addCase(updateAdminUser.fulfilled, (state, action: PayloadAction<IUser>) => {
        const index = state.users.findIndex((u) => u._id === action.payload._id);
        if (index !== -1) state.users[index] = action.payload;
        if (state.profile?._id === action.payload._id) state.profile = action.payload;
      })
      .addCase(deleteAdminUser.fulfilled, (state, action: PayloadAction<string>) => {
        state.users = state.users.filter((u) => u._id !== action.payload);
        state.activeConversationIds = state.activeConversationIds.filter(id => id !== action.payload);
        localStorage.setItem("active_chat_ids", JSON.stringify(state.activeConversationIds));
      })

      /* --- Conversation Management --- */
      .addCase(fetchActiveConversations.fulfilled, (state, action: PayloadAction<any[]>) => {
        // If the backend returns full user objects, we extract the IDs for the ID list
        // and optionally update the users array to ensure we have the latest names.
        const ids = action.payload.map(item => item._id || item);
        state.activeConversationIds = ids;
        localStorage.setItem("active_chat_ids", JSON.stringify(ids));
      });
  },
});

export const { clearUserError, addToActiveConversations } = userSlice.actions;
export default userSlice.reducer;