# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev    # Run development server with hot reload (ts-node-dev)
pnpm build  # Compile TypeScript to dist/
pnpm start  # Run production server from dist/
```

## Architecture

Express 5 + Mongoose 9 + TypeScript API server.

### Entry Flow
`src/server.ts` → connects MongoDB → starts Express listener. Handles SIGINT/SIGTERM graceful shutdown.

### Request Pipeline
`src/app.ts` → JSON body parsing → request logging → routes → 404 handler → error handler (last).

### Config (`src/config/env.ts`)
Singleton Config class validates env vars at startup. Throws on missing `MONGO_URI` or invalid `PORT`. Provides `isDevelopment()`/`isProduction()`/`isTest()` helpers.

### Error Handling (`src/middlewares/errorHandler.ts`)
- `AppError` class for operational errors with statusCode
- `asyncHandler` wrapper for route handlers
- Handles Mongoose ValidationError, CastError, MongoServerError (duplicate key 11000)

### Logging (`src/utils/logger.ts`)
Console logger with ISO timestamps. Redacts passwords in MongoDB URI logs (`//user:****@`). Debug level only in development or when `LOG_LEVEL=DEBUG`.

## Project Structure

```
src/
  app.ts              # Express app setup, middleware, routes
  server.ts           # Entry point, database connect, graceful shutdown
  config/
    env.ts            # Config class with validation
    database.ts       # Mongoose connection singleton
  middlewares/
    errorHandler.ts   # Error handling middleware, AppError, asyncHandler
  utils/
    logger.ts         # Console logger
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| NODE_ENV | development | runtime mode |
| MONGO_URI | mongodb://localhost:27017/test_db | MongoDB connection string |
| LOG_LEVEL | info | Log verbosity |
| APP_NAME | API | Display name in health check |