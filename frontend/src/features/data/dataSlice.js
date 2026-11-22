import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { listAuditLogs } from "../../services/auditService";
import {
  listNotifications,
  markNotificationAsRead,
} from "../../services/notificationsService";

export const fetchAuditLogs = createAsyncThunk(
  "data/fetchAuditLogs",
  listAuditLogs,
);
export const fetchNotifications = createAsyncThunk(
  "data/fetchNotifications",
  listNotifications,
);
export const markNotificationRead = createAsyncThunk(
  "data/markNotificationRead",
  markNotificationAsRead,
);

const dataSlice = createSlice({
  name: "data",
  initialState: {
    auditLogs: [],
    auditStatus: "idle",
    auditError: null,
    appointments: [],
    documents: [],
    notifications: [],
    notificationsStatus: "idle",
    notificationsError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.auditStatus = "loading";
        state.auditError = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.auditStatus = "succeeded";
        state.auditLogs = action.payload;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.auditStatus = "failed";
        state.auditError = action.error.message ?? "No se pudo cargar la auditoría.";
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.notificationsStatus = "loading";
        state.notificationsError = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notificationsStatus = "succeeded";
        state.notifications = action.payload;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.notificationsStatus = "failed";
        state.notificationsError =
          action.error.message ?? "No se pudieron cargar las notificaciones.";
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (item) => item.id === action.payload.id,
        );
        if (notification) Object.assign(notification, action.payload);
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        state.notificationsError =
          action.error.message ?? "No se pudo actualizar la notificación.";
      });
  },
});

export default dataSlice.reducer;
