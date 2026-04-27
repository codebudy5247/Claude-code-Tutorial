import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterSchema } from './auth.schema';
import type { RegisterDto } from './auth.schema';
import { setRefreshTokenCookie } from '@shared/utils/cookie';

async function register(req: Request, res: Response): Promise<void> {
  const body = RegisterSchema.parse(req.body) as RegisterDto;
  const result = await AuthService.register(body);

  setRefreshTokenCookie(res, result.accessToken);

  res.status(201).json({
    user: result.user,
    accessToken: result.accessToken,
  });
}

export const AuthController = {
  register,
};