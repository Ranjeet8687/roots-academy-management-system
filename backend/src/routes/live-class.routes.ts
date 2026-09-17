import { Router } from 'express';
import {
  createLiveClass,
  getAllLiveClasses,
  getLiveClassById,
  updateLiveClass,
  deleteLiveClass,
  toggleLiveClassPublish,
  toggleLiveClassActivate,
  getStudentCourseLiveClasses,
  getStudentLiveClass
} from '../controllers/live-class.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/rbac.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas for route params
const liveClassIdParam = z.object({
  params: z.object({
    id: z.string().refine((val) => val.length === 24, 'Invalid live class ID')
  })
});

const courseIdParam = z.object({
  params: z.object({
    courseId: z.string().refine((val) => val.length === 24, 'Invalid course ID')
  })
});

// ADMIN routes - full live class management
router.post(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  createLiveClass
);

router.get(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  getAllLiveClasses
);

router.get(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(liveClassIdParam),
  getLiveClassById
);

router.put(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(liveClassIdParam),
  updateLiveClass
);

router.delete(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(liveClassIdParam),
  deleteLiveClass
);

router.patch(
  '/:id/publish',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(liveClassIdParam),
  toggleLiveClassPublish
);

router.patch(
  '/:id/activate',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(liveClassIdParam),
  toggleLiveClassActivate
);

// FACULTY routes - manage live classes they are assigned to
// Note: Faculty-course assignment not yet implemented, so faculty gets same access as admin for now
// This is a limitation that should be addressed when faculty-course assignment is added
router.get(
  '/faculty/my-live-classes',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  getAllLiveClasses // Will be filtered by faculty in controller when assignment is implemented
);

router.get(
  '/faculty/live-classes/:id',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  validate(liveClassIdParam),
  getLiveClassById
);

router.put(
  '/faculty/live-classes/:id',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  validate(liveClassIdParam),
  updateLiveClass
);

// STUDENT routes - view published/active live classes for enrolled courses
router.get(
  '/course/:courseId',
  authenticate,
  authorizeRole(UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY),
  validate(courseIdParam),
  getStudentCourseLiveClasses
);

router.get(
  '/:id',
  authenticate,
  authorizeRole(UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY),
  validate(liveClassIdParam),
  getStudentLiveClass
);

export default router;