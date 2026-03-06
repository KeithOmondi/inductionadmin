// src/store/slices/guests/guestMessagesSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../../api/axios";

export interface IMessage {
  _id: string;
  sender: {
    _id: string;
    name: string;
    role: string;
  };
  receiver?: {
    _id: string;
    name: string;
    role: string;
  };
  text?: string;
  imageUrl?: string;
  senderType: "guest" | "admin" | "judge";
  readBy: string[];
  isBroadcast: boolean;
  status: "sent" | "delivered" | "read";
  createdAt: string;
  updatedAt: string;
}

interface GuestMessagesState {
  messages: IMessage[];
  loading: boolean;
  error: string | null;
}

const initialState: GuestMessagesState = {
  messages: [],
  loading: false,
  error: null,
};

/* =========================
    FETCH GUEST MESSAGES
========================= */
export const fetchGuestMessages = createAsyncThunk<
  IMessage[],
  void,
  { rejectValue: string }
>("guestMessages/fetchGuestMessages", async (_, { rejectWithValue }) => {
  try {
    // Path aligned with: router.get("/")
    const res = await api.get("/chat/guest"); 
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch messages");
  }
});

/* =========================
    SEND GUEST MESSAGE
========================= */
export const sendGuestMessage = createAsyncThunk<
  IMessage,
  { text?: string; file?: File },
  { rejectValue: string }
>("guestMessages/sendGuestMessage", async ({ text, file }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    if (text) formData.append("text", text);
    if (file) formData.append("file", file);

    // Path aligned with: router.post("/send")
    const res = await api.post("/chat/send", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to send message");
  }
});

/* =========================
    MARK MESSAGE AS READ
========================= */
export const markGuestMessageRead = createAsyncThunk<
  { messageId: string },
  string,
  { rejectValue: string }
>("guestMessages/markGuestMessageRead", async (messageId, { rejectWithValue }) => {
  try {
    // Path aligned with: router.patch("/read/:messageId")
    await api.patch(`/chat/read/${messageId}`);
    return { messageId };
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to mark as read");
  }
});

/* =========================
    SLICE
========================= */
const guestMessagesSlice = createSlice({
  name: "guestMessages",
  initialState,
  reducers: {
    clearGuestMessages: (state) => {
      state.messages = [];
      state.loading = false;
      state.error = null;
    },
    // Useful for Real-time Socket Updates
    receiveNewMessage: (state, action: PayloadAction<IMessage>) => {
        state.messages.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      /* FETCH */
      .addCase(fetchGuestMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuestMessages.fulfilled, (state, action: PayloadAction<IMessage[]>) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchGuestMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load guest messages";
      })

      /* SEND */
      .addCase(sendGuestMessage.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendGuestMessage.fulfilled, (state, action: PayloadAction<IMessage>) => {
        state.loading = false;
        state.messages.push(action.payload);
      })
      .addCase(sendGuestMessage.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to send guest message";
      })

      /* MARK READ (Optimistic UI update) */
      .addCase(markGuestMessageRead.fulfilled, (state, action) => {
        const msg = state.messages.find(m => m._id === action.payload.messageId);
        if (msg) msg.status = "read";
      });
  },
});

/* =========================
    EXPORTS
========================= */
export const { clearGuestMessages, receiveNewMessage } = guestMessagesSlice.actions;
export default guestMessagesSlice.reducer;