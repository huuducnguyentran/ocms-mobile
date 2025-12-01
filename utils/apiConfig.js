// Azure Computer Vision API Configuration
// These values are loaded from environment variables (Vite uses import.meta.env)
export const AZURE_COMPUTER_VISION_ENDPOINT =
  import.meta.env.VITE_AZURE_COMPUTER_VISION_ENDPOINT || "";
export const AZURE_COMPUTER_VISION_API_KEY =
  import.meta.env.VITE_AZURE_COMPUTER_VISION_API_KEY || "";

// Firebase Endpoints
// export const FIREBASE_FUNCTIONS_BASE_URL =
//   "https://us-central1-ocms-web.cloudfunctions.net";
// export const CERTIFICATE_ANALYZE_ENDPOINT = `${FIREBASE_FUNCTIONS_BASE_URL}/analyzeCertificateImage`;
