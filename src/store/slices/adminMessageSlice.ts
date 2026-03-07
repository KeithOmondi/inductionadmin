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
  messages: Message[];
  chatMessages: Message[];
  unreadCount: number;
  groups: Group[];
  stats: Record<string, any>;
  loading: boolean;
  error?: string;
  totalMessages: number;
  page: number;
  pages: number;
}

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

export const fetchChatMessages = createAsyncThunk<
  { messages: Message[]; total: number; page: number; pages: number },
  { receiverId?: string; isBroadcast?: boolean; page?: number; limit?: number }
>("adminChat/fetchChatMessages", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/chat/chat/messages", { params });
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || err.message);
  }
});

export const sendMessage = createAsyncThunk<
  Message | Message[],
  {
    receivers?: string[];
    receiver?: string;
    text?: string;
    image?: File;
    isBroadcast?: boolean;
    groupId?: string; // Add this if you use groups
  }
>("adminChat/sendMessage", async (payload, { rejectWithValue }) => {
  try {
    const formData = new FormData();

    // 1. Always append text (Backend requires it)
    formData.append("text", payload.text || "");
    if (payload.image) formData.append("image", payload.image);

    // 2. Explicit Destination Routing
    if (payload.isBroadcast === true) {
      formData.append("isBroadcast", "true");
    } 
    else if (payload.groupId) {
      formData.append("group", payload.groupId);
    }
    else if (payload.receivers && payload.receivers.length > 0) {
      // For Multi-select: Append each ID to the same key 'receivers'
      payload.receivers.forEach(id => formData.append("receivers", id));
    } 
    else if (payload.receiver) {
      // For Single-select: Backend now accepts 'receiver' directly
      formData.append("receiver", payload.receiver);
    } else {
      // If none of the above are met, the backend WILL throw "No valid destination"
      return rejectWithValue("No recipient selected.");
    }

    const { data } = await api.post("/chat/admin/send", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err: any) {
    // Return the specific error from the backend (like "No Admin found")
    return rejectWithValue(err.response?.data?.message || "Destination Error");
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
  },
);

export const fetchActiveConversations = createAsyncThunk(
  "userChat/fetchActiveConversations",
  async (_, { rejectWithValue }) => {
    try {
      // Ensure this matches your route prefix (usually /chat)
      const { data } = await api.get("/chat/conversations/active"); 
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed");
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
    clearUnreadCount(state) {
      state.unreadCount = 0;
    },
    receiveMessage(state, action: PayloadAction<Message>) {
      // DEFENSIVE: Ensure payload and _id exist to prevent "reading _id of null"
      if (!action.payload?._id) return;

      const exists = state.chatMessages.find(
        (m) => m?._id === action.payload._id
      );

      if (!exists) {
        state.chatMessages.push(action.payload);
        
        // Only increment unread if from external users
        if (action.payload.senderType !== "admin") {
          state.unreadCount += 1;
        }

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
      .addCase(fetchChatMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.chatMessages = action.payload.messages;
        state.totalMessages = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false;
        
        // Normalize: Backend might return 1 object or an array of objects
        const newMessages = Array.isArray(action.payload)
          ? action.payload
          : [action.payload];

        newMessages.forEach((msg) => {
          if (!msg?._id) return; // Skip if malformed
          const exists = state.chatMessages.find((m) => m?._id === msg._id);
          if (!exists) state.chatMessages.push(msg);
        });
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
  clearUnreadCount,
} = adminChatSlice.actions;

export default adminChatSlice.reducer;