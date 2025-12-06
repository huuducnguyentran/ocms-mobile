// src/service/TrainingPlanService.ts
import {
  PLAN_ENROLLMENT_URLS,
  PLAN_URLS,
  STUDY_RECORD_URLS,
} from "@/api/apiUrl";
import axiosInstance from "@/utils/axiosInstance";

// ==================================
//            TYPES
// ==================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface TrainingPlan {
  planId: string;
  planName: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudyRecordPayload {
  traineeId: string;
  courseId: string;
  finalScore?: number;
}

export interface EnrollmentPayload {
  traineeId: string;
  planId: string;
}

export interface NewPlanRequestPayload {
  description: string;
  notes: string;
}

// ==================================
//            SERVICES
// ==================================

/** Get all plans */
export const getAllPlans = async (): Promise<ApiResponse<TrainingPlan[]>> => {
  try {
    const res = await axiosInstance.get(PLAN_URLS.GET_ALL_PLANS);
    return res.data;
  } catch (error: any) {
    console.error("Error fetching all plans:", error);
    return { success: false, message: "Failed to fetch plans.", data: [] };
  }
};

/** Get plan by ID */
export const getPlanById = async (
  planId: string
): Promise<ApiResponse<TrainingPlan>> => {
  try {
    const res = await axiosInstance.get(
      `${PLAN_URLS.GET_PLAN_BY_ID}/${planId}`
    );
    return res.data;
  } catch (error: any) {
    console.error(`Error fetching plan ${planId}:`, error);
    return { success: false, message: "Failed to fetch plan." };
  }
};

/** Get plan with course info */
export const getPlanWithCourseById = async (
  planId: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.get(
      `${PLAN_URLS.GET_PLAN_WITH_COURSE_BY_ID}/${planId}/with-courses`
    );
    return res.data;
  } catch (error: any) {
    console.error(`Error fetching plan ${planId}:`, error);
    return { success: false, message: "Failed to fetch plan." };
  }
};

/** Get plans by status */
export const getPlansByStatus = async (
  status: string
): Promise<ApiResponse<TrainingPlan[]>> => {
  try {
    const res = await axiosInstance.get(
      `${PLAN_URLS.GET_PLANS_BY_STATUS}/${status}`
    );
    return res.data;
  } catch (error: any) {
    console.error(`Error fetching plans by status ${status}:`, error);
    return { success: false, message: "Failed to fetch plans.", data: [] };
  }
};

/** Create plan */
export const createPlan = async (
  payload: TrainingPlan
): Promise<ApiResponse<TrainingPlan>> => {
  try {
    const res = await axiosInstance.post(PLAN_URLS.CREATE_PLAN, payload);
    return res.data;
  } catch (error: any) {
    console.error("Error creating plan:", error);
    return { success: false, message: "Failed to create plan." };
  }
};

/** Create study record */
export const createStudyRecord = async (
  payload: StudyRecordPayload
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.post(
      STUDY_RECORD_URLS.CREATE_STUDY_RECORD,
      payload
    );
    return res.data;
  } catch (error: any) {
    console.error("Error creating study record:", error);
    return { success: false, message: "Failed to create study record." };
  }
};

/** Enroll plan */
export const enrollPlan = async (
  payload: EnrollmentPayload
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.post(
      PLAN_ENROLLMENT_URLS.ENROLL_PLAN,
      payload
    );
    return res.data;
  } catch (error: any) {
    console.error("Error enrolling:", error);
    return { success: false, message: "Failed to enroll trainee." };
  }
};

/** Send new plan request */
export const sendNewPlanRequest = async (
  planId: string,
  payload: NewPlanRequestPayload
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.post(
      `${PLAN_URLS.SEND_NEW_PLAN_REQUEST}/${planId}/request/new`,
      payload
    );
    return res.data;
  } catch (error: any) {
    console.error("Error sending new plan request:", error);
    return { success: false, message: "Failed to send request." };
  }
};

/** Get suitable trainees */
export const getSuitableTrainees = async (
  planId: string
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await axiosInstance.get(
      PLAN_ENROLLMENT_URLS.GET_SUITABLE_TRAINEES
    );
    return res.data;
  } catch (error: any) {
    console.error("Error fetching suitable trainees:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch trainees.",
      data: [],
    };
  }
};

/** Get enrollments by trainee */
export const getEnrollmentsByTrainee = async (
  traineeId: string
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await axiosInstance.get(
      `${PLAN_ENROLLMENT_URLS.GET_BY_TRAINEE}/${traineeId}`
    );
    return res.data;
  } catch (error: any) {
    console.error("Error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch enrollments.",
      data: [],
    };
  }
};

/** Get enrollments by plan */
export const getEnrollmentsByPlan = async (
  planId: string
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await axiosInstance.get(
      `${PLAN_ENROLLMENT_URLS.GET_BY_PLAN}/${planId}`
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to fetch enrollments.",
      data: [],
    };
  }
};

/** Approve plan */
export const approvePlan = async (
  planId: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.put(
      `${PLAN_URLS.GET_PLAN_BY_ID}/${planId}/approve`,
      {}
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to approve.",
    };
  }
};

/** Reject plan */
export const rejectPlan = async (planId: string): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.put(
      `${PLAN_URLS.GET_PLAN_BY_ID}/${planId}/reject`,
      {}
    );
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to reject.",
    };
  }
};

/** Batch approve */
export const approvePlansBatch = async (
  planIds: string[]
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.post(PLAN_URLS.APPROVE_BATCH, {
      ids: planIds,
    });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to batch approve plans.",
    };
  }
};

/** Batch reject */
export const rejectPlansBatch = async (
  planIds: string[]
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.post(PLAN_URLS.REJECT_BATCH, {
      ids: planIds,
    });
    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || "Failed to batch reject plans.",
    };
  }
};
