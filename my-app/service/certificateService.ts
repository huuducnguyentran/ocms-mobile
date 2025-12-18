import axiosInstance from "../utils/axiosInstance";
import { CERTIFICATE_URLS, SIGNATURE_URLS } from "../api/apiUrl";

export interface PagedResponse<T> {
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

/**
 * Get all certificates with pagination
 */
export const getAllCertificates = async (
  skip: number,
  take: number
): Promise<ApiResponse<PagedResponse<any>>> => {
  try {
    const res = await axiosInstance.get(
      `${CERTIFICATE_URLS.GET_ALL_CERTIFICATE}?skip=${skip}&take=${take}`
    );
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch certificates",
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
};

/**
 * Get certificate by ID
 */
export const getCertificateById = async (
  certificateId: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.get(
      `${CERTIFICATE_URLS.GET_CERTIFICATE_BY_ID}/${certificateId}`
    );
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch certificate details.",
      data: null,
    };
  }
};

/**
 * Sign certificate (PDF signing + email)
 */
export const signCertificate = async (
  certificateId: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.post(
      `${SIGNATURE_URLS.SIGN_CERTIFICATE}/${certificateId}`,
      {}
    );

    return {
      success: true,
      message: "Email sent successfully with signed certificate.",
      data: res.data,
    };
  } catch (error: any) {
    let message = "Failed to send signed certificate.";

    if (error.response) {
      const map: Record<number, string> = {
        400: "Invalid certificate ID.",
        401: "Unauthorized.",
        403: "Permission denied.",
        500: "Server error.",
      };
      message = map[error.response.status] || message;
    }

    return {
      success: false,
      message,
      data: null,
    };
  }
};

/**
 * Update certificate status (Director)
 */
export const updateCertificateStatus = async (
  certificateId: string,
  status: string,
  reason: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.put(
      `${CERTIFICATE_URLS.UPDATE_CERTIFICATE_STATUS}/${certificateId}/status`,
      { status, reason }
    );

    return {
      success: true,
      message: res.data?.message || "Certificate status updated.",
      data: res.data?.data || null,
    };
  } catch (error: any) {
    let message = "Failed to update certificate status.";

    if (error.response) {
      const map: Record<number, string> = {
        400: "Invalid request data.",
        401: "Unauthorized.",
        403: "Permission denied.",
        404: "Certificate not found.",
        500: "Server error.",
      };
      message = map[error.response.status] || message;
    }

    return {
      success: false,
      message,
      data: null,
    };
  }
};

/**
 * Get public certificate (NO AUTH)
 */
export const getPublicCertificate = async (
  certificateId: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.get(
      `${CERTIFICATE_URLS.PUBLIC_CERTIFICATE}/${certificateId}`,
      { headers: { Authorization: "" } }
    );

    return res.data;
  } catch (error: any) {
    return {
      success: false,
      message:
        error.response?.data?.message || "Failed to fetch public certificate.",
      data: null,
    };
  }
};

/**
 * View certificate (HTML or PDF) – PUBLIC / SIGNED
 */
export const viewPublicCertificateHtml = async (
  certificateId: string
): Promise<{
  success: boolean;
  isPdf: boolean;
  data: any;
  message: string;
}> => {
  try {
    const res = await axiosInstance.get(
      `${CERTIFICATE_URLS.VIEW_PUBLIC_CERTIFICATE}/${certificateId}/view`,
      {
        responseType: "arraybuffer",
        headers: { Authorization: "" },
      }
    );

    const isPdf = res.headers["content-type"]?.includes("application/pdf");

    return {
      success: true,
      isPdf,
      data: res.data,
      message: isPdf ? "PDF loaded" : "HTML loaded",
    };
  } catch (error) {
    return {
      success: false,
      isPdf: false,
      data: null,
      message: "Failed to load certificate view.",
    };
  }
};

/**
 * Get my certificates (Trainee)
 */
export const getMyCertificates = async (): Promise<ApiResponse<any[]>> => {
  try {
    const res = await axiosInstance.get(CERTIFICATE_URLS.MY_CERTIFICATES);
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch your certificates.",
      data: [],
    };
  }
};

/**
 * Get certificate HTML or PDF (SIGNED)
 */
export const getCertificateHtml = async (
  certificateId: string
): Promise<{
  success: boolean;
  isPdf: boolean;
  data: any;
  message: string;
}> => {
  try {
    const res = await axiosInstance.get(
      `${CERTIFICATE_URLS.CERTIFICATE_HTML}/${certificateId}/html`,
      {
        responseType: "arraybuffer",
      }
    );

    const isPdf = res.headers["content-type"]?.includes("application/pdf");

    return {
      success: true,
      isPdf,
      data: res.data,
      message: "Certificate content retrieved.",
    };
  } catch (error) {
    return {
      success: false,
      isPdf: false,
      data: null,
      message: "Failed to retrieve certificate content.",
    };
  }
};
