"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { facultyApi, DPP } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Award, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DPPQuestion {
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  marks?: number;
}

export default function FacultyDPPDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const dppId = params.id as string;

  const [dpp, setDPP] = useState<DPP | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    scheduledDate: "",
    duration: "",
    totalMarks: "",
    passingMarks: "",
    questions: [] as DPPQuestion[],
  });
  const [titleError, setTitleError] = useState("");
  const [dateError, setDateError] = useState("");
  const [questionsError, setQuestionsError] = useState("");

  useEffect(() => {
    if (!authLoading && user) {
      fetchDPP();
    }
  }, [authLoading, user, dppId]);

  const fetchDPP = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      setError(null);
      const result = await facultyApi.getDPPById(accessToken, dppId);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setDPP(result.data);
        // Format date for datetime-local input
        const formatForInput = (dateStr: string) => {
          const date = new Date(dateStr);
          const offset = date.getTimezoneOffset() * 60000;
          const localDate = new Date(date.getTime() - offset);
          return localDate.toISOString().slice(0, 16);
        };
        setFormData({
          title: result.data.title,
          description: result.data.description || "",
          scheduledDate: formatForInput(result.data.scheduledDate),
          duration: result.data.duration?.toString() || "",
          totalMarks: result.data.totalMarks?.toString() || "",
          passingMarks: result.data.passingMarks?.toString() || "",
          questions: result.data.questions?.map((q: any) => ({
            questionText: q.questionText,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || "",
            marks: q.marks || 1,
          })) || [],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch DPP");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "title") setTitleError("");
    if (field === "scheduledDate") setDateError("");
  };

  const handleQuestionChange = (index: number, field: string, value: string | string[]) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[index] = { ...newQuestions[index], [field]: value };
      return { ...prev, questions: newQuestions };
    });
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          questionText: "",
          options: [],
          correctAnswer: "",
          explanation: "",
          marks: 1,
        },
      ],
    }));
  };

  const removeQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const addOption = (questionIndex: number) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: [...(newQuestions[questionIndex].options || []), ""],
      };
      return { ...prev, questions: newQuestions };
    });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: newQuestions[questionIndex].options?.filter((_, i) => i !== optionIndex) || [],
      };
      return { ...prev, questions: newQuestions };
    });
  };

  const handleOptionChange = (questionIndex: number, optionIndex: number, value: string) => {
    setFormData((prev) => {
      const newQuestions = [...prev.questions];
      const newOptions = [...(newQuestions[questionIndex].options || [])];
      newOptions[optionIndex] = value;
      newQuestions[questionIndex] = { ...newQuestions[questionIndex], options: newOptions };
      return { ...prev, questions: newQuestions };
    });
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
    if (formData.questions.length === 0) {
      setQuestionsError("At least one question is required");
      valid = false;
    } else {
      const hasEmptyQuestion = formData.questions.some(
        (q) => !q.questionText.trim() || !q.correctAnswer.trim()
      );
      if (hasEmptyQuestion) {
        setQuestionsError("All questions must have text and a correct answer");
        valid = false;
      }
    }
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
      const result = await facultyApi.updateDPP(accessToken, dpp._id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        scheduledDate: formData.scheduledDate ? new Date(formData.scheduledDate).toISOString() : undefined,
        questions: formData.questions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options?.filter((opt) => opt.trim()) || [],
          correctAnswer: q.correctAnswer.trim(),
          explanation: q.explanation?.trim() || undefined,
          marks: q.marks || 1,
        })),
      });

      const updatedDPP = result.data;

      if (result.error) {
        setError(result.error);
      } else if (updatedDPP) {
        setDPP(updatedDPP);
        setFormData((prev) => ({ ...prev, title: updatedDPP.title }));
      } else {
        setError("Unexpected response from server");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update DPP");
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

  if (error && !dpp) {
    return (
      <ProtectedRoute allowedRoles={["FACULTY"]}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/faculty/dpps" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
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
    <ProtectedRoute allowedRoles={["FACULTY"]}>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/faculty/dpps" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{dpp.title}</h1>
              <p className="text-gray-600 mt-1">Manage DPP details and questions</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              dpp.isPublished
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {dpp.isPublished ? "Published" : "Draft"}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
              dpp.isActive
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}>
              {dpp.isActive ? "Active" : "Inactive"}
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
            <label htmlFor="course" className="text-sm font-medium text-gray-700 block mb-1.5">
              Course
            </label>
            <input
              id="course"
              type="text"
              value={getCourseName(dpp.course)}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="scheduledDate" className="text-sm font-medium text-gray-700 block mb-1.5">
                Scheduled Date <span className="text-destructive">*</span>
              </label>
              <input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => handleChange("scheduledDate", e.target.value)}
                className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  dateError ? "border-destructive" : "border-gray-300"
                }`}
              />
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
                placeholder="e.g., 60"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="1"
              />
            </div>
          </div>

          {dateError && <p className="text-xs text-destructive mt-1">{dateError}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="totalMarks" className="text-sm font-medium text-gray-700 block mb-1.5">
                Total Marks
              </label>
              <input
                id="totalMarks"
                type="number"
                value={formData.totalMarks}
                onChange={(e) => handleChange("totalMarks", e.target.value)}
                placeholder="e.g., 100"
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
                placeholder="e.g., 40"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                min="1"
              />
            </div>
          </div>

          {/* Questions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
              <button type="button" onClick={addQuestion} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark">
                <Plus className="h-4 w-4" />
                Add Question
              </button>
            </div>

            {formData.questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No questions added yet. Click "Add Question" to start.
              </div>
            ) : (
              <div className="space-y-6">
                {formData.questions.map((question, qIndex) => (
                  <div key={qIndex} className="border border-gray-200 rounded-lg p-5 bg-gray-50">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        disabled={formData.questions.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                          Question Text <span className="text-destructive">*</span>
                        </label>
                        <textarea
                          value={question.questionText}
                          onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Enter the question..."
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                          Options (for MCQ) - Leave empty for open-ended
                        </label>
                        <div className="space-y-2">
                          {question.options?.map((option, oIndex) => (
                            <div key={oIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...(question.options || [])];
                                  newOptions[oIndex] = e.target.value;
                                  handleQuestionChange(qIndex, "options", newOptions);
                                }}
                                placeholder={`Option ${oIndex + 1}`}
                                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                              />
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(qIndex)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary-dark"
                          >
                            <Plus className="h-4 w-4" />
                            Add Option
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1.5">
                            Correct Answer <span className="text-destructive">*</span>
                          </label>
                          <input
                            type="text"
                            value={question.correctAnswer}
                            onChange={(e) => handleQuestionChange(qIndex, "correctAnswer", e.target.value)}
                            placeholder="Enter correct answer"
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-700 block mb-1.5">
                            Marks
                          </label>
                          <input
                            type="number"
                            value={question.marks || 1}
                            onChange={(e) => handleQuestionChange(qIndex, "marks", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            min="1"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1.5">
                          Explanation
                        </label>
                        <textarea
                          value={question.explanation || ""}
                          onChange={(e) => handleQuestionChange(qIndex, "explanation", e.target.value)}
                          rows={2}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Explanation for the correct answer (optional)"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {questionsError && <p className="text-xs text-destructive mt-2">{questionsError}</p>}
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
              <dt className="text-gray-500">DPP ID</dt>
              <dd className="font-mono text-gray-900">{dpp._id}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Created</dt>
              <dd className="font-medium text-gray-900">{new Date(dpp.createdAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Last Updated</dt>
              <dd className="font-medium text-gray-900">{new Date(dpp.updatedAt).toLocaleDateString()}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Published</dt>
              <dd className="font-medium text-gray-900">{dpp.isPublished ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Active</dt>
              <dd className="font-medium text-gray-900">{dpp.isActive ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Questions</dt>
              <dd className="font-medium text-gray-900">{dpp.questions?.length || 0}</dd>
            </div>
          </dl>
        </div>
      </div>
    </ProtectedRoute>
  );
}