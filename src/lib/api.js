import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://vertex-panel-kits.onrender.com/api',
  timeout: 15000,
});

// Attach token
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('pk_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Auto-refresh on 401
let refreshing = false;
api.interceptors.response.use(
  r => r,
  async err => {
    const orig = err.config;
    if (err.response?.status === 401 && err.response?.data?.code === 'TOKEN_EXPIRED' && !orig._retry) {
      orig._retry = true;
      if (refreshing) return Promise.reject(err);
      refreshing = true;
      try {
        const refresh = localStorage.getItem('pk_refresh');
        if (!refresh) throw new Error('No refresh token');
        const { data } = await axios.post(
          (import.meta.env.VITE_API_URL || 'https://vertex-panel-kits.onrender.com/api') + '/auth/refresh',
          { refresh }
        );
        localStorage.setItem('pk_token', data.token);
        orig.headers.Authorization = `Bearer ${data.token}`;
        return api(orig);
      } catch {
        localStorage.removeItem('pk_token');
        localStorage.removeItem('pk_refresh');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally { refreshing = false; }
    }
    return Promise.reject(err);
  }
);

export default api;
