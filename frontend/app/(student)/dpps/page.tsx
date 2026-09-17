"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { studentApi, StudentCourse, DPP } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2, AlertCircle, FileText, Clock, Award, Calendar } from "lucide-react";
import Link from "next/link";

interface CourseWithDPPs extends StudentCourse {
  dpps: DPP[];
}

export default function StudentDPPsPage() {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<CourseWithDPPs[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) return;

        const coursesResult = await studentApi.getMyCourses(accessToken);
        if (coursesResult.error) {
          setError(coursesResult.error);
          return;
        }

        const enrolledCourses = coursesResult.data || [];
        if (enrolledCourses.length === 0) {
          setCourses([]);
          return;
        }

        const coursesWithDPPs = await Promise.all(
          enrolledCourses.map(async (course) => {
            const dppsResult = await studentApi.getCourseDPPs(accessToken, course._id);
            return {
              ...course,
              dpps: dppsResult.data || []
            };
          })
        );

        setCourses(coursesWithDPPs);
        const firstWithDPPs = coursesWithDPPs.find(c => c.dpps.length > 0);
        if (firstWithDPPs) {
          setSelectedCourseId(firstWithDPPs._id);
        } else if (coursesWithDPPs.length > 0) {
          setSelectedCourseId(coursesWithDPPs[0]._id);
        }
      } catch {
        setError("Failed to load DPPs");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const selectedCourse = courses.find(c => c._id === selectedCourseId);
  const totalDPPs = courses.reduce((sum, c) => sum + c.dpps.length, 0);
  const now = new Date();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const getStatus = (dpp: DPP) => {
    const scheduled = new Date(dpp.scheduledDate);
    if (now < scheduled) return { label: "Upcoming", className: "bg-blue-100 text-blue-700" };
    if (dpp.isActive) return { label: "Active", className: "bg-green-100 text-green-700" };
    return { label: "Completed", className: "bg-gray-100 text-gray-700" };
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center p-8 max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load DPPs</h2>
            <p className="text-gray-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (courses.length === 0) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h1 className="text-2xl font-bold text-gray-900">DPPs</h1>
              <p className="text-gray-500 mt-1">Daily Practice Problems for your enrolled courses</p>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No enrolled courses</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You need to be enrolled in a course to access DPPs.
              </p>
              <Link
                href="/courses"
                className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-base font-medium"
              >
                View My Courses
              </Link>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">DPPs</h1>
                <p className="text-gray-500 mt-1">
                  {totalDPPs} DPP{totalDPPs !== 1 ? "s" : ""} across {courses.length} course{courses.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Course Selector */}
          <div className="mb-8">
            <label htmlFor="course-select" className="sr-only">Select course</label>
            <select
              id="course-select"
              value={selectedCourseId || ""}
              onChange={(e) => setSelectedCourseId(e.target.value || null)}
              className="w-full sm:w-64 px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.dpps.length} DPPs)
                </option>
              ))}
            </select>
          </div>

          {/* DPPs List */}
          {selectedCourse ? (
            selectedCourse.dpps.length > 0 ? (
              <div className="space-y-4">
                {selectedCourse.dpps.map((dpp) => {
                  const status = getStatus(dpp);
                  return (
                    <div
                      key={dpp._id}
                      className="p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{dpp.title}</h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${status.className}`}>
                              {status.label}
                            </span>
                          </div>
                          {dpp.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{dpp.description}</p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {formatDate(dpp.scheduledDate)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {dpp.duration} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Award className="h-4 w-4" />
                              {dpp.totalMarks} marks
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {dpp.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>
                        </div>
                        {/* No student DPP detail page exists; show DPP info inline */}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No DPPs available</h3>
                <p className="text-gray-500">This course doesn't have any published DPPs at the moment.</p>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Select a course</h3>
              <p className="text-gray-500">Choose a course from the dropdown to view its DPPs.</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}

