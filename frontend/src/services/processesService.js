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
