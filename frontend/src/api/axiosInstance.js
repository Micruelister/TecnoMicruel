// =================================================================
// FILE: frontend/src/api/axiosInstance.js
// =================================================================
import axios from 'axios';

// --- Production/Development Logic ---
// We determine if the app is in production by checking the hostname.
// This now checks for both possible Firebase Hosting domains.
const isProduction = window.location.hostname.includes('web.app') || window.location.hostname.includes('firebaseapp.com');

// Define the backend URL based on the environment.
const prodApiUrl = 'https://backend-image-g3k7m2f5ua-ew.a.run.app'; // <-- CORRECTED URL
const localApiUrl = 'http://127.0.0.1:5000';

const apiBaseUrl = isProduction ? prodApiUrl : localApiUrl;

// Inform the developer if the production URL is not set.
if (isProduction && prodApiUrl.includes('YOUR_BACKEND_URL_HERE')) {
  console.error("CRITICAL: Production backend URL is not set in frontend/src/api/axiosInstance.js");
  alert("Configuration error: The backend server address is missing. Please contact support.");
}
// ------------------------------------

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export default axiosInstance;
