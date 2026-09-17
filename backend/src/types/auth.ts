import { Request } from 'express';
import { JWTPayload } from '../utils/jwt';
import { RegisterInput, LoginInput, RefreshInput } from '../validators/auth';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

export { RegisterInput, LoginInput, RefreshInput };