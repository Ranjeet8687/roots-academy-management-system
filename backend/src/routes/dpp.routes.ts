import { Router } from 'express';
import {
  createDPP,
  getAllDPPs,
  getDPPById,
  updateDPP,
  deleteDPP,
  toggleDPPPublish,
  toggleDPPActivate,
  getStudentCourseDPPs,
  getStudentDPP
} from '../controllers/dpp.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/rbac.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas for route params
const dppIdParam = z.object({
  params: z.object({
    id: z.string().refine((val) => val.length === 24, 'Invalid DPP ID')
  })
});

const courseIdParam = z.object({
  params: z.object({
    courseId: z.string().refine((val) => val.length === 24, 'Invalid course ID')
  })
});

// ADMIN routes - full DPP management
router.post(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  createDPP
);

router.get(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  getAllDPPs
);

router.get(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(dppIdParam),
  getDPPById
);

router.put(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(dppIdParam),
  updateDPP
);

router.delete(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(dppIdParam),
  deleteDPP
);

router.patch(
  '/:id/publish',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(dppIdParam),
  toggleDPPPublish
);

router.patch(
  '/:id/activate',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(dppIdParam),
  toggleDPPActivate
);

// FACULTY routes - manage DPPs they are assigned to
// Note: Faculty-course assignment not yet implemented, so faculty gets same access as admin for now
// This is a limitation that should be addressed when faculty-course assignment is added
router.get(
  '/faculty/my-dpps',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  getAllDPPs // Will be filtered by faculty in controller when assignment is implemented
);

router.get(
  '/faculty/dpps/:id',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  validate(dppIdParam),
  getDPPById
);

router.put(
  '/faculty/dpps/:id',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  validate(dppIdParam),
  updateDPP
);

// STUDENT routes - view published/active DPPs for enrolled courses
router.get(
  '/course/:courseId',
  authenticate,
  authorizeRole(UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY),
  validate(courseIdParam),
  getStudentCourseDPPs
);

router.get(
  '/:id',
  authenticate,
  authorizeRole(UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY),
  validate(dppIdParam),
  getStudentDPP
);

export default router;