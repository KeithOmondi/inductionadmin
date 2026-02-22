import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 (Unauthorized) and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call the refresh endpoint
        // Note: Use the base axios here to avoid infinite loops
        await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Retry the original request with the new session cookie
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, the Refresh Token is likely expired too
        // You could dispatch a logout action here or redirect
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);