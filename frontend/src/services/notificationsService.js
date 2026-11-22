import { apiRequest } from './apiClient';

export function listNotifications() {
  return apiRequest('/notifications');
}

export function markNotificationAsRead(notificationId) {
  return apiRequest(`/notifications/${encodeURIComponent(notificationId)}/read`, {
    method: 'PATCH',
  });
}
