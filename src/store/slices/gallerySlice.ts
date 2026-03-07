import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

// NOTE: Ensure your axios 'api' instance has the baseURL set to include '/api/v1'
// If not, use `/api/v1/gallary` in the strings below.

// Types
export interface IGallery {
  _id: string;
  title: string;
  description: string;
  category: string;
  url: string;
  resourceType: "image" | "video";
  uploadedBy?: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

interface GalleryState {
  items: IGallery[];
  loading: boolean;
  error: string | null;
}

const initialState: GalleryState = {
  items: [],
  loading: false,
  error: null,
};

// -------------------- THUNKS --------------------

// Updated to use "gallary" to match app.use("/api/v1/gallary", ...)
const BASE_URL = "/gallary"; 

export const fetchGallery = createAsyncThunk(
  "gallery/fetchGallery",
  async ({ category }: { category?: string }, { rejectWithValue }) => {
    try {
      // Matches router.get("/")
      const res = await api.get(`${BASE_URL}${category ? `?category=${category}` : ""}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch gallery");
    }
  }
);

export const fetchGalleryAdmin = createAsyncThunk(
  "gallery/fetchGalleryAdmin", 
  async (_, { rejectWithValue }) => {
    try {
      // Matches router.get("/admin")
      const res = await api.get(`${BASE_URL}/admin`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch admin gallery");
    }
  }
);

export const uploadMedia = createAsyncThunk(
  "gallery/uploadMedia",
  async (formData: FormData, { rejectWithValue }) => {
    try {
      // Matches router.post("/upload")
      const res = await api.post(`${BASE_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to upload media");
    }
  }
);

export const deleteMedia = createAsyncThunk(
  "gallery/deleteMedia",
  async (id: string, { rejectWithValue }) => {
    try {
      // Matches router.delete("/:id")
      await api.delete(`${BASE_URL}/${id}`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete media");
    }
  }
);

// -------------------- SLICE --------------------
const gallerySlice = createSlice({
  name: "gallery",
  initialState,
  reducers: {
    clearGalleryError(state) {
      state.error = null;
    },
    resetGallery(state) {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchGallery.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGallery.fulfilled, (state, action: PayloadAction<IGallery[]>) => { 
        state.loading = false; 
        state.items = action.payload; 
      })
      .addCase(fetchGallery.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })
      // ADMIN FETCH
      .addCase(fetchGalleryAdmin.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchGalleryAdmin.fulfilled, (state, action: PayloadAction<IGallery[]>) => { 
        state.loading = false; 
        state.items = action.payload; 
      })
      .addCase(fetchGalleryAdmin.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })
      // UPLOAD
      .addCase(uploadMedia.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(uploadMedia.fulfilled, (state, action: PayloadAction<IGallery>) => { 
        state.loading = false; 
        state.items.unshift(action.payload); 
      })
      .addCase(uploadMedia.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      })
      // DELETE
      .addCase(deleteMedia.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(deleteMedia.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.items = state.items.filter(item => item._id !== action.payload);
      })
      .addCase(deleteMedia.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload as string; 
      });
  },
});

export const { clearGalleryError, resetGallery } = gallerySlice.actions;
export default gallerySlice.reducer;