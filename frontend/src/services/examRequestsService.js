import { apiRequest } from "./apiClient";

export function getExamRequestOptions() {
  return apiRequest("/exam-requests/options");
}

export function getExamRequests() {
  return apiRequest("/exam-requests");
}

export function createExamRequests(request) {
  return apiRequest("/exam-requests", {
    method: "POST",
    body: JSON.stringify(request),
  });
}
