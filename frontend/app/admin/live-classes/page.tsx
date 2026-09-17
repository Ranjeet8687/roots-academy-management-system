"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { adminApi, LiveClass, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginatedLiveClasses {
  data: LiveClass[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function LiveClassesPage() {
  const { user, loading: authLoading } = useAuth();
  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [publishFilter, setPublishFilter] = useState<"all" | "published" | "unpublished">("all");
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) {
      fetchLiveClasses();
      fetchCourses();
    }
  }, [authLoading, user, pagination.page, search, courseFilter, publishFilter, activeFilter]);

  const fetchLiveClasses = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        courseId: courseFilter !== "all" ? courseFilter : undefined,
        isPublished: publishFilter !== "all" ? publishFilter === "published" : undefined,
        isActive: activeFilter !== "all" ? activeFilter === "active" : undefined,
      };
      const result = await adminApi.getAllLiveClasses(accessToken, params);

      const responseData = result.data;

      if (result.error) {
        setError(result.error);
      } else if (responseData) {
        // Filter client-side for search since backend may not support it
        let filtered = responseData.data;
        if (search) {
          filtered = filtered.filter(lc =>
            lc.title.toLowerCase().includes(search.toLowerCase()) ||
            lc.description?.toLowerCase().includes(search.toLowerCase()) ||
            lc.meetingUrl?.toLowerCase().includes(search.toLowerCase())
          );
        }
        setLiveClasses(filtered);
        setPagination(prev => ({ ...prev, total: responseData.pagination.total, totalPages: responseData.pagination.totalPages }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch live classes");
    } finally {
      setLoading(false);
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

  const handleDelete = async (liveClassId: string) => {
    if (!confirm("Are you sure you want to delete this live class? This action cannot be undone.")) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setDeletingId(liveClassId);
    try {
      const result = await adminApi.deleteLiveClass(accessToken, liveClassId);

      if (result.error) {
        alert(result.error);
      } else {
        fetchLiveClasses();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete live class");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (liveClass: LiveClass) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      await adminApi.toggleLiveClassPublish(accessToken, liveClass._id, !liveClass.isPublished);
      fetchLiveClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update live class publish status");
    }
  };

  const handleToggleActivate = async (liveClass: LiveClass) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      await adminApi.toggleLiveClassActivate(accessToken, liveClass._id, !liveClass.isActive);
      fetchLiveClasses();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update live class active status");
    }
  };

  const getCourseName = (course: string | { _id: string; name: string; slug: string }) => {
    if (typeof course === "object" && course !== null) {
      return course.name;
    }
    return course;
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
            <h1 className="text-3xl font-bold text-gray-900">Live Classes</h1>
            <p className="text-gray-600 mt-1">Manage scheduled live classes and sessions</p>
          </div>
          <Link
            href="/admin/live-classes/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Schedule Live Class
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search live classes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>{course.name}</option>
              ))}
            </select>
            <select
              value={publishFilter}
              onChange={(e) => setPublishFilter(e.target.value as "all" | "published" | "unpublished")}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Publish Status</option>
              <option value="published">Published</option>
              <option value="unpublished">Unpublished</option>
            </select>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value as "all" | "active" | "inactive")}
              className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="all">All Active Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Live Classes Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchLiveClasses} className="text-sm underline hover:text-red-800">Retry</button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Class</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled Start</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled End</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Meeting URL</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Published</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {liveClasses.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      {search || courseFilter !== "all" || publishFilter !== "all" || activeFilter !== "all" ? "No live classes match your filters" : "No live classes yet. Schedule your first live class!"}
                    </td>
                  </tr>
                ) : (
                  liveClasses.map((lc) => (
                    <tr key={lc._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="h-6 w-6 text-red-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{lc.title}</p>
                            {lc.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">{lc.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getCourseName(lc.course)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(lc.scheduledStart)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDateTime(lc.scheduledEnd)}</td>
                      <td className="px-6 py-4">
                        {lc.meetingUrl ? (
                          <a
                            href={lc.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline truncate max-w-xs block"
                          >
                            {lc.meetingUrl}
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(lc)}
                          disabled={deletingId === lc._id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            lc.isPublished
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {lc.isPublished ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {lc.isPublished ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActivate(lc)}
                          disabled={deletingId === lc._id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            lc.isActive
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {lc.isActive ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {lc.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/live-classes/${lc._id}`}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View/Edit"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/live-classes/${lc._id}`}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(lc._id)}
                            disabled={deletingId === lc._id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            {deletingId === lc._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} live classes
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
      </div>
    </ProtectedRoute>
  );
}