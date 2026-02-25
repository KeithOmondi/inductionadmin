import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

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
  users: IUser[];
  activeConversationIds: string[]; 
  loading: boolean;
  error: string | null;
}

// HELPER: Hydrate state from localStorage on refresh
const getPersistedActiveIds = (): string[] => {
  const saved = localStorage.getItem("active_chat_ids");
  return saved ? JSON.parse(saved) : [];
};

const initialState: UserState = {
  profile: null,
  users: [],
  activeConversationIds: getPersistedActiveIds(), // Immediate hydration
  loading: false,
  error: null,
};

export const fetchActiveConversations = createAsyncThunk(
  "users/fetchActiveConversations",
  async (_, thunkAPI) => {
    try {
      const { data } = await api.get("/messages/conversations/active");
      return data.conversationIds; // Should be string[]
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchProfile = createAsyncThunk("users/fetchProfile", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/users/me");
    return data.user;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

export const fetchUsers = createAsyncThunk("users/fetchUsers", async (_, thunkAPI) => {
  try {
    const { data } = await api.get("/users");
    return data.users;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.response?.data?.message);
  }
});

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUserError: (state) => { state.error = null; },
    addToActiveConversations: (state, action: PayloadAction<string>) => {
      if (!state.activeConversationIds.includes(action.payload)) {
        state.activeConversationIds.push(action.payload);
        // Persist to storage
        localStorage.setItem("active_chat_ids", JSON.stringify(state.activeConversationIds));
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchActiveConversations.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.activeConversationIds = action.payload;
        localStorage.setItem("active_chat_ids", JSON.stringify(action.payload));
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<IUser[]>) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchProfile.fulfilled, (state, action: PayloadAction<IUser>) => {
        state.profile = action.payload;
      });
  },
});

export const { clearUserError, addToActiveConversations } = userSlice.actions;
export default userSlice.reducer;