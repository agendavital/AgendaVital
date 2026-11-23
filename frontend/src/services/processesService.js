import { apiRequest } from "./apiClient";

export function getProcesses() {
  return apiRequest("/processes");
}

export function getProcessOptions() {
  return apiRequest("/processes/options");
}

export function createProcess(process) {
  return apiRequest("/processes", {
    method: "POST",
    body: JSON.stringify(process),
  });
}

export function getWorkplaceProfile(processId) {
  return apiRequest(`/processes/${processId}/workplace-profile`);
}

export function saveWorkplaceProfile(processId, profile) {
  return apiRequest(`/processes/${processId}/workplace-profile`, {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}
