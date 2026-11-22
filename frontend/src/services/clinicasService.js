import { apiRequest } from './apiClient';

export function listClinics() {
  return apiRequest('/clinics');
}

export function createClinic(data) {
  return apiRequest('/clinics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateClinicStatus(id, activa) {
  return apiRequest(`/clinics/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ activa }),
  });
}
