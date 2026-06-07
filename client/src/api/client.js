import axios from 'axios';

export const TOKEN_KEY = 'planit.token';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      if (!location.pathname.startsWith('/login') && !location.pathname.startsWith('/signup')) {
        location.assign('/login');
      }
    }
    return Promise.reject(err);
  }
);
