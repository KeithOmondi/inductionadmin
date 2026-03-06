import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  createGuest,
  getAllGuests,
  deleteGuest,
  getGuestProfile,
} from "./guestService";
import type { IGuest } from "../../types/guestTypes";

/* =========================
   STATE
========================= */

interface GuestState {
  guests: IGuest[];
  profile: IGuest | null;
  loading: boolean;
  error: string | null;
}

const initialState: GuestState = {
  guests: [],
  profile: null,
  loading: false,
  error: null,
};

/* =========================
   THUNKS
========================= */

export const fetchGuests = createAsyncThunk(
  "guest/fetchGuests",
  async (_, thunkAPI) => {
    try {
      return await getAllGuests();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const addGuest = createAsyncThunk(
  "guest/addGuest",
  async (
    data: { name: string; email: string; password: string },
    thunkAPI
  ) => {
    try {
      return await createGuest(data);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const removeGuest = createAsyncThunk(
  "guest/removeGuest",
  async (id: string, thunkAPI) => {
    try {
      return await deleteGuest(id);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

export const fetchGuestProfile = createAsyncThunk(
  "guest/profile",
  async (_, thunkAPI) => {
    try {
      return await getGuestProfile();
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message);
    }
  }
);

/* =========================
   SLICE
========================= */

const guestSlice = createSlice({
  name: "g",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder

      /* FETCH GUESTS */
      .addCase(fetchGuests.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchGuests.fulfilled, (state, action) => {
        state.loading = false;
        state.guests = action.payload;
      })
      .addCase(fetchGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* CREATE GUEST */
      .addCase(addGuest.fulfilled, (state, action) => {
        state.guests.push(action.payload);
      })

      /* DELETE GUEST */
      .addCase(removeGuest.fulfilled, (state, action) => {
        state.guests = state.guests.filter(
          (g) => g._id !== action.payload
        );
      })

      /* PROFILE */
      .addCase(fetchGuestProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export default guestSlice.reducer;
