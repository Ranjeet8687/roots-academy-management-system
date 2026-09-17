"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminApi, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NewLiveClassPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [scheduledStart, setScheduledStart] = useState("");
  const [scheduledEnd, setScheduledEnd] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [platform, setPlatform] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState("");
  const [courseError, setCourseError] = useState("");
  const [startError, setStartError] = useState("");
  const [endError, setEndError] = useState("");
  const [meetingUrlError, setMeetingUrlError] = useState("");

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
    if (!scheduledStart) {
      setStartError("Scheduled start time is required");
      valid = false;
    }
    if (!scheduledEnd) {
      setEndError("Scheduled end time is required");
      valid = false;
    }
    if (!meetingUrl.trim()) {
      setMeetingUrlError("Meeting URL is required");
      valid = false;
    } else if (!/^https?:\/\/.+/.test(meetingUrl)) {
      setMeetingUrlError("Please enter a valid URL");
      valid = false;
    }
    if (scheduledStart && scheduledEnd && new Date(scheduledStart) >= new Date(scheduledEnd)) {
      setEndError("End time must be after start time");
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
      const result = await adminApi.createLiveClass(accessToken, {
        title: title.trim(),
        description: description.trim() || undefined,
        courseId,
        scheduledStart: new Date(scheduledStart).toISOString(),
        scheduledEnd: new Date(scheduledEnd).toISOString(),
        meetingUrl: meetingUrl.trim(),
        platform: platform.trim() || undefined,
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        router.push(`/admin/live-classes/${result.data._id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create live class");
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
            href="/admin/live-classes"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Live Class</h1>
            <p className="text-gray-600 mt-1">Create a new live class session</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center gap-2">
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
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
              placeholder="e.g., Live Q&A Session - Week 1"
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
            <label htmlFor="description" className="text-sm font-medium text-gray-700 block mb-1.5">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Live class description (optional)"
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
                value={scheduledStart}
                onChange={(e) => { setScheduledStart(e.target.value); setStartError(""); setEndError(""); }}
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
                value={scheduledEnd}
                onChange={(e) => { setScheduledEnd(e.target.value); setEndError(""); }}
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
              value={meetingUrl}
              onChange={(e) => { setMeetingUrl(e.target.value); setMeetingUrlError(""); }}
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
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="e.g., Zoom, Google Meet, Microsoft Teams (optional)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
            <Button type="submit" size="lg" isLoading={loading} loadingLabel="Creating...">
              <Save className="h-4 w-4 mr-2" />
              Create Live Class
            </Button>
            <Link
              href="/admin/live-classes"
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