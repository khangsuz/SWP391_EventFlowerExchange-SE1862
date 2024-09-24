import axios from "axios";
const baseUrl = "http://14.225.220.131:8080/api/";
// const baseUrl = "http://localhost:8080/api/";

const config = {
  baseURL: baseUrl, // Use baseURL instead of baseUrl
};

const api = axios.create(config);

api.defaults.baseURL = baseUrl;

// handle before call API
const handleBefore = (config) => {
  // handle hành động trước khi call API

  // Get the token and attach it to the request
  const token = localStorage.getItem("token")?.replaceAll('"', "");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(handleBefore, null);

export default api;