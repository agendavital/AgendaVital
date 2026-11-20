import { apiRequest } from "./apiClient";

export function getAppointmentOptions() {
  return apiRequest("/appointments/options");
}

export function getAppointments() {
  return apiRequest("/appointments");
}

export function getAppointmentAvailability({ clinicId, from, to }) {
  const query = new URLSearchParams({ clinicId, from, to });
  return apiRequest(`/appointments/availability?${query.toString()}`);
}

export function createAppointment(appointment) {
  return apiRequest("/appointments", {
    method: "POST",
    body: JSON.stringify(appointment),
  });
}
