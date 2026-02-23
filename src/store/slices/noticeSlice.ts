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
  publicId: string;
  size: string;
  views: number;
  downloads: number;
  createdAt: string;
}

interface NoticeState {
  notices: INotice[];
  notice?: INotice;
  loading: boolean;
  error?: string;
}

const initialState: NoticeState = {
  notices: [],
  loading: false,
};



/* ================= THUNKS ================= */

export const fetchNotices = createAsyncThunk(
  "notices/fetchAll",
  async (
    params: { type?: string; search?: string } | undefined,
    thunkAPI
  ) => {
    try {
      const { data } = await api.get(`/notices/get`, {
        params,
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// Fetch single notice
export const fetchNoticeById = createAsyncThunk(
  "notices/fetchOne",
  async (id: string, thunkAPI) => {
    try {
      const { data } = await api.get(`/notices/get/${id}`, {
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// Download notice
export const downloadNotice = createAsyncThunk(
  "notices/download",
  async (id: string, thunkAPI) => {
    try {
      const { data } = await api.get(`/notices/download/${id}`, {
        withCredentials: true,
      });
      window.open(data.url, "_blank");
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// Create notice (admin)
export const createNotice = createAsyncThunk(
  "notices/create",
  async (formData: FormData, thunkAPI) => {
    try {
      const { data } = await api.post(`/notices/ceate`, formData, {
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// Update notice
export const updateNotice = createAsyncThunk(
  "notices/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    try {
      const { data } = await api.put(`/notices/update/${id}`, formData, {
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

// Delete notice
export const deleteNotice = createAsyncThunk(
  "notices/delete",
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/notices/delete/${id}`, {
        withCredentials: true,
      });
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

/* ================= SLICE ================= */

const noticeSlice = createSlice({
  name: "notices",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchNotices.pending, (state) => {
        state.loading = true;
      })
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
      })

      /* CREATE */
      .addCase(createNotice.fulfilled, (state, action) => {
        state.notices.unshift(action.payload);
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

export default noticeSlice.reducer;