// utils/axiosInstance.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ==============================
   REQUEST INTERCEPTOR
   Attach JWT token
============================== */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ==============================
   RESPONSE INTERCEPTOR
   Handle auth safely
============================== */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // ✅ ONLY logout when token is invalid or expired
    if (status === 401 && message === "Invalid token") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("crmType");

      window.location.href = "/login";
    }

    // ❌ DO NOT logout on 403 (Admin only, permission issues)
    return Promise.reject(error);
  }
);

export default api;
