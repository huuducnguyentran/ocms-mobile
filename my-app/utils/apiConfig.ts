// utils/apiConfig.ts - Azure Computer Vision API Configuration
// For React Native/Expo, use environment variables or app.json extra config
import Constants from 'expo-constants';

export const AZURE_COMPUTER_VISION_ENDPOINT =
  process.env.EXPO_PUBLIC_AZURE_COMPUTER_VISION_ENDPOINT ||
  Constants.expoConfig?.extra?.azureComputerVisionEndpoint ||
  '';

export const AZURE_COMPUTER_VISION_API_KEY =
  process.env.EXPO_PUBLIC_AZURE_COMPUTER_VISION_API_KEY ||
  Constants.expoConfig?.extra?.azureComputerVisionApiKey ||
  '';

