# Project Structure

Full directory tree for reference — see `CLAUDE.md` for high-level overview.

```
src/
  app.ts                 # Express app: middleware, mounts routers
  server.ts              # Entry point: DB connect, listen, graceful shutdown
  modules/               # Feature-first modules
    auth/                # Registration, login, refresh, logout
      routes.ts          # /auth/register, /auth/login, /auth/refresh, /auth/logout
      controller.ts      # Request handlers
      service.ts         # Business logic
      model.ts            # User model
      schema.ts          # Zod schemas for validation
      types.ts           # Auth-specific types
      index.ts           # Public boundary: exports router + types
    user/                # User model and queries
      model.ts
      schema.ts
      types.ts
      index.ts
  shared/                # Cross-cutting infrastructure
    middlewares/
      errorHandler.ts    # AppError, asyncHandler, ZodError/Mongoose handling
      auth.middleware.ts # requireAuth, optionalAuth
    config/
      env.ts             # Config singleton with env validation
      database.ts        # Mongoose connection singleton
    utils/
      logger.ts          # Console logger with ISO timestamps
      cookie.ts          # setRefreshTokenCookie / clearRefreshTokenCookie
    types/
      express.d.ts       # req.user augmentation
```

## Module Anatomy

Each module lives in `src/modules/<name>/` with up to 7 files:

| File | Purpose |
|------|---------|
| `routes.ts` | Express route definitions |
| `controller.ts` | Request handlers — thin, delegates to service |
| `service.ts` | Business logic — where real work happens |
| `model.ts` | Mongoose model definition |
| `schema.ts` | Zod validation schemas |
| `types.ts` | Module-specific TypeScript types |
| `index.ts` | Public boundary — only export router and public types |

### Import Rule

Always import from the module `index.ts`, never internal files:

```typescript
// ✅
import { userRouter } from '@modules/user';

// ❌ FORBIDDEN
import { UserService } from '@modules/user/user.service';
```

### Path Aliases

The project uses `module-alias` for clean imports across modules:

| Alias | Resolves to |
|-------|-------------|
| `@modules/*` | `src/modules/*` |
| `@shared/*` | `src/shared/*` |
| `@/*` | `src/*` |

**Critical**: `import 'module-alias/register'` must be the **first** import in `src/server.ts`.