// utils/validationSchemas.jsx
import dayjs from "dayjs";

/**
 * Validation Schemas for Form Fields
 * Centralized validation rules for consistent validation across the application
 */

// ==================== EMAIL VALIDATION ====================
export const emailValidation = [
  {
    required: true,
    message: "Please enter email address",
  },
  {
    type: "email",
    message: "Please enter a valid email address (e.g., user@example.com)",
  },
  {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: "Email format is invalid",
  },
];

// ==================== PHONE NUMBER VALIDATION ====================
export const phoneValidation = [
  {
    required: true,
    message: "Please enter phone number",
  },
  {
    pattern: /^[0-9]{10}$/,
    message: "Phone number must be exactly 10 digits (e.g., 0123456789)",
  },
  {
    validator: (_: any, value: string) => {
      if (!value) {
        return Promise.resolve();
      }
      // Remove any spaces or special characters
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length !== 10) {
        return Promise.reject(
          new Error("Phone number must contain exactly 10 digits")
        );
      }
      // Check if starts with 0
      if (!cleaned.startsWith("0")) {
        return Promise.reject(new Error("Phone number must start with 0"));
      }
      return Promise.resolve();
    },
  },
];

// ==================== CITIZEN ID VALIDATION ====================
export const citizenIdValidation = [
  {
    required: true,
    message: "Please enter Citizen ID",
  },
  {
    pattern: /^[0-9]{12}$/,
    message: "Citizen ID must be exactly 12 digits",
  },
  {
    validator: (_: any, value: string) => {
      if (!value) {
        return Promise.resolve();
      }
      // Remove any spaces or special characters
      const cleaned = value.replace(/\D/g, "");
      if (cleaned.length !== 12) {
        return Promise.reject(
          new Error(
            "Citizen ID must contain exactly 12 digits (no spaces or special characters)"
          )
        );
      }
      return Promise.resolve();
    },
  },
];

// ==================== DATE OF BIRTH VALIDATION ====================
export const dateOfBirthValidation = [
  {
    required: true,
    message: "Please select date of birth",
  },
  {
    validator: (_: any, value: string) => {
      if (!value) {
        return Promise.resolve();
      }

      const selectedDate = dayjs(value);
      const today = dayjs();
      const age = today.diff(selectedDate, "year");

      // Check if date is in the future
      if (selectedDate.isAfter(today)) {
        return Promise.reject(
          new Error("Date of birth cannot be in the future")
        );
      }

      // Check minimum age (16 years old)
      if (age < 16) {
        return Promise.reject(new Error("User must be at least 16 years old"));
      }

      // Check maximum age (reasonable limit, e.g., 100 years)
      if (age > 100) {
        return Promise.reject(new Error("Please enter a valid date of birth"));
      }

      return Promise.resolve();
    },
  },
];

// ==================== FIRST NAME VALIDATION ====================
export const firstNameValidation = [
  {
    required: true,
    message: "Please enter first name",
  },
  {
    min: 2,
    message: "First name must be at least 2 characters",
  },
  {
    max: 50,
    message: "First name must not exceed 50 characters",
  },
  {
    pattern: /^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]+$/,
    message: "First name can only contain letters and spaces",
  },
];

// ==================== LAST NAME VALIDATION ====================
export const lastNameValidation = [
  {
    required: true,
    message: "Please enter last name",
  },
  {
    min: 2,
    message: "Last name must be at least 2 characters",
  },
  {
    max: 50,
    message: "Last name must not exceed 50 characters",
  },
  {
    pattern: /^[a-zA-Z\s\u00C0-\u024F\u1E00-\u1EFF]+$/,
    message: "Last name can only contain letters and spaces",
  },
];

// ==================== ADDRESS VALIDATION ====================
export const addressValidation = [
  {
    required: true,
    message: "Please enter address",
  },
  {
    min: 10,
    message: "Address must be at least 10 characters",
  },
  {
    max: 200,
    message: "Address must not exceed 200 characters",
  },
];

// ==================== HELPER FUNCTIONS ====================

/**
 * Disable future dates for DatePicker
 * @param {dayjs} current - Current date being evaluated
 * @returns {boolean} - True if date should be disabled
 */
export const disableFutureDates = (current: any) => {
  return current && current > dayjs().endOf("day");
};

/**
 * Disable dates for users under 16 years old
 * @param {dayjs} current - Current date being evaluated
 * @returns {boolean} - True if date should be disabled
 */
export const disableDatesForMinAge = (current: any) => {
  if (!current) return false;
  const today = dayjs();
  const minDate = today.subtract(100, "year"); // Maximum 100 years old
  const maxDate = today.subtract(16, "year"); // Minimum 16 years old
  return (
    current.isBefore(minDate) ||
    current.isAfter(maxDate) ||
    current.isAfter(today)
  );
};

/**
 * Format phone number input (remove non-digits)
 * @param {string} value - Input value
 * @returns {string} - Cleaned phone number
 */
export const formatPhoneNumber = (value: string) => {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, 10);
};

/**
 * Format Citizen ID input (remove non-digits)
 * @param {string} value - Input value
 * @returns {string} - Cleaned Citizen ID
 */
export const formatCitizenId = (value: string) => {
  if (!value) return "";
  return value.replace(/\D/g, "").slice(0, 12);
};

// ==================== SCORE VALIDATION ====================

/**
 * Validate score input (0-10, allows decimal with dot)
 * @param {string} label - Field label for error messages
 * @param {boolean} required - Whether the field is required
 * @returns {array} - Validation rules
 */
export const createScoreValidation = (label: string, required = false) => {
  const rules = [];

  if (required) {
    rules.push({
      required: true,
      message: `Please enter ${label}`,
    });
  }

  rules.push({
    validator: (_: any, value: string) => {
      // If empty and not required, allow
      if (!value && !required) {
        return Promise.resolve();
      }

      // If empty and required, reject (already handled by required rule)
      if (!value && required) {
        return Promise.reject(new Error(`${label} is required`));
      }

      // Convert to string and check format
      const strValue = String(value).trim();

      // Check if contains comma (not allowed)
      if (strValue.includes(",")) {
        return Promise.reject(
          new Error(
            "Please use dot (.) instead of comma (,) for decimal numbers"
          )
        );
      }

      // Check if valid number
      const numValue = parseFloat(strValue);
      if (isNaN(numValue)) {
        return Promise.reject(new Error("Please enter a valid number"));
      }

      // Check if negative
      if (numValue < 0) {
        return Promise.reject(new Error("Score cannot be negative"));
      }

      // Check if exceeds maximum
      if (numValue > 10) {
        return Promise.reject(new Error("Score cannot exceed 10"));
      }

      // Check decimal places (max 2 decimal places)
      if (strValue.includes(".")) {
        const decimalPart = strValue.split(".")[1];
        if (decimalPart && decimalPart.length > 2) {
          return Promise.reject(new Error("Maximum 2 decimal places allowed"));
        }
      }

      return Promise.resolve();
    },
  });

  return rules;
};

// ==================== PERCENTAGE VALIDATION ====================

/**
 * Validate percentage input (0-100)
 * @param {string} label - Field label for error messages
 * @param {boolean} required - Whether the field is required
 * @returns {array} - Validation rules
 */
export const createPercentageValidation = (label: string, required = false) => {
  const rules = [];

  if (required) {
    rules.push({
      required: true,
      message: `Please enter ${label}`,
    });
  }

  rules.push({
    validator: (_: any, value: string) => {
      // If empty and not required, allow
      if (value !== "0" && !required) {
        return Promise.resolve();
      }

      // Convert to number
      const numValue = parseFloat(value);
      if (isNaN(numValue)) {
        return Promise.reject(new Error("Please enter a valid number"));
      }

      // Check if negative
      if (numValue < 0) {
        return Promise.reject(new Error("Percentage cannot be negative"));
      }

      // Check if exceeds 100
      if (numValue > 100) {
        return Promise.reject(new Error("Percentage cannot exceed 100"));
      }

      return Promise.resolve();
    },
  });

  return rules;
};

// Specific Score Validations
export const minAttendanceValidation = createScoreValidation(
  "Minimum Attendance",
  false
);
export const minPracticeExamScoreValidation = createScoreValidation(
  "Minimum Practice Exam Score",
  false
);
export const minFinalExamScoreValidation = createScoreValidation(
  "Minimum Final Exam Score",
  true
);
export const minTotalScoreValidation = createScoreValidation(
  "Minimum Total Score",
  true
);

/**
 * Format score input (replace comma with dot)
 * @param {string} value - Input value
 * @returns {string} - Formatted score
 */
export const formatScoreInput = (value: string) => {
  if (!value) return value;
  return String(value).replace(",", ".");
};

// ==================== GRADE INPUT VALIDATION (FOR IMPORT) ====================

/**
 * Validate grade input for import (0-10, no negatives, max 2 decimals)
 * @param {number} value - Grade value
 * @param {string} fieldName - Field name for error messages
 * @returns {object} - { isValid: boolean, error: string }
 */
export const validateGradeInput = (value: any, fieldName = "Grade") => {
  // Allow empty/null values
  if (value === null || value === undefined || value === "") {
    return { isValid: true, error: null };
  }

  const numValue = Number(value);

  // Check if it's a valid number
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  // Check for negative numbers
  if (numValue < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }

  // Check maximum value (10)
  if (numValue > 10) {
    return { isValid: false, error: `${fieldName} cannot exceed 10` };
  }

  // Check decimal places (max 2)
  const strValue = String(value);
  if (strValue.includes(".")) {
    const decimalPart = strValue.split(".")[1];
    if (decimalPart && decimalPart.length > 2) {
      return {
        isValid: false,
        error: `${fieldName} can have maximum 2 decimal places`,
      };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validate all grades in a grade entry
 * @param {object} gradeEntry - Grade entry object with attendance, practiceExamScore, finalExamScore, totalScore
 * @returns {object} - { isValid: boolean, errors: array }
 */
export const validateGradeEntry = (gradeEntry: any) => {
  const errors = [];

  // Validate attendance
  if (
    gradeEntry.attendance !== null &&
    gradeEntry.attendance !== undefined &&
    gradeEntry.attendance !== ""
  ) {
    const result = validateGradeInput(gradeEntry.attendance, "Attendance");
    if (!result.isValid) {
      errors.push(result.error);
    }
  }

  // Validate practice exam score
  if (
    gradeEntry.practiceExamScore !== null &&
    gradeEntry.practiceExamScore !== undefined &&
    gradeEntry.practiceExamScore !== ""
  ) {
    const result = validateGradeInput(
      gradeEntry.practiceExamScore,
      "Practice Exam Score"
    );
    if (!result.isValid) {
      errors.push(result.error);
    }
  }

  // Validate final exam score
  if (
    gradeEntry.finalExamScore !== null &&
    gradeEntry.finalExamScore !== undefined &&
    gradeEntry.finalExamScore !== ""
  ) {
    const result = validateGradeInput(
      gradeEntry.finalExamScore,
      "Final Exam Score"
    );
    if (!result.isValid) {
      errors.push(result.error);
    }
  }

  // Validate total score
  if (
    gradeEntry.totalScore !== null &&
    gradeEntry.totalScore !== undefined &&
    gradeEntry.totalScore !== ""
  ) {
    const result = validateGradeInput(gradeEntry.totalScore, "Total Score");
    if (!result.isValid) {
      errors.push(result.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

// ==================== DATE RANGE VALIDATION (CLASS GROUP) ====================

/**
 * Disable past dates (for start/end date selection)
 * @param {dayjs} current - Current date being evaluated
 * @returns {boolean} - True if date should be disabled
 */
export const disablePastDates = (current: any) => {
  if (!current) return false;
  const today = dayjs().startOf("day");
  return current.isBefore(today);
};

/**
 * Validation for class group start date
 */
export const startDateValidation = [
  {
    required: true,
    message: "Please select start date",
  },
  {
    validator: (_: any, value: string) => {
      if (!value) {
        return Promise.resolve();
      }

      const selectedDate = dayjs(value).startOf("day");
      const today = dayjs().startOf("day");

      // Check if date is in the past
      if (selectedDate.isBefore(today)) {
        return Promise.reject(new Error("Start date cannot be in the past"));
      }

      return Promise.resolve();
    },
  },
];

/**
 * Validation for class group end date
 * @param {function} getFieldValue - Form getFieldValue function to access start date
 */
export const createEndDateValidation = (getFieldValue: any) => [
  {
    required: true,
    message: "Please select end date",
  },
  {
    validator: (_: any, value: string) => {
      if (!value) {
        return Promise.resolve();
      }

      const selectedDate = dayjs(value).startOf("day");
      const today = dayjs().startOf("day");
      const startDate = getFieldValue("start");

      // Check if date is in the past
      if (selectedDate.isBefore(today)) {
        return Promise.reject(new Error("End date cannot be in the past"));
      }

      // Check if end date is after start date
      if (startDate && selectedDate.isBefore(dayjs(startDate).startOf("day"))) {
        return Promise.reject(new Error("End date must be after start date"));
      }

      // Check if end date is the same as start date
      if (
        startDate &&
        selectedDate.isSame(dayjs(startDate).startOf("day"), "day")
      ) {
        return Promise.reject(new Error("End date must be after start date"));
      }

      return Promise.resolve();
    },
  },
];

/**
 * Validation for class group start date (Edit Mode)
 * More flexible - allows keeping existing past dates but prevents selecting new past dates
 * @param {dayjs} originalStartDate - Original start date from the record
 */
export const createEditStartDateValidation = (originalStartDate: any) => [
  {
    required: true,
    message: "Please select start date",
  },
  {
    validator: (_: any, value: string) => {
      if (!value) {
        return Promise.resolve();
      }

      const selectedDate = dayjs(value).startOf("day");
      const today = dayjs().startOf("day");
      const originalDate = originalStartDate
        ? dayjs(originalStartDate).startOf("day")
        : null;

      // If user keeps the original date (even if it's in the past), allow it
      if (originalDate && selectedDate.isSame(originalDate, "day")) {
        return Promise.resolve();
      }

      // If user selects a new date, it must not be in the past
      if (selectedDate.isBefore(today)) {
        return Promise.reject(new Error("Start date cannot be in the past"));
      }

      return Promise.resolve();
    },
  },
];

/**
 * Disable past dates except for a specific date (used in edit mode)
 * @param {dayjs} allowedDate - The date that should be allowed even if it's in the past
 */
export const createDisablePastDatesExcept =
  (allowedDate: any) => (current: any) => {
    if (!current) return false;
    const today = dayjs().startOf("day");
    const allowed = allowedDate ? dayjs(allowedDate).startOf("day") : null;

    // Allow the specific date even if it's in the past
    if (allowed && current.isSame(allowed, "day")) {
      return false;
    }

    // Disable all dates before today
    return current.isBefore(today);
  };
