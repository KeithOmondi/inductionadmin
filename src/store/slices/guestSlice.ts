import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
  isAnyOf,
} from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* =====================================================
   TYPES
===================================================== */

export type GuestType = "ADULT" | "MINOR";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type GuestListStatus = "DRAFT" | "SUBMITTED";

export interface IGuest {
  name?: string;
  type?: GuestType;
  gender?: Gender;
  idNumber?: string;      // Required for Adults
  birthCertNumber?: string; // Required for Minors
  phone?: string;
  email?: string;
}

export interface IJudgeGuest {
  _id: string;
  user:
    | {
        _id: string;
        name: string;
        email: string;
        role: string;
      }
    | string;
  guests: IGuest[];
  status: GuestListStatus;
  createdAt: string;
  updatedAt: string;
}

interface GuestState {
  guestList: IJudgeGuest | null;
  allGuestLists: IJudgeGuest[];
  loading: boolean;
  error: string | null;
}

const initialState: GuestState = {
  guestList: null,
  allGuestLists: [],
  loading: false,
  error: null,
};

/* =====================================================
   THUNKS
===================================================== */

// Helper to handle standardized error messages
const getErrorMessage = (err: any, fallback: string) => 
  err.response?.data?.message || err.message || fallback;

export const fetchMyGuestList = createAsyncThunk(
  "guests/fetchMyGuestList",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/guests/me");
      // Standardizing: checking if your backend wraps in .data or returns direct object
      return (data.data || data) as IJudgeGuest;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch guest list"));
    }
  }
);

export const saveGuestList = createAsyncThunk(
  "guests/saveGuestList",
  async (guests: IGuest[], { rejectWithValue }) => {
    try {
      const { data } = await api.post("/guests/save", { guests });
      return (data.data || data) as IJudgeGuest;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "Failed to save draft"));
    }
  }
);

export const submitGuestList = createAsyncThunk(
  "guests/submitGuestList",
  async (guests: IGuest[], { rejectWithValue }) => {
    try {
      const { data } = await api.post("/guests/submit", { guests });
      return (data.data || data) as IJudgeGuest; 
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "Failed to submit guest list"));
    }
  }
);

export const addGuests = createAsyncThunk(
  "guests/addGuests",
  async (guests: IGuest[], { rejectWithValue }) => {
    try {
      const { data } = await api.patch("/guests/add", { guests });
      return (data.data || data) as IJudgeGuest;
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "Failed to add guests"));
    }
  }
);

export const deleteGuestList = createAsyncThunk(
  "guests/deleteGuestList",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/guests/delete");
      return null; 
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "Failed to delete guest list"));
    }
  }
);

export const fetchAllGuestLists = createAsyncThunk(
  "guests/fetchAllGuestLists",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/guests/admin/all");
      return (data.data || data) as IJudgeGuest[];
    } catch (err: any) {
      return rejectWithValue(getErrorMessage(err, "Failed to fetch all guest lists"));
    }
  }
);

/* =====================================================
   SLICE
===================================================== */

const guestSlice = createSlice({
  name: "guests",
  initialState,
  reducers: {
    resetGuestState: () => initialState, // Cleaner way to reset to defaults
  },
  extraReducers: (builder) => {
    builder
      /* SUCCESS: Specific cases for individual logic */
      .addCase(deleteGuestList.fulfilled, (state) => {
        state.loading = false;
        state.guestList = null;
      })
      .addCase(fetchAllGuestLists.fulfilled, (state, action) => {
        state.loading = false;
        state.allGuestLists = action.payload;
      })
      
      /* SUCCESS: Matcher for any thunk that updates the primary guestList */
      .addMatcher(
        isAnyOf(
          fetchMyGuestList.fulfilled, 
          saveGuestList.fulfilled, 
          submitGuestList.fulfilled, 
          addGuests.fulfilled
        ),
        (state, action: PayloadAction<IJudgeGuest>) => {
          state.loading = false;
          state.guestList = action.payload;
          state.error = null;
        }
      )

      /* GLOBAL PENDING MATCHERS */
      .addMatcher(
        (action) => action.type.endsWith("/pending") && action.type.startsWith("guests/"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )

      /* GLOBAL REJECTED MATCHERS */
      .addMatcher(
        (action) => action.type.endsWith("/rejected") && action.type.startsWith("guests/"),
        (state, action: PayloadAction<string>) => {
          state.loading = false;
          state.error = action.payload || "An unexpected error occurred";
        }
      );
  },
});

export const { resetGuestState } = guestSlice.actions;
export default guestSlice.reducer;