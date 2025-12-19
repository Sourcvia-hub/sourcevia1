/**
 * API Configuration - Production
 * Backend URL must be set via REACT_APP_BACKEND_URL environment variable
 */
import axios from 'axios';

// Get backend URL from environment variable
// This must be set during Docker build or in .env file for development
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

if (!BACKEND_URL) {
  console.error('❌ REACT_APP_BACKEND_URL is not set! Backend API calls will fail.');
  console.error('Set REACT_APP_BACKEND_URL in your .env file or Docker build args.');
}

export const API_URL = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

// Export for debugging
export const API_CONFIG = {
  BACKEND_URL: BACKEND_URL || 'NOT SET',
  API_URL,
  configured: !!BACKEND_URL
};

// Log configuration in development
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', API_CONFIG);
}

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30000,
});

// Add request interceptor to include Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('session_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stored data on authentication failure
      localStorage.removeItem('user');
      localStorage.removeItem('session_token');
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

