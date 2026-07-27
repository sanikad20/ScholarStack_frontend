import api from './axios';

// PUBLIC ROUTES 
export const registerStudent = (data) => api.post("/auth/register/student", data);
export const login = (credentials) => api.post("/auth/login", credentials);
export const forgotPassword = (email) => api.post("/auth/forgot-password", { email });
export const resetPassword = (token, newPassword) => api.post("auth/reset-password", { token, newPassword });
export const verifyEmail = (token) => api.get(`/auth/verify-email/${token}`);

// AUTHENTICATED ROUTE
export const changePassword = (data) => api.post("auth/change-password", data);

// SUPER ADMIN ONLY ROUTE
export const registerInstitutionAdmin = (data) => api.post("/auth/register/admin", data);

// INSITUTION ADMIN ONLY ROUTE 
export const addInstitutionAdmin = (data) => api.post("/auth/add-admin", data);
export const getAdmins = () => api.get("/auth/admins");