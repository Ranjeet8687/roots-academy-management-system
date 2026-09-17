"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminApi, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Trash2, CheckCircle, XCircle, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CourseDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    thumbnail: "",
    isActive: true,
  });
  const [nameError, setNameError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchCourse();
    }
  }, [authLoading, user, courseId]);

  const fetchCourse = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getCourseById(accessToken, courseId);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setCourse(result.data);
        setFormData({
          name: result.data.name,
          description: result.data.description || "",
          thumbnail: result.data.thumbnail || "",
          isActive: result.data.isActive,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch course");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "name") setNameError("");
  };

  const validate = () => {
    if (!formData.name.trim()) {
      setNameError("Course name is required");
      return false;
    }
    return true;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !course) return;

    setSaving(true);
    setError(null);

    try {
      const result = await adminApi.updateCourse(accessToken, course._id, {
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      });

      const updatedCourse = result.data;

      if (result.error) {
        setError(result.error);
      } else if (updatedCourse) {
        setCourse(updatedCourse);
        setFormData(prev => ({ ...prev, name: updatedCourse.name }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !course) return;

    setDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001"}/api/courses/${course._id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.ok) {
        router.push("/admin/courses");
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to delete course");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete course");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleStatus = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !course) return;

    try {
      const result = await adminApi.updateCourse(accessToken, course._id, { isActive: !course.isActive });
      const updatedCourse = result.data;
      if (updatedCourse) {
        setCourse(updatedCourse);
        setFormData(prev => ({ ...prev, isActive: updatedCourse.isActive }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error && !course) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/courses" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Not Found</h1>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchCourse} className="ml-4 text-sm underline hover:text-red-800">Retry</button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!course) return null;

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/courses" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              <p className="text-gray-600 mt-1">Manage course details and content</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleStatus}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                course.isActive
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {course.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {course.isActive ? "Active" : "Inactive"}
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-sm underline hover:text-red-800">Dismiss</button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
          <div>
            <label htmlFor="name" className="text-sm font-medium text-gray-700 block mb-1.5">
              Course Name <span className="text-destructive">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                nameError ? "border-destructive" : "border-gray-300"
              }`}
            />
            {nameError && <p className="text-xs text-destructive mt-1">{nameError}</p>}
          </div>

          <div>
            <label htmlFor="slug" className="text-sm font-medium text-gray-700 block mb-1.5">Slug</label>
            <input
              id="slug"
              type="text"
              value={course.slug}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">Slug cannot be changed after creation.</p>
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label htmlFor="thumbnail" className="text-sm font-medium text-gray-700 block mb-1.5">
              Thumbnail URL
            </label>
            <input
              id="thumbnail"
              type="url"
              value={formData.thumbnail}
              onChange={(e) => handleChange("thumbnail", e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {formData.thumbnail && (
              <div className="mt-2">
                <img src={formData.thumbnail} alt="Thumbnail preview" className="max-h-32 rounded-lg border border-gray-200" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary/50"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700 cursor-pointer">
              Course is active (visible to students)
            </label>
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button type="submit" size="lg" isLoading={saving} loadingLabel="Saving...">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Danger Zone
          </h3>
          <p className="text-gray-600 mb-4">Once you delete this course, there is no going back. Please be certain.</p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={deleting}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 hover:border-red-300 transition-colors disabled:opacity-50"
          >
            {deleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Course"
            )}
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Course</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete "{course.name}"? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Delete Course"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}