import express, { Application, Request, Response } from 'express';
import mongoose from 'mongoose';
import { errorHandler } from '@shared/middlewares/errorHandler';
import logger from '@shared/utils/logger';
import config from '@shared/config/env';
import { authRouter } from '@modules/auth';

interface HealthStatus {
  status: 'ok' | 'degraded' | 'unhealthy';
  uptime: number;
  memory: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  database: {
    state: string;
    connected: boolean;
  };
  environment: {
    nodeEnv: string;
    appName: string;
  };
  timestamp: string;
}

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
  const dbState = mongoose.connection.readyState;
  const dbStates: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const memoryUsage = process.memoryUsage();

  const health: HealthStatus = {
    status: dbState === 1 ? 'ok' : 'degraded',
    uptime: process.uptime(),
    memory: {
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
    },
    database: {
      state: dbStates[dbState] ?? 'unknown',
      connected: dbState === 1,
    },
    environment: {
      nodeEnv: config.get().nodeEnv,
      appName: config.get().appName,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(health.status === 'ok' ? 200 : 503).json(health);
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