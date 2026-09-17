"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { facultyApi, FacultyDashboardResponse, Lecture, LiveClass, DPP, StudyMaterial } from "@/lib/api";
import {
  Video,
  Calendar,
  FileText,
  FolderOpen,
  Loader2,
  AlertCircle,
  Link2,
  Clock,
  Award,
} from "lucide-react";
import Link from "next/link";

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  href: string;
  color: string;
}

function StatCard({ title, value, icon, href, color }: StatCardProps) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 p-6 rounded-xl bg-white border border-gray-100 hover:border-gray-200 transition-colors"
    >
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <Link2 className="text-gray-400 group-hover:text-gray-600 transition-colors" size={20} />
    </Link>
  );
}

function ContentItemCard({
  item,
  type,
}: {
  item: Lecture | LiveClass | DPP | StudyMaterial;
  type: "lecture" | "liveClass" | "dpp" | "studyMaterial";
}) {
  const courseName = typeof item.course === "object" && item.course !== null ? item.course.name : "Unknown Course";
  const courseSlug = typeof item.course === "object" && item.course !== null ? item.course.slug : "";

  const getHref = () => {
    switch (type) {
      case "lecture":
        return `/faculty/lectures/${item._id}`;
      case "liveClass":
        return `/faculty/live-classes/${item._id}`;
      case "dpp":
        return `/faculty/dpps/${item._id}`;
      case "studyMaterial":
        return `/faculty/study-materials/${item._id}`;
    }
  };

  const getStatusBadge = () => {
    if ("isPublished" in item && "isActive" in item) {
      // LiveClass or DPP or StudyMaterial
      if (!item.isPublished) return <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Draft</span>;
      if (!item.isActive) return <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Inactive</span>;
      return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Published</span>;
    }
    if ("isPublished" in item) {
      // Lecture
      return item.isPublished
        ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Published</span>
        : <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Draft</span>;
    }
    return null;
  };

  const getIcon = () => {
    switch (type) {
      case "lecture":
        return <Video className="h-5 w-5 text-pink-600" />;
      case "liveClass":
        return <Calendar className="h-5 w-5 text-red-600" />;
      case "dpp":
        return <Award className="h-5 w-5 text-yellow-600" />;
      case "studyMaterial":
        return <FolderOpen className="h-5 w-5 text-blue-600" />;
    }
  };

  const getMeta = () => {
    switch (type) {
      case "lecture":
        return item.duration ? `${Math.floor(item.duration / 60)}m ${item.duration % 60}s` : "—";
      case "liveClass":
        return new Date(item.scheduledStart).toLocaleDateString();
      case "dpp":
        return new Date(item.scheduledDate).toLocaleDateString();
      case "studyMaterial":
        return item.materialType || "Material";
    }
  };

  return (
    <Link
      href={getHref()}
      className="group block p-5 rounded-xl bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10 flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors truncate pr-2">
              {item.title}
            </h3>
            {getStatusBadge()}
          </div>
          {item.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Link2 className="h-3.5 w-3.5" />
              {courseName}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {getMeta()}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function FacultyDashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [dashboardData, setDashboardData] = useState<FacultyDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      fetchDashboard();
    }
  }, [authLoading, isAuthenticated, user]);

  const fetchDashboard = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await facultyApi.getDashboard(accessToken);

      if (result.error) {
        setError(result.error);
        if (result.error.includes("401") || result.error.includes("403")) {
          // Redirect handled by ProtectedRoute
        }
      } else if (result.data) {
        setDashboardData(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
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

  if (!dashboardData) {
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

  const { faculty, assignedContent, lectures, liveClasses, dpps, studyMaterials } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {faculty.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full">
            Faculty
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <section aria-labelledby="stats-heading" className="mb-8">
        <h2 id="stats-heading" className="sr-only">Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Lectures"
            value={assignedContent.lectures}
            icon={<Video className="h-6 w-6 text-pink-600" />}
            href="/faculty/lectures"
            color="bg-pink-100"
          />
          <StatCard
            title="Live Classes"
            value={assignedContent.liveClasses}
            icon={<Calendar className="h-6 w-6 text-red-600" />}
            href="/faculty/live-classes"
            color="bg-red-100"
          />
          <StatCard
            title="DPPs"
            value={assignedContent.dpps}
            icon={<Award className="h-6 w-6 text-yellow-600" />}
            href="/faculty/dpps"
            color="bg-yellow-100"
          />
          <StatCard
            title="Study Materials"
            value={assignedContent.studyMaterials}
            icon={<FolderOpen className="h-6 w-6 text-blue-600" />}
            href="/faculty/study-materials"
            color="bg-blue-100"
          />
        </div>
      </section>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lectures */}
        <section aria-labelledby="lectures-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="lectures-heading" className="text-lg font-semibold text-gray-900">My Lectures</h2>
            <Link
              href="/faculty/lectures"
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              View all
            </Link>
          </div>
          {lectures.length > 0 ? (
            <div className="space-y-3">
              {lectures.slice(0, 4).map((lecture) => (
                <ContentItemCard key={lecture._id} item={lecture} type="lecture" />
              ))}
              {lectures.length > 4 && (
                <Link
                  href="/faculty/lectures"
                  className="block text-center text-sm text-primary hover:text-primary-dark font-medium py-3"
                >
                  + {lectures.length - 4} more lectures
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Video className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No lectures assigned</h3>
              <p className="text-gray-500 mb-4">You don't have any lectures assigned yet.</p>
              <Link
                href="/faculty/lectures"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                View Lectures
              </Link>
            </div>
          )}
        </section>

        {/* Live Classes */}
        <section aria-labelledby="live-classes-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="live-classes-heading" className="text-lg font-semibold text-gray-900">My Live Classes</h2>
            <Link
              href="/faculty/live-classes"
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              View all
            </Link>
          </div>
          {liveClasses.length > 0 ? (
            <div className="space-y-3">
              {liveClasses.slice(0, 4).map((liveClass) => (
                <ContentItemCard key={liveClass._id} item={liveClass} type="liveClass" />
              ))}
              {liveClasses.length > 4 && (
                <Link
                  href="/faculty/live-classes"
                  className="block text-center text-sm text-primary hover:text-primary-dark font-medium py-3"
                >
                  + {liveClasses.length - 4} more live classes
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No live classes assigned</h3>
              <p className="text-gray-500 mb-4">You don't have any live classes assigned yet.</p>
              <Link
                href="/faculty/live-classes"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                View Live Classes
              </Link>
            </div>
          )}
        </section>

        {/* DPPs */}
        <section aria-labelledby="dpps-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="dpps-heading" className="text-lg font-semibold text-gray-900">My DPPs</h2>
            <Link
              href="/faculty/dpps"
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              View all
            </Link>
          </div>
          {dpps.length > 0 ? (
            <div className="space-y-3">
              {dpps.slice(0, 4).map((dpp) => (
                <ContentItemCard key={dpp._id} item={dpp} type="dpp" />
              ))}
              {dpps.length > 4 && (
                <Link
                  href="/faculty/dpps"
                  className="block text-center text-sm text-primary hover:text-primary-dark font-medium py-3"
                >
                  + {dpps.length - 4} more DPPs
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No DPPs assigned</h3>
              <p className="text-gray-500 mb-4">You don't have any DPPs assigned yet.</p>
              <Link
                href="/faculty/dpps"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                View DPPs
              </Link>
            </div>
          )}
        </section>

        {/* Study Materials */}
        <section aria-labelledby="study-materials-heading">
          <div className="flex items-center justify-between mb-4">
            <h2 id="study-materials-heading" className="text-lg font-semibold text-gray-900">My Study Materials</h2>
            <Link
              href="/faculty/study-materials"
              className="text-sm text-primary hover:text-primary-dark font-medium"
            >
              View all
            </Link>
          </div>
          {studyMaterials.length > 0 ? (
            <div className="space-y-3">
              {studyMaterials.slice(0, 4).map((material) => (
                <ContentItemCard key={material._id} item={material} type="studyMaterial" />
              ))}
              {studyMaterials.length > 4 && (
                <Link
                  href="/faculty/study-materials"
                  className="block text-center text-sm text-primary hover:text-primary-dark font-medium py-3"
                >
                  + {studyMaterials.length - 4} more materials
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FolderOpen className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No study materials assigned</h3>
              <p className="text-gray-500 mb-4">You don't have any study materials assigned yet.</p>
              <Link
                href="/faculty/study-materials"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
              >
                View Study Materials
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}