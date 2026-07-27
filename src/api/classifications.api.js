import api from './axios';

// INSTITUION ADMIN ONLY ROUTES
export const getClassificationRules = () => api.get("/classifications/rules");
export const updateClassificationRules = (data) => api.put("/classifications/rules", data);
export const classifySingleApplication = (applicationId) => api.post(`/classifications/${applicationId}/classify`);
export const classifyAllApplications = () => api.post("/classifications/classify-all");
export const getClassifications = (params = {}) => api.get("/classifications", { params });
export const getClassificationStats = () => api.get("/classifications/stats");
export const filterByClassification = (params = {}) => api.get("/classifications/filter", { params });
export const getApplicationByClassification = (classificationId) => api.get(`/classifications/${classificationId}/applications`);