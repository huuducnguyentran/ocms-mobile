// service/faceRecognitionService.ts
import axiosInstance from "@/utils/axiosInstance";
import { FACE_RECOGNITION_URLS } from "@/api/apiUrl";

export interface RegisterFaceRequest {
  userId: string;
  imageFile: any; // FormData file
}

export interface RegisterFaceResponse {
  success: boolean;
  message?: string;
}

export interface ScanFaceResponse {
  userId?: string;
  token?: string; // Token if auto-login is enabled
  roles?: string[];
  hubUrl?: string;
  success?: boolean;
  message?: string;
}

export const faceRecognitionService = {
  /** ---------------------------
   * REGISTER FACE
   * POST /api/FaceRecognition/api/register
   * multipart/form-data: userId, imageFile
   * --------------------------- */
  registerFace: async (
    userId: string,
    imageFile: FormData
  ): Promise<RegisterFaceResponse> => {
    try {
      // For FormData, let axios set Content-Type automatically with boundary
      // Don't manually set Content-Type, axios will add the boundary parameter
      const response = await axiosInstance.post<RegisterFaceResponse>(
        FACE_RECOGNITION_URLS.REGISTER,
        imageFile,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          transformRequest: (data) => {
            // Return FormData as-is, axios will handle it
            return data;
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ registerFace error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  },

  /** ---------------------------
   * SCAN FACE (LOGIN)
   * POST /api/FaceRecognition/api/scan
   * multipart/form-data: imageFile
   * Returns userId if face matches
   * --------------------------- */
  scanFace: async (imageFile: FormData): Promise<ScanFaceResponse> => {
    try {
      const response = await axiosInstance.post<ScanFaceResponse>(
        FACE_RECOGNITION_URLS.SCAN,
        imageFile,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          transformRequest: (data) => {
            return data;
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("❌ scanFace error:", error);
      console.error("❌ Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
      });
      throw error;
    }
  },
};
