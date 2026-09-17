"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { facultyApi, LiveClass } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FacultyLiveClassDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const liveClassId = params.id as string;

  const [liveClass, setLiveClass] = useState<LiveClass | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledStart: "",
    scheduledEnd: "",
    meetingUrl: "",
    platform: "",
  });
  const [titleError, setTitleError] = useState("");
  const [meetingUrlError, setMeetingUrlError] = useState("");
  const [dateError, setDateError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      fetchLiveClass();
    }
  }, [authLoading, user, liveClassId]);

  const fetchLiveClass = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await facultyApi.getLiveClassById(accessToken, liveClassId);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setLiveClass(result.data);
        // Format dates for datetime-local input
        const formatForInput = (dateStr: string) => {
          const date = new Date(dateStr);
          // Convert to local time for datetime-local input
          const offset = date.getTimezoneOffset() * 60000;
          const localDate = new Date(date.getTime() - offset);
          return localDate.toISOString().slice(0, 16);
        };
        setFormData({
          title: result.data.title,
          description: result.data.description || "",
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

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "title") setTitleError("");
    if (field === "meetingUrl") setMeetingUrlError("");
    if (field === "scheduledStart" || field === "scheduledEnd") setDateError("");
  };

  const validate = () => {
    let valid = true;
    if (!formData.title.trim()) {
      setTitleError("Live class title is required");
      valid = false;
    }
    if (!formData.meetingUrl.trim()) {
      setMeetingUrlError("Meeting URL is required");
      valid = false;
    } else if (!/^https?:\/\/.+/.test(formData.meetingUrl)) {
      setMeetingUrlError("Please enter a valid URL");
      valid = false;
    }
    if (!formData.scheduledStart || !formData.scheduledEnd) {
      setDateError("Both start and end times are required");
      valid = false;
    } else if (new Date(formData.scheduledStart) >= new Date(formData.scheduledEnd)) {
      setDateError("Start time must be before end time");
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
      const result = await facultyApi.updateLiveClass(accessToken, liveClass._id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        scheduledStart: formData.scheduledStart ? new Date(formData.scheduledStart).toISOString() : undefined,
        scheduledEnd: formData.scheduledEnd ? new Date(formData.scheduledEnd).toISOString() : undefined,
        meetingUrl: formData.meetingUrl.trim(),
        platform: formData.platform.trim() || undefined,
      });

      const updatedLiveClass = result.data;

      if (result.error) {
        setError(result.error);
      } else if (updatedLiveClass) {
        setLiveClass(updatedLiveClass);
        setFormData((prev) => ({ ...prev, title: updatedLiveClass.title }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update live class");
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

  if (error && !liveClass) {
    return (
      <ProtectedRoute allowedRoles={["FACULTY"]}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/faculty/live-classes" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
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
    <ProtectedRoute allowedRoles={["FACULTY"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/faculty/live-classes" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{liveClass.title}</h1>
              <p className="text-gray-600 mt-1">Manage live class details and schedule</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              liveClass.isPublished
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {liveClass.isPublished ? "Published" : "Draft"}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              liveClass.isActive
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {liveClass.isActive ? "Active" : "Inactive"}
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
              Live Class Title <span className="text-destructive">*</span>
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
              value={getCourseName(liveClass.course)}
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
                  dateError ? "border-destructive" : "border-gray-300"
                }`}
              />
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
                  dateError ? "border-destructive" : "border-gray-300"
                }`}
              />
            </div>
          </div>

          {dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}

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

        {/* Read-only Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Information</h3>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">Live Class ID</dt>
              <dd className="font-mono text-gray-900">{liveClass._id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium text-gray-900">{new Date(liveClass.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="font-medium text-gray-900">{new Date(liveClass.updatedAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Published</dt>
              <dd className="font-medium text-gray-900">{liveClass.isPublished ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Active</dt>
              <dd className="font-medium text-gray-900">{liveClass.isActive ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Platform</dt>
              <dd className="font-medium text-gray-900">{liveClass.platform || "—"}</dd>
            </div>
          </dl>
        </div>
      </div>
    </ProtectedRoute>
  );
}