import api from "./axios";
export const getMyApplications = () => api.get("/applications/my");
export const getWorkflowStatuses = () => api.get("/applications/workflow/statuses");