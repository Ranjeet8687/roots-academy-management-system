"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminApi, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";

export default function NewStudyMaterialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [materialType, setMaterialType] = useState("PDF");
  const [resourceUrl, setResourceUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [subject, setSubject] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState("");
  const [courseError, setCourseError] = useState("");
  const [urlError, setUrlError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      fetchCourses();
    }
  }, [authLoading, user]);

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

  const validate = () => {
    let valid = true;
    if (!title.trim()) {
      setTitleError("Title is required");
      valid = false;
    }
    if (!courseId) {
      setCourseError("Please select a course");
      valid = false;
    }
    if (!resourceUrl.trim()) {
      setUrlError("Resource URL is required");
      valid = false;
    } else {
      try {
        new URL(resourceUrl);
      } catch {
        setUrlError("Please enter a valid URL");
        valid = false;
      }
    }
    if (!materialType) {
      setError("Please select a material type");
      valid = false;
    }
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const result = await adminApi.createStudyMaterial(accessToken, {
        title: title.trim(),
        description: description.trim() || undefined,
        courseId,
        materialType,
        resourceUrl: resourceUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
        subject: subject.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        router.push(`/admin/study-materials/${result.data._id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create study material");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/study-materials"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Study Material</h1>
            <p className="text-gray-600 mt-1">Create a new study material resource</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="text-sm font-medium text-gray-700 block mb-1.5">
              Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(""); }}
              placeholder="e.g., Introduction to Calculus - Lecture Notes"
              className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                titleError ? "border-destructive" : "border-gray-300"
              }`}
            />
            {titleError && <p className="text-xs text-destructive mt-1">{titleError}</p>}
          </div>

          <div>
            <label htmlFor="courseId" className="text-sm font-medium text-gray-700 block mb-1.5">
              Course <span className="text-destructive">*</span>
            </label>
            <select
              id="courseId"
              value={courseId}
              onChange={(e) => { setCourseId(e.target.value); setCourseError(""); }}
              className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                courseError ? "border-destructive" : "border-gray-300"
              }`}
              required
            >
              <option value="">Select a course</option>
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
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="PDF">PDF</option>
              <option value="VIDEO">Video</option>
              <option value="DOCUMENT">Document</option>
              <option value="LINK">Link</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <FileUpload
            id="resourceUrl"
            name="resourceUrl"
            value={resourceUrl}
            onChange={setResourceUrl}
            label="Resource URL"
            placeholder="https://example.com/resource.pdf"
            helperText="Direct link to the study material (PDF, video, document, etc.)"
            accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,image/jpeg,image/png,image/webp,video/mp4"
            required
            error={urlError}
          />

          <FileUpload
            id="thumbnailUrl"
            name="thumbnailUrl"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            label="Thumbnail URL"
            placeholder="https://example.com/thumbnail.jpg (optional)"
            helperText="Optional thumbnail/preview image URL"
            accept="image/jpeg,image/png,image/webp"
          />

          <div>
            <label htmlFor="subject" className="text-sm font-medium text-gray-700 block mb-1.5">
              Subject/Topic (optional)
            </label>
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Calculus - Chapter 1: Limits"
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief description of the study material..."
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button type="submit" size="lg" isLoading={loading} loadingLabel="Creating...">
              <Save className="h-4 w-4 mr-2" />
              Create Study Material
            </Button>
            <Link
              href="/admin/study-materials"
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  );
}