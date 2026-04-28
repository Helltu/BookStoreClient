import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

declare module 'axios' {
  interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

const apiClient = axios.create({
  baseURL: '/api', // Теперь запросы идут через Next.js rewrites
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage, если мы на клиенте
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config?.skipErrorToast) return Promise.reject(error);
    if (error.response) {
      const message = error.response.data?.message || error.response.data?.error || `Ошибка сервера: ${error.response.status}`;
      toast.error(message);
    } else if (error.request) {
      toast.error('Сервер недоступен. Проверьте подключение.');
    } else {
      toast.error(`Ошибка запроса: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
