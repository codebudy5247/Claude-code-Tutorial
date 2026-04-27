import type { Request, Response, NextFunction } from 'express';
import { AuthService } from '@modules/auth/auth.service';
import { AppError } from './errorHandler';

export function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Unauthorized', 401);
  }

  const token = authHeader.slice(7);
  try {
    const payload = AuthService.verifyAccessToken(token);
    req.user = { _id: payload.sub } as any;
    next();
  } catch {
    throw new AppError('Unauthorized', 401);
  }
}

export function optionalAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.slice(7);
  try {
    const payload = AuthService.verifyAccessToken(token);
    req.user = { _id: payload.sub } as any;
  } catch {
    // Invalid token, but optional - continue without user
  }
  next();
}