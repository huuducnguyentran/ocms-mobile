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

/**
 * GET /api/Attendance/class/{classId}/slot/{slot}
 */
export const getAttendanceByClassAndSlot = async (
  classId: number,
  slot: number
): Promise<ApiResponse<AttendanceRecord[]>> => {
  try {
    const url = ATTENDANCE_URLS.GET_BY_CLASS_AND_SLOT.replace(
      "{classId}",
      String(classId)
    ).replace("{slot}", String(slot));

    const res = await axiosInstance.get(url);
    return res.data;
  } catch (error) {
    return {
      data: [],
      success: false,
      message: "Failed to load attendance for this slot.",
    };
  }
};

/**
 * POST /api/Attendance
 * Create a new attendance record
 */
export const addAttendance = async (payload: {
  traineeAssignationId: string;
  slot: number;
  status: string;
}): Promise<ApiResponse<AttendanceRecord>> => {
  try {
    const res = await axiosInstance.post(ATTENDANCE_URLS.CREATE, payload);
    return res.data;
  } catch (error) {
    return {
      data: {} as AttendanceRecord,
      success: false,
      message: "Failed to create attendance.",
    };
  }
};

/**
 * PUT /api/Attendance/{attendanceId}
 * Update attendance record
 */
export const updateAttendance = async (
  attendanceId: number,
  payload: { status: string }
): Promise<ApiResponse<AttendanceRecord>> => {
  try {
    const url = ATTENDANCE_URLS.UPDATE.replace(
      "{attendanceId}",
      String(attendanceId)
    );

    const res = await axiosInstance.put(url, payload);
    return res.data;
  } catch (error) {
    return {
      data: {} as AttendanceRecord,
      success: false,
      message: "Failed to update attendance.",
    };
  }
};
