import axios from 'axios';

// Set VITE_API_URL in .env to override. Defaults to http://localhost:5000
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://Inventory-Management-System-back-env.eba-q5p3ktcn.eu-north-1.elasticbeanstalk.com';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Unwrap the standard ApiResponse<T> envelope the backend always returns
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ?? error?.message ?? 'Network error';
    console.error('[API Error]', message, error?.response?.data);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
