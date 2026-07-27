import api from './axios';

export const getAdminDashboard = () => api.get("/dashboard/admin");
export const getStatsByCourse = () => api.get("/dashboard/admin/stats/by-course");

// STUDENT DASHBOARD
export const getStudentDashboard = () => api.get("/dashboard/student");