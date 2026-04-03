import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies/tokens
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// AUTHENTICATION FUNCTIONS - MATCHING YOUR BACKEND ROUTES

// Registration flow with OTP
export const sendRegistrationOTP = async (userData) => {
  const response = await api.post('/api/auth/send-registration-otp', userData);
  return response;
};

export const verifyRegistrationOTP = async (otpData) => {
  const response = await api.post('/api/auth/verify-registration-otp', otpData);
  // Store token if returned
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

// Login flow with OTP
export const sendLoginOTP = async (credentials) => {
  const response = await api.post('/api/auth/send-login-otp', credentials);
  return response;
};

export const verifyLoginOTP = async (otpData) => {
  const response = await api.post('/api/auth/verify-login-otp', otpData);
  // Store token if returned
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

// Google Login
export const googleLogin = async (data) => {
  const response = await api.post('/api/auth/google', data);
  // Store token if returned
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

// Password reset with OTP
export const forgotPassword = async (email) => {
  const response = await api.post('/api/auth/forgot-password', { email });
  return response;
};

// Reset Password with OTP
export const resetPassword = async ({ email, otp, newPassword }) => {
  const response = await api.post('/api/auth/reset-password', {
    email,
    otp,
    newPassword
  });
  return response;
};

// Token management
export const refreshToken = async () => {
  const response = await api.post('/api/auth/refresh-token');
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
  }
  return response;
};

export const logout = async () => {
  try {
    await api.post('/api/auth/logout');
  } finally {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

// USER PROFILE FUNCTIONS (Protected routes)
export const getCurrentUser = async () => {
  const response = await api.get('/api/users/me');
  return response;
};

export const updateProfile = async (profileData) => {
  const response = await api.patch('/api/users/update-profile', profileData);
  return response;
};

export const changePassword = async (passwordData) => {
  const response = await api.patch('/api/users/change-password', passwordData);
  return response;
};

export const deleteAccount = async () => {
  const response = await api.delete('/api/users/delete-account');
  return response;
};

// Email change with OTP
export const sendEmailChangeOTP = async (newEmail) => {
  const response = await api.post('/api/users/send-email-change-otp', { newEmail });
  return response;
};

// Verify OTP and update email
export const verifyEmailChangeOTP = async (otpData) => {
  const response = await api.post('/api/users/verify-email-change-otp', otpData);
  return response;
};

// Admin functions
export const getAllUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response;
};

export const getUserById = async (id) => {
  const response = await api.get(`/api/admin/users/${id}`);
  return response;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/api/admin/users/${id}/role`, { role });
  return response;
};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/api/admin/users/${id}/toggle-status`);
  return response;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/admin/users/${id}`);
  return response;
};

export const createUserByAdmin = async (userData) => {
  const response = await api.post('/api/admin/users', userData);
  return response;
};

export const getAnalysisHistoryAPI = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.type) params.append('type', filters.type);
  if (filters.diseaseName) params.append('diseaseName', filters.diseaseName);
  if (filters.user) params.append('user', filters.user);
  if (filters.date) params.append('date', filters.date);

  const query = params.toString();
  const response = await api.get(`/api/analysis-history${query ? `?${query}` : ''}`);
  return response;
};

export const deleteAnalysisAPI = async (analysisId) => {
  const response = await api.delete(`/api/analysis/${analysisId}`);
  return response;
};

export const getAnalysisByIdAPI = async (analysisId) => {
  const response = await api.get(`/api/analysis/${analysisId}`);
  return response;
};

// Disease API endpoints
export const getAllDiseases = async () => {
  const response = await api.get('/api/diseases');
  return response;
};

export const getDiseasesByType = async (type) => {
  const response = await api.get(`/api/diseases/type/${type}`);
  return response;
};

export const getDiseaseById = async (diseaseId) => {
  const response = await api.get(`/api/diseases/${diseaseId}`);
  return response;
};

export const createDiseaseAPI = async (diseaseData) => {
  const response = await api.post('/api/diseases', diseaseData);
  return response;
};

export const updateDiseaseAPI = async (diseaseId, diseaseData) => {
  const response = await api.put(`/api/diseases/${diseaseId}`, diseaseData);
  return response;
};

export const deleteDiseaseAPI = async (diseaseId) => {
  const response = await api.delete(`/api/diseases/${diseaseId}`);
  return response;
};

// Analysis functions
export const analyzeImage = async (diseaseId, file, diseaseType) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('diseaseType', diseaseType);
  formData.append('diseaseId', diseaseId);

  const response = await api.post('/api/analyze-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const analyzeClinicalData = async (diseaseType, formData, diseaseId) => {
  const response = await api.post('/api/analyze-clinical-data', {
    diseaseType,
    formData,
    diseaseId,
  });
  return response;
};

// Payment plan admin APIs
export const getAdminPaymentPlans = async (includeInactive = true) => {
  const response = await api.get('/api/payment/admin/plans', {
    params: { includeInactive },
  });
  return response;
};

export const getAdminSubscriptions = async ({ page = 1, limit = 10, status, type } = {}) => {
  const response = await api.get('/api/payment/admin/subscriptions', {
    params: { page, limit, status, type },
  });
  return response;
};

export const createPaymentPlan = async (planData) => {
  const response = await api.post('/api/payment/admin/plans', planData);
  return response;
};

export const updatePaymentPlan = async (planId, planData) => {
  const response = await api.put(`/api/payment/admin/plans/${planId}`, planData);
  return response;
};

export const deactivatePaymentPlan = async (planId) => {
  const response = await api.delete(`/api/payment/admin/plans/${planId}`);
  return response;
};

export const sendChatMessage = async (message, history, systemInstruction) => {
  const response = await api.post('/api/chat', {
    message,
    history,
    systemInstruction,
  });
  return response;
};

export const subscribeNewsletter = async (email) => {
  const response = await api.post('/api/subscribe', { email });
  return response;
};

export default api;
