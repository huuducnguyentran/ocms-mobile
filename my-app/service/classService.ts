// src/service/classService.ts
import { CLASS_URLS } from "@/api/apiUrl";
import axiosInstance from "@/utils/axiosInstance";

export interface TraineeGrade {
  traineeAssignationGradeId: string;
  gradeKind:
    | "ProgressTest"
    | "PracticeExamScore"
    | "FinalExamScore"
    | "TotalScore";
  grade: number;
  gradeStatus: "Pass" | "Fail";
}

export interface MyClass {
  classId: number;
  subjectId: string;
  subjectName: string;
  classGroupCode: string;
  instructorId: string;
  instructorName: string;
  slot: number;
}

export interface TraineeAssignation {
  traineeAssignationId: string;
  traineeId: string;
  traineeName: string;
  grades: TraineeGrade[];
}

export interface MyClassDetail {
  classId: number;
  subjectId: string;
  subjectName: string;
  instructorId: string;
  instructorName: string;
  classGroupCode: string;

  traineeAssignations: TraineeAssignation[];

  minAttendance: number;
  slot: number;
  minProgressTest: number;
  minPracticeExamScore: number;
  minFinalExamScore: number;
  minTotalScore: number;

  /* ✅ ADD THESE */
  weightProgressTest: number;
  weightPracticalExam: number;
  weightFinalExam: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

/**
 * GET /Class/me
 * Get all classes (Instructor or Trainee)
 */
export const getMyClasses = async (): Promise<ApiResponse<MyClass[]>> => {
  try {
    const res = await axiosInstance.get(CLASS_URLS.GET_MY_CLASSES);
    return res.data;
  } catch (error) {
    return {
      data: [],
      success: false,
      message: "Failed to load your classes.",
    };
  }
};

/**
 * GET /Class/me/{classId}
 * Get detailed info for a specific class
 */
export const getMyClassById = async (
  classId: number
): Promise<ApiResponse<MyClassDetail>> => {
  try {
    const res = await axiosInstance.get(
      `${CLASS_URLS.GET_MY_CLASSES_BY_ID}/${classId}`
    );
    return res.data;
  } catch (error) {
    return {
      data: {} as MyClassDetail,
      success: false,
      message: "Failed to load class detail.",
    };
  }
};
