import axiosInstance from "@/utils/axiosInstance";
import { SPECIALTY_URLS } from "@/api/apiUrl";
import { storage } from "@/utils/storage";

/* ================= INTERFACES ================= */

export interface Specialty {
  specialtyId: string;
  specialtyName: string;
  description: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

/* ================= API ================= */

/**
 * Get all specialties
 * GET /Specialty/all
 */
export const getAllSpecialty = async (): Promise<ApiResponse<Specialty[]>> => {
  try {
    const token = await storage.getItem("token");

    const res = await axiosInstance.get(SPECIALTY_URLS.GET_ALL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  } catch (error) {
    console.error("Error loading specialties:", error);
    return {
      data: [],
      success: false,
      message: "Failed to load specialties",
    };
  }
};
