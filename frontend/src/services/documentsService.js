import { apiRequest } from './apiClient';

export function getDocuments() {
  return apiRequest('/documents');
}
