import { createSlice } from "@reduxjs/toolkit";

const candidatesSlice = createSlice({
  name: "candidates",
  initialState: [],
  reducers: {
    candidateAdded(state, action) {
      state.unshift({
        ...action.payload,
        id: Date.now(),
        status: "Registrado",
        concept: "Pendiente"
      });
    }
  }
});

export const { candidateAdded } = candidatesSlice.actions;
export default candidatesSlice.reducer;
