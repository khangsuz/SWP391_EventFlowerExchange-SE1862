import axios from "axios";

const baseUrl = "https://localhost:7288/api/";

const api = axios.create({
  baseURL: baseUrl,
});

const handleBefore = (config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token.replace(/"/g, "")}`;
  }
  return config;
};

api.interceptors.request.use(handleBefore, (error) => Promise.reject(error));

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;