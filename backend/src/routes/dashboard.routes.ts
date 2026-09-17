import { Router } from 'express';
import {
  getAdminDashboard,
  getFacultyDashboard,
  getStudentDashboard
} from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorizeRole } from '../middleware/rbac.middleware';
import { UserRole } from '../models/user.model';

const router = Router();

// ADMIN dashboard - ADMIN only
router.get(
  '/admin',
  authenticate,
  authorizeRole(UserRole.ADMIN),
  getAdminDashboard
);

// FACULTY dashboard - FACULTY only
router.get(
  '/faculty',
  authenticate,
  authorizeRole(UserRole.FACULTY),
  getFacultyDashboard
);

// STUDENT dashboard - STUDENT only
router.get(
  '/student',
  authenticate,
  authorizeRole(UserRole.STUDENT),
  getStudentDashboard
);

export default router;