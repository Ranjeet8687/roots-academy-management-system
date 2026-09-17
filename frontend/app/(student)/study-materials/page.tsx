"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { studentApi, StudentCourse, StudyMaterial } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2, AlertCircle, FileText, ChevronRight, ExternalLink, Download, File, Image, Video as VideoIcon, Eye } from "lucide-react";
import Link from "next/link";
import { buildApiUrl } from "@/lib/api";

interface CourseWithStudyMaterials extends StudentCourse {
  studyMaterials: StudyMaterial[];
}

const getFileIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "pdf":
      return <File className="h-6 w-6 text-red-600" />;
    case "image":
    case "jpg":
    case "jpeg":
    case "png":
      return <Image className="h-6 w-6 text-green-600" />;
    case "video":
    case "mp4":
      return <VideoIcon className="h-6 w-6 text-blue-600" />;
    default:
      return <FileText className="h-6 w-6 text-gray-600" />;
  }
};

const getFileTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    pdf: "PDF",
    image: "Image",
    jpg: "JPG",
    jpeg: "JPEG",
    png: "PNG",
    video: "Video",
    mp4: "MP4",
  };
  return labels[type.toLowerCase()] || type.toUpperCase();
};

export default function StudentStudyMaterialsPage() {
  const { isAuthenticated } = useAuth();
  const [courses, setCourses] = useState<CourseWithStudyMaterials[]>([]);
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

        const coursesWithMaterials = await Promise.all(
          enrolledCourses.map(async (course) => {
            const materialsResult = await studentApi.getCourseStudyMaterials(accessToken, course._id);
            return {
              ...course,
              studyMaterials: materialsResult.data || []
            };
          })
        );

        setCourses(coursesWithMaterials);
        const firstWithMaterials = coursesWithMaterials.find(c => c.studyMaterials.length > 0);
        if (firstWithMaterials) {
          setSelectedCourseId(firstWithMaterials._id);
        } else if (coursesWithMaterials.length > 0) {
          setSelectedCourseId(coursesWithMaterials[0]._id);
        }
      } catch {
        setError("Failed to load study materials");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const selectedCourse = courses.find(c => c._id === selectedCourseId);
  const totalMaterials = courses.reduce((sum, c) => sum + c.studyMaterials.length, 0);

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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load study materials</h2>
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
              <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
              <p className="text-gray-500 mt-1">Learning resources for your enrolled courses</p>
            </div>
          </header>
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">No enrolled courses</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                You need to be enrolled in a course to access study materials.
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
                <h1 className="text-2xl font-bold text-gray-900">Study Materials</h1>
                <p className="text-gray-500 mt-1">
                  {totalMaterials} resource{totalMaterials !== 1 ? "s" : ""} across {courses.length} course{courses.length !== 1 ? "s" : ""}
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
                  {course.name} ({course.studyMaterials.length} resources)
                </option>
              ))}
            </select>
          </div>

          {/* Study Materials List */}
          {selectedCourse ? (
            selectedCourse.studyMaterials.length > 0 ? (
              <div className="space-y-4">
                {selectedCourse.studyMaterials.map((material) => (
                  <div
                    key={material._id}
                    className="p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        {getFileIcon(material.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{material.title}</h3>
                          <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                            {getFileTypeLabel(material.type)}
                          </span>
                        </div>
                        {material.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{material.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          {material.course && typeof material.course === "object" && (
                            <span>Course: {material.course.name}</span>
                          )}
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {material.isPublished ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                      {material.resourceUrl && (
                        <a
                          href={material.resourceUrl.startsWith("http") ? material.resourceUrl : buildApiUrl(material.resourceUrl)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          View Material
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No study materials available</h3>
                <p className="text-gray-500">This course doesn't have any published study materials at the moment.</p>
              </div>
            )
          ) : (
            <div className="text-center py-16">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">Select a course</h3>
              <p className="text-gray-500">Choose a course from the dropdown to view its study materials.</p>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}