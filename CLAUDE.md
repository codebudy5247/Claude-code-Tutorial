# CLAUDE.md

Express 5 + Mongoose 9 + TypeScript API with JWT authentication.

---

## Commands

```bash
pnpm dev        # Run development server (ts-node-dev)
pnpm build      # Compile TypeScript to dist/
pnpm start      # Run production server from dist/
pnpm typecheck  # Type check without emitting
```

---

## Tech Stack

- **Runtime**: Node.js, Express 5
- **Language**: TypeScript (strict mode)
- **Database**: MongoDB + Mongoose 9
- **Auth**: JWT (access 15m, refresh 7d) + bcrypt
- **Validation**: Zod
- **Package manager**: pnpm

---

## Project Structure

```
src/
  app.ts                 # Express app: middleware, mounts routers
  server.ts              # Entry point: DB connect, listen, graceful shutdown
  modules/               # Feature-first modules
    auth/                # Registration, login, refresh, logout
    user/                # User model and queries
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

### Module anatomy

Each module lives in `src/modules/<name>/` with up to 7 files: routes, controller, service, model, schema, types, and `index.ts` as the public boundary.

**Always import from the module index, never internal files:**
```typescript
// ✅
import { userRouter } from '@modules/user';

// ❌ FORBIDDEN
import { UserService } from '@modules/user/user.service';
```

### Path aliases

```typescript
// ✅ Always use path aliases
import { requireAuth } from '@shared/middlewares/auth.middleware';

// ❌ Never use relative ../../ chains across modules
```

Runtime resolution: `module-alias/register` must be the first import in `src/server.ts`.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Access token signing secret (min 64 chars) |
| `REFRESH_SECRET` | Yes | Refresh token signing secret (min 64 chars) |
| `JWT_EXPIRES_IN` | No | Access token lifetime (default: 15m) |
| `REFRESH_EXPIRES_IN` | No | Refresh token lifetime (default: 7d) |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Runtime mode (default: development) |

---

## Critical Conventions

### Authentication

- Access token → `Authorization: Bearer <token>` header
- Refresh token → `HttpOnly; Secure; SameSite=Strict` cookie
- Refresh tokens stored **hashed** in DB (`User.refreshTokens[]`), rotated on every use
- Auth errors: `new AppError('Unauthorized', 401)` or `AppError('Forbidden', 403)` — always route through the central error handler

### Error Handling

`src/shared/middlewares/errorHandler.ts` handles all operational errors including Zod validation (400 with field-level messages), Mongoose errors, and token errors.

### Security (non-negotiable)

- Never store plaintext passwords or tokens
- Never expose internal error details to the client (no `err.stack` in responses)
- Never use `*` for CORS in production
- Never trust `req.body` without Zod validation
- Never log tokens, passwords, or raw JWTs

### TypeScript

- Use `unknown` instead of `any` — narrow with guards
- Use `type` for pure shapes, `interface` for extensible contracts
- Use `satisfies` for config objects
- Avoid enums — use `as const` objects instead
- Always annotate async service function return types
- Never use non-null assertion (`!`) without a guard

### Express

- Route files are thin — no business logic, call services only
- Validate input with Zod before passing to services
- Never call `next()` after sending a response
- Never use `res.send()` for JSON — always `res.json()`
- Never add route-specific middleware (auth, rate limiters) globally in `app.ts`

### Mongoose

- Use `findByIdAndUpdate` for simple field updates — never `findById` + `save`
- Always paginate list queries with `.limit()`
- Always pass `{ runValidators: true }` on updates
- Never use `{ strict: false }` on schemas
- Use `.lean()` for read-only queries

---

## Known Gotchas

- `src/server.ts`: `import 'module-alias/register'` must be the **first** import
- Module `index.ts`: only export the router and public types — keep internals private
- `User.refreshTokens[]`: stores **hashed** tokens, not plaintext
- `Config` singleton throws on missing required env vars at startup
- `tsconfig.json` enables `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`

---

## Key Files

- `src/app.ts` — middleware stack and router registration
- `src/server.ts` — startup and graceful shutdown
- `src/shared/middlewares/errorHandler.ts` — central error handling
- `src/shared/middlewares/auth.middleware.ts` — JWT verification
- `src/modules/auth/` — auth routes, service, and types
- `src/modules/user/` — user model and public types
