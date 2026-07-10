import axios from 'axios';


export const BASE_URL = import.meta.env.VITE_API_URL

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Unwrap the standard ApiResponse<T> envelope the backend always returns
apiClient.interceptors.response.use(
  (response) => {
    // Prevent crashes if the server returns an HTML page (like a 502 error or Vercel login page)
    if (typeof response.data === 'string' && (response.data.trim().toLowerCase().startsWith('<!doctype') || response.data.trim().toLowerCase().startsWith('<html'))) {
      return Promise.reject(new Error('API returned an HTML page instead of JSON data.'));
    }
    return response;
  },
  (error) => {
    const message =
      error?.response?.data?.message ?? error?.message ?? 'Network error';
    console.error('[API Error]', message, error?.response?.data);
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
