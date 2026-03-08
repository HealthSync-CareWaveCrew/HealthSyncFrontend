// Review API endpoints
export const createReviewAPI = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response;
};

export const getAllReviewsAPI = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.rating) params.append('rating', filters.rating);
  if (filters.approved !== undefined) params.append('approved', filters.approved);
  
  const response = await api.get(`/reviews?${params.toString()}`);
  return response;
};

export const getAllReviewsAdminAPI = async () => {
  const response = await api.get('/reviews/admin/all');
  return response;
};

export const getReviewsByUserAPI = async (email) => {
  const response = await api.get(`/reviews/user/${email}`);
  return response;
};

export const getReviewByIdAPI = async (id) => {
  const response = await api.get(`/reviews/${id}`);
  return response;
};

export const updateReviewAPI = async (id, updateData) => {
  const response = await api.put(`/reviews/${id}`, updateData);
  return response;
};

export const deleteReviewAPI = async (id, userEmail) => {
  const response = await api.delete(`/reviews/${id}`, { data: { userEmail } });
  return response;
};

export const toggleReviewVisibilityAPI = async (id, isVisible) => {
  const response = await api.patch(`/reviews/${id}/visibility`, { isVisible });
  return response;
};

export const toggleReviewApprovalAPI = async (id, isApproved) => {
  const response = await api.patch(`/reviews/${id}/approval`, { isApproved });
  return response;
};

export const getReviewStatsAPI = async () => {
  const response = await api.get('/reviews/stats');
  return response;
};