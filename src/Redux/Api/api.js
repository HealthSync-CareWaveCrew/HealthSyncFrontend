import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

export default api;
