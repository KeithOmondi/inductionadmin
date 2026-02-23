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
  readBy: string[];
  deliveryStatus: string;
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

interface Group {
  _id: string;
  name: string;
  description?: string;
  members: User[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
}

interface UserChatState {
  groups: Group[];
  chatMessages: Message[];
  unreadCount: number; // Added for the Header Badge
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

export const fetchUserMessages = createAsyncThunk(
  "userChat/fetchUserMessages",
  async (params: { receiver?: string; group?: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/chat/messages", { params });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const sendUserMessage = createAsyncThunk(
  "userChat/sendUserMessage",
  async (payload: { receiver?: string; group?: string; text?: string; image?: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (payload.receiver) formData.append("receiver", payload.receiver);
      if (payload.group) formData.append("group", payload.group);
      if (payload.text) formData.append("text", payload.text);
      if (payload.image) formData.append("image", payload.image);

      const { data } = await api.post("/chat/messages", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const editUserMessage = createAsyncThunk(
  "userChat/editUserMessage",
  async ({ messageId, text }: { messageId: string; text: string }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/chat/messages/${messageId}`, { text });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Edit failed");
    }
  }
);

export const deleteUserMessage = createAsyncThunk(
  "userChat/deleteUserMessage",
  async (messageId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/chat/messages/${messageId}`);
      return messageId;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Delete failed");
    }
  }
);

export const markMessageAsRead = createAsyncThunk(
  "userChat/markAsRead",
  async ({ messageId, userId }: { messageId: string; userId: string }, { rejectWithValue }) => {
    try {
      await api.patch(`/chat/messages/${messageId}/read`);
      return { messageId, userId };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to mark read");
    }
  }
);

export const fetchUserGroups = createAsyncThunk(
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
        // Increment unread count for the Header
        state.unreadCount += 1;
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
      /* Fetch Messages */
      .addCase(fetchUserMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserMessages.fulfilled, (state, action: PayloadAction<Message[]>) => {
        state.loading = false;
        state.chatMessages = action.payload;
      })
      .addCase(fetchUserMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* Send Message */
      .addCase(sendUserMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        state.chatMessages.push(action.payload);
      })

      /* Edit Message */
      .addCase(editUserMessage.fulfilled, (state, action: PayloadAction<Message>) => {
        const index = state.chatMessages.findIndex((m) => m._id === action.payload._id);
        if (index !== -1) state.chatMessages[index] = action.payload;
      })

      /* Delete Message */
      .addCase(deleteUserMessage.fulfilled, (state, action: PayloadAction<string>) => {
        state.chatMessages = state.chatMessages.filter((m) => m._id !== action.payload);
      })

      /* Mark Read */
      .addCase(markMessageAsRead.fulfilled, (state, action) => {
        const msg = state.chatMessages.find((m) => m._id === action.payload.messageId);
        if (msg && !msg.readBy.includes(action.payload.userId)) {
          msg.readBy.push(action.payload.userId);
        }
      })

      /* Groups */
      .addCase(fetchUserGroups.fulfilled, (state, action: PayloadAction<Group[]>) => {
        state.groups = action.payload;
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