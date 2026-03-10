// Configuration file for the application
const config = {
  // API Configuration
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002/api',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'UDEMY Clone',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Other settings
  TOKEN_KEY: 'token',
  USER_KEY: 'user',
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      VERIFY: '/auth/verify'
    },
    USER: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      PROFILE: '/users/profile',
      DASHBOARD: '/users/dashboard'
    }
  }
};

export default config;
