import { apiRequest } from './apiClient';

export function getRoleAccessMatrix() {
  return apiRequest('/access-control/roles');
}

export function saveRolePermissions(roleId, permissions) {
  return apiRequest(`/access-control/roles/${roleId}/permissions`, {
    method: 'PUT',
    body: JSON.stringify({ permissions }),
  });
}
