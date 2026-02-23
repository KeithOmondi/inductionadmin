// store/slices/courtSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";

// ----------------- TYPES -----------------
interface Division { _id: string; name: string; }
interface FAQ { _id: string; question: string; answer: string; }
interface Contact { _id: string; title: string; detail: string; sub?: string; }

interface CourtState {
  divisions: Division[];
  faqs: FAQ[];
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

const initialState: CourtState = {
  divisions: [],
  faqs: [],
  contacts: [],
  loading: false,
  error: null,
};

// ----------------- ASYNC THUNKS -----------------

export const fetchCourtInfo = createAsyncThunk("court/fetchCourtInfo", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/courts/get");
    return data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Failed to fetch court info");
  }
});

// --- DIVISION THUNKS ---
export const createDivision = createAsyncThunk("court/createDivision", async (name: string, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/courts/divisions", { name });
    return data;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to create division"); }
});

export const updateDivision = createAsyncThunk("court/updateDivision", async ({ id, name }: { id: string; name: string }, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/courts/divisions/${id}`, { name });
    return data;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to update division"); }
});

export const deleteDivision = createAsyncThunk("court/deleteDivision", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/courts/divisions/${id}`);
    return id;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to delete division"); }
});

// --- FAQ THUNKS ---
export const createFaq = createAsyncThunk("court/createFaq", async (faq: Omit<FAQ, '_id'>, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/courts/faqs", faq);
    return data;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to create FAQ"); }
});

// In courtSlice.ts
export const updateFaq = createAsyncThunk(
  "court/updateFaq", 
  async (arg: { _id: string } & Partial<Omit<FAQ, '_id'>>, { rejectWithValue }) => {
    try {
      const { _id, ...updateData } = arg;
      const { data } = await api.put(`/courts/faqs/${_id}`, updateData);
      return data;
    } catch (err: any) { 
      return rejectWithValue(err.response?.data?.message || "Failed to update FAQ"); 
    }
  }
);

export const deleteFaq = createAsyncThunk("court/deleteFaq", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/courts/faqs/${id}`);
    return id;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to delete FAQ"); }
});

// --- CONTACT THUNKS ---
export const createContact = createAsyncThunk("court/createContact", async (contact: Omit<Contact, '_id'>, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/courts/contacts", contact);
    return data;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to create contact"); }
});

export const updateContact = createAsyncThunk(
  "court/updateContact",
  // Change { id, ...contact } to { _id, ...contact }
  async ({ _id, ...contact }: Contact, { rejectWithValue }) => {
    try {
      const { data } = await api.put(`/courts/contacts/${_id}`, contact);
      return data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Failed to update contact");
    }
  }
);

export const deleteContact = createAsyncThunk("court/deleteContact", async (id: string, { rejectWithValue }) => {
  try {
    await api.delete(`/courts/contacts/${id}`);
    return id;
  } catch (err: any) { return rejectWithValue(err.response?.data?.message || "Failed to delete contact"); }
});

// ----------------- SLICE -----------------
const courtSlice = createSlice({
  name: "court",
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourtInfo.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCourtInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.divisions = action.payload.divisions || [];
        state.faqs = action.payload.faqs || [];
        state.contacts = action.payload.contacts || [];
      })
      .addCase(fetchCourtInfo.rejected, (state, action: any) => { state.loading = false; state.error = action.payload; })

      // DIVISIONS
      .addCase(createDivision.fulfilled, (state, action) => { state.divisions.push(action.payload); })
      .addCase(updateDivision.fulfilled, (state, action) => {
        const idx = state.divisions.findIndex(d => d._id === action.payload._id);
        if (idx !== -1) state.divisions[idx] = action.payload;
      })
      .addCase(deleteDivision.fulfilled, (state, action) => {
        state.divisions = state.divisions.filter(d => d._id !== action.payload);
      })

      // FAQs
      .addCase(createFaq.fulfilled, (state, action) => { state.faqs.push(action.payload); })
      .addCase(updateFaq.fulfilled, (state, action) => {
        const idx = state.faqs.findIndex(f => f._id === action.payload._id);
        if (idx !== -1) state.faqs[idx] = action.payload;
      })
      .addCase(deleteFaq.fulfilled, (state, action) => {
        state.faqs = state.faqs.filter(f => f._id !== action.payload);
      })

      // CONTACTS
      .addCase(createContact.fulfilled, (state, action) => { state.contacts.push(action.payload); })
      .addCase(updateContact.fulfilled, (state, action) => {
        const idx = state.contacts.findIndex(c => c._id === action.payload._id);
        if (idx !== -1) state.contacts[idx] = action.payload;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.contacts = state.contacts.filter(c => c._id !== action.payload);
      })

      // Global Error Catcher for Rejected Actions
      .addMatcher((action) => action.type.endsWith("/rejected"), (state, action: any) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { clearError } = courtSlice.actions;
export default courtSlice.reducer;