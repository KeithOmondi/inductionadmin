import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

/* ================= TYPES ================= */

export type EventFilter = "UPCOMING" | "PAST" | "RECENT" | "ALL";
export type EventStatus = "SCHEDULED" | "ONGOING" | "COMPLETED" | "CANCELLED";

/* ================= EVENT INTERFACE ================= */

export interface IEvent {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;         // ISO string (Date only)
  time: string;         // e.g., "14:30"
  scheduledAt: string;  // ISO string (Combined Date + Time for countdown)
  status: EventStatus;
  isMandatory: boolean;
  capacity?: number;
  createdBy: string | { _id: string; name: string; role: string };
  createdAt: string;
  updatedAt?: string;
}

interface EventState {
  events: IEvent[];
  event?: IEvent;
  loading: boolean;
  error?: string;
}

const initialState: EventState = {
  events: [],
  loading: false,
};

/* ================= THUNKS ================= */

// Fetch events with filter
export const fetchEvents = createAsyncThunk(
  "events/fetchAll",
  async (params: { filter?: EventFilter } | undefined, thunkAPI) => {
    try {
      const { data } = await api.get(`/events/get`, {
        params,
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch events");
    }
  }
);

// Fetch single event
export const fetchEventById = createAsyncThunk(
  "events/fetchOne",
  async (id: string, thunkAPI) => {
    try {
      const { data } = await api.get(`/events/get/${id}`, {
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Failed to fetch event");
    }
  }
);

// Create event (admin)
export const createEvent = createAsyncThunk(
  "events/create",
  async (
    formData: {
      title: string;
      description: string;
      location: string;
      date: string;
      time: string;
      isMandatory: boolean;
      capacity?: number;
      status?: EventStatus;
    },
    thunkAPI
  ) => {
    try {
      const { data } = await api.post("/events/create", formData, {
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Creation failed");
    }
  }
);

// Update event (admin)
export const updateEvent = createAsyncThunk(
  "events/update",
  async (
    { id, formData }: { id: string; formData: Partial<IEvent> },
    thunkAPI
  ) => {
    try {
      const { data } = await api.put(`/events/update/${id}`, formData, {
        withCredentials: true,
      });
      return data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

// Delete event (admin)
export const deleteEvent = createAsyncThunk(
  "events/delete",
  async (id: string, thunkAPI) => {
    try {
      await api.delete(`/events/delete/${id}`, {
        withCredentials: true,
      });
      return id;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || "Deletion failed");
    }
  }
);

/* ================= SLICE ================= */

const eventSlice = createSlice({
  name: "events",
  initialState,
  reducers: {
    // Helpful for clearing error state on navigation
    clearEventError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    builder
      /* FETCH ALL */
      .addCase(fetchEvents.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.loading = false;
        state.events = action.payload;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* FETCH ONE */
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.event = action.payload;
      })

      /* CREATE */
      .addCase(createEvent.fulfilled, (state, action) => {
        // Unshift adds to the top of the list
        state.events.unshift(action.payload);
      })

      /* UPDATE */
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.events = state.events.map((e) =>
          e._id === action.payload._id ? action.payload : e
        );
        // Also update the single event state if it's the one being edited
        if (state.event?._id === action.payload._id) {
          state.event = action.payload;
        }
      })

      /* DELETE */
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e._id !== action.payload);
      });
  },
});

export const { clearEventError } = eventSlice.actions;
export default eventSlice.reducer;