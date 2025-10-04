import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Add token to requests automatically
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Adding token to request header");
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log("No token found in localStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Authentication error, redirecting to login");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);

// Game APIs
export const startGame = () => API.post("/game/start");
export const guessWord = (guess) => API.post("/game/guess", { guess });

// Admin APIs
export const getDailyReport = (date) => API.get(`/admin/report/day/${date}`);
export const getUserReport = (username) => API.get(`/admin/report/user/${username}`);

// Hint APIs
export const getHint = (hintLevel) => API.post("/hint/get-hint", { hint_level: hintLevel });
export const getContextualHint = () => API.get("/hint/contextual-hint");

// Token management utility
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("token", token);
    console.log("Token stored in localStorage");
  } else {
    localStorage.removeItem("token");
    console.log("Token removed from localStorage");
  }
};

export const getStoredToken = () => {
  return localStorage.getItem("token");
};