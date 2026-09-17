"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminApi, LiveClass, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Trash2, CheckCircle, XCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LiveClassDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const liveClassId = params.id as string;

  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
    scheduledStart: "",
    scheduledEnd: "",
    meetingUrl: "",
    platform: "",
  });
  const [titleError, setTitleError] = useState("");
  const [meetingUrlError, setMeetingUrlError] = useState("");
  const [startError, setStartError] = useState("");
  const [endError, setEndError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchLiveClass();
      fetchCourses();
    }
  }, [authLoading, user, liveClassId]);

  const fetchLiveClass = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getLiveClassById(accessToken, liveClassId);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setLiveClass(result.data);
        // Convert ISO strings to datetime-local format (YYYY-MM-DDTHH:mm)
        const formatForInput = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toISOString().slice(0, 16);
        };
        setFormData({
          title: result.data.title,
          description: result.data.description || "",
          courseId: typeof result.data.course === "object" ? result.data.course._id : result.data.course,
          scheduledStart: formatForInput(result.data.scheduledStart),
          scheduledEnd: formatForInput(result.data.scheduledEnd),
          meetingUrl: result.data.meetingUrl || "",
          platform: result.data.platform || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch live class");
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

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "title") setTitleError("");
    if (field === "meetingUrl") setMeetingUrlError("");
    if (field === "scheduledStart") { setStartError(""); setEndError(""); }
    if (field === "scheduledEnd") setEndError("");
  };

  const validate = () => {
    let valid = true;
    if (!formData.title.trim()) {
      setTitleError("Title is required");
      valid = false;
    }
    if (!formData.meetingUrl.trim()) {
      setMeetingUrlError("Meeting URL is required");
      valid = false;
    } else if (!/^https?:\/\/.+/.test(formData.meetingUrl)) {
      setMeetingUrlError("Please enter a valid URL");
      valid = false;
    }
    if (!formData.scheduledStart) {
      setStartError("Scheduled start time is required");
      valid = false;
    }
    if (!formData.scheduledEnd) {
      setEndError("Scheduled end time is required");
      valid = false;
    }
    if (formData.scheduledStart && formData.scheduledEnd && new Date(formData.scheduledStart) >= new Date(formData.scheduledEnd)) {
      setEndError("End time must be after start time");
      valid = false;
    }
    return valid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !liveClass) return;

    setSaving(true);
    setError(null);

    try {
      const result = await adminApi.updateLiveClass(accessToken, liveClass._id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        scheduledStart: new Date(formData.scheduledStart).toISOString(),
        scheduledEnd: new Date(formData.scheduledEnd).toISOString(),
        meetingUrl: formData.meetingUrl.trim(),
        platform: formData.platform.trim() || undefined,
        courseId: formData.courseId,
      });

      const updatedLiveClass = result.data;

      if (result.error) {
        setError(result.error);
      } else if (updatedLiveClass) {
        setLiveClass(updatedLiveClass);
        setFormData(prev => ({ ...prev, title: updatedLiveClass.title }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update live class");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !liveClass) return;

    setDeleting(true);
    try {
      const result = await adminApi.deleteLiveClass(accessToken, liveClass._id);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/live-classes");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete live class");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleTogglePublish = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !liveClass) return;

    try {
      const result = await adminApi.toggleLiveClassPublish(accessToken, liveClass._id, !liveClass.isPublished);
      if (result.data) {
        setLiveClass(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update publish status");
    }
  };

  const handleToggleActivate = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !liveClass) return;

    try {
      const result = await adminApi.toggleLiveClassActivate(accessToken, liveClass._id, !liveClass.isActive);
      if (result.data) {
        setLiveClass(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update active status");
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

  if (error && !liveClass) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/live-classes" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Live Class Not Found</h1>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchLiveClass} className="ml-4 text-sm underline hover:text-red-800">Retry</button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!liveClass) return null;

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/live-classes" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{liveClass.title}</h1>
              <p className="text-gray-600 mt-1">Manage live class details and schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePublish}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                liveClass.isPublished
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {liveClass.isPublished ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {liveClass.isPublished ? "Published" : "Draft"}
            </button>
            <button
              onClick={handleToggleActivate}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                liveClass.isActive
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {liveClass.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {liveClass.isActive ? "Active" : "Inactive"}
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
            <label htmlFor="title" className="text-sm font-medium text-gray-700 block mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                titleError ? "border-destructive" : "border-gray-300"
              }`}
            />
            {titleError && <p className="text-xs text-destructive mt-1">{titleError}</p>}
          </div>

          <div>
            <label htmlFor="courseId" className="text-sm font-medium text-gray-700 block mb-1.5">
              Course
            </label>
            <select
              id="courseId"
              value={formData.courseId}
              onChange={(e) => handleChange("courseId", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.slug})
                </option>
              ))}
            </select>
            {loadingCourses && <p className="text-xs text-gray-500 mt-1">Loading courses...</p>}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledStart" className="text-sm font-medium text-gray-700 block mb-1.5">
                Scheduled Start <span className="text-destructive">*</span>
              </label>
              <input
                id="scheduledStart"
                type="datetime-local"
                value={formData.scheduledStart}
                onChange={(e) => handleChange("scheduledStart", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  startError ? "border-destructive" : "border-gray-300"
                }`}
              />
              {startError && <p className="text-xs text-destructive mt-1">{startError}</p>}
            </div>

            <div>
              <label htmlFor="scheduledEnd" className="text-sm font-medium text-gray-700 block mb-1.5">
                Scheduled End <span className="text-destructive">*</span>
              </label>
              <input
                id="scheduledEnd"
                type="datetime-local"
                value={formData.scheduledEnd}
                onChange={(e) => handleChange("scheduledEnd", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  endError ? "border-destructive" : "border-gray-300"
                }`}
              />
              {endError && <p className="text-xs text-destructive mt-1">{endError}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="meetingUrl" className="text-sm font-medium text-gray-700 block mb-1.5">
              Meeting URL <span className="text-destructive">*</span>
            </label>
            <input
              id="meetingUrl"
              type="url"
              value={formData.meetingUrl}
              onChange={(e) => handleChange("meetingUrl", e.target.value)}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                meetingUrlError ? "border-destructive" : "border-gray-300"
              }`}
            />
            {meetingUrlError && <p className="text-xs text-destructive mt-1">{meetingUrlError}</p>}
          </div>

          <div>
            <label htmlFor="platform" className="text-sm font-medium text-gray-700 block mb-1.5">
              Platform
            </label>
            <input
              id="platform"
              type="text"
              value={formData.platform}
              onChange={(e) => handleChange("platform", e.target.value)}
              placeholder="e.g., Zoom, Google Meet, Microsoft Teams"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
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
          <p className="text-gray-600 mb-4">Once you delete this live class, there is no going back. Please be certain.</p>
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
              "Delete Live Class"
            )}
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Live Class</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete "{liveClass.title}"? This action cannot be undone.</p>
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
                  {deleting ? "Deleting..." : "Delete Live Class"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}