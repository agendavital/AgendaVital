import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

export const fetchAuditLogs = createAsyncThunk(
  "data/fetchAuditLogs",
  async () => [],
);

const dataSlice = createSlice({
  name: "data",
  initialState: {
    auditLogs: [],
    appointments: [],
    documents: [],
    notifications: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchAuditLogs.fulfilled, (state, action) => {
      state.auditLogs = action.payload;
    });
  },
});

export default dataSlice.reducer;
