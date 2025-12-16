import axiosInstance from "../utils/axiosInstance";
import { CURRICULUM_URLS } from "../api/apiUrl";

export interface CurriculumSubject {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  score: number;
  status: string;
  traineeAssignationId: string;
  gradeDate: string;
}

export interface CurriculumCourse {
  courseId: string;
  courseName: string;
  subjects: CurriculumSubject[];
}

export interface CurriculumPlan {
  planId: string;
  planName: string;
  courses: CurriculumCourse[];
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

/**
 * GET /Curriculum/me
 * Get curriculum for current trainee
 */
export const getMyCurriculum = async (): Promise<
  ApiResponse<CurriculumPlan[]>
> => {
  try {
    const res = await axiosInstance.get(CURRICULUM_URLS.GET_MY_CURRICULUM);
    return res.data;
  } catch (error) {
    return {
      data: [],
      success: false,
      message: "Failed to load your curriculum.",
    };
  }
};
