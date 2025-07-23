// API Configuration - Simple and reliable
const isProduction =
  window.location.hostname !== 'localhost' &&
  window.location.hostname !== '127.0.0.1';
const API_BASE_URL = isProduction
  ? 'https://daring-embrace-production.up.railway.app'
  : 'http://localhost:5000';

// Debug logging
console.log('🌐 API Configuration:');
console.log('- hostname:', window.location.hostname);
console.log('- isProduction:', isProduction);
console.log('- VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('- Final API_BASE_URL:', API_BASE_URL);

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
  },
  POSTS: {
    CREATE: `${API_BASE_URL}/api/posts`,
    GET_ALL: `${API_BASE_URL}/api/posts`,
  },
  UPLOAD: {
    IMAGE: `${API_BASE_URL}/api/upload`,
  },
};

export default API_BASE_URL;
