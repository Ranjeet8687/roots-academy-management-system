"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { adminApi } from "@/lib/api";
import {
  Users,
  BookOpen,
  UserCheck,
  Video,
  Calendar,
  FileText,
  FolderOpen,
  Loader2,
  AlertCircle,
  TrendingUp,
} from "lucide-react";

interface AdminDashboardData {
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

const statCards = [
  {
    id: "students",
    label: "Total Students",
    icon: Users,
    color: "text-blue-600 bg-blue-50",
    path: "/admin/students",
  },
  {
    id: "faculty",
    label: "Total Faculty",
    icon: GraduationCap,
    color: "text-purple-600 bg-purple-50",
    path: "/admin/faculty",
  },
  {
    id: "coursesTotal",
    label: "Total Courses",
    icon: BookOpen,
    color: "text-indigo-600 bg-indigo-50",
    path: "/admin/courses",
  },
  {
    id: "coursesActive",
    label: "Active Courses",
    icon: BookOpen,
    color: "text-green-600 bg-green-50",
    path: "/admin/courses",
  },
  {
    id: "enrollmentsTotal",
    label: "Total Enrollments",
    icon: UserCheck,
    color: "text-orange-600 bg-orange-50",
    path: "/admin/students",
  },
  {
    id: "enrollmentsActive",
    label: "Active Enrollments",
    icon: UserCheck,
    color: "text-teal-600 bg-teal-50",
    path: "/admin/students",
  },
  {
    id: "lectures",
    label: "Total Lectures",
    icon: Video,
    color: "text-pink-600 bg-pink-50",
    path: "/admin/lectures",
  },
  {
    id: "liveClasses",
    label: "Total Live Classes",
    icon: Calendar,
    color: "text-red-600 bg-red-50",
    path: "/admin/live-classes",
  },
  {
    id: "dpps",
    label: "Total DPPs",
    icon: FileText,
    color: "text-yellow-600 bg-yellow-50",
    path: "/admin/dpps",
  },
  {
    id: "studyMaterials",
    label: "Total Study Materials",
    icon: FolderOpen,
    color: "text-cyan-600 bg-cyan-50",
    path: "/admin/study-materials",
  },
];

import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard();
    }
  }, [authLoading, user]);

  const fetchDashboard = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getDashboard(accessToken);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
        <p className="text-gray-600 mb-4 max-w-md">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No data available</h2>
        <p className="text-gray-600 mb-4">Unable to load dashboard statistics.</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = [
    { key: "students", label: "Total Students", value: data.users.totalStudents, icon: Users, color: "text-blue-600 bg-blue-50", path: "/admin/students" },
    { key: "faculty", label: "Total Faculty", value: data.users.totalFaculty, icon: GraduationCap, color: "text-purple-600 bg-purple-50", path: "/admin/faculty" },
    { key: "coursesTotal", label: "Total Courses", value: data.courses.total, icon: BookOpen, color: "text-indigo-600 bg-indigo-50", path: "/admin/courses" },
    { key: "coursesActive", label: "Active Courses", value: data.courses.active, icon: BookOpen, color: "text-green-600 bg-green-50", path: "/admin/courses" },
    { key: "enrollmentsTotal", label: "Total Enrollments", value: data.enrollments.total, icon: UserCheck, color: "text-orange-600 bg-orange-50", path: "/admin/students" },
    { key: "enrollmentsActive", label: "Active Enrollments", value: data.enrollments.active, icon: UserCheck, color: "text-teal-600 bg-teal-50", path: "/admin/students" },
    { key: "lectures", label: "Total Lectures", value: data.content.totalLectures, icon: Video, color: "text-pink-600 bg-pink-50", path: "/admin/lectures" },
    { key: "liveClasses", label: "Total Live Classes", value: data.content.totalLiveClasses, icon: Calendar, color: "text-red-600 bg-red-50", path: "/admin/live-classes" },
    { key: "dpps", label: "Total DPPs", value: data.content.totalDPPs, icon: FileText, color: "text-yellow-600 bg-yellow-50", path: "/admin/dpps" },
    { key: "studyMaterials", label: "Total Study Materials", value: data.content.totalStudyMaterials, icon: FolderOpen, color: "text-cyan-600 bg-cyan-50", path: "/admin/study-materials" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of platform statistics and content</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 rounded-full">
            Admin: {user?.email}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
        {stats.map((stat) => (
          <Link
            key={stat.key}
            href={stat.path}
            className="group block p-5 sm:p-6 bg-white rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-500 truncate">{stat.label}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                    {stat.value.toLocaleString()}
                  </span>
                  <TrendingUp className="h-5 w-5 text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <div className={`p-3 rounded-xl ${stat.color} flex-shrink-0`}>
                <stat.icon className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/courses/new"
          className="p-5 bg-white rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Create Course</h3>
              <p className="text-sm text-gray-500">Add a new course</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/lectures/new"
          className="p-5 bg-white rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink/10 rounded-lg text-pink-600 group-hover:bg-pink/20 transition-colors">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Lecture</h3>
              <p className="text-sm text-gray-500">Upload new lecture</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/live-classes/new"
          className="p-5 bg-white rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red/10 rounded-lg text-red-600 group-hover:bg-red/20 transition-colors">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Schedule Live Class</h3>
              <p className="text-sm text-gray-500">Create live session</p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/students"
          className="p-5 bg-white rounded-xl border border-gray-200 hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue/10 rounded-lg text-blue-600 group-hover:bg-blue/20 transition-colors">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Students</h3>
              <p className="text-sm text-gray-500">View & enroll students</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}