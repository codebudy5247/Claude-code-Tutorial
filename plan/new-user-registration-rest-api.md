# Implementation Plan: New User Registration REST API

## Context

The CLAUDE.md describes a module-based architecture with JWT authentication, but the actual codebase is a skeleton with only Express + Mongoose + basic error handling. The spec requires implementing user registration with password hashing (bcrypt), JWT tokens (access + refresh), and proper validation (Zod).

This is a greenfield implementation — no auth, user, or shared modules exist yet.

---

## Dependencies to Install

```bash
pnpm add bcrypt jsonwebtoken zod
pnpm add -D @types/bcrypt @types/jsonwebtoken
```

---

## Implementation Steps

### 1. Update Config (`src/config/env.ts`)

Add JWT-related environment variables:
- `JWT_SECRET` (required)
- `JWT_EXPIRES_IN` (default: `15m`)
- `REFRESH_SECRET` (required)
- `REFRESH_EXPIRES_IN` (default: `7d`)

Update `validate()` to require `JWT_SECRET` and `REFRESH_SECRET`.

### 2. Restructure to Module-Based Architecture

Per CLAUDE.md, the codebase should use:
- `src/modules/` — feature modules
- `src/shared/` — cross-cutting infrastructure

**Move existing code:**
- `src/config/env.ts` → `src/shared/config/env.ts`
- `src/config/database.ts` → `src/shared/config/database.ts`
- `src/middlewares/errorHandler.ts` → `src/shared/middlewares/errorHandler.ts`
- `src/utils/logger.ts` → `src/shared/utils/logger.ts`

### 3. Create Auth Module (`src/modules/auth/`)

Files to create:
- `auth.types.ts` — `TokenPair`, `TokenPayload`, `AuthResult` types
- `auth.schema.ts` — `RegisterSchema` (Zod) with `name`, `email`, `password` fields
- `auth.service.ts` — `hashPassword()`, `generateTokens()`, `verifyAccessToken()`, `register()`
- `auth.controller.ts` — thin handler calling `AuthService.register()`
- `auth.routes.ts` — `POST /auth/register` route
- `index.ts` — re-exports router as default

### 4. Create User Module (`src/modules/user/`)

Files to create:
- `user.types.ts` — `IUser`, `PublicUser` types
- `user.model.ts` — Mongoose schema with `email`, `passwordHash`, `refreshTokens[]`
- `user.service.ts` — `createUser()`, `findUserByEmail()`
- `index.ts` — re-exports router and types

### 5. Create Shared Utilities

- `src/shared/utils/cookie.ts` — `setRefreshTokenCookie()`, `clearRefreshTokenCookie()`
- `src/shared/middlewares/auth.middleware.ts` — `requireAuth`, `optionalAuth` (for future use)

### 6. Update `src/app.ts`

- Import `authRouter` from `@modules/auth`
- Mount at `/auth` — no auth required for registration

### 7. Update `src/server.ts`

- Add `import 'module-alias/register'` as first import (for path aliases to work)

### 8. Create Tests (`tests/auth.register.test.ts`)

Test cases from spec:
- Success with valid name/email/password → 201
- Missing name → 400
- Missing email → 400
- Missing password → 400
- Invalid email format → 400
- Password < 8 chars → 400
- Duplicate email → 409
- Response excludes `passwordHash` and `refreshTokens`

---

## Critical Files

| Action | File |
|--------|------|
| Create | `src/modules/auth/auth.types.ts` |
| Create | `src/modules/auth/auth.schema.ts` |
| Create | `src/modules/auth/auth.service.ts` |
| Create | `src/modules/auth/auth.controller.ts` |
| Create | `src/modules/auth/auth.routes.ts` |
| Create | `src/modules/auth/index.ts` |
| Create | `src/modules/user/user.types.ts` |
| Create | `src/modules/user/user.model.ts` |
| Create | `src/modules/user/user.service.ts` |
| Create | `src/modules/user/index.ts` |
| Create | `src/shared/utils/cookie.ts` |
| Create | `src/shared/middlewares/auth.middleware.ts` |
| Move | `src/config/env.ts` → `src/shared/config/env.ts` |
| Move | `src/config/database.ts` → `src/shared/config/database.ts` |
| Move | `src/middlewares/errorHandler.ts` → `src/shared/middlewares/errorHandler.ts` |
| Move | `src/utils/logger.ts` → `src/shared/utils/logger.ts` |
| Modify | `src/app.ts` |
| Modify | `src/server.ts` |

---

## Verification

1. Run `pnpm typecheck` — should have no errors
2. Run `pnpm build` — should compile successfully
3. Run `pnpm dev` and test:
   ```bash
   curl -X POST http://localhost:3000/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test","email":"test@example.com","password":"password123"}'
   ```
   Should return 201 with `user` (no passwordHash) and `accessToken`
4. Run tests: `pnpm test` (if test script added)