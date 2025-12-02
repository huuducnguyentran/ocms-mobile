// service/loginServices.ts
import axiosInstance from '@/utils/axiosInstance';
import { AUTH_URLS } from '@/api/apiUrl';

export interface LoginResponse {
  token: string;
  userId: string;
  roles?: string[];
  hubUrl?: string;
  success?: boolean; // Optional success flag from API
}

export interface LoginRequest {
  username: string;
  password: string;
}

export const loginService = {
  // Login with username and password
  login: async (username: string, password: string): Promise<LoginResponse> => {
    try {
      const response = await axiosInstance.post<LoginResponse>(AUTH_URLS.LOGIN, {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Forgot password
  forgotPassword: async (emailOrUsername: string): Promise<void> => {
    try {
      // Most backends expect 'emailOrUsername' or just 'email'
      // Try 'emailOrUsername' first as that's what the UI sends
      const response = await axiosInstance.post(AUTH_URLS.FORGOT_PASSWORD, {
        emailOrUsername,
      });
      return response.data;
    } catch (error: any) {
      // If 400 error, try with 'email' field name (common alternative)
      if (error.response?.status === 400) {
        try {
          const retryResponse = await axiosInstance.post(AUTH_URLS.FORGOT_PASSWORD, {
            email: emailOrUsername,
          });
          return retryResponse.data;
        } catch (retryError) {
          // If still fails, log and throw original error
          console.error('Forgot password retry also failed:', retryError);
        }
      }
      
      // Log full error details for debugging
      console.error('Forgot password API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Reset password
  resetPassword: async (
    token: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> => {
    try {
      // Token must be sent as query parameter
      const response = await axiosInstance.post(
        `${AUTH_URLS.RESET_PASSWORD}?token=${encodeURIComponent(token)}`,
        {
          newPassword,
          confirmPassword,
        }
      );
      return response.data;
    } catch (error: any) {
      // Log full error details for debugging
      console.error('Reset password API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
};

