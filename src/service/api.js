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
      if (error.response?.status === 401) {
        // Токен истек или недействителен
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        // Перенаправляем на страницу логина
        window.location.href = '/auth/login';
      }
      if (error.message === 'Network Error') {
        console.log('setError', 'Нет подключения к интернету. Проверьте соединение и перезагрузите страницу.');
      }
      return Promise.reject(error);
    }
  );
  return Api;
};
