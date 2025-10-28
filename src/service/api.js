import axios from 'axios';
import config from './config';

export default () => {
  const Api = axios.create(config);

  // Добавляем токен в заголовок Authorization для всех запросов
  Api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Обработка ошибок авторизации
  Api.interceptors.response.use(
    (response) => response,
    (error) => {
      console.log('API Error:', error);

      if (error.response?.status === 401) {
        const errorCode = error.response?.data?.code;

        // Если это ошибка токена (истек, недействителен, отсутствует), делаем logout
        if (
          errorCode === 'TOKEN_EXPIRED' ||
          errorCode === 'INVALID_TOKEN' ||
          errorCode === 'NO_TOKEN' ||
          errorCode === 'INVALID_TOKEN_FORMAT'
        ) {
          // Токен истек или недействителен
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          // Перенаправляем на страницу логина
          window.location.href = '/login';
        }
        // Если это INVALID_CREDENTIALS (ошибка входа на странице логина),
        // не делаем redirect, просто пропускаем ошибку дальше
      }

      if (error.response?.status === 429) {
        // Rate limit exceeded
        const retryAfter = error.response?.data?.retryAfter || 900;
        const minutes = Math.ceil(retryAfter / 60);
        console.error(`Слишком много попыток. Попробуйте через ${minutes} минут`);
      }

      if (error.message === 'Network Error') {
        console.error('Нет подключения к интернету. Проверьте соединение и перезагрузите страницу.');
      }

      return Promise.reject(error);
    }
  );
  return Api;
};
