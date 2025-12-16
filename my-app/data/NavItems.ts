// data/NavItems.ts - Navigation items for mobile app
// data/NavItems.ts - Navigation items for mobile app
export interface NavItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  roles?: string[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  // ──────────────────────────────
  // 📌 General
  // ──────────────────────────────
  {
    key: "1",
    label: "Home",
    icon: "home",
    path: "/(tabs)",
    roles: [
      "Administrator",
      "Instructor",
      "Trainee",
      "Education Officer",
      "Director",
      "AOC Manager",
    ],
  },

  // ──────────────────────────────
  // 🎓 Learning Management
  // ──────────────────────────────
  {
    key: "2",
    label: "Specialty",
    icon: "appstore",
    path: "/specialty_screen",
    roles: ["Administrator", "Instructor", "Education Officer"],
  },
  {
    key: "3",
    label: "Course",
    icon: "book",
    roles: [
      "Administrator",
      "Instructor",
      "Trainee",
      "Education Officer",
      "Director",
    ],
    children: [
      {
        key: "3-1",
        label: "All Courses",
        path: "/course_screen",
        roles: ["Administrator", "Instructor", "Director", "Education Officer"],
      },
      {
        key: "3-2",
        label: "Course Specialty",
        icon: "cluster",
        path: "/course-subject-specialty",
        roles: ["Administrator", "Instructor", "Director", "Education Officer"],
      },
    ],
  },
  {
    key: "4",
    label: "Subject",
    icon: "read",
    path: "/subject",
    roles: ["Administrator", "Instructor", "Education Officer", "Director"],
    children: [
      {
        key: "4-1",
        label: "View Subjects",
        path: "/subject_status_screen",
        roles: ["Administrator", "Instructor", "Education Officer", "Director"],
      },
    ],
  },
  {
    key: "5",
    label: "Classroom",
    icon: "file-protect",
    roles: ["Administrator", "Education Officer", "Trainee"],
    children: [
      {
        key: "5-1",
        label: "View Classes",
        path: "/class_screen",
        roles: ["Administrator", "Education Officer", "Trainee"],
      },
      {
        key: "5-2",
        label: "Create Class",
        path: "/class/create",
        roles: ["Education Officer"],
      },
      {
        key: "5-3",
        label: "Assign Trainees",
        path: "/class/assign-trainee",
        roles: ["Education Officer"],
      },
    ],
  },

  // ──────────────────────────────
  // 🧾 Assessment & Accomplishment
  // ──────────────────────────────
  {
    key: "6",
    label: "Accomplishments",
    icon: "trophy",
    path: "/my_certificate_screen",
    roles: ["Trainee"],
  },
  {
    key: "7",
    label: "Grade",
    icon: "bar-chart",
    roles: ["Instructor", "Trainee"],
    children: [
      {
        key: "7-1",
        label: "Manage Grades",
        path: "/manage_grade_screen",
        roles: ["Instructor"],
      },
      {
        key: "7-2",
        label: "My Grades",
        path: "/trainee-grade",
        roles: ["Trainee"],
      },
      {
        key: "7-3",
        label: "Attendance",
        path: "/manage_attendance_screen",
        roles: ["Instructor"],
      },
    ],
  },
  {
    key: "8",
    label: "Curriculum",
    icon: "book",
    path: "/curriculum_screen",
    roles: ["Trainee"],
  },

  // ──────────────────────────────
  // 📨 Requests
  // ──────────────────────────────
  {
    key: "9",
    label: "Request",
    icon: "form",
    path: "/request",
    roles: [
      "Administrator",
      "Instructor",
      "Trainee",
      "Education Officer",
      "Director",
    ],
  },

  // ──────────────────────────────
  // 🎖️ Certification & Decisions
  // ──────────────────────────────
  {
    key: "10",
    label: "Certificate",
    icon: "safety-certificate",
    roles: ["Administrator", "Education Officer", "Director"],
    children: [
      {
        key: "10-1",
        label: "All Certificate",
        path: "/certificate_screen",
        roles: ["Administrator", "Director"],
      },
      {
        key: "10-2",
        label: "Certificate Template",
        path: "/certificate-template",
        roles: ["Administrator", "Education Officer"],
      },
    ],
  },
  {
    key: "11",
    label: "Decision",
    icon: "audit",
    roles: ["Administrator", "Education Officer", "Director"],
    children: [
      {
        key: "11-1",
        label: "All Decision",
        path: "/decision_screen",
        roles: ["Administrator", "Director"],
      },
      {
        key: "11-2",
        label: "Decision Template",
        path: "/decision-template",
        roles: ["Administrator", "Education Officer"],
      },
    ],
  },

  // ──────────────────────────────
  // 👥 User & Role Management
  // ──────────────────────────────
  {
    key: "12",
    label: "Accounts",
    icon: "user-switch",
    roles: ["Administrator"],
    children: [
      {
        key: "12-1",
        label: "View Accounts",
        path: "/accounts",
        roles: ["Administrator"],
      },
      {
        key: "12-2",
        label: "Create Account",
        path: "/create-account",
        roles: ["Administrator"],
      },
    ],
  },
  {
    key: "13",
    label: "Trainees",
    icon: "solution",
    roles: ["Education Officer"],
    children: [
      {
        key: "13-1",
        label: "View Trainees",
        path: "/trainees-view",
        roles: ["Education Officer"],
      },
      {
        key: "13-2",
        label: "Trainee Assignment",
        icon: "usergroup-add",
        path: "/assigned-trainee",
        roles: ["Instructor", "Education Officer"],
      },
    ],
  },
  {
    key: "14",
    label: "Instructor Assignment",
    icon: "idcard",
    path: "/instructor-assignment",
    roles: ["Administrator", "Education Officer"],
  },

  // ──────────────────────────────
  // 🏢 Organization Management
  // ──────────────────────────────
  {
    key: "15",
    label: "Department",
    icon: "apartment",
    path: "/department",
    roles: ["Administrator", "AOC Manager"],
    children: [
      {
        key: "15-1",
        label: "View Departments",
        path: "/department-admin",
        roles: ["Administrator"],
      },
      {
        key: "15-2",
        label: "View Departments",
        path: "/department-aoc",
        roles: ["AOC Manager"],
      },
    ],
  },

  // ──────────────────────────────
  // ⚙️ System & Tools
  // ──────────────────────────────
  {
    key: "16",
    label: "Reports",
    icon: "pie-chart",
    path: "/export-certificate",
    roles: ["Administrator", "Director", "AOC Manager"],
  },
  {
    key: "17",
    label: "Plan",
    icon: "calendar",
    path: "/plan",
    roles: ["Director", "Education Officer"],
    children: [
      {
        key: "17-1",
        label: "All-Plans",
        path: "/all-plans",
        roles: ["Education Officer"],
      },
      {
        key: "17-2",
        label: "Plans Status",
        path: "/plan_status_screen",
        roles: ["Director"],
      },
      {
        key: "17-3",
        label: "Plans Enrollment",
        path: "/plan_enrollment_screen",
        roles: ["Education Officer", "Director"],
      },
    ],
  },
  {
    key: "18",
    label: "Progress",
    icon: "apartment",
    path: "/progress",
    roles: ["Administrator", "Education Officer"],
  },
  {
    key: "19",
    label: "Make report",
    icon: "FileDoneOutlined",
    path: "/make_report_screen",
    roles: ["Trainee"],
  },
];

export default navItems;
