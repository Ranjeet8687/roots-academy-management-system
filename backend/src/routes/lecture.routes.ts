import { Router } from 'express';
import {
  createLecture,
  getAllLectures,
  getLectureById,
  updateLecture,
  deleteLecture,
  toggleLecturePublish,
  getStudentCourseLectures,
  getStudentLecture
} from '../controllers/lecture.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/rbac.middleware';
import { UserRole } from '../models/user.model';
import { validate } from '../middleware/validate';
import { z } from 'zod';

const router = Router();

// Validation schemas for route params
const lectureIdParam = z.object({
  params: z.object({
    id: z.string().refine((val) => val.length === 24, 'Invalid lecture ID')
  })
});

const courseIdParam = z.object({
  params: z.object({
    courseId: z.string().refine((val) => val.length === 24, 'Invalid course ID')
  })
});

// ADMIN routes - full lecture management
router.post(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  createLecture
);

router.get(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  getAllLectures
);

router.get(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(lectureIdParam),
  getLectureById
);

router.put(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(lectureIdParam),
  updateLecture
);

router.delete(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(lectureIdParam),
  deleteLecture
);

router.patch(
  '/:id/publish',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  validate(lectureIdParam),
  toggleLecturePublish
);

// FACULTY routes - manage lectures they are assigned to
// Note: Faculty-course assignment not yet implemented, so faculty gets same access as admin for now
// This is a limitation that should be addressed when faculty-course assignment is added
router.get(
  '/faculty/my-lectures',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  getAllLectures // Will be filtered by faculty in controller when assignment is implemented
);

router.get(
  '/faculty/lectures/:id',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  validate(lectureIdParam),
  getLectureById
);

router.put(
  '/faculty/lectures/:id',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  validate(lectureIdParam),
  updateLecture
);

// STUDENT routes - view published lectures for enrolled courses
router.get(
  '/course/:courseId',
  authenticate,
  authorizeRole(UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY),
  validate(courseIdParam),
  getStudentCourseLectures
);

router.get(
  '/:id',
  authenticate,
  authorizeRole(UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY),
  validate(lectureIdParam),
  getStudentLecture
);

export default router;