"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { adminApi, Enrollment, User, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, Search, Filter, Plus, Eye, MoreHorizontal, AlertCircle, Users, UserCheck, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginatedEnrollments {
  data: Enrollment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ENROLLMENT_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  INACTIVE: "bg-gray-100 text-gray-700",
  SUSPENDED: "bg-yellow-100 text-yellow-700",
  COMPLETED: "bg-blue-100 text-blue-700",
};

export default function StudentsPage() {
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "COMPLETED">("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollData, setEnrollData] = useState({ studentId: "", courseId: "" });
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>([]);
  const [loadingStudentEnrollments, setLoadingStudentEnrollments] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchEnrollments();
      fetchStudents();
      fetchCourses();
    }
  }, [authLoading, user, pagination.page, search, statusFilter]);

  const fetchEnrollments = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: String(pagination.page),
        limit: String(pagination.limit),
      });
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);

      // Note: There's no getAllEnrollments endpoint, so we'll need to get enrollments differently
      // For now, we'll fetch students and their enrollments
      // This is a workaround since the backend doesn't have a list all enrollments endpoint
      const studentsResult = await adminApi.getAllStudents(accessToken);
      if (studentsResult.data) {
        setStudents(studentsResult.data);
        // Fetch enrollments for each student (only first page for now)
        const allEnrollments: Enrollment[] = [];
        for (const student of studentsResult.data.slice(0, 20)) {
          const enrollmentsResult = await adminApi.getStudentEnrollments(accessToken, student._id);
          if (enrollmentsResult.data) {
            allEnrollments.push(...enrollmentsResult.data);
          }
        }

        // Filter by search and status
        let filtered = allEnrollments;
        if (search) {
          filtered = filtered.filter(e =>
            (e.student as any)?.email?.toLowerCase().includes(search.toLowerCase()) ||
            (e.course as any)?.name?.toLowerCase().includes(search.toLowerCase()) ||
            (e.student as any)?.name?.toLowerCase().includes(search.toLowerCase())
          );
        }
        if (statusFilter !== "all") {
          filtered = filtered.filter(e => e.status === statusFilter);
        }

        setEnrollments(filtered);
        setPagination(prev => ({ ...prev, total: filtered.length, totalPages: Math.ceil(filtered.length / prev.limit) }));
      } else if (studentsResult.error) {
        setError(studentsResult.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch enrollments");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setLoadingStudents(true);
    try {
      const result = await adminApi.getAllStudents(accessToken);
      if (result.data) {
        setStudents(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchCourses = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setLoadingCourses(true);
    try {
      const result = await adminApi.getAllCourses(accessToken);
      if (result.data) {
        setCourses(result.data.filter(c => c.isActive));
      }
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollData.studentId || !enrollData.courseId) {
      setEnrollError("Please select both a student and a course");
      return;
    }

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setEnrollLoading(true);
    setEnrollError(null);

    try {
      const result = await adminApi.enrollStudent(accessToken, {
        studentId: enrollData.studentId,
        courseId: enrollData.courseId,
      });

      if (result.error) {
        setEnrollError(result.error);
      } else {
        setShowEnrollModal(false);
        setEnrollData({ studentId: "", courseId: "" });
        fetchEnrollments();
      }
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Failed to enroll student");
    } finally {
      setEnrollLoading(false);
    }
  };

  const handleViewStudent = async (studentId: string) => {
    setViewStudentId(studentId);
    setLoadingStudentEnrollments(true);

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      const result = await adminApi.getStudentEnrollments(accessToken, studentId);
      if (result.data) {
        setStudentEnrollments(result.data);
      }
    } catch (err) {
      console.error("Failed to fetch student enrollments:", err);
    } finally {
      setLoadingStudentEnrollments(false);
    }
  };

  const getStudentName = (student: string | { _id: string; email: string; name?: string }) => {
    if (typeof student === "object" && student !== null) {
      return student.name || student.email;
    }
    return student;
  };

  const getStudentEmail = (student: string | { _id: string; email: string; name?: string }) => {
    if (typeof student === "object" && student !== null) {
      return student.email;
    }
    return "";
  };

  const getCourseName = (course: string | { _id: string; name: string; slug: string }) => {
    if (typeof course === "object" && course !== null) {
      return course.name;
    }
    return course;
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Students & Enrollments</h1>
            <p className="text-gray-600 mt-1">Manage student enrollments and view course enrollments</p>
          </div>
          <Button onClick={() => setShowEnrollModal(true)} className="inline-flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Enroll Student
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, email, or course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "COMPLETED")}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchEnrollments} className="text-sm underline hover:text-red-800">Retry</button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled At</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {enrollments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      {search || statusFilter !== "all" ? "No enrollments match your filters" : "No enrollments yet. Enroll a student to get started!"}
                    </td>
                  </tr>
                ) : (
                  enrollments.map((enrollment) => (
                    <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getStudentName(enrollment.student)}</p>
                            <p className="text-sm text-gray-500">{getStudentEmail(enrollment.student)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getCourseName(enrollment.course)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${ENROLLMENT_STATUS_COLORS[enrollment.status] || "bg-gray-100 text-gray-700"}`}>
                          {enrollment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleViewStudent(typeof enrollment.student === "object" ? enrollment.student._id : enrollment.student)}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Student's Courses"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} enrollments
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Enroll Student Modal */}
        {showEnrollModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Enroll Student</h3>
                <button
                  onClick={() => { setShowEnrollModal(false); setEnrollError(null); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <form onSubmit={handleEnrollStudent} className="space-y-4">
                {enrollError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {enrollError}
                  </div>
                )}

                <div>
                  <label htmlFor="studentId" className="text-sm font-medium text-gray-700 block mb-1.5">
                    Student <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="studentId"
                    value={enrollData.studentId}
                    onChange={(e) => setEnrollData(prev => ({ ...prev, studentId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Select a student</option>
                    {students.map((student) => (
                      <option key={student._id} value={student._id}>
                        {student.name || student.email} ({student.email})
                      </option>
                    ))}
                  </select>
                  {loadingStudents && <p className="text-xs text-gray-500 mt-1">Loading students...</p>}
                </div>

                <div>
                  <label htmlFor="courseId" className="text-sm font-medium text-gray-700 block mb-1.5">
                    Course <span className="text-destructive">*</span>
                  </label>
                  <select
                    id="courseId"
                    value={enrollData.courseId}
                    onChange={(e) => setEnrollData(prev => ({ ...prev, courseId: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.name} ({course.slug})
                      </option>
                    ))}
                  </select>
                  {loadingCourses && <p className="text-xs text-gray-500 mt-1">Loading courses...</p>}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setShowEnrollModal(false); setEnrollError(null); }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" isLoading={enrollLoading} loadingLabel="Enrolling...">
                    Enroll Student
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Student Enrollments Modal */}
        {viewStudentId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Student's Courses</h3>
                  <p className="text-gray-600 text-sm">View all active enrollments for this student</p>
                </div>
                <button
                  onClick={() => setViewStudentId(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {loadingStudentEnrollments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 text-primary animate-spin" />
                </div>
              ) : studentEnrollments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No active enrollments found for this student</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studentEnrollments.map((enrollment) => (
                    <div key={enrollment._id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <GraduationCap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{getCourseName(enrollment.course)}</p>
                            <p className="text-sm text-gray-500">Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${ENROLLMENT_STATUS_COLORS[enrollment.status] || "bg-gray-100 text-gray-700"}`}>
                          {enrollment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}