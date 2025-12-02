// utils/axiosInstance.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { BASE_URL } from "@/utils/environment";
import { storage } from "@/utils/storage";
import { router } from "expo-router";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout for mobile networks
});

// Add token automatically to each request
axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Variable to track if status check request is in progress
let isCheckingStatus = false;

// Create separate axios instance for checking user status to avoid recursion
const statusCheckInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to status check requests
statusCheckInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await storage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Check if user is authenticated
export const requireAuth = async (): Promise<boolean> => {
  const token = await storage.getItem("token");
  if (!token) {
    router.replace("/login");
    return false;
  }
  return true;
};

// Check user account status
export const checkAccountStatus = async (): Promise<boolean> => {
  if (isCheckingStatus) return true;

  try {
    isCheckingStatus = true;
    const token = await storage.getItem("token");
    if (!token) return false;

    const response = await statusCheckInstance.get("/User/profile");
    const userData = response.data.user;
    if (response.data.fullName) {
      await storage.setItem("fullname", response.data.fullName);
    }

    return true;
  } catch (error) {
    console.error("Error checking account status:", error);
    const axiosError = error as AxiosError;
    // Handle when cannot connect to API
    if (axiosError.response?.status === 401) {
      // Token expired or invalid
      await storage.clear();
      router.replace("/login");
    }
    return false;
  } finally {
    isCheckingStatus = false;
  }
};

// Add response interceptor to check account status
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & {
      url?: string;
    };

    // Skip status check for login-related endpoints or when already checking status
    if (
      config.url?.includes("login") ||
      config.url?.includes("reset-password") ||
      config.url?.includes("forgot-password") ||
      isCheckingStatus
    ) {
      return Promise.reject(error);
    }

    // If 401 status (unauthorized), clear session and redirect to login
    if (error.response?.status === 401) {
      await storage.clear();
      router.replace("/login");
      return Promise.reject(error);
    }

    // For other errors, check account status
    await checkAccountStatus();
    return Promise.reject(error);
  }
);

export default axiosInstance;
