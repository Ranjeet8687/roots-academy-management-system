/**
 * Centralized API configuration and client for Roots Academy frontend.
 * Uses NEXT_PUBLIC_API_URL environment variable for the backend base URL.
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Upload response from the backend
 */
export interface UploadResponse {
  originalName: string;
  storedName: string;
  url: string;
  mimeType: string;
  size: number;
  message: string;
}

/**
 * Build full API URL for a given endpoint path
 */
export function buildApiUrl(endpoint: string): string {
  const base = API_BASE_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

/**
 * Default fetch options with JSON content type
 */
const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
};

/**
 * Generic API request function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = buildApiUrl(endpoint);

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      if (contentType?.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      }
      return { error: errorMessage };
    }

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return { data };
    }

    return { data: undefined as T };
  } catch (error) {
    console.error(`API request failed: ${endpoint}`, error);
    return {
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),

  /**
   * Upload a file using FormData
   * Does not set Content-Type - browser sets it with boundary automatically
   */
  upload: <T>(endpoint: string, formData: FormData, accessToken: string) =>
    apiRequest<T>(endpoint, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }),
};

/**
 * Student Dashboard API functions
 */
export const studentApi = {
  /**
   * Get student dashboard data (active enrollments, content counts)
   */
  getDashboard: (accessToken: string) =>
    api.get<StudentDashboardResponse>("/api/dashboard/student", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Get student's active enrolled courses
   */
  getMyCourses: (accessToken: string) =>
    api.get<StudentCourse[]>("/api/enrollments/my-courses", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Get lectures for a specific course (student view - published only)
   */
  getCourseLectures: (accessToken: string, courseId: string) =>
    api.get<Lecture[]>("/api/lectures/course/" + courseId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Get a specific lecture (student view)
   */
  getLecture: (accessToken: string, lectureId: string) =>
    api.get<Lecture>("/api/lectures/" + lectureId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Get live classes for a specific course (student view - published/active only)
   */
  getCourseLiveClasses: (accessToken: string, courseId: string) =>
    api.get<LiveClass[]>("/api/live-classes/course/" + courseId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Get a specific live class (student view)
   */
  getLiveClass: (accessToken: string, liveClassId: string) =>
    api.get<LiveClass>("/api/live-classes/" + liveClassId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Get DPPs for a specific course (student view - published/active only)
   */
  getCourseDPPs: (accessToken: string, courseId: string) =>
    api.get<DPP[]>("/api/dpps/course/" + courseId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Get a specific DPP (student view)
   */
  getDPP: (accessToken: string, dppId: string) =>
    api.get<DPP>("/api/dpps/" + dppId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Get study materials for a specific course (student view - published/active only)
   */
  getCourseStudyMaterials: (accessToken: string, courseId: string) =>
    api.get<StudyMaterial[]>("/api/study-materials/course/" + courseId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Get a specific study material (student view)
   */
  getStudyMaterial: (accessToken: string, studyMaterialId: string) =>
    api.get<StudyMaterial>("/api/study-materials/" + studyMaterialId, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};

/**
 * Types for student API responses
 */
export interface StudentDashboardResponse {
  student: {
    id: string;
  };
  activeEnrollments: number;
  courses: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  contentCounts: {
    lectures: number;
    liveClasses: number;
    dpps: number;
    studyMaterials: number;
  };
}

export interface StudentCourse {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  [key: string]: any;
}

export interface Lecture {
  _id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  duration?: number;
  order: number;
  isPublished: boolean;
  course: string | { _id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface LiveClass {
  _id: string;
  title: string;
  description?: string;
  scheduledStart: string;
  scheduledEnd: string;
  meetingUrl?: string;
  isPublished: boolean;
  isActive: boolean;
  course: string | { _id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface DPP {
  _id: string;
  title: string;
  description?: string;
  scheduledDate: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  isPublished: boolean;
  isActive: boolean;
  course: string | { _id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export enum StudyMaterialType {
  PDF = "PDF",
  DOCUMENT = "DOCUMENT",
  NOTES = "NOTES",
  LINK = "LINK",
  OTHER = "OTHER",
}

export interface StudyMaterial {
  _id: string;
  title: string;
  description?: string;
  materialType: StudyMaterialType;
  resourceUrl: string;
  thumbnailUrl?: string;
  subject?: string;
  isPublished: boolean;
  isActive: boolean;
  course: string | { _id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

/**
 * Auth-specific API functions
 */
/**
 * Admin Dashboard API types
 */
export interface AdminDashboardResponse {
  users: {
    totalStudents: number;
    totalFaculty: number;
  };
  courses: {
    total: number;
    active: number;
  };
  enrollments: {
    total: number;
    active: number;
  };
  content: {
    totalLectures: number;
    totalLiveClasses: number;
    totalDPPs: number;
    totalStudyMaterials: number;
  };
}

/**
 * Faculty Dashboard API types
 */
export interface FacultyDashboardResponse {
  faculty: {
    id: string;
    name: string;
    email: string;
  };
  assignedContent: {
    lectures: number;
    liveClasses: number;
    dpps: number;
    studyMaterials: number;
  };
  lectures: Lecture[];
  liveClasses: LiveClass[];
  dpps: DPP[];
  studyMaterials: StudyMaterial[];
}

/**
 * Admin API functions
 */
export const adminApi = {
  /**
   * Get admin dashboard statistics
   */
  getDashboard: (accessToken: string) =>
    api.get<AdminDashboardResponse>("/api/dashboard/admin", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Course Management
   */
  // Get all courses (admin view - includes inactive)
  getAllCourses: (accessToken: string) =>
    api.get<Course[]>("/api/courses", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Get a specific course by ID (admin view)
  getCourseById: (accessToken: string, courseId: string) =>
    api.get<Course>(`/api/courses/${courseId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Create a new course (admin only)
  createCourse: (accessToken: string, data: { name: string; description?: string; isActive?: boolean }) =>
    api.post<Course>("/api/courses", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Update a course (admin only)
  updateCourse: (accessToken: string, courseId: string, data: { description?: string; isActive?: boolean }) =>
    api.put<Course>(`/api/courses/${courseId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Enrollment/Student Management
   */
  // Enroll a student in a course (admin only)
  enrollStudent: (accessToken: string, data: { studentId: string; courseId: string }) =>
    api.post<Enrollment>("/api/enrollments", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Get a specific student's enrollments (admin only)
  getStudentEnrollments: (accessToken: string, studentId: string) =>
    api.get<Enrollment[]>(`/api/enrollments/student/${studentId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Get all users (admin) - could be used for student selection
  getAllStudents: (accessToken: string) =>
    api.get<User[]>("/api/auth/users?role=STUDENT", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Lecture Management
   */
  // Get all lectures with filters (admin)
  getAllLectures: (accessToken: string, params?: { courseId?: string; facultyId?: string; isPublished?: boolean; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.set('courseId', params.courseId);
    if (params?.facultyId) searchParams.set('facultyId', params.facultyId);
    if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return api.get<PaginatedResponse<Lecture>>(`/api/lectures${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  // Get a specific lecture by ID (admin)
  getLectureById: (accessToken: string, lectureId: string) =>
    api.get<Lecture>(`/api/lectures/${lectureId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Create a new lecture (admin)
  createLecture: (accessToken: string, data: {
    title: string;
    description?: string;
    courseId: string;
    facultyId?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    duration?: number;
    order?: number;
  }) =>
    api.post<Lecture>("/api/lectures", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Update a lecture (admin)
  updateLecture: (accessToken: string, lectureId: string, data: {
    title?: string;
    description?: string;
    courseId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    order?: number;
    facultyId?: string;
  }) =>
    api.put<Lecture>(`/api/lectures/${lectureId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Delete a lecture (admin)
  deleteLecture: (accessToken: string, lectureId: string) =>
    api.delete<{ message: string }>(`/api/lectures/${lectureId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Publish/unpublish a lecture (admin)
  toggleLecturePublish: (accessToken: string, lectureId: string, isPublished: boolean) =>
    api.patch<Lecture>(`/api/lectures/${lectureId}/publish`, { isPublished }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Live Class Management
   */
  // Get all live classes with filters (admin)
  getAllLiveClasses: (accessToken: string, params?: { courseId?: string; facultyId?: string; isPublished?: boolean; isActive?: boolean; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.set('courseId', params.courseId);
    if (params?.facultyId) searchParams.set('facultyId', params.facultyId);
    if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished));
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return api.get<PaginatedResponse<LiveClass>>(`/api/live-classes${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  // Get a specific live class by ID (admin)
  getLiveClassById: (accessToken: string, liveClassId: string) =>
    api.get<LiveClass>(`/api/live-classes/${liveClassId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Create a new live class (admin)
  createLiveClass: (accessToken: string, data: {
    title: string;
    description?: string;
    courseId: string;
    facultyId?: string;
    scheduledStart: string;
    scheduledEnd: string;
    meetingUrl: string;
    platform?: string;
  }) =>
    api.post<LiveClass>("/api/live-classes", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Update a live class (admin)
  updateLiveClass: (accessToken: string, liveClassId: string, data: {
    title?: string;
    description?: string;
    courseId?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    meetingUrl?: string;
    platform?: string;
    facultyId?: string;
  }) =>
    api.put<LiveClass>(`/api/live-classes/${liveClassId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Delete a live class (admin)
  deleteLiveClass: (accessToken: string, liveClassId: string) =>
    api.delete<{ message: string }>(`/api/live-classes/${liveClassId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Publish/unpublish a live class (admin)
  toggleLiveClassPublish: (accessToken: string, liveClassId: string, isPublished: boolean) =>
    api.patch<LiveClass>(`/api/live-classes/${liveClassId}/publish`, { isPublished }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Activate/deactivate a live class (admin)
  toggleLiveClassActivate: (accessToken: string, liveClassId: string, isActive: boolean) =>
    api.patch<LiveClass>(`/api/live-classes/${liveClassId}/activate`, { isActive }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * DPP Management
   */
  // Get all DPPs with filters (admin)
  getAllDPPs: (accessToken: string, params?: { courseId?: string; facultyId?: string; isPublished?: boolean; isActive?: boolean; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.set('courseId', params.courseId);
    if (params?.facultyId) searchParams.set('facultyId', params.facultyId);
    if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished));
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return api.get<PaginatedResponse<DPP>>(`/api/dpps${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  // Get a specific DPP by ID (admin)
  getDPPById: (accessToken: string, dppId: string) =>
    api.get<DPP>(`/api/dpps/${dppId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Create a new DPP (admin)
  createDPP: (accessToken: string, data: {
    title: string;
    description?: string;
    courseId: string;
    facultyId?: string;
    questions: Array<{ questionText: string; options?: string[]; correctAnswer: string; explanation?: string; marks?: number }>;
    scheduledDate: string;
  }) =>
    api.post<DPP>("/api/dpps", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Update a DPP (admin)
  updateDPP: (accessToken: string, dppId: string, data: {
    title?: string;
    description?: string;
    questions?: Array<{ questionText: string; options?: string[]; correctAnswer: string; explanation?: string; marks?: number }>;
    scheduledDate?: string;
    facultyId?: string;
  }) =>
    api.put<DPP>(`/api/dpps/${dppId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Delete a DPP (admin)
  deleteDPP: (accessToken: string, dppId: string) =>
    api.delete<{ message: string }>(`/api/dpps/${dppId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Publish/unpublish a DPP (admin)
  toggleDPPPublish: (accessToken: string, dppId: string, isPublished: boolean) =>
    api.patch<DPP>(`/api/dpps/${dppId}/publish`, { isPublished }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Activate/deactivate a DPP (admin)
  toggleDPPActivate: (accessToken: string, dppId: string, isActive: boolean) =>
    api.patch<DPP>(`/api/dpps/${dppId}/activate`, { isActive }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Study Material Management
   */
  // Get all study materials with filters (admin)
  getAllStudyMaterials: (accessToken: string, params?: { courseId?: string; facultyId?: string; materialType?: string; isPublished?: boolean; isActive?: boolean; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.set('courseId', params.courseId);
    if (params?.facultyId) searchParams.set('facultyId', params.facultyId);
    if (params?.materialType) searchParams.set('materialType', params.materialType);
    if (params?.isPublished !== undefined) searchParams.set('isPublished', String(params.isPublished));
    if (params?.isActive !== undefined) searchParams.set('isActive', String(params.isActive));
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    const query = searchParams.toString();
    return api.get<PaginatedResponse<StudyMaterial>>(`/api/study-materials${query ? `?${query}` : ''}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  },

  // Get a specific study material by ID (admin)
  getStudyMaterialById: (accessToken: string, studyMaterialId: string) =>
    api.get<StudyMaterial>(`/api/study-materials/${studyMaterialId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Create a new study material (admin)
  createStudyMaterial: (accessToken: string, data: {
    title: string;
    description?: string;
    courseId: string;
    facultyId?: string;
    materialType: string;
    resourceUrl: string;
    thumbnailUrl?: string;
    subject?: string;
  }) =>
    api.post<StudyMaterial>("/api/study-materials", data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Update a study material (admin)
  updateStudyMaterial: (accessToken: string, studyMaterialId: string, data: {
    title?: string;
    description?: string;
    materialType?: string;
    resourceUrl?: string;
    thumbnailUrl?: string;
    subject?: string;
    facultyId?: string;
  }) =>
    api.put<StudyMaterial>(`/api/study-materials/${studyMaterialId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Delete a study material (admin)
  deleteStudyMaterial: (accessToken: string, studyMaterialId: string) =>
    api.delete<{ message: string }>(`/api/study-materials/${studyMaterialId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Publish/unpublish a study material (admin)
  toggleStudyMaterialPublish: (accessToken: string, studyMaterialId: string, isPublished: boolean) =>
    api.patch<StudyMaterial>(`/api/study-materials/${studyMaterialId}/publish`, { isPublished }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Activate/deactivate a study material (admin)
  toggleStudyMaterialActivate: (accessToken: string, studyMaterialId: string, isActive: boolean) =>
    api.patch<StudyMaterial>(`/api/study-materials/${studyMaterialId}/activate`, { isActive }, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};

/**
 * Paginated response wrapper for list endpoints
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Faculty API functions
 */
export const facultyApi = {
  /**
   * Get faculty dashboard data
   */
  getDashboard: (accessToken: string) =>
    api.get<FacultyDashboardResponse>("/api/dashboard/faculty", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Lecture Management (Faculty)
   */
  // Get all lectures assigned to faculty (paginated)
  getMyLectures: (accessToken: string) =>
    api.get<PaginatedResponse<Lecture>>("/api/lectures/faculty/my-lectures", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Get a specific lecture by ID (faculty view)
  getLectureById: (accessToken: string, lectureId: string) =>
    api.get<Lecture>(`/api/lectures/faculty/lectures/${lectureId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Update a lecture (faculty)
  updateLecture: (accessToken: string, lectureId: string, data: {
    title?: string;
    description?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    duration?: number;
    order?: number;
  }) =>
    api.put<Lecture>(`/api/lectures/faculty/lectures/${lectureId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Live Class Management (Faculty)
   */
  // Get all live classes assigned to faculty (paginated)
  getMyLiveClasses: (accessToken: string) =>
    api.get<PaginatedResponse<LiveClass>>("/api/live-classes/faculty/my-live-classes", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Get a specific live class by ID (faculty view)
  getLiveClassById: (accessToken: string, liveClassId: string) =>
    api.get<LiveClass>(`/api/live-classes/faculty/live-classes/${liveClassId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Update a live class (faculty)
  updateLiveClass: (accessToken: string, liveClassId: string, data: {
    title?: string;
    description?: string;
    scheduledStart?: string;
    scheduledEnd?: string;
    meetingUrl?: string;
    platform?: string;
  }) =>
    api.put<LiveClass>(`/api/live-classes/faculty/live-classes/${liveClassId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * DPP Management (Faculty)
   */
  // Get all DPPs assigned to faculty (paginated)
  getMyDPPs: (accessToken: string) =>
    api.get<PaginatedResponse<DPP>>("/api/dpps/faculty/my-dpps", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Get a specific DPP by ID (faculty view)
  getDPPById: (accessToken: string, dppId: string) =>
    api.get<DPP>(`/api/dpps/faculty/dpps/${dppId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Update a DPP (faculty)
  updateDPP: (accessToken: string, dppId: string, data: {
    title?: string;
    description?: string;
    questions?: Array<{ questionText: string; options?: string[]; correctAnswer: string; explanation?: string; marks?: number }>;
    scheduledDate?: string;
  }) =>
    api.put<DPP>(`/api/dpps/faculty/dpps/${dppId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Study Material Management (Faculty)
   */
  // Get all study materials assigned to faculty (paginated)
  getMyStudyMaterials: (accessToken: string) =>
    api.get<PaginatedResponse<StudyMaterial>>("/api/study-materials/faculty/my-study-materials", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Get a specific study material by ID (faculty view)
  getStudyMaterialById: (accessToken: string, studyMaterialId: string) =>
    api.get<StudyMaterial>(`/api/study-materials/faculty/study-materials/${studyMaterialId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  // Update a study material (faculty)
  updateStudyMaterial: (accessToken: string, studyMaterialId: string, data: {
    title?: string;
    description?: string;
    materialType?: StudyMaterialType;
    resourceUrl?: string;
    thumbnailUrl?: string;
    subject?: string;
  }) =>
    api.put<StudyMaterial>(`/api/study-materials/faculty/study-materials/${studyMaterialId}`, data, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};

/**
 * Admin-specific types
 */
export interface Course {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  thumbnail?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface Enrollment {
  _id: string;
  student: string | { _id: string; name?: string; email: string; role: string };
  course: string | { _id: string; name: string; slug: string; isActive: boolean };
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'COMPLETED';
  enrolledAt: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

export interface User {
  _id: string;
  name?: string;
  email: string;
  role: 'ADMIN' | 'FACULTY' | 'STUDENT';
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const authApi = {
  /**
   * Register a new student
   * Backend currently only accepts email and password.
   * Other fields (fullName, mobileNumber, parentMobileNumber, courseInterested)
   * are validated on frontend but not sent to backend.
   * confirmPassword and agreeToTerms are frontend-only validation.
   */
  register: (data: {
    fullName: string;
    email: string;
    mobileNumber: string;
    parentMobileNumber: string;
    courseInterested: string;
    password: string;
    confirmPassword: string;
    agreeToTerms: boolean;
  }) => api.post<{ user: any; accessToken: string; refreshToken: string }>("/api/auth/register", {
    email: data.email,
    password: data.password,
  }),

  /**
   * Login with email and password
   */
  login: (data: { email: string; password: string }) =>
    api.post<{ user: any; accessToken: string; refreshToken: string }>("/api/auth/login", data),

  /**
   * Refresh access token using refresh token
   */
  refresh: (refreshToken: string) =>
    api.post<{ accessToken: string; refreshToken: string }>("/api/auth/refresh", { refreshToken }),

  /**
   * Get current authenticated user
   */
  me: (accessToken: string) =>
    api.get<{ user: any }>("/api/auth/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  /**
   * Logout (revoke refresh token)
   */
  logout: (accessToken: string) =>
    api.post<{ message: string }>("/api/auth/logout", {}, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),
};