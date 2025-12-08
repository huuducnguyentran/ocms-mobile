import axiosInstance from "../utils/axiosInstance";
import { ATTENDANCE_URLS } from "../api/apiUrl";

export interface AttendanceRecord {
  attendanceId: number;
  traineeAssignationId: string;
  traineeId: string;
  traineeName: string;
  slot: number;
  date: string;
  status: string;
  statusDisplay: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

/**
 * GET /api/Attendance/class/{classId}
 */
export const getAttendanceByClassId = async (
  classId: number
): Promise<ApiResponse<AttendanceRecord[]>> => {
  try {
    const url = ATTENDANCE_URLS.GET_BY_CLASS.replace(
      "{classId}",
      String(classId)
    );

    const res = await axiosInstance.get(url);

    return res.data;
  } catch (error) {
    return {
      data: [],
      success: false,
      message: "Failed to load attendance list.",
    };
  }
};
