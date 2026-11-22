import { apiRequest } from './apiClient';

export function listAuditLogs() {
  return apiRequest('/audit');
}
