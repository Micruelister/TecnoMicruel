// =================================================================
// FILE: frontend/src/api/axiosInstance.js
// =================================================================
import axios from 'axios';

// --- Production/Development Logic ---
// We determine if the app is in production by checking the hostname.
// Your Firebase app URL is 'tecnomicruelgjp-t477f933-clado.firebaseapp.com'
const isProduction = window.location.hostname.includes('firebaseapp.com');

// Define the backend URL based on the environment.
const prodApiUrl = 'https://api-175446052275.europe-west1.run.app'; // <-- URL SET
const localApiUrl = 'http://127.0.0.1:5000';

const apiBaseUrl = isProduction ? prodApiUrl : localApiUrl;

// Inform the developer if the production URL is not set.
if (isProduction && apiBaseUrl.includes('YOUR_BACKEND_URL_HERE')) { // This check will no longer trigger
  console.error("CRITICAL: Production backend URL is not set in frontend/src/api/axiosInstance.js");
  alert("Configuration error: The backend server address is missing. Please contact support.");
}
// ------------------------------------

const axiosInstance = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export default axiosInstance;
