import { apiRequest } from './apiClient';

export function listCandidates() {
    return apiRequest("/candidates");
}

export function createCandidate(candidate) {
    return apiRequest("/candidates", {
        method: "POST",
        body: JSON.stringify(candidate)
    });
}