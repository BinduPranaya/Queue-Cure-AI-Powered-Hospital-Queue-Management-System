import axios from "axios";

// Base URL for the Spring Boot backend. Override via VITE_API_BASE_URL
// when deploying so the frontend can point at a different host.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Normalize errors into a consistent shape so components don't need to
// know about axios internals. Falls back gracefully when the backend is
// unreachable (network error) vs. when it responds with a 4xx/5xx body.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      return Promise.reject({
        status,
        message: data?.message || "Something went wrong. Please try again.",
        details: data?.details || null,
      });
    }
    if (error.request) {
      return Promise.reject({
        status: 0,
        message: "Could not reach the server. Check your connection and try again.",
        details: null,
      });
    }
    return Promise.reject({ status: -1, message: error.message, details: null });
  }
);

export default apiClient;
