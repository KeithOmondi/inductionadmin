// src/store/slices/guests/guestCourtInfoSlice.ts

import {
  createSlice,
  createAsyncThunk,
  type ActionReducerMapBuilder,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../../api/axios";

/* ===========================
    TYPES
=========================== */

export interface ContentItem {
  type: "IMAGE" | "VIDEO" | "TEXT" | "FILE";
  url?: string;
  publicId?: string;
  body?: string;
  fileName?: string;
  thumbnailUrl?: string;
  createdAt?: string | Date;
}

export interface Division {
  _id: string;
  name: string;
  title?: string;
  description?: string;
  order?: number;
  content: ContentItem[]; // Explicitly typed content array
}

export interface FAQ {
  _id: string;
  question: string;
  answer: string;
}

export interface Contact {
  _id: string;
  title: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CourtInfoPayload {
  divisions: Division[];
  faqs: FAQ[];
  contacts: Contact[];
}

interface CourtInfoState {
  divisions: Division[];
  faqs: FAQ[];
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

/* ===========================
    INITIAL STATE
=========================== */

const initialState: CourtInfoState = {
  divisions: [],
  faqs: [],
  contacts: [],
  loading: false,
  error: null,
};

/* ===========================
    ASYNC THUNK
=========================== */

/**
 * Fetches the unified court information.
 * Updated to return res.data directly to align with the flat 
 * structure returned by the revised Guest Controller.
 */
export const fetchGuestCourtInfo = createAsyncThunk<
  CourtInfoPayload,
  void,
  { rejectValue: string }
>("guestCourtInfo/fetchGuestCourtInfo", async (_, { rejectWithValue }) => {
  try {
    // res.data is now { divisions: [...], faqs: [...], contacts: [...] }
    const res = await api.get("/courts/court-info");
    return res.data; 
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to fetch court information"
    );
  }
});

/* ===========================
    SLICE
=========================== */

const guestCourtInfoSlice = createSlice({
  name: "guestCourtInfo",
  initialState,

  reducers: {
    clearCourtError: (state) => {
      state.error = null;
    },

    clearCourtData: (state) => {
      state.divisions = [];
      state.faqs = [];
      state.contacts = [];
      state.error = null;
      state.loading = false;
    },
  },

  extraReducers: (builder: ActionReducerMapBuilder<CourtInfoState>) => {
    builder
      /* ---------- FETCH COURT INFO ---------- */
      .addCase(fetchGuestCourtInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchGuestCourtInfo.fulfilled,
        (state, action: PayloadAction<CourtInfoPayload>) => {
          state.loading = false;
          // Successfully maps the flat payload to the state
          state.divisions = action.payload.divisions;
          state.faqs = action.payload.faqs;
          state.contacts = action.payload.contacts;
        }
      )
      .addCase(
        fetchGuestCourtInfo.rejected,
        (state, action: PayloadAction<string | undefined>) => {
          state.loading = false;
          state.error = action.payload || "Failed to load court information";
        }
      );
  },
});

/* ===========================
    EXPORTS
=========================== */

export const { clearCourtError, clearCourtData } = guestCourtInfoSlice.actions;

export default guestCourtInfoSlice.reducer;