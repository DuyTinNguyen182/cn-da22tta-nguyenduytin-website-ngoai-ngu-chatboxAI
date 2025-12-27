import axios from "axios";

const isDevelopment = import.meta.env.DEV;

const apiClient = axios.create({
  baseURL: isDevelopment
    ? "/api"
    : "https://cn-da22tta-nguyenduytin-website-ngoai.onrender.com/api",
  withCredentials: true,
});

export default apiClient;
