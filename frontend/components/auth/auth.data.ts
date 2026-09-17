import type { CourseOption } from "./auth.types";

// Mirrors the course list used in the Contact module — kept as a
// separate constant here since Register's dropdown is auth-scoped and
// may diverge (e.g. add "Not sure yet") independently of Contact's.
export const COURSE_OPTIONS: CourseOption[] = [
  { value: "jee", label: "JEE Main + Advanced" },
  { value: "neet", label: "NEET" },
  { value: "foundation", label: "Foundation (Class 6-10)" },
  { value: "mht-cet", label: "MHT-CET" },
  { value: "crash-course", label: "Crash Course" },
  { value: "dropper", label: "Dropper Batch" },
];

// Simulated network delay for dummy authentication (milliseconds).
// Remove once the real Auth API module replaces the setTimeout calls.
export const AUTH_SIMULATED_DELAY_MS = 1500;

// Student dashboard route (route group (student) makes this /dashboard)
export const STUDENT_DASHBOARD_ROUTE = "/dashboard";

// Admin dashboard route
export const ADMIN_DASHBOARD_ROUTE = "/admin/dashboard";

// Faculty dashboard route
export const FACULTY_DASHBOARD_ROUTE = "/faculty/dashboard";

// Centralized copy so page headings/subtext aren't hardcoded inline
// across LoginForm / RegisterForm / ForgotPasswordForm.
export const authCopy = {
  login: {
    title: "Welcome Back",
    subtitle: "Login to continue your learning journey.",
  },
  register: {
    title: "Create Your Account",
    subtitle: "Join Roots Academy and start your success story.",
  },
  forgotPassword: {
    title: "Forgot Password",
    subtitle: "Enter your email and we'll send you a reset link.",
    successTitle: "Reset link sent successfully.",
    successSubtitle: "Please check your email.",
  },
} as const;