import axios from 'axios';

let accessToken: string | null = null;

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  withCredentials: true
});

export const setApiAccessToken = (token: string | null) => {
  accessToken = token;
}

export const getApiAccessToken = () => accessToken;


let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void, reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest.url !== '/auth/refresh' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await api.post('/auth/refresh');
        const newAccessToken = response.data.data.accessToken;

        setApiAccessToken(newAccessToken);
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        return api(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError, null);
        setApiAccessToken(null);
        window.location.href = '/login';

        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;