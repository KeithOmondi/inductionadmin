import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* =====================================================
   TYPES
===================================================== */

export type GuestType = "ADULT" | "MINOR";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type AgeGroup =
  | "UNDER_5"
  | "6_12"
  | "13_17"
  | "18_25"
  | "26_40"
  | "41_60"
  | "60_PLUS";

export type GuestListStatus = "DRAFT" | "SUBMITTED";

export interface IGuest {
  name?: string;
  type?: GuestType;
  gender?: Gender;
  ageGroup?: AgeGroup;
  idNumber?: string;
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

// 🔹 Get My Guest List
export const fetchMyGuestList = createAsyncThunk(
  "guests/fetchMyGuestList",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/guests/me", {
        withCredentials: true,
      });
      return data as IJudgeGuest;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to fetch guest list"
      );
    }
  }
);

// 🔹 Save Draft (create or update)
export const saveGuestList = createAsyncThunk(
  "guests/saveGuestList",
  async (guests: IGuest[], { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/guests/save",
        { guests },
        { withCredentials: true }
      );
      return data as IJudgeGuest;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to save draft"
      );
    }
  }
);

// 🔹 Submit Guest List
export const submitGuestList = createAsyncThunk(
  "guests/submitGuestList",
  async (guests: IGuest[], { rejectWithValue }) => {
    try {
      const { data } = await api.post(
        "/guests/submit",
        { guests },
        { withCredentials: true }
      );
      return data.data as IJudgeGuest; // backend returns { message, data }
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to submit guest list"
      );
    }
  }
);

// 🔹 Add More Guests
export const addGuests = createAsyncThunk(
  "guests/addGuests",
  async (guests: IGuest[], { rejectWithValue }) => {
    try {
      const { data } = await api.patch(
        "/guests/add",
        { guests },
        { withCredentials: true }
      );
      return data.data as IJudgeGuest;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to add guests"
      );
    }
  }
);

// 🔹 Delete Guest List
export const deleteGuestList = createAsyncThunk(
  "guests/deleteGuestList",
  async (_, { rejectWithValue }) => {
    try {
      await api.delete("/guests/delete", {
        withCredentials: true,
      });
      return true;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message || "Failed to delete guest list"
      );
    }
  }
);

// 🔹 Admin: Fetch All Guest Lists
export const fetchAllGuestLists = createAsyncThunk(
  "guests/fetchAllGuestLists",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get("/guests/admin/all", {
        withCredentials: true,
      });
      return data as IJudgeGuest[];
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ||
          "Failed to fetch all guest lists"
      );
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
    resetGuestState: (state) => {
      state.guestList = null;
      state.allGuestLists = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      /* ================= FETCH MY ================= */
      .addCase(fetchMyGuestList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchMyGuestList.fulfilled,
        (state, action: PayloadAction<IJudgeGuest>) => {
          state.loading = false;
          state.guestList = action.payload;
        }
      )
      .addCase(fetchMyGuestList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= SAVE DRAFT ================= */
      .addCase(saveGuestList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        saveGuestList.fulfilled,
        (state, action: PayloadAction<IJudgeGuest>) => {
          state.loading = false;
          state.guestList = action.payload;
        }
      )
      .addCase(saveGuestList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= SUBMIT ================= */
      .addCase(submitGuestList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        submitGuestList.fulfilled,
        (state, action: PayloadAction<IJudgeGuest>) => {
          state.loading = false;
          state.guestList = action.payload;
        }
      )
      .addCase(submitGuestList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= ADD GUESTS ================= */
      .addCase(addGuests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        addGuests.fulfilled,
        (state, action: PayloadAction<IJudgeGuest>) => {
          state.loading = false;
          state.guestList = action.payload;
        }
      )
      .addCase(addGuests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= DELETE ================= */
      .addCase(deleteGuestList.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGuestList.fulfilled, (state) => {
        state.loading = false;
        state.guestList = null;
      })
      .addCase(deleteGuestList.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ================= ADMIN FETCH ================= */
      .addCase(fetchAllGuestLists.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchAllGuestLists.fulfilled,
        (state, action: PayloadAction<IJudgeGuest[]>) => {
          state.loading = false;
          state.allGuestLists = action.payload;
        }
      )
      .addCase(fetchAllGuestLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetGuestState } = guestSlice.actions;
export default guestSlice.reducer;
