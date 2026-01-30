import axios from "axios";
import Urls from "./URLs";
import { getToken, setToken, clearToken } from "./token";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor
let retry = 2;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && retry > 0) {
      retry--;

      try {
        const res = await api.post(Urls.AUTH.REFRESH_TOKEN);
        const newToken = res.data.token;

        setToken(newToken);
        console.log(newToken)

        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch (err) {
        clearToken();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
