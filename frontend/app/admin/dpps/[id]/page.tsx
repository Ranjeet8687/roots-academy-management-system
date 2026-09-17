"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminApi, DPP, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Trash2, CheckCircle, XCircle, FileText, Plus, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

export default function DPPDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const dppId = params.id as string;

  const [dpp, setDPP] = useState<DPP & { questions?: Question[] } | null>(null);
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
    scheduledDate: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    questions: [] as Question[],
  });
  const [titleError, setTitleError] = useState("");
  const [dateError, setDateError] = useState("");
  const [questionsError, setQuestionsError] = useState<Record<number, string>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      fetchDPP();
      fetchCourses();
    }
  }, [authLoading, user, dppId]);

  const fetchDPP = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await adminApi.getDPPById(accessToken, dppId);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setDPP(result.data);
        // Format scheduledDate for date input (YYYY-MM-DD)
        const formatForDateInput = (dateStr: string) => {
          const date = new Date(dateStr);
          return date.toISOString().split('T')[0];
        };
        setFormData({
          title: result.data.title,
          description: result.data.description || "",
          courseId: typeof result.data.course === "object" ? result.data.course._id : result.data.course,
          scheduledDate: formatForDateInput(result.data.scheduledDate),
          duration: result.data.duration.toString(),
          totalMarks: result.data.totalMarks.toString(),
          passingMarks: result.data.passingMarks.toString(),
          questions: (result.data as any).questions ? (result.data as any).questions.map((q: any) => ({
            questionText: q.questionText,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            marks: q.marks || 1,
          })) : [],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch DPP");
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

  const addQuestion = () => {
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, { questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "", marks: 1 }]
    }));
  };

  const removeQuestion = (index: number) => {
    if (formData.questions.length <= 1) return;
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => i === index ? { ...q, [field]: value } : q)
    }));
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === "title") setTitleError("");
    if (field === "scheduledDate") setDateError("");
  };

  const validate = () => {
    let valid = true;
    if (!formData.title.trim()) {
      setTitleError("DPP title is required");
      valid = false;
    }
    if (!formData.scheduledDate) {
      setDateError("Scheduled date is required");
      valid = false;
    }
    if (!formData.totalMarks || parseInt(formData.totalMarks) <= 0) {
      setError("Total marks must be greater than 0");
      valid = false;
    }
    if (!formData.passingMarks || parseInt(formData.passingMarks) <= 0) {
      setError("Passing marks must be greater than 0");
      valid = false;
    }
    if (parseInt(formData.passingMarks) > parseInt(formData.totalMarks)) {
      setError("Passing marks cannot exceed total marks");
      valid = false;
    }

    // Validate questions
    const newQuestionsError: Record<number, string> = {};
    formData.questions.forEach((q, i) => {
      if (!q.questionText.trim()) {
        newQuestionsError[i] = `Question ${i + 1}: Question text is required`;
        valid = false;
      }
      if (q.options.filter(o => o.trim()).length < 2) {
        newQuestionsError[i] = `Question ${i + 1}: At least 2 options are required`;
        valid = false;
      }
      if (!q.correctAnswer) {
        newQuestionsError[i] = `Question ${i + 1}: Correct answer must be selected`;
        valid = false;
      }
      if (q.marks <= 0) {
        newQuestionsError[i] = `Question ${i + 1}: Marks must be greater than 0`;
        valid = false;
      }
    });
    setQuestionsError(newQuestionsError);

    return valid;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !dpp) return;

    setSaving(true);
    setError(null);

    try {
      const result = await adminApi.updateDPP(accessToken, dpp._id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        questions: formData.questions.map(q => ({
          questionText: q.questionText.trim(),
          options: q.options.filter(o => o.trim()),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation?.trim(),
          marks: q.marks,
        })),
      });

      const updatedDPP = result.data;

      if (result.error) {
        setError(result.error);
      } else if (updatedDPP) {
        setDPP(updatedDPP);
        setFormData(prev => ({ ...prev, title: updatedDPP.title }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update DPP");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !dpp) return;

    setDeleting(true);
    try {
      const result = await adminApi.deleteDPP(accessToken, dpp._id);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/admin/dpps");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete DPP");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleTogglePublish = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !dpp) return;

    try {
      const result = await adminApi.toggleDPPPublish(accessToken, dpp._id, !dpp.isPublished);
      if (result.data) {
        setDPP(result.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update publish status");
    }
  };

  const handleToggleActivate = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || !dpp) return;

    try {
      const result = await adminApi.toggleDPPActivate(accessToken, dpp._id, !dpp.isActive);
      if (result.data) {
        setDPP(result.data);
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

  if (error && !dpp) {
    return (
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/admin/dpps" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DPP Not Found</h1>
              <p className="text-gray-600 mt-1">{error}</p>
            </div>
          </div>
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
            <button onClick={fetchDPP} className="ml-4 text-sm underline hover:text-red-800">Retry</button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!dpp) return null;

  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/dpps" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{dpp.title}</h1>
              <p className="text-gray-600 mt-1">Manage DPP details and questions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePublish}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dpp.isPublished
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {dpp.isPublished ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {dpp.isPublished ? "Published" : "Draft"}
            </button>
            <button
              onClick={handleToggleActivate}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                dpp.isActive
                  ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {dpp.isActive ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {dpp.isActive ? "Active" : "Inactive"}
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
              DPP Title <span className="text-destructive">*</span>
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
              rows={3}
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label htmlFor="scheduledDate" className="text-sm font-medium text-gray-700 block mb-1.5">
                Scheduled Date <span className="text-destructive">*</span>
              </label>
              <input
                id="scheduledDate"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleChange("scheduledDate", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  dateError ? "border-destructive" : "border-gray-300"
                }`}
              />
              {dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}
            </div>
            <div>
              <label htmlFor="duration" className="text-sm font-medium text-gray-700 block mb-1.5">
                Duration (minutes)
              </label>
              <input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleChange("duration", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="totalMarks" className="text-sm font-medium text-gray-700 block mb-1.5">
                Total Marks
              </label>
              <input
                id="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => handleChange("totalMarks", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="1"
              />
            </div>
            <div>
              <label htmlFor="passingMarks" className="text-sm font-medium text-gray-700 block mb-1.5">
                Passing Marks
              </label>
              <input
                id="passingMarks"
                type="number"
                value={formData.passingMarks}
                onChange={(e) => handleChange("passingMarks", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="1"
              />
            </div>
          </div>

          {/* Questions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                <Plus className="h-4 w-4 mr-1" />
                Add Question
              </Button>
            </div>

            <div className="space-y-4">
              {formData.questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                    {formData.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeQuestion(qIndex)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">
                        Question Text <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        value={question.questionText}
                        onChange={(e) => updateQuestion(qIndex, "questionText", e.target.value)}
                        rows={2}
                        placeholder="Enter question text"
                        className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                          questionsError[qIndex] ? "border-destructive" : "border-gray-300"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">
                        Options (minimum 2) <span className="text-destructive">*</span>
                      </label>
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`question-${qIndex}-correct`}
                              checked={question.correctAnswer === option}
                              onChange={() => updateQuestion(qIndex, "correctAnswer", option)}
                              className="h-4 w-4 text-primary"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options];
                                newOptions[oIndex] = e.target.value;
                                updateQuestion(qIndex, "options", newOptions);
                              }}
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                            {question.options.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newOptions = question.options.filter((_, i) => i !== oIndex);
                                  updateQuestion(qIndex, "options", newOptions);
                                  if (question.correctAnswer === option) {
                                    updateQuestion(qIndex, "correctAnswer", newOptions[0] || "");
                                  }
                                }}
                                className="text-gray-500 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuestion(qIndex, "options", [...question.options, ""])}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Option
                        </Button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1.5">
                        Explanation (optional)
                      </label>
                      <textarea
                        value={question.explanation || ""}
                        onChange={(e) => updateQuestion(qIndex, "explanation", e.target.value)}
                        rows={2}
                        placeholder="Explanation for the correct answer"
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                          Marks <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="number"
                          value={question.marks}
                          onChange={(e) => updateQuestion(qIndex, "marks", parseInt(e.target.value) || 1)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  {questionsError[qIndex] && (
                    <p className="text-xs text-destructive mt-2">{questionsError[qIndex]}</p>
                  )}
                </div>
              ))}
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
          <p className="text-gray-600 mb-4">Once you delete this DPP, there is no going back. Please be certain.</p>
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
              "Delete DPP"
            )}
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete DPP</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete "{dpp.title}"? This action cannot be undone.</p>
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
                  {deleting ? "Deleting..." : "Delete DPP"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}