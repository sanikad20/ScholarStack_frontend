import api from "./axios";

// PUBLIC ROUTES
export const getCourses = () => api.get("/courses");
export const getCourseById = (id) => api.get(`/courses/${id}`);

// INSTITUTION ADMIN ONLY ROUTES
export const createCourse = (data) => api.post("/courses", data);
export const updateCourse = (id, data) => api.put(`/courses/${id}`, data);
export const deleteCourse = (id) => api.delete(`/courses/${id}`);