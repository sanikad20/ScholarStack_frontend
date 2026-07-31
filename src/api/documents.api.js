import api from './axios';

// STUDENT ROUTES 
export const uploadDocument = (formData) => api.post("/documents/upload", formData, {
    headers : {"Content-Type" : "multipart/form-data"}
});
export const getDocuments = (applicationId) => api.get(`/documents/${applicationId}`);
export const getDocumentById = (id) => api.get(`/documents/single/${id}`);

// ADMIN ROUTES
export const updateDocumentStatus = (id, data) => api.put(`/documents/${id}/status`, data);
export const deleteDocument = (id) => api.delete(`/documents/${id}`);
export const verifyDocument = (id) => api.post(`documents/verify/${id}`);
