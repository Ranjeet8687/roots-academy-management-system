import { Router } from 'express';
import { uploadFile, serveFile, deleteFile } from '../controllers/upload.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/rbac.middleware';
import { UserRole } from '../models/user.model';
import { z } from 'zod';

const router = Router();

// Validation schema for filename param
const filenameParam = z.object({
  params: z.object({
    filename: z.string().min(1).max(255),
  }),
});

// POST /api/uploads - Upload a file (ADMIN and FACULTY)
router.post(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.FACULTY),
  uploadFile
);

// GET /api/uploads/:filename - Serve uploaded file (authenticated users)
router.get(
  '/:filename',
  authenticate,
  authorizeRole(UserRole.ADMIN, UserRole.FACULTY, UserRole.STUDENT),
  serveFile
);

// DELETE /api/uploads/:filename - Delete uploaded file (ADMIN only)
router.delete(
  '/:filename',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  deleteFile
);

export default router;