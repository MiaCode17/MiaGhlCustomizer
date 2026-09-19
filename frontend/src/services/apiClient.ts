import axios from 'axios';
import { mockAdapter } from './mockAdapter';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  withCredentials: true,
  ...(useMocks ? { adapter: mockAdapter } : {}),
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const message =
      error.response?.data?.error ?? error.message ?? 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  },
);
