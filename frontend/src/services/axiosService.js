import axios from "axios";
import { baseURL } from "../configs/urls";

const axiosService = axios.create({
    baseURL,
    timeout: 10000, // 10 секунд на відповідь
    headers: {
        'Content-Type': 'application/json'
    }
});

// Додаємо перехоплювач запитів (Request Interceptor)
axiosService.interceptors.request.use((config) => {
    const token = localStorage.getItem("ut"); // Отримуємо токен з localStorage
    
    if (token) {
        // Додаємо токен до заголовка Authorization
        // Переконайся, що формат (Bearer чи просто рядок) відповідає вимогам бекенду
        config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Додаємо перехоплювач відповідей (Response Interceptor) для обробки помилок 401
axiosService.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Якщо токен протух — видаляємо його і редиректимо на логін
            localStorage.removeItem("ut");
            localStorage.removeItem("user");
            window.location.href = "/";
        }
        return Promise.reject(error);
    }
);

export { axiosService };