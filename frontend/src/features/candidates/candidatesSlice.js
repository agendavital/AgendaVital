import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { 
  createCandidate, 
  listCandidates
} from "../../services/candidatesService";

export const loadCandidates = createAsyncThunk(
  "candidates/load",
  async (_, { rejectWithValue  }) => {
    try {
      return await listCandidates();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerCandidate = createAsyncThunk(
  "candidates/register",
  async (candidate, { rejectWithValue }) => {
    try {
      return await createCandidate(candidate);
    } catch (error) {
      return rejectWithValue({
        status: error.status,
        message: error.message
      });
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,
  createSuccess: false
};

const candidatesSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCandidates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCandidates.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadCandidates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "No se pudieron cargar los candidatos.";
      })
      .addCase(registerCandidate.pending, (state) => {
        state.creating = true;
        state.createError = null;
        state.createSuccess = false;
      })
      .addCase(registerCandidate.fulfilled, (state, action) => {
        state.creating = false;
        state.createSuccess = true;
        state.items.unshift(action.payload);
      })
      .addCase(registerCandidate.rejected, (state, action) => {
        state.creating = false;
        state.createError =
          action.payload?.message ?? "No se pudo registrar el candidato.";
      });
    
  }
});

export default candidatesSlice.reducer;
