import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// This interceptor adds the auth token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// This interceptor handles token refreshes
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is a 401 and we haven't already retried
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          // Use dj-rest-auth's endpoint for token refresh
          const response = await axios.post('http://localhost:8000/dj-rest-auth/token/refresh/', {
            refresh: refreshToken,
          });

          const { access, refresh } = response.data;
          // Update localStorage and the Zustand store
          localStorage.setItem('accessToken', access);
          if (refresh) { // dj-rest-auth might rotate refresh tokens
            localStorage.setItem('refreshToken', refresh);
          }
          
          useAuthStore.getState().login(access, refresh || refreshToken);
          
          // Update the header of the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${access}`;
          
          // Retry the original request
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          // If refresh fails, log the user out
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token found, log out
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;