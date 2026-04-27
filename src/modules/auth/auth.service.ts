import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import type { TokenPair, TokenPayload, RegisterInput, AuthResult } from './auth.types';
import { UserService } from '@modules/user/user.service';
import { AppError } from '@shared/middlewares/errorHandler';
import Config from '@shared/config/env';

const SALT_ROUNDS = 12;

function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateTokens(userId: string): TokenPair {
  const config = Config.get();
  const accessToken = jwt.sign(
    { sub: userId },
    config.jwtSecret,
    { expiresIn: '15m' as jwt.SignOptions['expiresIn'] }
  );
  const refreshToken = jwt.sign(
    { sub: userId },
    config.refreshSecret,
    { expiresIn: '7d' as jwt.SignOptions['expiresIn'] }
  );
  return { accessToken, refreshToken };
}

function verifyAccessToken(token: string): TokenPayload {
  const config = Config.get();
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}

async function register(input: RegisterInput): Promise<AuthResult> {
  const config = Config.get();
  const existingUser = await UserService.findUserByEmail(input.email);
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const passwordHash = await hashPassword(input.password);
  const user = await UserService.createUser({
    name: input.name,
    email: input.email,
    passwordHash,
  });

  const tokens = generateTokens(user._id.toString());

  return {
    user: UserService.toPublicUser(user),
    accessToken: tokens.accessToken,
  };
}

export const AuthService = {
  register,
  generateTokens,
  verifyAccessToken,
  hashPassword,
};