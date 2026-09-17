"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminApi, StudyMaterial, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Trash2, CheckCircle, XCircle, FolderOpen, Plus, Eye, EyeOff, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

export default function StudyMaterialDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const studyMaterialId = params.id as string;

  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null);
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
    materialType: "PDF",
    resourceUrl: "",
    thumbnailUrl: "",
    subject: "",
  });
  const [titleError, setTitleError] = useState("");
  const [courseError, setCourseError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchStudyMaterial();
      fetchCourses();
    }
  }, [authLoading, user, studyMaterialId]);

  const fetchStudyMaterial = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getStudyMaterialById(accessToken, studyMaterialId);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setStudyMaterial(result.data);
        setFormData({
          title: result.data.title,
          description: result.data.description || "",
          courseId: typeof result.data.course === "object" ? result.data.course._id : result.data.course,
          materialType: result.data.type,
          resourceUrl: result.data.resourceUrl || "",
          thumbnailUrl: result.data.thumbnailUrl || "",
          subject: result.data.subject || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch study material");
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
    if (field === "courseId") setCourseError("");
    if (field === "resourceUrl") setUrlError("");
  };

  const validate = () => {
    let valid = true;
    if (!formData.title.trim()) {
      setTitleError("Title is required");
      valid = false;
    }
    if (!formData.courseId) {
      setCourseError("Please select a course");
      valid = false;
    }
    if (!formData.resourceUrl.trim()) {
      setUrlError("Resource URL is required");
      valid = false;
    } else {
      try {
        new URL(formData.resourceUrl);
      } catch {
        setUrlError("Please enter a valid URL");
        valid = false;
      }
    }
    return valid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !studyMaterial) return;

    setSaving(true);
    setError(null);

    try {
      const result = await adminApi.updateStudyMaterial(accessToken, studyMaterial._id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        materialType: formData.materialType,
        resourceUrl: formData.resourceUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        subject: formData.subject.trim() || undefined,
      });

      const updatedStudyMaterial = result.data;

      if (result.error) {
        setError(result.error);
      } else if (updatedStudyMaterial) {
        setStudyMaterial(updatedStudyMaterial);
        setFormData(prev => ({ ...prev, title: updatedStudyMaterial.title }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update study material");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !studyMaterial) return;

    setDeleting(true);
    try {
      const result = await adminApi.deleteStudyMaterial(accessToken, studyMaterial._id);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/study-materials");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete study material");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleTogglePublish = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !studyMaterial) return;

    try {
      const result = await adminApi.toggleStudyMaterialPublish(accessToken, studyMaterial._id, !studyMaterial.isPublished);
      if (result.data) {
        setStudyMaterial(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update publish status");
    }
  };

  const handleToggleActivate = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !studyMaterial) return;

    try {
      const result = await adminApi.toggleStudyMaterialActivate(accessToken, studyMaterial._id, !studyMaterial.isActive);
      if (result.data) {
        setStudyMaterial(result.data);
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

  if (error && !studyMaterial) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/study-materials" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Study Material Not Found</h1>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchStudyMaterial} className="ml-4 text-sm underline hover:text-red-800">Retry</button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!studyMaterial) return null;

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/study-materials" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{studyMaterial.title}</h1>
              <p className="text-gray-600 mt-1">Manage study material details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePublish}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                studyMaterial.isPublished
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {studyMaterial.isPublished ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {studyMaterial.isPublished ? "Published" : "Draft"}
            </button>
            <button
              onClick={handleToggleActivate}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                studyMaterial.isActive
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {studyMaterial.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {studyMaterial.isActive ? "Active" : "Inactive"}
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
              className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                courseError ? "border-destructive" : "border-gray-300"
              }`}
            >
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.name} ({course.slug})
                </option>
              ))}
            </select>
            {courseError && <p className="text-xs text-destructive mt-1">{courseError}</p>}
            {loadingCourses && <p className="text-xs text-gray-500 mt-1">Loading courses...</p>}
          </div>

          <div>
            <label htmlFor="materialType" className="text-sm font-medium text-gray-700 block mb-1.5">
              Material Type <span className="text-destructive">*</span>
            </label>
            <select
              id="materialType"
              value={formData.materialType}
              onChange={(e) => handleChange("materialType", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="PDF">PDF</option>
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Document</option>
              <option value="LINK">Link</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="resourceUrl" className="text-sm font-medium text-gray-700 block mb-1.5">
              Resource URL <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <input
                id="resourceUrl"
                type="url"
                value={formData.resourceUrl}
                onChange={(e) => handleChange("resourceUrl", e.target.value)}
                className={`flex-1 px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  urlError ? "border-destructive" : "border-gray-300"
                }`}
              />
              {formData.resourceUrl && (
                <a
                  href={formData.resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                  title="Open resource"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            {urlError && <p className="text-xs text-destructive mt-1">{urlError}</p>}
            <p className="text-xs text-gray-500 mt-1">Direct link to the study material</p>
          </div>

          <div>
            <label htmlFor="thumbnailUrl" className="text-sm font-medium text-gray-700 block mb-1.5">
              Thumbnail URL (optional)
            </label>
            <div className="flex gap-2">
              <input
                id="thumbnailUrl"
                type="url"
                value={formData.thumbnailUrl}
                onChange={(e) => handleChange("thumbnailUrl", e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              {formData.thumbnailUrl && (
                <a
                  href={formData.thumbnailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1"
                  title="Open thumbnail"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Optional thumbnail/preview image URL</p>
          </div>

          <div>
            <label htmlFor="subject" className="text-sm font-medium text-gray-700 block mb-1.5">
              Subject/Topic (optional)
            </label>
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p className="text-xs text-gray-500 mt-1">Specific subject or topic this material covers</p>
          </div>

          <div>
            <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-1.5">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
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

        {/* Info Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">ID</dt>
              <dd className="font-mono text-gray-900">{studyMaterial._id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="font-medium text-gray-900">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {studyMaterial.type}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Subject</dt>
              <dd className="font-medium text-gray-900">{studyMaterial.subject || "—"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Course</dt>
              <dd className="font-medium text-gray-900">{getCourseName(studyMaterial.course)}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">Resource URL</dt>
              <dd className="font-medium text-gray-900">
                {studyMaterial.resourceUrl ? (
                  <a
                    href={studyMaterial.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate max-w-xs block"
                  >
                    {studyMaterial.resourceUrl}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-gray-500">Thumbnail URL</dt>
              <dd className="font-medium text-gray-900">
                {studyMaterial.thumbnailUrl ? (
                  <a
                    href={studyMaterial.thumbnailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline truncate max-w-xs block"
                  >
                    {studyMaterial.thumbnailUrl}
                  </a>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium text-gray-900">{formatDate(studyMaterial.createdAt)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="font-medium text-gray-900">{formatDate(studyMaterial.updatedAt)}</dd>
            </div>
          </dl>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            Danger Zone
          </h3>
          <p className="text-gray-600 mb-4">Once you delete this study material, there is no going back. Please be certain.</p>
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
              "Delete Study Material"
            )}
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Study Material</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete "{studyMaterial.title}"? This action cannot be undone.</p>
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
                  {deleting ? "Deleting..." : "Delete Study Material"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}