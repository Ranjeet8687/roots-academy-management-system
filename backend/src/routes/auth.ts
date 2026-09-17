import { Router, RequestHandler } from 'express';
import { register, login, refresh, me, logout } from '../controllers/auth';
import { validate } from '../middleware/validate';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', validate(registerSchema), register as RequestHandler);
router.post('/login', validate(loginSchema), login as RequestHandler);
router.post('/refresh', validate(refreshSchema), refresh as RequestHandler);
router.get('/me', requireAuth, me as RequestHandler);
router.post('/logout', requireAuth, logout as RequestHandler);

export default router;