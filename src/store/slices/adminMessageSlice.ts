import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../api/axios";

// ==========================
// Types
// ==========================
interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface Message {
  _id: string;
  sender: User | string;
  receiver?: User | string;
  group?: any;
  text?: string;
  imageUrl?: string;
  senderType: "admin" | "user";
  readBy: string[];
  deliveryStatus: string;
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

interface AdminChatState {
  messages: Message[];
  chatMessages: Message[];
  groups: Group[];
  stats: any;
  loading: boolean;
  error?: string;
  totalMessages?: number;
  page?: number;
  pages?: number;
}

const initialState: AdminChatState = {
  messages: [],
  chatMessages: [],
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

export const fetchAllMessages = createAsyncThunk(
  "adminChat/fetchAllMessages",
  async (
    params: {
      page?: number;
      limit?: number;
      senderType?: string;
      isDeleted?: boolean;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.get("/chat/admin/messages", { params });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchChatMessages = createAsyncThunk(
  "adminChat/fetchChatMessages",
  async (
    params: {
      receiverId?: string;
      groupId?: string;
      page?: number;
      limit?: number;
    },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.get("/chat/chat/messages", { params });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const sendMessage = createAsyncThunk(
  "adminChat/sendMessage",
  async (
    payload: { receiver?: string; group?: string; text?: string; image?: File },
    { rejectWithValue },
  ) => {
    try {
      const formData = new FormData();
      if (payload.receiver) formData.append("receiver", payload.receiver);
      if (payload.group) formData.append("group", payload.group);
      if (payload.text) formData.append("text", payload.text);
      if (payload.image) formData.append("image", payload.image);

      const { data } = await api.post("/chat/admin/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchStats = createAsyncThunk(
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

export const createGroup = createAsyncThunk(
  "adminChat/createGroup",
  async (
    payload: { name: string; description?: string; members?: string[] },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post("/chat/groups/create", payload);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const updateGroup = createAsyncThunk(
  "adminChat/updateGroup",
  async (
    { groupId, updates }: { groupId: string; updates: any },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.patch(`/chat/groups/${groupId}`, updates);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const addMembers = createAsyncThunk(
  "adminChat/addMembers",
  async (
    { groupId, userIds }: { groupId: string; userIds: string[] },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.post(`/chat/groups/${groupId}/members`, {
        userIds,
      });
      return data.group;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const removeMember = createAsyncThunk(
  "adminChat/removeMember",
  async (
    { groupId, userId }: { groupId: string; userId: string },
    { rejectWithValue },
  ) => {
    try {
      const { data } = await api.delete(
        `/chat/groups/${groupId}/members/${userId}`,
      );
      return data.group;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchGroups = createAsyncThunk(
  "adminChat/fetchGroups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/chat/groups");
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
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
    // 🔹 Matches component: dispatch(resetChatMessages())
    resetChatMessages(state) {
      state.chatMessages = [];
    },
    // 🔹 Matches component: dispatch(receiveMessage(msg))
    receiveMessage(state, action: PayloadAction<Message>) {
      const exists = state.chatMessages.find(
        (m) => m._id === action.payload._id,
      );
      if (!exists) {
        state.chatMessages.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllMessages.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        fetchAllMessages.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.messages = action.payload.messages;
          state.totalMessages = action.payload.total;
          state.page = action.payload.page;
          state.pages = action.payload.pages;
        },
      )
      .addCase(fetchAllMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchChatMessages.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        fetchChatMessages.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.chatMessages = action.payload.messages;
          state.totalMessages = action.payload.total;
          state.page = action.payload.page;
          state.pages = action.payload.pages;
        },
      )
      .addCase(fetchChatMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(sendMessage.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(
        sendMessage.fulfilled,
        (state, action: PayloadAction<Message>) => {
          state.loading = false;
          // Optional: Check existence even here to be safe
          const exists = state.chatMessages.find(
            (m) => m._id === action.payload._id,
          );
          if (!exists) state.chatMessages.push(action.payload);
        },
      )
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchStats.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.stats = action.payload;
      })

      .addCase(createGroup.fulfilled, (state, action: PayloadAction<Group>) => {
        state.groups.push(action.payload);
      })
      .addCase(
        fetchGroups.fulfilled,
        (state, action: PayloadAction<Group[]>) => {
          state.groups = action.payload;
        },
      );
  },
});

export const { clearError, resetChatMessages, receiveMessage } =
  adminChatSlice.actions;
export default adminChatSlice.reducer;
