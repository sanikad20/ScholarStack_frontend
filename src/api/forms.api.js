import api from './axios';

// PUBLIC ROUTE 
export const getFormTemplateByCourse = (courseId) => api.get(`/forms/course/${courseId}`);

// ADMIN ROUTES
export const getFormTemplates = () => api.get("/forms");
export const getFormTemplateById = (id) => api.get(`/forms/${id}`);
export const createFormTemplate = (data) => api.post("/forms", data);
export const updateFormTemplate = (id, data) => api.put(`/forms/${id}`, data);
export const deleteFormTemplate = (id) => api.delete(`/forms/${id}`);