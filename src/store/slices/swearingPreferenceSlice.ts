import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* =====================================================
   TYPES
===================================================== */

export interface SwearingPreference {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role?: string;
  };
  ceremonyChoice: "oath" | "affirmation";
  religiousText?: string;
  createdAt: string;
  updatedAt: string;
}

interface SwearingPreferenceState {
  myPreference: SwearingPreference | null;
  preferences: SwearingPreference[];
  selectedPreference: SwearingPreference | null;
  loading: boolean;
  error: string | null;
}

const initialState: SwearingPreferenceState = {
  myPreference: null,
  preferences: [],
  selectedPreference: null,
  loading: false,
  error: null,
};

/* =====================================================
   THUNKS
===================================================== */

// USER ACTIONS
export const saveSwearingPreference = createAsyncThunk(
  "swearingPreference/save",
  async (data: { ceremonyChoice: string; religiousText?: string }, { rejectWithValue }) => {
    try {
      const response = await api.post("/oath/save", data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to save preference");
    }
  }
);

export const getMySwearingPreference = createAsyncThunk(
  "swearingPreference/getMy",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/oath/me");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch preference");
    }
  }
);

// ADMIN ACTIONS
export const getAllSwearingPreferences = createAsyncThunk(
  "swearingPreference/getAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/oath/get");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch preferences");
    }
  }
);

export const getSwearingPreferenceByUser = createAsyncThunk(
  "swearingPreference/getByUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/oath/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch preference");
    }
  }
);

export const adminUpdateSwearingPreference = createAsyncThunk(
  "swearingPreference/adminUpdate",
  async ({ userId, data }: { userId: string; data: { ceremonyChoice: string; religiousText?: string } }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/oath/${userId}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update preference");
    }
  }
);

export const deleteSwearingPreference = createAsyncThunk(
  "swearingPreference/delete",
  async (userId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/oath/${userId}`);
      return userId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete preference");
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const swearingPreferenceSlice = createSlice({
  name: "swearingPreference",
  initialState,
  reducers: {
    clearSwearingPreferenceState: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      /* SUCCESS HANDLERS */
      .addCase(saveSwearingPreference.fulfilled, (state, action: PayloadAction<SwearingPreference>) => {
        state.loading = false;
        state.myPreference = action.payload;
      })
      .addCase(getMySwearingPreference.fulfilled, (state, action: PayloadAction<SwearingPreference>) => {
        state.loading = false;
        state.myPreference = action.payload;
      })
      .addCase(getAllSwearingPreferences.fulfilled, (state, action: PayloadAction<SwearingPreference[]>) => {
        state.loading = false;
        state.preferences = action.payload;
      })
      .addCase(getSwearingPreferenceByUser.fulfilled, (state, action: PayloadAction<SwearingPreference>) => {
        state.loading = false;
        state.selectedPreference = action.payload;
      })
      .addCase(adminUpdateSwearingPreference.fulfilled, (state, action: PayloadAction<SwearingPreference>) => {
        state.loading = false;
        state.selectedPreference = action.payload;
        // Update the item in the list for real-time UI updates
        const index = state.preferences.findIndex(p => p.user._id === action.payload.user._id);
        if (index !== -1) state.preferences[index] = action.payload;
      })
      .addCase(deleteSwearingPreference.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.preferences = state.preferences.filter((pref) => pref.user._id !== action.payload);
        if (state.selectedPreference?.user._id === action.payload) {
          state.selectedPreference = null;
        }
      })

      /* GLOBAL MATCHERS (Generic Loading/Error State) */
      .addMatcher(
        (action) => action.type.startsWith("swearingPreference/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("swearingPreference/") && action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.error = action.payload as string;
        }
      );
  },
});

export const { clearSwearingPreferenceState } = swearingPreferenceSlice.actions;
export default swearingPreferenceSlice.reducer;