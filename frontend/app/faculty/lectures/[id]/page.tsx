"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { facultyApi, Lecture } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Video } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FacultyLectureDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const lectureId = params.id as string;

  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    thumbnailUrl: "",
    duration: "",
    order: "",
  });
  const [titleError, setTitleError] = useState("");
  const [videoUrlError, setVideoUrlError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      fetchLecture();
    }
  }, [authLoading, user, lectureId]);

  const fetchLecture = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await facultyApi.getLectureById(accessToken, lectureId);

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
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch lecture");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
      const result = await facultyApi.updateLecture(accessToken, lecture._id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        videoUrl: formData.videoUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        order: formData.order ? parseInt(formData.order) : undefined,
      });

      const updatedLecture = result.data;

      if (result.error) {
        setError(result.error);
      } else if (updatedLecture) {
        setLecture(updatedLecture);
        setFormData((prev) => ({ ...prev, title: updatedLecture.title }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update lecture");
    } finally {
      setSaving(false);
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
      <ProtectedRoute allowedRoles={["FACULTY"]}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/faculty/lectures" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
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
    <ProtectedRoute allowedRoles={["FACULTY"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/faculty/lectures" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{lecture.title}</h1>
              <p className="text-gray-600 mt-1">Manage lecture details and content</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              lecture.isPublished
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {lecture.isPublished ? "Published" : "Draft"}
            </span>
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
            <label htmlFor="course" className="text-sm font-medium text-gray-700 block mb-1.5">
              Course
            </label>
            <input
              id="course"
              type="text"
              value={getCourseName(lecture.course)}
              readOnly
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-gray-50 text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">Course assignment is managed by administrators.</p>
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
            <label htmlFor="videoUrl" className="text-sm font-medium text-gray-700 block mb-1.5">
              Video URL <span className="text-destructive">*</span>
            </label>
            <input
              id="videoUrl"
              type="url"
              value={formData.videoUrl}
              onChange={(e) => handleChange("videoUrl", e.target.value)}
              placeholder="https://example.com/video.mp4"
              className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                videoUrlError ? "border-destructive" : "border-gray-300"
              }`}
            />
            {videoUrlError && <p className="text-xs text-destructive mt-1">{videoUrlError}</p>}
          </div>

          <div>
            <label htmlFor="thumbnailUrl" className="text-sm font-medium text-gray-700 block mb-1.5">
              Thumbnail URL
            </label>
            <input
              id="thumbnailUrl"
              type="url"
              value={formData.thumbnailUrl}
              onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
              placeholder="https://example.com/thumbnail.jpg"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            {formData.thumbnailUrl && (
              <div className="mt-2">
                <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="max-h-32 rounded-lg border border-gray-200" />
              </div>
            )}
          </div>

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

        {/* Read-only Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Lecture ID</dt>
              <dd className="font-mono text-gray-900">{lecture._id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium text-gray-900">{new Date(lecture.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="font-medium text-gray-900">{new Date(lecture.updatedAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Published</dt>
              <dd className="font-medium text-gray-900">{lecture.isPublished ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </ProtectedRoute>
  );
}