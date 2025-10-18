import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api',
});

export const setupAxiosInterceptors = (showToast) => {
    axiosInstance.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 404 && error.config.url.includes('/client/reviews')) {
                return Promise.resolve(null);
            }

            if (!error.response) {
                showToast({
                    variant: "destructive",
                    title: "Ошибка сети",
                    description: "Не удалось подключиться к серверу.",
                });
            } else {
                const statusCode = error.response.status;

                if (statusCode === 401) {
                    localStorage.removeItem('token');
                    showToast({
                        variant: "destructive",
                        title: "Ошибка авторизации",
                        description: "Ваша сессия истекла. Пожалуйста, войдите снова.",
                    });
                    setTimeout(() => {
                        window.location.assign('/login');
                    }, 3000);
                } else if (window.location.pathname === '/login') {
                    localStorage.removeItem('token');
                    showToast({
                        variant: "destructive",
                        title: `Ошибка ${statusCode}`,
                        description: error.response.data?.message || "Произошла неизвестная ошибка.",
                    });
                } else {
                    showToast({
                        variant: "destructive",
                        title: `Ошибка ${statusCode}`,
                        description: error.response.data?.message || "Произошла неизвестная ошибка.",
                    });
                }
            }
            return Promise.reject(error);
        }
    );
};

export default axiosInstance;
