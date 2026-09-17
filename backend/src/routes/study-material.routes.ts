import { Router } from 'express';
import {
  createStudyMaterial,
  getAllStudyMaterials,
  getStudyMaterialById,
  updateStudyMaterial,
  deleteStudyMaterial,
  toggleStudyMaterialPublish,
  toggleStudyMaterialActivate,
  getStudentCourseStudyMaterials,
  getStudentStudyMaterial
} from '../controllers/study-material.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/rbac.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas for route params
const studyMaterialIdParam = z.object({
  params: z.object({
    id: z.string().refine((val) => val.length === 24, 'Invalid study material ID')
  })
});

const courseIdParam = z.object({
  params: z.object({
    courseId: z.string().refine((val) => val.length === 24, 'Invalid course ID')
  })
});

// ADMIN routes - full Study Material management
router.post(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  createStudyMaterial
);

router.get(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  getAllStudyMaterials
);

router.get(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(studyMaterialIdParam),
  getStudyMaterialById
);

router.put(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(studyMaterialIdParam),
  updateStudyMaterial
);

router.delete(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(studyMaterialIdParam),
  deleteStudyMaterial
);

router.patch(
  '/:id/publish',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(studyMaterialIdParam),
  toggleStudyMaterialPublish
);

router.patch(
  '/:id/activate',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(studyMaterialIdParam),
  toggleStudyMaterialActivate
);

// FACULTY routes - manage Study Materials they are assigned to
// Note: Faculty-course assignment not yet implemented, so faculty gets same access as admin for now
// This is a limitation that should be addressed when faculty-course assignment is added
router.get(
  '/faculty/my-study-materials',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  getAllStudyMaterials // Will be filtered by faculty in controller when assignment is implemented
);

router.get(
  '/faculty/study-materials/:id',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  validate(studyMaterialIdParam),
  getStudyMaterialById
);

router.put(
  '/faculty/study-materials/:id',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  validate(studyMaterialIdParam),
  updateStudyMaterial
);

// STUDENT routes - view published/active Study Materials for enrolled courses
router.get(
  '/course/:courseId',
  authenticate,
  authorizeRole(UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY),
  validate(courseIdParam),
  getStudentCourseStudyMaterials
);

router.get(
  '/:id',
  authenticate,
  authorizeRole(UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY),
  validate(studyMaterialIdParam),
  getStudentStudyMaterial
);

export default router;