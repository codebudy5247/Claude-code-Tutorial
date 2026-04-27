import { Router } from 'express';
import type { Router as ExpressRouter } from 'express';
import { AuthController } from './auth.controller';
import { asyncHandler } from '@shared/middlewares/errorHandler';

const router: ExpressRouter = Router();

router.post('/register', asyncHandler(AuthController.register));

export default router;