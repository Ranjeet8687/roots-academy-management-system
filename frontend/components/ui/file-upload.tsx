"use client";

import { useState, useCallback } from "react";
import { Upload, X, Loader2, CheckCircle, AlertCircle, File, FileText } from "lucide-react";
import { api, UploadResponse } from "@/lib/api";

interface FileUploadProps {
  /** Current URL value (controlled) */
  value: string;
  /** Callback when URL changes */
  onChange: (url: string) => void;
  /** Accepted file types */
  accept?: string;
  /** Label for the upload button */
  label?: string;
  /** Placeholder text for the URL input */
  placeholder?: string;
  /** Helper text shown below the input */
  helperText?: string;
  /** Whether the upload is in progress (from parent) */
  isUploading?: boolean;
  /** Error message to display */
  error?: string;
  /** Success message to display */
  success?: string;
  /** Input field ID */
  id: string;
  /** Field name for the form (if used in a form) */
  name?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

const DEFAULT_ACCEPT = "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,image/jpeg,image/png,image/webp,video/mp4";

export function FileUpload({
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  label = "Upload File",
  placeholder = "Enter URL or upload a file",
  helperText,
  isUploading: externalUploading,
  error: externalError,
  success: externalSuccess,
  id,
  name,
  required,
  disabled = false,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localUploading, setLocalUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const isUploading = externalUploading || localUploading;
  const error = externalError || localError;
  const success = externalSuccess || localSuccess;

  const handleFileSelect = useCallback(
    (file: File) => {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-powerpoint",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
      ];

      if (!allowedTypes.includes(file.type)) {
        setLocalError(`File type "${file.type}" is not allowed. Allowed: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, PNG, WEBP, MP4`);
        return;
      }

      // Validate file size (100MB default from backend)
      const maxSize = 100 * 1024 * 1024;
      if (file.size > maxSize) {
        setLocalError(`File too large. Maximum size is 100MB`);
        return;
      }

      setLocalError(null);
      setLocalSuccess(null);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    },
    []
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    },
    [handleFileSelect]
  );

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const url = e.target.value;
      onChange(url);
      setLocalError(null);
      setLocalSuccess(null);
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    [onChange]
  );

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setLocalUploading(true);
    setLocalError(null);
    setLocalSuccess(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("Authentication required");
      }

      const result = await api.upload<UploadResponse>("/api/uploads", formData, accessToken);

      if (result.error) {
        setLocalError(result.error);
      } else if (result.data) {
        onChange(result.data.url);
        setLocalSuccess(`File uploaded: ${result.data.originalName}`);
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLocalUploading(false);
    }
  }, [selectedFile, onChange]);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setLocalError(null);
    setLocalSuccess(null);
    // Don't clear the URL - user might have typed one manually
  }, []);

  const handleClearUrl = useCallback(() => {
    onChange("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setLocalError(null);
    setLocalSuccess(null);
  }, [onChange]);

  const showPreview = previewUrl && (previewUrl.startsWith("blob:") || value.startsWith("blob:"));

  const isPdfPreview = selectedFile?.type === "application/pdf" || value === "application/pdf";
  const isVideoPreview = selectedFile?.type?.startsWith("video/") || previewUrl?.match(/\.(mp4|webm|mov)$/i);
  const isImagePreview = selectedFile?.type?.startsWith("image/") || previewUrl?.match(/\.(jpg|jpeg|png|webp|gif)$/i);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-gray-700 block mb-1.5">
        {label} {required && <span className="text-destructive">*</span>}
      </label>

      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            id={id}
            name={name}
            type="url"
            value={value}
            onChange={handleUrlChange}
            placeholder={placeholder}
            className={`w-full px-4 py-2.5 rounded-lg border bg-background text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              error ? "border-destructive" : "border-gray-300"
            }`}
            disabled={disabled || isUploading}
            required={required}
          />
          {value && !isUploading && !disabled && (
            <button
              type="button"
              onClick={handleClearUrl}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              aria-label="Clear URL"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {!disabled && (
          <>
            <label
              className={`relative inline-flex items-center justify-center px-4 py-2.5 rounded-lg border cursor-pointer transition-colors ${
                isUploading
                  ? "bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <input
                type="file"
                accept={accept}
                onChange={handleInputChange}
                className="sr-only"
                id={`${id}-file`}
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Upload className="h-5 w-5" />
              )}
              <span className="ml-2 hidden sm:inline">{label}</span>
            </label>

            {selectedFile && (
              <button
                type="button"
                onClick={handleUpload}
                disabled={isUploading}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload"
                )}
              </button>
            )}
          </>
        )}
      </div>

      {selectedFile && !isUploading && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <File className="h-5 w-5 text-gray-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-500">
              {Math.round(selectedFile.size / 1024)} KB • {selectedFile.type}
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemoveFile}
            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
            aria-label="Remove selected file"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {previewUrl && showPreview && (
        <div className="mt-2">
          {isPdfPreview ? (
            <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 flex items-center gap-3 max-h-32">
              <FileText className="h-8 w-8 text-red-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{selectedFile?.name || "PDF file"}</p>
                <p className="text-xs text-gray-500">PDF Document</p>
              </div>
            </div>
          ) : isVideoPreview ? (
            <video
              src={previewUrl}
              controls
              className="max-h-32 rounded-lg border border-gray-200"
            />
          ) : isImagePreview ? (
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-32 rounded-lg border border-gray-200"
            />
          ) : (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:underline"
            >
              <File className="h-4 w-4" />
              Preview file
            </a>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-1.5 text-xs text-green-700">
          <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
          {success}
        </div>
      )}

      {helperText && !error && !success && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
}