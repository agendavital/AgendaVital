import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { appointments, documents } from "../../services/mockData";
import { createCandidate, listCandidates } from "../../services/candidateService";
import { listAuditLogs } from "../../services/auditService";

export const fetchCandidates = createAsyncThunk("data/fetchCandidates", listCandidates);
export const addCandidate = createAsyncThunk("data/addCandidate", createCandidate);
export const fetchAuditLogs = createAsyncThunk("data/fetchAuditLogs", listAuditLogs);

const dataSlice = createSlice({
  name: "data",
  initialState: {
    candidates: [],
    appointments,
    documents,
    auditLogs: [],
    notifications: [
      { id: 1, title: "Cita programada", message: "Maria Gomez tiene cita el 18 de junio.", read: false },
      { id: 2, title: "Documento restringido", message: "Historia clinica requiere autorizacion.", read: false }
    ],
    status: "idle"
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCandidates.fulfilled, (state, action) => {
        state.candidates = action.payload;
      })
      .addCase(addCandidate.fulfilled, (state, action) => {
        state.candidates.unshift(action.payload);
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditLogs = action.payload;
      });
  }
});

export default dataSlice.reducer;
