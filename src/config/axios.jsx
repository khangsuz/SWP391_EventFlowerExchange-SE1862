import axios from "axios";

// Update the baseUrl to point to your API endpoint
const baseUrl = "https://localhost:7288/api/"; // Change this to your actual API endpoint

const config = {
  baseURL: baseUrl, // Use baseURL instead of baseUrl
};

const api = axios.create(config);

// Handle before call API
const handleBefore = (config) => {
  // Handle actions before calling the API

  // Get the token and attach it to the request
  const token = localStorage.getItem("token")?.replaceAll('"', "");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(handleBefore, null);

export default api;