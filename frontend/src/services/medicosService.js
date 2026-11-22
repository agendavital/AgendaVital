import { apiRequest } from "./apiClient";

export function getMedicalStaffOptions() {
  return apiRequest("/medical-staff/options");
}

export function getMedicalStaff() {
  return apiRequest("/medical-staff");
}

export function createMedicalStaffMember(medico) {
  return apiRequest("/medical-staff", {
    method: "POST",
    body: JSON.stringify(medico),
  });
}
