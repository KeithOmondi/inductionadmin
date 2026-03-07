import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  type Action,
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
}

export interface Message {
  _id: string;
  sender: User | string;
  receiver?: User | string; // Can be null for broadcasts
  group?: string;
  text?: string;
  imageUrl?: string;
  senderType: "admin" | "judge" | "guest";
  isBroadcast?: boolean;
  readBy: string[];
  status: "sent" | "delivered" | "read";
  isEdited?: boolean;
  isDeleted?: boolean;
  createdAt: string;
}

export interface Group {
  _id: string;
  name: string;
  description?: string;
  members: User[] | string[];
  createdBy: string;
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

export const fetchUserMessages = createAsyncThunk<
  Message[],
  { receiver?: string; group?: string; isBroadcast?: boolean }
>("userChat/fetchUserMessages", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/chat/messages", { params });
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch messages",
    );
  }
});

export const fetchGuestMessages = createAsyncThunk<
  Message[],
  { isBroadcast?: boolean }
>("userChat/fetchGuestMessages", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/chat/guest/messages", { params });
    return data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch guest messages",
    );
  }
});

export const fetchGuestChannels = createAsyncThunk<Group[]>(
  "userChat/fetchGuestChannels",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/chat/guest/channels");
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch channels",
      );
    }
  },
);

export const sendUserMessage = createAsyncThunk<
  Message,
  { receiver?: string; group?: string; text?: string; image?: File }
>("userChat/sendUserMessage", async (payload, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    if (payload.receiver) formData.append("receiver", payload.receiver);
    if (payload.group) formData.append("group", payload.group);
    if (payload.text) formData.append("text", payload.text);
    if (payload.image) formData.append("image", payload.image);

    const { data } = await api.post("/chat/messages", formData);
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Send failed");
  }
});

export const fetchUserGroups = createAsyncThunk<Group[]>(
  "userChat/fetchUserGroups",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/chat/my-groups");
      return data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Groups fetch failed",
      );
    }
  },
);

// ==========================
// Slice
// ==========================
const userChatSlice = createSlice({
  name: "userChat",
  initialState,
  reducers: {
    receiveMessage(state, action: PayloadAction<Message>) {
      // Defensive Check: Ensure payload exists and has an ID
      if (!action.payload?._id) return;

      // Safe Find: Use optional chaining to prevent crash if a previous message is malformed
      const exists = state.chatMessages.find(
        (m) => m?._id === action.payload._id,
      );

      if (!exists) {
        state.chatMessages.push(action.payload);

        // Logical Check: Increment unread count
        state.unreadCount += 1;
      }
    },
    resetChatMessages(state) {
      state.chatMessages = [];
      state.unreadCount = 0;
      state.error = undefined;
    },
    clearUnreadCount(state) {
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserMessages.fulfilled, (state, action) => {
        // Safe Assignment: Ensure we always have an array
        state.chatMessages = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchGuestMessages.fulfilled, (state, action) => {
        state.chatMessages = Array.isArray(action.payload)
          ? action.payload
          : [];
      })
      .addCase(fetchUserGroups.fulfilled, (state, action) => {
        state.groups = action.payload;
      })
      .addCase(fetchGuestChannels.fulfilled, (state, action) => {
        state.groups = action.payload;
      })
      .addCase(sendUserMessage.fulfilled, (state, action) => {
        // Defensive: Only push if the returned message is valid
        if (action.payload?._id) {
          state.chatMessages.push(action.payload);
        }
      })
      /* Matchers for Loading/Error States */
      .addMatcher(
        (action: Action): action is Action => action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = undefined;
        },
      )
      .addMatcher(
        (action: Action): action is PayloadAction<string> =>
          action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          // Ensure error is a string to prevent "Object not valid as React child"
          state.error =
            typeof action.payload === "string"
              ? action.payload
              : "An unexpected error occurred";
        },
      )
      .addMatcher(
        (action: Action): action is Action =>
          action.type.endsWith("/fulfilled"),
        (state) => {
          state.loading = false;
        },
      );
  },
});

export const { receiveMessage, resetChatMessages, clearUnreadCount } =
  userChatSlice.actions;

export default userChatSlice.reducer;
