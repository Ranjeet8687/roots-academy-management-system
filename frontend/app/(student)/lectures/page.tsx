"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { studentApi, StudentCourse, Lecture } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2, AlertCircle, Video, ChevronRight, PlayCircle } from "lucide-react";
import Link from "next/link";

interface CourseWithLectures extends StudentCourse {
  lectures: Lecture[];
}

export default function StudentLecturesPage() {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<CourseWithLectures[]>([]);
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

        // First get enrolled courses
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

        // Fetch lectures for each course
        const coursesWithLectures = await Promise.all(
          enrolledCourses.map(async (course) => {
            const lecturesResult = await studentApi.getCourseLectures(accessToken, course._id);
            return {
              ...course,
              lectures: lecturesResult.data || []
            };
          })
        );

        setCourses(coursesWithLectures);
        // Auto-select first course with lectures
        const firstWithLectures = coursesWithLectures.find(c => c.lectures.length > 0);
        if (firstWithLectures) {
          setSelectedCourseId(firstWithLectures._id);
        } else if (coursesWithLectures.length > 0) {
          setSelectedCourseId(coursesWithLectures[0]._id);
        }
      } catch {
        setError("Failed to load lectures");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const selectedCourse = courses.find(c => c._id === selectedCourseId);
  const totalLectures = courses.reduce((sum, c) => sum + c.lectures.length, 0);

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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load lectures</h2>
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
              <h1 className="text-2xl font-bold text-gray-900">Lectures</h1>
              <p className="text-gray-500 mt-1">Video lectures for your enrolled courses</p>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center py-16">
              <Video className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No enrolled courses</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You need to be enrolled in a course to access lectures.
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
                <h1 className="text-2xl font-bold text-gray-900">Lectures</h1>
                <p className="text-gray-500 mt-1">
                  {totalLectures} lecture{totalLectures !== 1 ? "s" : ""} across {courses.length} course{courses.length !== 1 ? "s" : ""}
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
                  {course.name} ({course.lectures.length} lectures)
                </option>
              ))}
            </select>
          </div>

          {/* Lectures List */}
          {selectedCourse ? (
            selectedCourse.lectures.length > 0 ? (
              <div className="space-y-4">
                {selectedCourse.lectures.map((lecture, index) => (
                  <div
                    key={lecture._id}
                    className="p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <PlayCircle className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{lecture.title}</h3>
                          <span className="text-sm text-gray-500">
                            Lecture {lecture.order}
                          </span>
                        </div>
                        {lecture.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{lecture.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {lecture.duration && (
                            <span className="flex items-center gap-1">
                              <Video className="h-4 w-4" />
                              {Math.floor(lecture.duration / 60)}:{String(lecture.duration % 60).padStart(2, "0")}
                            </span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {lecture.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                      {lecture.videoUrl && (
                        <a
                          href={lecture.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark hover:bg-primary/10 rounded-lg transition-colors"
                        >
                          Watch
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No lectures available</h3>
                <p className="text-gray-500">This course doesn't have any published lectures yet.</p>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <Video className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Select a course</h3>
              <p className="text-gray-500">Choose a course from the dropdown to view its lectures.</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}