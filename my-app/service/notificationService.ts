import axiosInstance from "../utils/axiosInstance";
import { NOTIFICATION_URLS } from "../api/apiUrl";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface Notification {
  notificationId: number;
  title: string;
  message: string;
  notificationType: string;
  createdAt: string;
  isRead: boolean;
}

/**
 * Get all notifications for the current user
 */
export const getNotifications = async (): Promise<
  ApiResponse<Notification[]>
> => {
  try {
    const res = await axiosInstance.get(NOTIFICATION_URLS.GET_ALL);
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch notifications.",
      data: [],
    };
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  notificationId: number
): Promise<ApiResponse<boolean>> => {
  try {
    const res = await axiosInstance.put(
      `${NOTIFICATION_URLS.MARK_READ}/${notificationId}/read`
    );
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to mark notification as read.",
      data: false,
    };
  }
};

