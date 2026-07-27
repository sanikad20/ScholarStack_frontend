import api from './axios';

// SUPER ADMIN ONLY ROUTES
export const getInstitutions = () => api.get("/institutions");
export const createInstitution = (data) => api.post("/institutions", data);
export const deleteInstitution = (id) => api.delete(`/institutions/${id}`);

// SUPER ADMIN OR OWN INSTITUTION
export const getInstitutionById = (id) => api.get(`/institutions/${id}`);
export const updateInstitution = (id, data) => api.put(`/institutions/${id}`, data);