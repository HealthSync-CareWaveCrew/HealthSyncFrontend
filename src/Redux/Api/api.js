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

// Admin functions
export const getAllUsers = async () => {
  const response = await api.get('/api/users');
  return response;
};

export const getUserById = async (id) => {
  const response = await api.get(`/api/users/${id}`);
  return response;
};

export const updateUserRole = async (id, role) => {
  const response = await api.patch(`/api/users/${id}/role`, { role });
  return response;
};

export const toggleUserStatus = async (id) => {
  const response = await api.patch(`/api/users/${id}/toggle-status`);
  return response;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/api/users/${id}`);
  return response;
};

// Existing functions
export const analyzeImage = async (file, diseaseType) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('diseaseType', diseaseType);

  const response = await api.post('/analyze-image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const analyzeClinicalData = async (diseaseType, formData) => {
  const response = await api.post('/analyze-clinical-data', {
    diseaseType,
    formData,
  });
  return response;
};

export const sendChatMessage = async (message, history, systemInstruction) => {
  const response = await api.post('/chat', {
    message,
    history,
    systemInstruction,
  });
  return response;
};



export const createUserByAdmin = async (userData) => {
  const response = await api.post('/api/users', userData);
  return response;
};

export default api;