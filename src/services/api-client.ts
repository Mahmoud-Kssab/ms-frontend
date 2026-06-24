import axios from 'axios';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { env } from '@/constants/env';

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const statusCode = error.response?.status;
    const requestUrl = originalRequest?.url ?? '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/refresh');

    if (
      statusCode !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint
    ) {
      throw error;
    }

    originalRequest._retry = true;
    await apiClient.post('/auth/refresh');

    return apiClient(originalRequest);
  },
);
