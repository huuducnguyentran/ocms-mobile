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
  fullName: string | undefined;
}

export const profileService = {
  /** ---------------------------
   * GET PROFILE
   * --------------------------- */
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      const response = await axiosInstance.get<ProfileData>(USER_URLS.PROFILE);

      return {
        data: response.data,
        fullName: response.data?.fullName,
      };
    } catch (error) {
      console.error("❌ getProfile error:", error);
      throw error;
    }
  },

  /** ---------------------------
   * UPDATE PROFILE
   * --------------------------- */
  updateProfile: async (profileData: Partial<ProfileData>): Promise<any> => {
    try {
      const response = await axiosInstance.put(
        USER_URLS.UPDATE_PROFILE,
        profileData
      );
      return response.data;
    } catch (error) {
      console.error("❌ updateProfile error:", error);
      throw error;
    }
  },

  /** ---------------------------
   * CHANGE PASSWORD
   * --------------------------- */
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
      console.error("❌ changePassword error:", error);
      throw error;
    }
  },

  /** ---------------------------
   * UPLOAD AVATAR (FormData)
   * --------------------------- */
  uploadAvatar: async (file: FormData): Promise<any> => {
    try {
      const response = await axiosInstance.post(USER_URLS.UPLOAD_AVATAR, file, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      console.error("❌ uploadAvatar error:", error);
      throw error;
    }
  },
};
