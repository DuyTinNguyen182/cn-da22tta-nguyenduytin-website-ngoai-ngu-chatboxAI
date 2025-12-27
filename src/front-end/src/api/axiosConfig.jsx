import axios from 'axios';

const isDevelopment = import.meta.env.DEV;

const apiClient = axios.create({
  baseURL: isDevelopment ? '/api' : import.meta.env.VITE_API_DOMAIN,
  withCredentials: true,
});

export default apiClient;