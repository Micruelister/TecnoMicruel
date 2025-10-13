// =================================================================
// FILE: frontend/src/api/axiosInstance.js
// =================================================================
import axios from 'axios';

// Get the API base URL from environment variables.
// Vite exposes env variables prefixed with VITE_ on the `import.meta.env` object.
// We provide a fallback for local development.
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000';

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export default axiosInstance;