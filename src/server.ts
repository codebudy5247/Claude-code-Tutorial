import 'module-alias/register';

import app from './app';
import database from '@shared/config/database';
import logger from '@shared/utils/logger';
import config from '@shared/config/env';

const { port, appName, nodeEnv } = config.get();

async function startServer() {
  try {
    await database.connect();

    app.listen(port, () => {
      logger.info(`${appName} is running`, { port, environment: nodeEnv });
      logger.info(`Health check: http://localhost:${port}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await database.disconnect();
  process.exit(0);
});

startServer();