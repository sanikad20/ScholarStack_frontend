import api from "./axios";
export const getCourses = () => api.get("/courses");
export const getCourseById = (id) => api.get(`/courses/${id}`);