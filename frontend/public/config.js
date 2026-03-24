// Runtime configuration - reads from environment variables
// This allows changing API URL without rebuilding
window.APP_CONFIG = {
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
};

console.log('📋 Runtime Config:', window.APP_CONFIG);
