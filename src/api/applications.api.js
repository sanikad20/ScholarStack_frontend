import api from "./axios";

// STUDENT ROUTES
export const getMyApplications = () => api.get("/applications/my");
export const getWorkflowStatuses = () => api.get("/applications/workflow/statuses");
export const submitApplication = (data) => api.post("/applications", data);
export const saveDraft = (id, data) => api.put(`/applications/${id}/draft`, data);
export const getApplicationById = (id) => api.get(`/applications/${id}`);
export const getApplicationTimeline = (id) => api.get(`/applications/${id}/timeline`);

// ADMIN ROUTES
export const getAllApplications = () => api.get("/applications/admin/all");
export const updateApplicationStatus = (id, data) => api.put(`/applications/admin/${id}`, data);
export const filterApplications = (params) => api.get("/applications/admin/filter", {params});
export const deleteApplication = (id) => api.delete(`/applications/${id}`);