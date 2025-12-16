// src/service/subjectService.ts
import axiosInstance from "@/utils/axiosInstance";
import { SUBJECT_URLS } from "@/api/apiUrl";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export const subjectService = {
  /** -----------------------------
   * Get all subjects
   * ------------------------------ */
  getAllSubjects: async (): Promise<ApiResponse<any[]>> => {
    try {
      const res = await axiosInstance.get(SUBJECT_URLS.GET_ALL);
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch subjects.",
        data: [],
      };
    }
  },

  /** -----------------------------
   * Get subject by ID
   * ------------------------------ */
  getSubjectById: async (subjectId: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.get(
        `${SUBJECT_URLS.GET_BY_ID}/${subjectId}`
      );
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to fetch subject details.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Get subjects by status
   * ------------------------------ */
  getSubjectsByStatus: async (status: string): Promise<ApiResponse<any[]>> => {
    try {
      const res = await axiosInstance.get(
        `${SUBJECT_URLS.GET_BY_STATUS}/${status}`
      );
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to fetch subjects by status.",
        data: [],
      };
    }
  },

  /** -----------------------------
   * Create subject
   * ------------------------------ */
  createSubject: async (body: any): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(SUBJECT_URLS.CREATE, body);
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to create subject.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Update subject
   * ------------------------------ */
  updateSubject: async (id: string, body: any): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.put(`${SUBJECT_URLS.UPDATE}/${id}`, body);
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to update subject.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Delete subject
   * ------------------------------ */
  deleteSubject: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.delete(`${SUBJECT_URLS.DELETE}/${id}`);
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to delete subject.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Import subjects in bulk
   * ------------------------------ */
  importSubjects: async (subjects: any[]): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(SUBJECT_URLS.IMPORT, subjects);
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to import subjects.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Approve subject
   * ------------------------------ */
  approveSubject: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.put(
        `${SUBJECT_URLS.APPROVE}/${id}/approve`
      );
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to approve subject.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Approve multiple subjects
   * ------------------------------ */
  approveSubjectBatch: async (ids: string[]): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(SUBJECT_URLS.APPROVE_BATCH, { ids });
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to approve subject batch.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Reject subject
   * ------------------------------ */
  rejectSubject: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.put(
        `${SUBJECT_URLS.REJECT}/${id}/reject`
      );
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to reject subject.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Reject multiple subjects
   * ------------------------------ */
  rejectSubjectBatch: async (ids: string[]): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(SUBJECT_URLS.REJECT_BATCH, { ids });
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to reject subject batch.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Request new subject
   * ------------------------------ */
  requestNewSubject: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(
        `${SUBJECT_URLS.REQUEST_NEW}/${id}/request/new`
      );
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to request new subject.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Request modify subject
   * ------------------------------ */
  requestModifySubject: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(
        `${SUBJECT_URLS.REQUEST_MODIFY}/${id}/request/modify`
      );
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to request subject modification.",
        data: null,
      };
    }
  },

  /** -----------------------------
   * Toggle certificated
   * ------------------------------ */
  toggleCertificated: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const res = await axiosInstance.post(
        `${SUBJECT_URLS.TOGGLE_CERTIFICATED}/${id}/toggle-certificated`
      );
      return res.data;
    } catch {
      return {
        success: false,
        message: "Failed to toggle certificated status.",
        data: null,
      };
    }
  },
};

export default subjectService;
