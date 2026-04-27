import express, { Application, Request, Response } from 'express';
import { errorHandler } from '@shared/middlewares/errorHandler';
import logger from '@shared/utils/logger';
import config from '@shared/config/env';
import { authRouter } from '@modules/auth';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next) => {
  logger.info(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query
  });
  next();
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    app: config.get().appName,
    environment: config.get().nodeEnv,
    timestamp: new Date().toISOString()
  });
});

app.use('/auth', authRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

app.use(errorHandler);

export default app;