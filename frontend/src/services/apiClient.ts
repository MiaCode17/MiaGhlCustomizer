import axios from 'axios';
import { mockAdapter } from './mockAdapter';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080/api/v1',
  ...(useMocks ? { adapter: mockAdapter } : {}),
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ?? error.message ?? 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  },
);
