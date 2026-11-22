import { apiRequest } from "./apiClient";

export function getEvaluationOptions() {
  return apiRequest("/medical-results/options");
}

export function getEvaluations() {
  return apiRequest("/medical-results");
}

export function createEvaluation(evaluation) {
  return apiRequest("/medical-results", {
    method: "POST",
    body: JSON.stringify(evaluation),
  });
}
