import multer, { FileFilterCallback, MulterError } from 'multer';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

// Allowed MIME types for file uploads
const ALLOWED_MIME_TYPES = new Set([
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  // Images
  'image/jpeg',
  'image/png',
  'image/webp',
  // Video
  'video/mp4',
]);

// Allowed file extensions
const ALLOWED_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xls',
  'xlsx',
  'txt',
  'jpg',
  'jpeg',
  'png',
  'webp',
  'mp4',
]);

// Maximum file size (configurable via env)
const MAX_FILE_SIZE = env.UPLOAD_MAX_FILE_SIZE;

// Ensure upload directory exists
const uploadDir = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Generate safe filename
function generateSafeFilename(originalName: string): string {
  const ext = path.extname(originalName).toLowerCase().replace('.', '');
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : 'bin';
  return `${timestamp}-${random}.${safeExt}`;
}

// File filter function
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimeType = file.mimetype.toLowerCase();

  const isAllowedExt = ALLOWED_EXTENSIONS.has(ext);
  const isAllowedMime = ALLOWED_MIME_TYPES.has(mimeType);

  if (isAllowedExt && isAllowedMime) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed: ${file.originalname}. Allowed types: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, JPG, JPEG, PNG, WEBP, MP4`));
  }
};

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const safeName = generateSafeFilename(file.originalname);
    cb(null, safeName);
  },
});

// Create multer upload instance
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1, // Only allow single file upload
  },
});

// Middleware to handle multer errors
export const handleUploadError = (
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`,
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ error: 'Only one file allowed per upload' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ error: 'Unexpected file field' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err.message.includes('File type not allowed')) {
    return res.status(400).json({ error: err.message });
  }

  next(err);
};

// Helper to get public URL for uploaded file
export function getFileUrl(filename: string): string {
  // In development, serve from local filesystem via a static route
  // In production, this could be replaced with Cloudinary/S3 URL
  return `/uploads/${filename}`;
}

// Helper to get file info from request
export function getUploadedFileInfo(req: Request): {
  originalName: string;
  storedName: string;
  url: string;
  mimeType: string;
  size: number;
} | null {
  if (!req.file) return null;

  return {
    originalName: req.file.originalname,
    storedName: req.file.filename,
    url: getFileUrl(req.file.filename),
    mimeType: req.file.mimetype,
    size: req.file.size,
  };
}