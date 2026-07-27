import api from './axios';

export const getMyNotifications = (params = {}) => api.get("/notifications/my", { params });
export const getUnreadCount = () => api.get("/notifications/unread/count");
export const markAsRead = (id) => api.put(`/notifications/${id}/read`);
export const markAllAsRead = () => api.put("/notifications/read-all");
export const deleteNotifications = (id) => api.delete(`/notifications/${id}`);