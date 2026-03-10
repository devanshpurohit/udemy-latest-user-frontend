// Backend Configuration - Centralized URL Management
// Change this file to update backend URL across ALL components

const BACKEND_CONFIG = {
  // Current Backend URL - Change this ONE PLACE to update everywhere
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api',
  
  // API Endpoints
  ENDPOINTS: {
    PUBLIC_COURSES: '/public/courses',
    AUTH_LOGIN: '/auth/login',
    USER_PROFILE: '/users/profile',
    USER_DASHBOARD: '/users/dashboard'
  }
};

// Helper function to get full URL
export const getBackendUrl = (endpoint) => {
  return `${BACKEND_CONFIG.API_BASE_URL}${endpoint}`;
};

// Helper function to get backend base URL for images
export const getBackendBaseUrl = () => {
  return BACKEND_CONFIG.API_BASE_URL.replace('/api', '');
};

export default BACKEND_CONFIG;
