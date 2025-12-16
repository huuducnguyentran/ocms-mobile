// src/service/traineeAssignationService.ts
import axiosInstance from "@/utils/axiosInstance";
import { TRAINEE_ASSIGNATION_URLS } from "@/api/apiUrl";

export interface TraineeGradeRecord {
  traineeAssignationGradeId: string;
  traineeAssignationId: string;
  gradeKind: string;
  grade: number;
  gradeStatus: string;
  weight?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface AddTraineeGradeRequest {
  grade: number;
  gradeKind: string; // e.g. "TotalScore"
  note?: string;
}

/**
 * Get grades of a trainee in a class
 */
export const getGradesByClassAndTrainee = async (
  classId: number,
  traineeId: string
): Promise<ApiResponse<TraineeGradeRecord[]>> => {
  try {
    const token = sessionStorage.getItem("token");

    const res = await axiosInstance.get(
      `${TRAINEE_ASSIGNATION_URLS.GET_GRADES_BY_CLASS_AND_TRAINEE}/${classId}/trainee/${traineeId}/grades`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error loading trainee grades:", error);
    return { data: [], success: false, message: "Failed to load grades" };
  }
};

/**
 * Add grade for a trainee assignation
 */
export const addGradeToTraineeAssignation = async (
  traineeAssignationId: string,
  payload: AddTraineeGradeRequest
): Promise<ApiResponse<TraineeGradeRecord>> => {
  try {
    const token = sessionStorage.getItem("token");

    const res = await axiosInstance.post(
      `${TRAINEE_ASSIGNATION_URLS.CREATE}/${traineeAssignationId}/grades`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error adding trainee grade:", error);
    return {
      data: null as any,
      success: false,
      message: "Failed to add grade",
    };
  }
};
