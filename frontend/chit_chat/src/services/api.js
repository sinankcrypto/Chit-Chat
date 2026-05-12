import axios from "axios";
import { triggerLogout } from "./authService";



const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

let isLoggingOut = false;

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url.includes("login") ||
      originalRequest.url.includes("auth/refresh/")||
      originalRequest.url.includes("auth/logout/")
    ) {
      return Promise.reject(error);
    }

    // If unauthorized and not retried yet → try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await API.post(
          "/auth/refresh/",
          {},
          { withCredentials: true }
        );

        // Retry the original request with new cookie
        return API(originalRequest);
      } catch (refreshError) {
        if (!isLoggingOut){
          isLoggingOut = true;
          triggerLogout();
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;