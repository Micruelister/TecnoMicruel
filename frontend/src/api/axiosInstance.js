import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/',
  withCredentials: true // Crucial for sending session cookies
});

export default axiosInstance;
