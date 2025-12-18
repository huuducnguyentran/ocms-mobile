import axiosInstance from "../utils/axiosInstance";
import { DECISION_URLS, SIGNATURE_URLS } from "../api/apiUrl";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* ============================================================
   GET ALL DECISIONS (LIKE CERTIFICATE API)
   skip = (page - 1) * take
============================================================ */
export const getAllDecisions = async (
  skip: number,
  take: number
): Promise<
  ApiResponse<{
    data: any[];
    totalPages: number;
  }>
> => {
  try {
    const res = await axiosInstance.get(DECISION_URLS.GET_ALL_DECISION, {
      params: { skip, take },
    });

    return res.data;
  } catch (error) {
    console.error("❌ Error getAllDecisions:", error);
    return {
      success: false,
      message: "Failed to fetch decisions.",
      data: {
        data: [],
        totalPages: 1,
      },
    };
  }
};

/* ============================================================
    GET MY DECISIONS (trainee)
============================================================ */
export const getMyDecisions = async (): Promise<ApiResponse<any[]>> => {
  try {
    const res = await axiosInstance.get(DECISION_URLS.GET_MY_DECISIONS);
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch your decisions.",
      data: [],
    };
  }
};

/* ============================================================
    GET DECISION BY ID
============================================================ */
export const getDecisionById = async (
  decisionId: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.get(
      `${DECISION_URLS.GET_DECISION_BY_ID}/${decisionId}`
    );
    return res.data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch decision.",
      data: null,
    };
  }
};

/* ============================================================
    GET DECISION HTML OR PDF (internal)
============================================================ */
export const getDecisionHtml = async (
  decisionId: string
): Promise<{
  success: boolean;
  isPdf: boolean;
  data: any;
  message: string;
}> => {
  try {
    const res = await axiosInstance.get(
      `${DECISION_URLS.GET_DECISION_HTML}/${decisionId}/html`,
      { responseType: "arraybuffer" }
    );

    const isPdf = res.headers["content-type"]?.includes("application/pdf");

    return {
      success: true,
      isPdf,
      data: res.data,
      message: isPdf ? "PDF retrieved." : "HTML retrieved.",
    };
  } catch (error) {
    return {
      success: false,
      isPdf: false,
      data: null,
      message: "Failed to retrieve decision content.",
    };
  }
};

/* ============================================================
    SIGN DECISION (Director)
============================================================ */
export const signDecision = async (
  decisionId: string
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.post(
      `${SIGNATURE_URLS.SIGN_DECISION}/${decisionId}`,
      {}
    );

    return {
      success: true,
      message: "Decision signed successfully.",
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to sign decision.",
      data: null,
    };
  }
};

/* ============================================================
    SIGN DECISIONS IN BATCH
============================================================ */
export const signDecisionBatch = async (
  ids: string[]
): Promise<ApiResponse<any>> => {
  try {
    const res = await axiosInstance.post(SIGNATURE_URLS.SIGN_DECISION_BATCH, {
      ids,
    });

    return {
      success: true,
      message: "Decisions signed successfully.",
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to sign decisions.",
      data: null,
    };
  }
};

/* ============================================================
    PUBLIC: GET DECISIONS BY USER
============================================================ */
export const getDecisionPublicByUserId = async (
  userId: string
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await axiosInstance.get(
      `${DECISION_URLS.PUBLIC_DECISION_BY_USER}/${userId}`,
      { headers: { Authorization: "" } }
    );

    return res.data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch public decisions.",
      data: [],
    };
  }
};

/* ============================================================
    PUBLIC: GET DECISION HTML/PDF (NO AUTH)
============================================================ */
export const getPublicDecisionHtml = async (
  decisionId: string
): Promise<{
  success: boolean;
  isPdf: boolean;
  data: any;
  message: string;
}> => {
  try {
    const res = await axiosInstance.get(
      `${DECISION_URLS.VIEW_PUBLIC_DECISION}/${decisionId}/html`,
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
      message: isPdf ? "PDF loaded." : "HTML loaded.",
    };
  } catch (error) {
    return {
      success: false,
      isPdf: false,
      data: null,
      message: "Failed to load public decision.",
    };
  }
};

/* ============================================================
    PUBLIC: GET DECISIONS BY CERTIFICATE
============================================================ */
export const getPublicDecisionByCertificate = async (
  certificateId: string
): Promise<ApiResponse<any[]>> => {
  try {
    const res = await axiosInstance.get(
      `${DECISION_URLS.PUBLIC_DECISION_BY_CERTIFICATE}/${certificateId}`,
      { headers: { Authorization: "" } }
    );

    return res.data;
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch decisions for certificate.",
      data: [],
    };
  }
};
