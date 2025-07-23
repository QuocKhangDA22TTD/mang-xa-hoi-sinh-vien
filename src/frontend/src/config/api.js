// API Configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://daring-embrace-production.up.railway.app'
  : 'http://localhost:5000';

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
  }
};

export default API_BASE_URL;
