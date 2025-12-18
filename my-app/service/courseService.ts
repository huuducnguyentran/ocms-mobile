// src/service/courseService.ts
import { COURSE_URLS } from "@/api/apiUrl";
import axiosInstance from "@/utils/axiosInstance";

/* ================= TYPES ================= */
export interface Course {
  courseId: string;
  courseName: string;
  description: string;
  status: string;
  isCertificated: boolean;
  createdAt: string;
}

export interface PaginationData<T> {
  data: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ================= SERVICE ================= */
const courseService = {
  /**
   * Get all courses (PAGINATED)
   */
  getAllCourses: async (
    skip = 0,
    take = 10
  ): Promise<ApiResponse<PaginationData<Course>>> => {
    try {
      const res = await axiosInstance.get(COURSE_URLS.GET_ALL, {
        params: { skip, take },
      });
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch courses.",
        data: {
          data: [],
          totalCount: 0,
          pageNumber: 1,
          pageSize: take,
          totalPages: 0,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      };
    }
  },
  /**
   * Get course details by ID
   */
  getCourseById: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.get(
        `${COURSE_URLS.GET_BY_ID}/${courseId}`
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch course details.",
        data: null,
      };
    }
  },

  /**
   * Get courses by status
   */
  getCoursesByStatus: async (status: string): Promise<ApiResponse<any[]>> => {
    try {
      const res = await axiosInstance.get(
        `${COURSE_URLS.GET_BY_STATUS}/${status}`
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch courses by status.",
        data: [],
      };
    }
  },

  /**
   * Get all subjects of a course
   */
  getCourseSubjects: async (courseId: string): Promise<ApiResponse<any[]>> => {
    try {
      const res = await axiosInstance.get(
        `${COURSE_URLS.GET_SUBJECTS}/${courseId}/subjects`
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch course subjects.",
        data: [],
      };
    }
  },

  /**
   * Create a new course
   */
  createCourse: async (courseData: any): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(COURSE_URLS.CREATE, courseData);
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to create course.",
        data: null,
      };
    }
  },

  /**
   * Update existing course
   */
  updateCourse: async (
    courseId: string,
    courseData: any
  ): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.put(
        `${COURSE_URLS.UPDATE}/${courseId}`,
        courseData
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to update course.",
        data: null,
      };
    }
  },

  /**
   * Delete a course
   */
  deleteCourse: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.delete(
        `${COURSE_URLS.DELETE}/${courseId}`
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to delete course.",
        data: null,
      };
    }
  },

  /**
   * Approve a course
   */
  approveCourse: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.put(
        `${COURSE_URLS.APPROVE}/${courseId}/approve`
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to approve course.",
        data: null,
      };
    }
  },

  /**
   * Approve multiple courses
   */
  approveCourseBatch: async (ids: string[]): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(COURSE_URLS.APPROVE_BATCH, { ids });
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to approve courses.",
        data: null,
      };
    }
  },

  /**
   * Reject a single course
   */
  rejectCourse: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.put(
        `${COURSE_URLS.REJECT}/${courseId}/reject`
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to reject course.",
        data: null,
      };
    }
  },

  /**
   * Reject multiple courses
   */
  rejectCourseBatch: async (ids: string[]): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(COURSE_URLS.REJECT_BATCH, { ids });
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to reject courses.",
        data: null,
      };
    }
  },

  /**
   * Request new course
   */
  requestNewCourse: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(
        `${COURSE_URLS.REQUEST_NEW}/${courseId}/request/new`
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to request new course.",
        data: null,
      };
    }
  },

  /**
   * Request course modification
   */
  requestModifyCourse: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(
        `${COURSE_URLS.REQUEST_MODIFY}/${courseId}/request/modify`
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to request course modification.",
        data: null,
      };
    }
  },

  /**
   * Toggle certificate status
   */
  toggleCertificated: async (courseId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(
        `${COURSE_URLS.TOGGLE_CERTIFICATED}/${courseId}/toggle-certificated`
      );
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to toggle certificated status.",
        data: null,
      };
    }
  },
};

export default courseService;
