import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* ================= TYPES ================= */
export type NoticeType = "CIRCULAR" | "EVENTS" | "NOTICE" | "URGENT";

export interface INotice {
  _id: string;
  title: string;
  description: string;
  type: NoticeType;
  isUrgent: boolean;
  fileUrl: string;
  fileName?: string; // Matches backend refactor
  size?: string; // Matches backend refactor
  views: number;
  downloads: number;
  createdAt: string;
}

interface NoticeState {
  notices: INotice[];
  publicNotices: INotice[]; // Separated for landing pages
  notice?: INotice;
  loading: boolean;
  error?: string;
}

const initialState: NoticeState = {
  notices: [],
  publicNotices: [],
  loading: false,
};

/* ================= THUNKS ================= */

// 1. PUBLIC: Fetch notices (No auth needed usually, but your router has 'protect' so keep withCredentials)
export const fetchPublicNotices = createAsyncThunk(
  "notices/fetchPublic",
  async (params: { type?: string; search?: string } | undefined, thunkAPI) => {
    try {
      const { data } = await api.get(`/notices/public`, { params });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch public notices");
    }
  }
);

// 2. ADMIN/INTERNAL: Fetch all notices
export const fetchNotices = createAsyncThunk(
  "notices/fetchAll",
  async (params: { type?: string; search?: string } | undefined, thunkAPI) => {
    try {
      const { data } = await api.get(`/notices/get`, { params, withCredentials: true });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// 3. Create notice (FIXED TYPO: /ceate -> /create)
export const createNotice = createAsyncThunk(
  "notices/create",
  async (formData: FormData, thunkAPI) => {
    try {
      const { data } = await api.post(`/notices/create`, formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// 4. Download (Updates local state count)
export const downloadNotice = createAsyncThunk(
  "notices/download",
  async (id: string, thunkAPI) => {
    try {
      const { data } = await api.get(`/notices/download/${id}`, { withCredentials: true });
      window.open(data.url, "_blank");
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

/* --- Keep other thunks (fetchNoticeById, updateNotice, deleteNotice) as they were --- */
export const fetchNoticeById = createAsyncThunk("notices/fetchOne", async (id: string, thunkAPI) => {
  try {
    const { data } = await api.get(`/notices/get/${id}`, { withCredentials: true });
    return data;
  } catch (err: any) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});

export const updateNotice = createAsyncThunk("notices/update", async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
  try {
    const { data } = await api.put(`/notices/update/${id}`, formData, { withCredentials: true });
    return data;
  } catch (err: any) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});

export const deleteNotice = createAsyncThunk("notices/delete", async (id: string, thunkAPI) => {
  try {
    await api.delete(`/notices/delete/${id}`, { withCredentials: true });
    return id;
  } catch (err: any) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});


/* ================= SLICE ================= */

const noticeSlice = createSlice({
  name: "notices",
  initialState,
  reducers: {
    clearNoticeError: (state) => { state.error = undefined; }
  },
  extraReducers: (builder) => {
    builder
      /* PUBLIC FETCH */
      .addCase(fetchPublicNotices.fulfilled, (state, action) => {
        state.loading = false;
        state.publicNotices = action.payload;
      })
      /* INTERNAL FETCH */
      .addCase(fetchNotices.pending, (state) => { state.loading = true; })
      .addCase(fetchNotices.fulfilled, (state, action) => {
        state.loading = false;
        state.notices = action.payload;
      })
      .addCase(fetchNotices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      /* FETCH ONE */
      .addCase(fetchNoticeById.fulfilled, (state, action) => {
        state.notice = action.payload;
        // Update the item in the list too so the view count stays fresh
        const index = state.notices.findIndex(n => n._id === action.payload._id);
        if (index !== -1) state.notices[index] = action.payload;
      })
      /* CREATE */
      .addCase(createNotice.fulfilled, (state, action) => {
        state.notices.unshift(action.payload);
      })
      /* DOWNLOAD (Increment local download count) */
      .addCase(downloadNotice.fulfilled, (state, action) => {
        const notice = state.notices.find(n => n._id === action.payload);
        if (notice) notice.downloads += 1;
      })
      /* UPDATE */
      .addCase(updateNotice.fulfilled, (state, action) => {
        state.notices = state.notices.map((n) =>
          n._id === action.payload._id ? action.payload : n
        );
      })
      /* DELETE */
      .addCase(deleteNotice.fulfilled, (state, action) => {
        state.notices = state.notices.filter((n) => n._id !== action.payload);
      });
  },
});

export const { clearNoticeError } = noticeSlice.actions;
export default noticeSlice.reducer;