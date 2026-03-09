import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important for cookies/tokens
});

// Review API endpoints
export const createReviewAPI = async (reviewData) => {
  const response = await api.post('/api/reviews', reviewData);
  return response;
};

export const getAllReviewsAPI = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.rating) params.append('rating', filters.rating);
  if (filters.approved !== undefined) params.append('approved', filters.approved);
  
  const response = await api.get(`/api/reviews?${params.toString()}`);
  return response;
};

export const getAllReviewsAdminAPI = async () => {
  const response = await api.get('/api/reviews/admin/all');
  return response;
};

export const getReviewsByUserAPI = async (email) => {
  const response = await api.get(`/api/reviews/user/${email}`);
  return response;
};

export const getReviewByIdAPI = async (id) => {
  const response = await api.get(`/api/reviews/${id}`);
  return response;
};

export const updateReviewAPI = async (id, updateData) => {
  const response = await api.put(`/api/reviews/${id}`, updateData);
  return response;
};

export const deleteReviewAPI = async (id, userEmail) => {
  const response = await api.delete(`/api/reviews/${id}`, { data: { userEmail } });
  return response;
};

export const toggleReviewVisibilityAPI = async (id, isVisible) => {
  const response = await api.patch(`/api/reviews/${id}/visibility`, { isVisible });
  return response;
};

export const toggleReviewApprovalAPI = async (id, isApproved) => {
  const response = await api.patch(`/api/reviews/${id}/approval`, { isApproved });
  return response;
};

export const getReviewStatsAPI = async () => {
  const response = await api.get('api/reviews/stats');
  return response;
};