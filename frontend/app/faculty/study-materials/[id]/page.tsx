"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { facultyApi, StudyMaterial, StudyMaterialType } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, FolderOpen, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const materialTypes = Object.values(StudyMaterialType);

const getTypeLabel = (type: string) => {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function FacultyStudyMaterialDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const materialId = params.id as string;

  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    materialType: StudyMaterialType.PDF,
    resourceUrl: "",
    thumbnailUrl: "",
    subject: "",
  });
  const [titleError, setTitleError] = useState("");
  const [resourceUrlError, setResourceUrlError] = useState("");
  const [typeError, setTypeError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      fetchMaterial();
    }
  }, [authLoading, user, materialId]);

  const fetchMaterial = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await facultyApi.getStudyMaterialById(accessToken, materialId);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setMaterial(result.data);
        setFormData({
          title: result.data.title,
          description: result.data.description || "",
          materialType: result.data.materialType,
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "title") setTitleError("");
    if (field === "resourceUrl") setResourceUrlError("");
    if (field === "materialType") setTypeError("");
  };

  const validate = () => {
    let valid = true;
    if (!formData.title.trim()) {
      setTitleError("Study material title is required");
      valid = false;
    }
    if (!formData.materialType) {
      setTypeError("Material type is required");
      valid = false;
    }
    if (!formData.resourceUrl.trim()) {
      setResourceUrlError("Resource URL is required");
      valid = false;
    } else if (!/^https?:\/\/.+/.test(formData.resourceUrl)) {
      setResourceUrlError("Please enter a valid URL");
      valid = false;
    }
    return valid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !material) return;

    setSaving(true);
    setError(null);

    try {
      const result = await facultyApi.updateStudyMaterial(accessToken, material._id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        materialType: formData.materialType,
        resourceUrl: formData.resourceUrl.trim(),
        thumbnailUrl: formData.thumbnailUrl.trim() || undefined,
        subject: formData.subject.trim() || undefined,
      });

      const updatedMaterial = result.data;

      if (result.error) {
        setError(result.error);
      } else if (updatedMaterial) {
        setMaterial(updatedMaterial);
        setFormData((prev) => ({ ...prev, title: updatedMaterial.title }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update study material");
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

  if (error && !material) {
    return (
      <ProtectedRoute allowedRoles={["FACULTY"]}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/faculty/study-materials" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Study Material Not Found</h1>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchMaterial} className="ml-4 text-sm underline hover:text-red-800">Retry</button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!material) return null;

  return (
    <ProtectedRoute allowedRoles={["FACULTY"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/faculty/study-materials" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{material.title}</h1>
              <p className="text-gray-600 mt-1">Manage study material details and resources</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              material.isPublished
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {material.isPublished ? "Published" : "Draft"}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              material.isActive
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {material.isActive ? "Active" : "Inactive"}
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
            <label htmlFor="course" className="text-sm font-medium text-gray-700 block mb-1.5">
              Course
            </label>
            <input
              id="course"
              type="text"
              value={getCourseName(material.course)}
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
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div>
            <label htmlFor="materialType" className="text-sm font-medium text-gray-700 block mb-1.5">
              Material Type <span className="text-destructive">*</span>
            </label>
            <select
              id="materialType"
              value={formData.materialType}
              onChange={(e) => handleChange("materialType", e.target.value)}
              className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                typeError ? "border-destructive" : "border-gray-300"
              }`}
            >
              {materialTypes.map((type) => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>
            {typeError && <p className="text-xs text-destructive mt-1">{typeError}</p>}
          </div>

          <div>
            <label htmlFor="resourceUrl" className="text-sm font-medium text-gray-700 block mb-1.5">
              Resource URL <span className="text-destructive">*</span>
            </label>
            <input
              id="resourceUrl"
              type="url"
              value={formData.resourceUrl}
              onChange={(e) => handleChange("resourceUrl", e.target.value)}
              placeholder="https://example.com/document.pdf"
              className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                resourceUrlError ? "border-destructive" : "border-gray-300"
              }`}
            />
            {resourceUrlError && <p className="text-xs text-destructive mt-1">{resourceUrlError}</p>}
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

          <div>
            <label htmlFor="subject" className="text-sm font-medium text-gray-700 block mb-1.5">
              Subject
            </label>
            <input
              id="subject"
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange("subject", e.target.value)}
              placeholder="e.g., Physics, Mathematics, Chemistry"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button type="submit" size="lg" isLoading={saving} loadingLabel="Saving...">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <a
              href={material.resourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark hover:bg-primary/10 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View Resource
            </a>
          </div>
        </form>

        {/* Read-only Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Study Material ID</dt>
              <dd className="font-mono text-gray-900">{material._id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="font-medium text-gray-900">{getTypeLabel(material.materialType)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium text-gray-900">{new Date(material.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="font-medium text-gray-900">{new Date(material.updatedAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Published</dt>
              <dd className="font-medium text-gray-900">{material.isPublished ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Active</dt>
              <dd className="font-medium text-gray-900">{material.isActive ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Subject</dt>
              <dd className="font-medium text-gray-900">{material.subject || "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </ProtectedRoute>
  );
}