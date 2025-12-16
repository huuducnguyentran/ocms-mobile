// api/apiUrl.ts
export const AUTH_URLS = {
  LOGIN: "/Authentication/login",
  FORGOT_PASSWORD: "/Authentication/forgot-password",
  RESET_PASSWORD: "/Authentication/reset-password",
  IMPORT_TRAINEE: "/User/import-trainees",
  GET_TRAINEE_BY_SPECIALTY: "User/trainees/specialty",
  GET_USER_BY_ROLE: "/User/get-all-by-role",
  GET_EXTERNAL_CERTIFICATE_BY_USER_ID: "ExternalCertificate/user",
  GET_EXTERNAL_CERTIFICATE_BY_ID: "ExternalCertificate",
  GET_ALL_EXTERNAL_CERTIFICATES: "ExternalCertificate/all",
  UPDATE_EXTERNAL_CERTIFICATE_FILE: "ExternalCertificate",
  UPDATE_EXTERNAL_CERTIFICATE: "ExternalCertificate",
  CREATE_EXTERNAL_CERTIFICATE: "ExternalCertificate",
  DELETE_EXTERNAL_CERTIFICATE: "ExternalCertificate",
  DELETE_EXTERNAL_CERTIFICATE_IMAGE: "ExternalCertificate",
};

export const ATTENDANCE_URLS = {
  GET_BY_CLASS_AND_SLOT: "/api/Attendance/class/{classId}/slot/{slot}", // GET /api/Attendance/class/{classId}/slot/{slot}
  GET_BY_CLASS: "/api/Attendance/class/{classId}", // GET /api/Attendance/class/{classId}
  CREATE: "/api/Attendance", // POST /api/Attendance
  UPDATE: "/api/Attendance/{attendanceId}", // PUT /api/Attendance/{attendanceId}
};

export const USER_URLS = {
  PROFILE: "/User/profile",
  UPDATE_PROFILE: "/User/profile",
  CHANGE_PASSWORD: "/User/change-password",
  UPLOAD_AVATAR: "/User/profile/avatar",
  GET_ALL_USERS: "/User/all",
  CREATE_MANUAL_ACCOUNT: "/User/create-manual-account",
  SEND_CREDENTIALS: "/User/send-credentials",
  UPDATE_PROFILE_BY_ID: "/User/profile",
};

export const PLAN_URLS = {
  GET_ALL_PLANS: "/api/Plan/all",
  GET_PLAN_BY_ID: "/api/Plan",
  GET_PLAN_BY_STATUS: "/api/Plan",
  GET_PLAN_WITH_COURSE_BY_ID: "/api/Plan",
  GET_PLANS_BY_STATUS: "/api/Plan/status",
  CREATE_PLAN: "/api/Plan",
  SEND_NEW_PLAN_REQUEST: "/api/Plan",
  APPROVE_BATCH: "/api/Plan/approve/batch",
  REJECT_BATCH: "/api/Plan/reject/batch",
};

export const PLAN_ENROLLMENT_URLS = {
  ENROLL_PLAN: "/TraineePlanEnrollment/batch-enroll",
  GET_BY_TRAINEE: "/TraineePlanEnrollment/trainee",
  GET_BY_PLAN: "/TraineePlanEnrollment/plan",
  GET_SUITABLE_TRAINEES: "/TraineePlanEnrollment/get-suitable-trainee",
  GET_ENROLLMENT_BY_REQUEST_STATUS: "/TraineePlanEnrollment/request-status",
  GET_ENROLLMENT_BY_ENROLLMENT_STATUS:
    "/TraineePlanEnrollment/enrollment-status",
  APPROVE_BATCH: "/TraineePlanEnrollment/approve/batch",
  REJECT_BATCH: "/TraineePlanEnrollment/reject/batch",
};

export const STUDY_RECORD_URLS = {
  CREATE_STUDY_RECORD: "/api/StudyRecord",
};

export const SIGNATURE_URLS = {
  SIGN_CERTIFICATE: "/PdfSign",
  SIGN_DECISION: "/PdfSign/decision",
  SIGN_DECISION_BATCH: "/PdfSign/decision/batch",
};

export const CERTIFICATE_URLS = {
  GET_ALL_CERTIFICATE: "/Certificate/All",
  GET_CERTIFICATE_BY_ID: "/Certificate",
  UPDATE_CERTIFICATE_STATUS: "/Certificate",
  PUBLIC_CERTIFICATE: "/Certificate/public",
  VIEW_PUBLIC_CERTIFICATE: "/Certificate/public", // /public/{id}/view
  CERTIFICATE_HTML: "/Certificate", // /Certificate/{id}/html
  MY_CERTIFICATES: "/Certificate/me",
};

export const CERTIFICATE_TEMPLATE_URLS = {
  GET_ALL_CERTIFICATE_TEMPLATE: "/CertificateTemplate",
  GET_CERTIFICATE_TEMPLATE_BY_ID: "/CertificateTemplate",
  IMPORT_CERTIFICATE_TEMPLATE: "/CertificateTemplate",
  CREATE_CERTIFICATE_TEMPLATE: "/CertificateTemplate",
  EDIT_CERTIFICATE_TEMPLATE: "/CertificateTemplate",
  DELETE_CERTIFICATE_TEMPLATE: "/CertificateTemplate",
};

export const DECISION_URLS = {
  GET_ALL_DECISION: "/Decision",
  GET_MY_DECISIONS: "/Decision/me",
  GET_DECISION_BY_ID: "/Decision",
  GET_DECISION_HTML: "/Decision",
  VIEW_PUBLIC_DECISION: "/Decision/public",
  PUBLIC_DECISION_BY_USER: "/Decision/public/user",
  PUBLIC_DECISION_BY_CERTIFICATE: "/Decision/public/certificate",
};

export const DECISION_TEMPLATE_URLS = {
  GET_ALL_DECISION_TEMPLATE: "/DecisionTemplate",
  IMPORT_DECISION_TEMPLATE: "/DecisionTemplate",
  CREATE_DECISION_TEMPLATE: "/DecisionTemplate",
  EDIT_DECISION_TEMPLATE: "/DecisionTemplate",
  DELETE_DECISION_TEMPLATE: "/DecisionTemplate",
};

export const SPECIALTY_URLS = {
  GET_ALL: "/Specialty/all",
  GET_BY_ID: "/Specialty",
  CREATE: "/Specialty",
  UPDATE: "/Specialty",
  DELETE: "/Specialty",
};

export const INSTRUCTOR_ASSIGNATION_URLS = {
  GET_ALL: "/InstructorAssignation/all",
  GET_BY_COMPOSITE_KEY: "/InstructorAssignation",
  GET_BY_SUBJECT: "/InstructorAssignation/subject",
  GET_BY_INSTRUCTOR: "/InstructorAssignation/instructor",
  CREATE: "/InstructorAssignation",
  DELETE: "/InstructorAssignation",
};

export const SUBJECT_URLS = {
  GET_ALL: "/Subject/all",
  GET_BY_ID: "/Subject",
  GET_BY_STATUS: "/Subject/status",
  CREATE: "/Subject",
  UPDATE: "/Subject",
  DELETE: "/Subject",
  IMPORT: "/Subject/import",
  APPROVE_BATCH: "/Subject/approve/batch",
  REJECT_BATCH: "/Subject/reject/batch",
  APPROVE: "/Subject",
  REJECT: "/Subject",
  REQUEST_NEW: "/Subject",
  REQUEST_MODIFY: "/Subject",
  TOGGLE_CERTIFICATED: "/Subject",
};

export const COURSE_URLS = {
  GET_ALL: "/Course/all",
  GET_BY_ID: "/Course",
  CREATE: "/Course",
  UPDATE: "/Course",
  DELETE: "/Course",
  GET_BY_STATUS: "/Course/status",
  GET_SUBJECTS: "/Course",
  APPROVE: "/Course",
  REJECT: "/Course",
  REQUEST_NEW: "/Course",
  REQUEST_MODIFY: "/Course",
  TOGGLE_CERTIFICATED: "/Course",
  APPROVE_BATCH: "/Course/approve/batch",
  REJECT_BATCH: "/Course/reject/batch",
};

export const CLASS_URLS = {
  GET_ALL: "/Class/all",
  GET_BY_ID: "/Class",
  CREATE: "/Class",
  UPDATE: "/Class",
  DELETE: "/Class",
  IMPORT_GRADES: "/Class",
  GET_MY_CLASSES: "/Class/me",
  GET_MY_CLASSES_BY_ID: "/Class/me",
};

export const CLASSGROUP_URLS = {
  GET_ALL: "/ClassGroup/all",
  GET_BY_ID: "/ClassGroup",
  CREATE: "/ClassGroup",
  UPDATE: "/ClassGroup",
  DELETE: "/ClassGroup",
  GET_CLASSES: "/ClassGroup",
  SEND_REQUEST: "/ClassGroup/send-request",
};

export const COURSE_SUBJECT_SPECIALTY_URLS = {
  GET_ALL: "/CourseSubjectSpecialty/all",
  GET_BY_COMPOSITE_KEY: "/CourseSubjectSpecialty",
  GET_BY_COURSE: "/CourseSubjectSpecialty/course",
  GET_BY_SPECIALTY: "/CourseSubjectSpecialty/specialty",
  GET_BY_SUBJECT: "/CourseSubjectSpecialty/subject",
  CREATE: "/CourseSubjectSpecialty",
  DELETE: "/CourseSubjectSpecialty",
  DELETE_BY_COURSE: "/CourseSubjectSpecialty/course",
  DELETE_BY_SPECIALTY: "/CourseSubjectSpecialty/specialty",
  REQUEST_NEW: "/CourseSubjectSpecialty",
  REQUEST_MODIFY: "/CourseSubjectSpecialty",
};

export const TRAINEE_ASSIGNATION_URLS = {
  CREATE: "/TraineeAssignation",
  BATCH_ASSIGN: "/TraineeAssignation/batch",
  GET_BY_ID: "/TraineeAssignation",
  UPDATE: "/TraineeAssignation",
  DELETE: "/TraineeAssignation",
  GET_BY_CLASS: "/Class/{classId}/trainee-assignations",
  PUBLIC_TRAINEE_ASSIGNATION:
    "/TraineeAssignation/public/user/{userId}/total-scores",
  GET_GRADES_BY_CLASS_AND_TRAINEE: "/TraineeAssignation/class",
};

export const NOTIFICATION_URLS = {
  GET_ALL: "/Notification/all",
  MARK_READ: "/Notification",
  CREATE: "/Notification",
  TEST_ADMIN: "/Notification/test-admin-notification",
};

export const REQUEST_URLS = {
  GET_ALL: "/api/Request/all",
  GET_BY_ID: "/api/Request",
  CREATE: "/api/Request",
  APPROVE: "/api/Request",
  REJECT: "/api/Request",
};

export const USER_SPECIALTY_URLS = {
  GET_BY_SPECIALTY: "/UserSpecialty/specialty",
  GET_BY_USER: "/UserSpecialty/user",
  CREATE: "/UserSpecialty",
  BATCH_CREATE: "/UserSpecialty/batch",
  UPDATE_CERTIFICATION: "/UserSpecialty",
  DELETE: "/UserSpecialty",
};

export const CURRICULUM_URLS = {
  GET_MY_CURRICULUM: "/Curriculum/me",
  GET_BY_TRAINEE: "/Curriculum/trainee",
};

export const DEPARTMENT_URLS = {
  GET_ALL_DEPARTMENTS: "/Department",
  CREATE_DEPARTMENT: "/Department",
  GET_DEPARTMENT_BY_MANAGER: "/Department/manager",
  GET_DEPARTMENT_BY_SPECIALTY: "/Department/specialty",
  GET_DEPARTMENT_BY_ID: "/Department",
  UPDATE_DEPARTMENT: "/Department",
  DELETE_DEPARTMENT: "/Department",
  PATCH_DEPARTMENT_STATUS: "/Department/status",
};

export const USER_DEPARTMENT_URLS = {
  GET_BY_DEPARTMENT: "/UserDepartment/department",
  GET_BY_USER: "/UserDepartment/user",
  CREATE: "/UserDepartment",
  CREATE_BATCH: "/UserDepartment/batch",
  LEAVE: "/UserDepartment/leave",
  DELETE: "/UserDepartment",
};
