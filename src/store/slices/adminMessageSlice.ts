import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../api/axios";

// ==========================
// Types
// ==========================
export interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
  isActive: boolean;
}

export interface Message {
  _id: string;
  sender: User | string;
  receiver?: User | string;
  group?: string;
  text?: string;
  imageUrl?: string;
  senderType: "admin" | "user" | "judge";
  readBy: string[];
  status: "sent" | "delivered" | "read";
  isEdited?: boolean;
  isDeleted?: boolean;
  isBroadcast?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  members: User[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

interface AdminChatState {
  messages: Message[];      // Global message history/logs
  chatMessages: Message[];  // Active conversation messages
  unreadCount: number;      // Tracking unread incoming messages
  groups: Group[];
  stats: Record<string, any>;
  loading: boolean;
  error?: string;
  totalMessages: number;
  page: number;
  pages: number;
}

// ==========================
// Initial State
// ==========================
const initialState: AdminChatState = {
  messages: [],
  chatMessages: [],
  unreadCount: 0,
  groups: [],
  stats: {},
  loading: false,
  error: undefined,
  totalMessages: 0,
  page: 1,
  pages: 1,
};

// ==========================
// Async Thunks
// ==========================

/**
 * Fetch global message registry (for logs/stats)
 */
export const fetchAllMessages = createAsyncThunk<
  { messages: Message[]; total: number; page: number; pages: number },
  { page?: number; limit?: number; senderType?: string; isDeleted?: boolean }
>("adminChat/fetchAllMessages", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/chat/admin/messages", { params });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/**
 * Fetch messages for a specific interaction (Private or Broadcast)
 */
export const fetchChatMessages = createAsyncThunk<
  { messages: Message[]; total: number; page: number; pages: number },
  { 
    receiverId?: string; 
    isBroadcast?: boolean; 
    page?: number; 
    limit?: number 
  }
>("adminChat/fetchChatMessages", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/chat/chat/messages", { params });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

/**
 * Send a message (Handles Direct and Broadcast)
 */
export const sendMessage = createAsyncThunk<
  Message,
  { receiver?: string; text?: string; image?: File; isBroadcast?: boolean }
>("adminChat/sendMessage", async (payload, { rejectWithValue }) => {
  try {
    const formData = new FormData();

    if (!payload.isBroadcast && payload.receiver) {
      formData.append("receiver", payload.receiver);
    }
    
    if (payload.text) formData.append("text", payload.text);
    if (payload.image) formData.append("image", payload.image);
    
    if (payload.isBroadcast !== undefined) {
      formData.append("isBroadcast", String(payload.isBroadcast));
    }

    const { data } = await api.post("/chat/admin/send", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const fetchStats = createAsyncThunk<Record<string, any>>(
  "adminChat/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/chat/admin/stats");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ==========================
// Slice
// ==========================
const adminChatSlice = createSlice({
  name: "adminChat",
  initialState,
  reducers: {
    clearError(state) {
      state.error = undefined;
    },
    resetChatMessages(state) {
      state.chatMessages = [];
    },
    /**
     * Resets the notification badge count
     */
    clearUnreadCount(state) {
      state.unreadCount = 0;
    },
    /**
     * Real-time socket update handler.
     * Logic: Only increment unreadCount if the message is from a user/judge.
     */
    receiveMessage(state, action: PayloadAction<Message>) {
      const exists = state.chatMessages.find(
        (m) => m._id === action.payload._id
      );

      if (!exists) {
        state.chatMessages.push(action.payload);
        
        // Notification Logic
        if (action.payload.senderType !== "admin") {
          state.unreadCount += 1;
        }

        // Global Logging Logic
        if (action.payload.isBroadcast) {
          state.messages.unshift(action.payload);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload.messages;
        state.totalMessages = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.chatMessages = action.payload.messages;
        state.totalMessages = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        const exists = state.chatMessages.find(
          (m) => m._id === action.payload._id
        );
        if (!exists) state.chatMessages.push(action.payload);
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { 
  clearError, 
  resetChatMessages, 
  receiveMessage, 
  clearUnreadCount 
} = adminChatSlice.actions;

export default adminChatSlice.reducer;