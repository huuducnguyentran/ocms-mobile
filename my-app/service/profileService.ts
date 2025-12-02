// service/profileService.ts
import axiosInstance from "@/utils/axiosInstance";
import { USER_URLS } from "@/api/apiUrl";

export interface ProfileData {
  userId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  sex?: string;
  dateOfBirth?: string;
  citizenId?: string;
  avatarUrl?: string;
}

export interface ProfileResponse {
  data: ProfileData;
  success: boolean;
}

export const profileService = {
  // Get user profile
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await axiosInstance.get<ProfileResponse>(USER_URLS.PROFILE);
      // API returns { data: ProfileData, success: boolean }
      return {
        data: response.data.data,
        success: response.data.success,
      };
    } catch (error) {
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData: Partial<ProfileData>): Promise<any> => {
    try {
      const response = await axiosInstance.put(USER_URLS.UPDATE_PROFILE, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<any> => {
    try {
      const response = await axiosInstance.post(USER_URLS.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Upload avatar
  uploadAvatar: async (file: FormData): Promise<any> => {
    try {
      const response = await axiosInstance.post(USER_URLS.UPLOAD_AVATAR, file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

