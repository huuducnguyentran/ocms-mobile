// utils/environment.ts - Environment configuration for React Native/Expo
import Constants from "expo-constants";

// Get BASE_URL from environment variables or use default
// Priority: EXPO_PUBLIC_BASE_URL > app.json extra.baseUrl > default
// For Expo, environment variables must be prefixed with EXPO_PUBLIC_
const DEPLOYED_BACKEND_URL =
  "https://certificatemanagementbe-production.up.railway.app";

export const BASE_URL =
  process.env.EXPO_PUBLIC_BASE_URL ||
  Constants.expoConfig?.extra?.baseUrl ||
  DEPLOYED_BACKEND_URL; // Use deployed backend as default

// Log for debugging (remove in production)
if (__DEV__) {
  console.log("BASE_URL:", BASE_URL);
  console.log("EXPO_PUBLIC_BASE_URL:", process.env.EXPO_PUBLIC_BASE_URL);
  console.log("app.json baseUrl:", Constants.expoConfig?.extra?.baseUrl);
  console.log("Using deployed backend:", DEPLOYED_BACKEND_URL);
}
