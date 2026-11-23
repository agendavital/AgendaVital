import { apiRequest } from './apiClient';

export function getMyProcess() {
  return apiRequest('/candidate-portal');
}
