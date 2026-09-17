import { Router } from 'express';
import {
  enrollStudent,
  getStudentEnrollments,
  getMyCourses
} from '../controllers/enrollment.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/rbac.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Admin routes - manage enrollments
router.post(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  enrollStudent
);

// Student routes - view their own courses
router.get(
  '/my-courses',
  authenticate,
  getMyCourses
);

// Admin routes - view any student's enrollments
router.get(
  '/student/:studentId',
  authenticate,
  (req, res, next) => {
    // Students can only access their own enrollments
    if (req.user?.role === UserRole.STUDENT && req.user.userId !== req.params.studentId) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other students\' enrollments' });
    }
    next();
  },
  authorizeRole(UserRole.ADMIN, UserRole.STUDENT),
  getStudentEnrollments
);

export default router;