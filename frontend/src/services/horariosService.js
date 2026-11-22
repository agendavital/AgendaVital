import { apiRequest } from './apiClient';

export function listManagedAvailability() {
  return apiRequest('/availability-management');
}

export function createAvailability(data) {
  return apiRequest('/availability-management', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function cancelAvailability(id) {
  return apiRequest(`/availability-management/${id}/cancel`, {
    method: 'PATCH',
  });
}
