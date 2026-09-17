import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../models/user.model';
import { getUploadedFileInfo, handleUploadError } from '../middleware/upload.middleware';

/**
 * POST /api/uploads
 * Upload a single file (ADMIN and FACULTY only)
 * Returns file info including URL for use in content creation
 */
export const uploadFile = [
  // Multer middleware with error handling
  (req: Request, res: Response, next: NextFunction) => {
    const uploadMiddleware = require('../middleware/upload.middleware').upload.single('file');
    uploadMiddleware(req, res, (err: Error) => {
      if (err) {
        return handleUploadError(err, req, res, next);
      }
      next();
    });
  },
  // Controller logic
  async (req: Request, res: Response) => {
    try {
      // Check authentication
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check authorization - only ADMIN and FACULTY can upload
      if (req.user.role !== UserRole.ADMIN && req.user.role !== UserRole.FACULTY) {
        return res.status(403).json({ error: 'Forbidden: Only admins and faculty can upload files' });
      }

      // Get file info
      const fileInfo = getUploadedFileInfo(req);
      if (!fileInfo) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Return file information
      res.status(201).json({
        ...fileInfo,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload file' });
    }
  },
];

/**
 * GET /api/uploads/:filename
 * Serve uploaded file (with authentication check for private files)
 * Note: This is a fallback - in production, use a CDN or static file server
 */
export const serveFile = async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;

    // Security: Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const fs = require('fs');
    const path = require('path');
    const { env } = require('../config/env');

    const uploadDir = path.resolve(env.UPLOAD_DIR);
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // For now, serve all uploaded files to authenticated users
    // In production, you might want to check permissions based on content ownership
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
};

/**
 * DELETE /api/uploads/:filename
 * Delete an uploaded file (ADMIN only)
 */
export const deleteFile = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Only ADMIN can delete uploaded files
    if (req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Forbidden: Only admins can delete files' });
    }

    const { filename } = req.params;

    // Security: Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const fs = require('fs');
    const path = require('path');
    const { env } = require('../config/env');

    const uploadDir = path.resolve(env.UPLOAD_DIR);
    const filePath = path.join(uploadDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }

    // Delete the file
    fs.unlinkSync(filePath);

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};