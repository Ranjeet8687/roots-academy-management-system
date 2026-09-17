"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { adminApi, DPP, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, CheckCircle, XCircle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PaginatedDPPs {
  data: DPP[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function DPPsPage() {
  const { user, loading: authLoading } = useAuth();
  const [dpps, setDPPs] = useState<DPP[]>([]);
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
      fetchDPPs();
      fetchCourses();
    }
  }, [authLoading, user, pagination.page, search, courseFilter, publishFilter, activeFilter]);

  const fetchDPPs = async () => {
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
      const result = await adminApi.getAllDPPs(accessToken, params);

      const responseData = result.data;

      if (result.error) {
        setError(result.error);
      } else if (responseData) {
        // Filter client-side for search since backend may not support it
        let filtered = responseData.data;
        if (search) {
          filtered = filtered.filter(dpp =>
            dpp.title.toLowerCase().includes(search.toLowerCase()) ||
            dpp.description?.toLowerCase().includes(search.toLowerCase())
          );
        }
        setDPPs(filtered);
        setPagination(prev => ({ ...prev, total: responseData.pagination.total, totalPages: responseData.pagination.totalPages }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch DPPs");
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

  const handleDelete = async (dppId: string) => {
    if (!confirm("Are you sure you want to delete this DPP? This action cannot be undone.")) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setDeletingId(dppId);
    try {
      const result = await adminApi.deleteDPP(accessToken, dppId);

      if (result.error) {
        alert(result.error);
      } else {
        fetchDPPs();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete DPP");
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (dpp: DPP) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      await adminApi.toggleDPPPublish(accessToken, dpp._id, !dpp.isPublished);
      fetchDPPs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update DPP publish status");
    }
  };

  const handleToggleActivate = async (dpp: DPP) => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      await adminApi.toggleDPPActivate(accessToken, dpp._id, !dpp.isActive);
      fetchDPPs();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update DPP active status");
    }
  };

  const getCourseName = (course: string | { _id: string; name: string; slug: string }) => {
    if (typeof course === "object" && course !== null) {
      return course.name;
    }
    return course;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
            <h1 className="text-3xl font-bold text-gray-900">DPPs (Daily Practice Problems)</h1>
            <p className="text-gray-600 mt-1">Manage practice problem sets for courses</p>
          </div>
          <Link
            href="/admin/dpps/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create DPP
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search DPPs..."
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

        {/* DPPs Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200 text-red-700 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={fetchDPPs} className="text-sm underline hover:text-red-800">Retry</button>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full" role="table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">DPP</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Passing Marks</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Published</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Active</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dpps.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                      {search || courseFilter !== "all" || publishFilter !== "all" || activeFilter !== "all" ? "No DPPs match your filters" : "No DPPs yet. Create your first DPP!"}
                    </td>
                  </tr>
                ) : (
                  dpps.map((dpp) => (
                    <tr key={dpp._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{dpp.title}</p>
                            {dpp.description && (
                              <p className="text-sm text-gray-500 truncate max-w-xs">{dpp.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getCourseName(dpp.course)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(dpp.scheduledDate)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dpp.duration} min</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dpp.totalMarks}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{dpp.passingMarks}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleTogglePublish(dpp)}
                          disabled={deletingId === dpp._id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            dpp.isPublished
                              ? "bg-green-100 text-green-700 hover:bg-green-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {dpp.isPublished ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {dpp.isPublished ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActivate(dpp)}
                          disabled={deletingId === dpp._id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                            dpp.isActive
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {dpp.isActive ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                          {dpp.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/dpps/${dpp._id}`}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View/Edit"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/dpps/${dpp._id}`}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(dpp._id)}
                            disabled={deletingId === dpp._id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            {deletingId === dpp._id ? (
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
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} DPPs
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