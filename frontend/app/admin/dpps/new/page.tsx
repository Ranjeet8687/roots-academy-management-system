"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { adminApi, Course } from "@/lib/api";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Loader2, ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Question {
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  marks: number;
}

export default function NewDPPPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [courseId, setCourseId] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [duration, setDuration] = useState("60");
  const [totalMarks, setTotalMarks] = useState("");
  const [passingMarks, setPassingMarks] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    { questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "", marks: 1 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState("");
  const [courseError, setCourseError] = useState("");
  const [dateError, setDateError] = useState("");
  const [questionsError, setQuestionsError] = useState<Record<number, string>>({});

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

  const addQuestion = () => {
    setQuestions(prev => [...prev, { questionText: "", options: ["", "", "", ""], correctAnswer: "", explanation: "", marks: 1 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number | string[]) => {
    setQuestions(prev => prev.map((q, i) => i === index ? { ...q, [field]: value } : q));
  };

  const validate = () => {
    let valid = true;
    if (!title.trim()) {
      setTitleError("DPP title is required");
      valid = false;
    }
    if (!courseId) {
      setCourseError("Please select a course");
      valid = false;
    }
    if (!scheduledDate) {
      setDateError("Scheduled date is required");
      valid = false;
    }
    if (!totalMarks || parseInt(totalMarks) <= 0) {
      setError("Total marks must be greater than 0");
      valid = false;
    }
    if (!passingMarks || parseInt(passingMarks) <= 0) {
      setError("Passing marks must be greater than 0");
      valid = false;
    }
    if (parseInt(passingMarks) > parseInt(totalMarks)) {
      setError("Passing marks cannot exceed total marks");
      valid = false;
    }

    // Validate questions
    const newQuestionsError: Record<number, string> = {};
    questions.forEach((q, i) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const result = await adminApi.createDPP(accessToken, {
        title: title.trim(),
        description: description.trim() || undefined,
        courseId,
        questions: questions.map(q => ({
          questionText: q.questionText.trim(),
          options: q.options.filter(o => o.trim()),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation?.trim(),
          marks: q.marks,
        })),
        scheduledDate: new Date(scheduledDate).toISOString(),
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        router.push(`/admin/dpps/${result.data._id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create DPP");
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dpps"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create DPP</h1>
            <p className="text-gray-600 mt-1">Create a new Daily Practice Problem set</p>
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
              DPP Title <span className="text-destructive">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(""); }}
              placeholder="e.g., DPP 1 - Algebra Basics"
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
              rows={3}
              placeholder="DPP description (optional)"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="scheduledDate" className="text-sm font-medium text-gray-700 block mb-1.5">
                Scheduled Date <span className="text-destructive">*</span>
              </label>
              <input
                id="scheduledDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => { setScheduledDate(e.target.value); setDateError(""); }}
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
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="60"
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
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
                placeholder="100"
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
                value={passingMarks}
                onChange={(e) => setPassingMarks(e.target.value)}
                placeholder="40"
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
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Question {qIndex + 1}</h4>
                    {questions.length > 1 && (
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
            <Button type="submit" size="lg" isLoading={loading} loadingLabel="Creating...">
              <Save className="h-4 w-4 mr-2" />
              Create DPP
            </Button>
            <Link
              href="/admin/dpps"
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