"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { studentApi, StudentDashboardResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Loader2, BookOpen, Calendar, FileText, Video, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, href, color, bgColor }: StatCardProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors ${bgColor}`}
    >
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <ChevronRight className="text-gray-400 group-hover:text-gray-600 transition-colors" size={20} />
    </Link>
  );
}

function CourseCard({ course }: { course: StudentDashboardResponse["courses"][0] }) {
  return (
    <div className="p-4 rounded-lg bg-white border border-gray-100 hover:border-gray-200 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{course.name}</h3>
          <p className="text-sm text-gray-500 mt-1">Active enrollment</p>
        </div>
        <Link
          href={`/courses/${course.slug}`}
          className="text-primary hover:text-primary-dark font-medium text-sm"
        >
          View Course
        </Link>
      </div>
    </div>
  );
}

export default function StudentDashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState<StudentDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          router.push("/login");
          return;
        }

        const result = await studentApi.getDashboard(accessToken);
        if (result.error) {
          setError(result.error);
          if (result.error.includes("401") || result.error.includes("403")) {
            router.push("/login");
          }
        } else if (result.data) {
          setDashboardData(result.data);
        }
      } catch (err) {
        setError("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center p-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
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

  if (!dashboardData) {
    return (
      <ProtectedRoute allowedRoles={["STUDENT"]}>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center p-8">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No data available</h2>
            <p className="text-gray-500">Unable to fetch dashboard data.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const { activeEnrollments, courses, contentCounts } = dashboardData;

  return (
    <ProtectedRoute allowedRoles={["STUDENT"]}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {user?.email || "Student"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <section aria-labelledby="stats-heading" className="mb-8">
            <h2 id="stats-heading" className="sr-only">Statistics</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Enrolled Courses"
                value={activeEnrollments}
                icon={<BookOpen className="h-6 w-6 text-primary" />}
                href="/courses"
                color="bg-primary/10"
                bgColor=""
              />
              <StatCard
                title="Lectures"
                value={contentCounts.lectures}
                icon={<Video className="h-6 w-6 text-blue-600" />}
                href="/lectures"
                color="bg-blue-100"
                bgColor=""
              />
              <StatCard
                title="Live Classes"
                value={contentCounts.liveClasses}
                icon={<Calendar className="h-6 w-6 text-green-600" />}
                href="/live-classes"
                color="bg-green-100"
                bgColor=""
              />
              <StatCard
                title="DPPs"
                value={contentCounts.dpps}
                icon={<FileText className="h-6 w-6 text-purple-600" />}
                href="/dpps"
                color="bg-purple-100"
                bgColor=""
              />
            </div>
          </section>

          {/* My Courses */}
          <section aria-labelledby="courses-heading" className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 id="courses-heading" className="text-lg font-semibold text-gray-900">My Courses</h2>
              <Link
                href="/courses"
                className="text-sm text-primary hover:text-primary-dark font-medium"
              >
                View all
              </Link>
            </div>
            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
                {courses.length > 4 && (
                  <Link
                    href="/courses"
                    className="block text-center text-sm text-primary hover:text-primary-dark font-medium py-3"
                  >
                    + {courses.length - 4} more courses
                  </Link>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No enrolled courses</h3>
                <p className="text-gray-500 mb-4">You are not currently enrolled in any active courses.</p>
                <Link
                  href="/courses"
                  className="inline-flex items-center px-4 py-2 bg-primary !text-primary-foreground rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </section>

          {/* Quick Links */}
          <section aria-labelledby="quick-links-heading">
            <h2 id="quick-links-heading" className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/lectures"
                className="p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className="p-3 rounded-lg bg-blue-100 mb-4 inline-block">
                  <Video className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Lectures</h3>
                <p className="text-sm text-gray-500">{contentCounts.lectures} available</p>
              </Link>
              <Link
                href="/live-classes"
                className="p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className="p-3 rounded-lg bg-green-100 mb-4 inline-block">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Live Classes</h3>
                <p className="text-sm text-gray-500">{contentCounts.liveClasses} scheduled</p>
              </Link>
              <Link
                href="/dpps"
                className="p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className="p-3 rounded-lg bg-purple-100 mb-4 inline-block">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">DPPs</h3>
                <p className="text-sm text-gray-500">{contentCounts.dpps} available</p>
              </Link>
              <Link
                href="/study-materials"
                className="p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors group"
              >
                <div className="p-3 rounded-lg bg-orange-100 mb-4 inline-block">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Study Materials</h3>
                <p className="text-sm text-gray-500">{contentCounts.studyMaterials} resources</p>
              </Link>
            </div>
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}