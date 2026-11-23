import { apiRequest } from './apiClient';

export function getReportSummary() {
  return apiRequest('/reports/summary');
}
