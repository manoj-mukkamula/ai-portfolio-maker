import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// Portfolio
export const portfolioApi = {
  generate: (data: FormData | object) => {
    if (data instanceof FormData) {
      return api.post("/portfolio/generate", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    return api.post("/portfolio/generate", data);
  },
  history: () => api.get("/portfolio/history"),
  getOne: (id: string) => api.get(`/portfolio/${id}`),
  update: (id: string, data: { html?: string; templateName?: string }) =>
    api.put(`/portfolio/${id}`, data),
  delete: (id: string) => api.delete(`/portfolio/${id}`),
};

export default api;
