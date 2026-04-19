import axios from 'axios';
import { toast } from 'sonner';

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
    if (error.response) {
      // Сервер ответил с ошибкой (статус не 2xx)
      const message = error.response.data?.message || error.response.data?.error || `Ошибка сервера: ${error.response.status}`;
      toast.error(message);
    } else if (error.request) {
      // Запрос был отправлен, но ответ не получен (сервер недоступен)
      toast.error('Сервер недоступен. Проверьте подключение.');
    } else {
      toast.error(`Ошибка запроса: ${error.message}`);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
