import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

// ==========================
// Types
// ==========================
export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

export interface Message {
  _id: string;
  sender: User | string;
  receiver?: User | string;
  group?: string;
  text?: string;
  imageUrl?: string;
  senderType: "admin" | "user" | "guest";
  isBroadcast?: boolean; 
  readBy: string[];
  deliveryStatus: "sent" | "delivered" | "read";
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  members: User[];
  createdBy: string;
  adminId?: string;
  isActive: boolean;
  createdAt: string;
  isReadOnly?: boolean;
  type?: "group" | "broadcast" | "private";
}

interface UserChatState {
  groups: Group[];
  chatMessages: Message[];
  unreadCount: number;
  loading: boolean;
  error?: string;
}

// ==========================
// Initial State
// ==========================
const initialState: UserChatState = {
  chatMessages: [],
  groups: [],
  unreadCount: 0,
  loading: false,
  error: undefined,
};

// ==========================
// Async Thunks
// ==========================

/**
 * Fetches messages for users.
 * Ensure isBroadcast is passed as a boolean or string correctly.
 */
export const fetchUserMessages = createAsyncThunk<
  Message[], 
  { receiver?: string; group?: string; isBroadcast?: boolean }
>(
  "userChat/fetchUserMessages",
  async (params, { rejectWithValue }) => {
    try {
      // Axios handles params object and converts { isBroadcast: true } to ?isBroadcast=true
      const { data } = await api.get("/chat/messages", { params });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

/**
 * Sends messages for users.
 */
export const sendUserMessage = createAsyncThunk<
  Message, 
  { receiver?: string; group?: string; text?: string; image?: File; isBroadcast?: boolean }
>(
  "userChat/sendUserMessage",
  async (payload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Only append if values exist to avoid sending "undefined" as a string
      if (payload.receiver) formData.append("receiver", payload.receiver);
      if (payload.group) formData.append("group", payload.group);
      if (payload.text) formData.append("text", payload.text);
      if (payload.image) formData.append("image", payload.image);
      
      // Explicitly convert boolean to string for multipart/form-data
      if (payload.isBroadcast !== undefined) {
        formData.append("isBroadcast", String(payload.isBroadcast));
      }

      const { data } = await api.post("/chat/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchUserGroups = createAsyncThunk<Group[]>(
  "userChat/fetchUserGroups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/chat/my-groups");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ==========================
// Slice
// ==========================
const userChatSlice = createSlice({
  name: "userChat",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
    resetChatMessages(state) {
      state.chatMessages = [];
      state.unreadCount = 0;
    },
    clearUnreadCount(state) {
      state.unreadCount = 0;
    },
    receiveMessage(state, action: PayloadAction<Message>) {
      const exists = state.chatMessages.find((m) => m._id === action.payload._id);
      if (!exists) {
        state.chatMessages.push(action.payload);
      }
    },
    updateSocketMessage(state, action: PayloadAction<Message>) {
      const index = state.chatMessages.findIndex((m) => m._id === action.payload._id);
      if (index !== -1) {
        state.chatMessages[index] = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserMessages.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchUserMessages.fulfilled, (state, action) => {
        state.loading = false;
        // The backend should return the filtered array (Broadcasts OR Private)
        state.chatMessages = action.payload;
      })
      .addCase(fetchUserMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.groups = action.payload;
      })
      .addCase(sendUserMessage.fulfilled, (state, action) => {
        const exists = state.chatMessages.find((m) => m._id === action.payload._id);
        if (!exists) {
          state.chatMessages.push(action.payload);
        }
      });
  },
});

export const {
  clearError,
  resetChatMessages,
  clearUnreadCount,
  receiveMessage,
  updateSocketMessage,
} = userChatSlice.actions;

export default userChatSlice.reducer;