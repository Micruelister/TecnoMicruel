// =================================================================
// FILE: frontend/src/api/axiosInstance.js
// =================================================================
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  withCredentials: true,
});

export default axiosInstance;