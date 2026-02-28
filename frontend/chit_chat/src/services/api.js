import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest.url.includes("login") ||
      originalRequest.url.includes("auth/refresh/")
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
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default API;