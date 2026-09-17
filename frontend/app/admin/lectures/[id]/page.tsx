"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminApi, Lecture, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Trash2, CheckCircle, XCircle, Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

export default function LectureDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const lectureId = params.id as string;

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "",
    order: "",
    courseId: "",
  });
  const [titleError, setTitleError] = useState("");
  const [videoUrlError, setVideoUrlError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchLecture();
      fetchCourses();
    }
  }, [authLoading, user, lectureId]);

  const fetchLecture = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getLectureById(accessToken, lectureId);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setLecture(result.data);
        setFormData({
          title: result.data.title,
          description: result.data.description || "",
          videoUrl: result.data.videoUrl || "",
          thumbnailUrl: result.data.thumbnailUrl || "",
          duration: result.data.duration?.toString() || "",
          order: result.data.order?.toString() || "",
          courseId: typeof result.data.course === "object" ? result.data.course._id : result.data.course,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch lecture");
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
    if (field === "videoUrl") setVideoUrlError("");
  };

  const validate = () => {
    let valid = true;
    if (!formData.title.trim()) {
      setTitleError("Lecture title is required");
      valid = false;
    }
    if (!formData.videoUrl.trim()) {
      setVideoUrlError("Video URL is required");
      valid = false;
    } else if (!/^https?:\/\/.+/.test(formData.videoUrl)) {
      setVideoUrlError("Please enter a valid URL");
      valid = false;
    }
    return valid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !lecture) return;

    setSaving(true);
    setError(null);

    try {
      const result = await adminApi.updateLecture(accessToken, lecture._id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        videoUrl: formData.videoUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        order: formData.order ? parseInt(formData.order) : undefined,
        courseId: formData.courseId,
      });

      const updatedLecture = result.data;

      if (result.error) {
        setError(result.error);
      } else if (updatedLecture) {
        setLecture(updatedLecture);
        setFormData(prev => ({ ...prev, title: updatedLecture.title }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lecture");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !lecture) return;

    setDeleting(true);
    try {
      const result = await adminApi.deleteLecture(accessToken, lecture._id);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/lectures");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete lecture");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleTogglePublish = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !lecture) return;

    try {
      const result = await adminApi.toggleLecturePublish(accessToken, lecture._id, !lecture.isPublished);
      if (result.data) {
        setLecture(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update publish status");
    }
  };

  const getCourseName = (course: string | { _id: string; name: string; slug: string }) => {
    if (typeof course === "object" && course !== null) {
      return course.name;
    }
    return course;
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error && !lecture) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/lectures" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Lecture Not Found</h1>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchLecture} className="ml-4 text-sm underline hover:text-red-800">Retry</button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!lecture) return null;

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/lectures" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lecture.title}</h1>
              <p className="text-gray-600 mt-1">Manage lecture details and content</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePublish}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                lecture.isPublished
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {lecture.isPublished ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {lecture.isPublished ? "Published" : "Draft"}
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
              Lecture Title <span className="text-destructive">*</span>
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

          <FileUpload
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={(value) => handleChange("videoUrl", value)}
            label="Video URL"
            placeholder="https://example.com/video.mp4"
            helperText="URL to the video file (MP4, WebM, or streaming URL)"
            accept="video/mp4,video/webm"
            required
            error={videoUrlError}
          />

          <FileUpload
            id="thumbnailUrl"
            name="thumbnailUrl"
            value={formData.thumbnailUrl}
            onChange={(value) => handleChange("thumbnailUrl", value)}
            label="Thumbnail URL"
            placeholder="https://example.com/thumbnail.jpg"
            helperText="Optional thumbnail image for the video"
            accept="image/jpeg,image/png,image/webp"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="duration" className="text-sm font-medium text-gray-700 block mb-1.5">
                Duration (seconds)
              </label>
              <input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                placeholder="e.g., 1800"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="0"
              />
            </div>

            <div>
              <label htmlFor="order" className="text-sm font-medium text-gray-700 block mb-1.5">
                Order
              </label>
              <input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => handleChange("order", e.target.value)}
                placeholder="e.g., 1"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="1"
              />
            </div>
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
          <p className="text-gray-600 mb-4">Once you delete this lecture, there is no going back. Please be certain.</p>
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
              "Delete Lecture"
            )}
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Lecture</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete "{lecture.title}"? This action cannot be undone.</p>
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
                  {deleting ? "Deleting..." : "Delete Lecture"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}