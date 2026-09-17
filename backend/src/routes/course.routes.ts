import { Router } from 'express';
import {
  createCourse,
  getActiveCourses,
  getCourseById,
  updateCourse
} from '../controllers/course.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/rbac.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// Public routes
router.get('/', getActiveCourses);
router.get('/:id', getCourseById);

// Admin routes
router.post(
  '/',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  createCourse
);

router.put(
  '/:id',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  updateCourse
);

export default router;