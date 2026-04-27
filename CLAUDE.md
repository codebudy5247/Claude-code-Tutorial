# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Commands

```bash
pnpm dev          # Run development server with hot reload (ts-node-dev)
pnpm build        # Compile TypeScript to dist/
pnpm start        # Run production server from dist/
pnpm typecheck    # Run tsc --noEmit (type check without emitting)
```
---

## Architecture

Express 5 + Mongoose 9 + TypeScript API server with JWT-based authentication.

### Entry Flow
`src/server.ts` → connects MongoDB → starts Express listener. Handles SIGINT/SIGTERM for graceful shutdown.

### Request Pipeline
`src/app.ts` → JSON body parsing → request logging → public routes (`/auth/*`) → `requireAuth` middleware → protected routes → 404 handler → error handler (last).

### Config (`src/shared/config/env.ts`)
Singleton `Config` class validates env vars at startup. Throws on missing required vars. Provides `isDevelopment()` / `isProduction()` / `isTest()` helpers.

### Error Handling (`src/shared/middlewares/errorHandler.ts`)
- `AppError` class for operational errors with `statusCode`
- `asyncHandler` wrapper eliminates try/catch boilerplate in route handlers
- Handles `ZodError` (400 with field-level messages), Mongoose `ValidationError`, `CastError`, `MongoServerError` (duplicate key 11000)
- Auth errors must use `AppError` with 401/403 — never bypass the central handler

### Logging (`src/shared/utils/logger.ts`)
Console logger with ISO timestamps. Redacts passwords in MongoDB URI logs (`//user:****@`). Debug level only in development or when `LOG_LEVEL=DEBUG`. **Never log tokens, passwords, or raw JWTs.**

### Authentication (`src/shared/middlewares/auth.middleware.ts`)
JWT-based stateless auth. Access tokens are short-lived (15m). Refresh tokens are long-lived (7d), stored hashed in the DB, and rotated on every use. All token errors surface as `AppError(401)`.

---

## Project Structure

The codebase uses a **module-based (feature-first) folder structure**. Every feature owns its routes, controller, service, model, schema, and types in one folder. Shared infrastructure lives in `src/shared/`. Nothing feature-specific bleeds into shared and nothing shared bleeds into a feature module.

```
src/
  app.ts                          # Express app: middleware stack, mounts module routers
  server.ts                       # Entry point: DB connect, listen, graceful shutdown

  modules/                        # One folder per domain feature
    auth/                         # ✅ Implemented
      auth.routes.ts              # Express router — POST /auth/register
      auth.controller.ts          # Request/response only — calls AuthService, sets cookies
      auth.service.ts             # Business logic — bcrypt, JWT sign/verify, token generation
      auth.schema.ts              # Zod schemas — RegisterSchema
      auth.types.ts               # Types local to auth — TokenPair, TokenPayload, AuthResult
      index.ts                    # Re-exports router as default, types as named exports

    user/                         # ✅ Implemented
      user.routes.ts              # Express router — (empty, ready for future routes)
      user.service.ts             # createUser, findUserByEmail, toPublicUser
      user.model.ts               # Mongoose schema + model — IUser, IUserDocument
      user.types.ts               # Types — IUser, IUserDocument, PublicUser
      index.ts                    # Re-exports router + types

    # future modules follow the same pattern:
    # product/, order/, payment/, notification/, …

  shared/                         # Cross-cutting infrastructure — no feature logic
    middlewares/
      errorHandler.ts             # AppError class, asyncHandler, ZodError + Mongoose error handling
      auth.middleware.ts          # requireAuth, optionalAuth — reads JWT, sets req.user

    config/
      env.ts                      # Config singleton — validates all env vars at startup
      database.ts                 # Mongoose connection singleton

    utils/
      logger.ts                   # Console logger with ISO timestamps, redacts secrets
      cookie.ts                   # setRefreshTokenCookie / clearRefreshTokenCookie helpers

    types/
      express.d.ts                # Augments Express.Request with req.user?: IUserDocument
```

### Module anatomy — every module follows this layout (create files as needed)

```
modules/<name>/
  <name>.routes.ts        # Router only — mount middleware + controllers, no logic
  <name>.controller.ts    # Parse req → call service → send res. No DB, no business rules
  <name>.service.ts       # All business logic. Pure functions where possible
  <name>.model.ts         # Mongoose Schema + model (only in data-owning modules)
  <name>.schema.ts        # Zod validation schemas (input DTOs)
  <name>.types.ts         # Types and interfaces scoped to this module
  index.ts                # Public API of the module — only export what consumers need
```

### Module `index.ts` — the public boundary

Each module exposes a clean public API. Consumers import from the module index, never from internal files.

```typescript
// src/modules/user/index.ts
export { default as userRouter } from './user.routes';
export type { IUser, PublicUser } from './user.types';
// userService, userController, userModel are NOT exported — internal only
```

```typescript
// ✅ Cross-module import — always use the module index
import { userRouter } from '@modules/user';
import type { IUser } from '@modules/user';

// ❌ Never import from internal module files
import { UserService } from '@modules/user/user.service'; // FORBIDDEN
import { UserModel } from '@modules/user/user.model';     // FORBIDDEN
```

### Path aliases — use aliases, never relative `../../` chains

Configured in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@modules/*": ["src/modules/*"],
      "@shared/*": ["src/shared/*"]
    }
  }
}
```

Runtime resolution via `module-alias` (configured in `package.json` `_moduleAliases`):
```typescript
// src/server.ts — must be the first import
import 'module-alias/register';
```

```typescript
// ✅ Always use path aliases
import { requireAuth } from '@shared/middlewares/auth.middleware';
import logger from '@shared/utils/logger';
import config from '@shared/config/env';

// ❌ Never use deep relative imports across modules
import { requireAuth } from '../../shared/middlewares/auth.middleware';
```

### App router registration — `app.ts` mounts modules

```typescript
// src/app.ts
import { authRouter } from '@modules/auth';
import { userRouter } from '@modules/user';

// Public routes
app.use('/auth', authRouter);

// Protected routes — requireAuth applied at router level
app.use('/users', requireAuth, userRouter);
```

### Adding a new module — checklist

1. Create `src/modules/<name>/` with all six files (routes, controller, service, model, schema, types) + `index.ts`
2. Export only the router and public types from `index.ts`
3. Register the router in `src/app.ts`
4. Add path alias if needed in `tsconfig.json`
5. Update this file under **Project Structure**

> **Never create a file at `src/models/`, `src/routes/`, `src/services/` or `src/controllers/` (flat).** All feature code lives inside `src/modules/<name>/`. Only truly shared infrastructure goes in `src/shared/`.

---

## Environment Variables

| Variable              | Default                              | Required | Description                          |
|-----------------------|--------------------------------------|----------|--------------------------------------|
| `PORT`                | `3000`                               | No       | Server port                          |
| `NODE_ENV`            | `development`                        | No       | Runtime mode                         |
| `MONGO_URI`           | `mongodb://localhost:27017/test_db`  | **Yes**  | MongoDB connection string            |
| `LOG_LEVEL`           | `info`                               | No       | Log verbosity (`debug` / `info`)     |
| `APP_NAME`            | `API`                                | No       | Display name in health check         |
| `JWT_SECRET`          | —                                    | **Yes**  | Secret for signing access tokens     |
| `JWT_EXPIRES_IN`      | `15m`                                | No       | Access token lifetime                |
| `REFRESH_SECRET`      | —                                    | **Yes**  | Separate secret for refresh tokens   |
| `REFRESH_EXPIRES_IN`  | `7d`                                 | No       | Refresh token lifetime               |

> **Never commit `.env` to version control.** Provide a `.env.example` with all keys and placeholder values.

---

## Authentication Conventions

- **Passwords:** bcrypt with `saltRounds = 12`. Never store plaintext. Never log raw passwords.
- **Access token:** JWT, 15m expiry, signed with `JWT_SECRET`, payload `{ sub: userId, iat, exp }`.
- **Refresh token:** JWT, 7d expiry, signed with `REFRESH_SECRET`. Store only the **hashed** value in DB (`User.refreshTokens[]`). Rotate on every `/auth/refresh` call (invalidate old, issue new).
- **Token transmission:** Access token in `Authorization: Bearer <token>` header. Refresh token in an `HttpOnly; Secure; SameSite=Strict` cookie.
- **Logout:** Remove the hashed refresh token from `User.refreshTokens[]`. The access token expires naturally (keep expiry short).
- **Auth errors:** Always use `new AppError('Unauthorized', 401)` or `new AppError('Forbidden', 403)`. Route through the central error handler.
- **Protected routes:** Wrap handlers with `asyncHandler(requireAuth)` before the route handler. Never add auth logic inline in route files.

---

## TypeScript Rules

### Strict Mode — Always On
`tsconfig.json` must include:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Never Use `any`
```typescript
// ❌ Bad
function parse(data: any) { ... }

// ✅ Good — use unknown and narrow
function parse(data: unknown) {
  if (typeof data !== 'object' || data === null) throw new AppError('Invalid data', 400);
  // narrow further as needed
}
```

### Prefer `type` over `interface` for pure shapes; use `interface` for extensible contracts
```typescript
// Domain shapes → type
type TokenPayload = { sub: string; iat: number; exp: number };

// Extensible contracts (e.g., service interfaces) → interface
interface AuthService {
  generateTokens(userId: string): Promise<TokenPair>;
  verifyAccessToken(token: string): TokenPayload;
}
```

### Augment Express types — never cast `req` to `any`
```typescript
// src/types/express.d.ts
import { IUser } from '../models/User';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
```

### Use `satisfies` for config objects
```typescript
const config = {
  saltRounds: 12,
  jwtAlgorithm: 'HS256',
} satisfies Partial<AuthConfig>;
```

### Avoid enums — use `as const` objects
```typescript
// ❌ TypeScript enum (generates runtime code, tricky to tree-shake)
enum Role { Admin = 'admin', User = 'user' }

// ✅ const object + derived type
const Role = { Admin: 'admin', User: 'user' } as const;
type Role = typeof Role[keyof typeof Role];
```

### Async — always `async/await`, never `.then().catch()` chains in route handlers
```typescript
// ❌ Bad
router.get('/me', requireAuth, (req, res, next) => {
  UserService.findById(req.user!.id)
    .then(user => res.json(user))
    .catch(next);
});

// ✅ Good
router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await UserService.findById(req.user.id);
  res.json(user);
}));
```

### Return types — always annotate async service functions
```typescript
// ❌ Inferred — breaks when refactoring
async function generateTokens(userId: string) { ... }

// ✅ Explicit
async function generateTokens(userId: string): Promise<TokenPair> { ... }
```

---

## Express + Node.js Conventions

### Route files are thin — no business logic
Route files only: validate input shape, call a service, return the response. All logic lives in `services/`.

```typescript
// ✅ Correct route handler shape
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body as LoginDto;
  const tokens = await AuthService.login(email, password);
  setRefreshTokenCookie(res, tokens.refreshToken);
  res.status(200).json({ accessToken: tokens.accessToken });
}));
```

### Input validation
Validate and strip unknown fields before passing to services. Use `zod` (preferred) or `express-validator`. Never trust `req.body` directly in services.

```typescript
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const { email, password } = LoginSchema.parse(req.body); // throws ZodError → caught by asyncHandler → errorHandler
```

### Error handling — never throw raw errors in routes
Always throw `AppError` or let Zod/Mongoose errors bubble to the central handler. Never send `res.status(500).json(err)` manually.

### HTTP status codes
| Situation                        | Code |
|----------------------------------|------|
| Success with body                | 200  |
| Created resource                 | 201  |
| Success, no body                 | 204  |
| Validation / bad input           | 400  |
| Missing or invalid token         | 401  |
| Valid token, insufficient perms  | 403  |
| Resource not found               | 404  |
| Duplicate key / conflict         | 409  |
| Unhandled server error           | 500  |

### Never block the event loop
Use `async` Mongoose operations. Never use `fs.readFileSync` or CPU-heavy sync operations in request handlers.

---

## Mongoose Conventions

### Always define an `IDocument` interface for each model
```typescript
import { Document, Model } from 'mongoose';

export interface IUser {
  email: string;
  passwordHash: string;
  refreshTokens: string[];     // hashed refresh tokens
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {}
export interface IUserModel extends Model<IUserDocument> {}
```

### Schema options — always enable timestamps
```typescript
const UserSchema = new Schema<IUserDocument, IUserModel>(
  { ... },
  { timestamps: true, versionKey: false }
);
```

### Sensitive fields — always exclude from queries by default
```typescript
UserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.refreshTokens;
    return ret;
  },
});
```

### Use `.lean()` for read-only queries — returns plain objects, faster
```typescript
const user = await User.findById(id).lean<IUser>();
```

### Index fields used in queries
Use `unique: true` on the schema field definition. **Do not** add a duplicate `schema.index()` call — Mongoose will warn about duplicate indexes.
```typescript
// ✅ unique: true on the field already creates the index
email: { type: String, required: true, unique: true, lowercase: true, trim: true }

// ❌ Don't also call schema.index() — causes Mongoose duplicate index warning
UserSchema.index({ email: 1 }, { unique: true });
```

---

## Security Checklist

- [ ] `JWT_SECRET` and `REFRESH_SECRET` are at least 64 random characters
- [ ] Refresh tokens stored hashed (`bcrypt` or `crypto.createHash('sha256')`)
- [ ] `HttpOnly; Secure; SameSite=Strict` on refresh token cookie
- [ ] `helmet()` middleware applied in `app.ts`
- [ ] Rate limiting on `/auth/*` routes (`express-rate-limit`)
- [ ] `CORS` origin whitelist configured (not `*` in production)
- [ ] Mongoose query projections exclude `passwordHash` and `refreshTokens` by default
- [ ] No secrets, tokens, or passwords in logs

---

## Code Style

### Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Files | `kebab-case` | `auth.service.ts`, `rate-limiter.ts` |
| Variables & functions | `camelCase` | `generateTokens`, `hashedToken` |
| Classes | `PascalCase` | `AppError`, `AuthService` |
| Interfaces & types | `PascalCase` | `IUser`, `TokenPayload` |
| Zod schemas | `PascalCase` + `Schema` suffix | `LoginSchema`, `RegisterSchema` |
| Constants | `SCREAMING_SNAKE_CASE` | `SALT_ROUNDS`, `MAX_REFRESH_TOKENS` |
| Route path segments | `kebab-case` | `/auth/refresh-token`, `/users/me` |
| Env variables | `SCREAMING_SNAKE_CASE` | `JWT_SECRET`, `REFRESH_EXPIRES_IN` |

### Formatting

- **Indentation:** 2 spaces. No tabs.
- **Quotes:** Single quotes for all strings except JSON and template literals.
- **Semicolons:** Always. No ASI reliance.
- **Trailing commas:** Always in multi-line objects, arrays, and function params (`"trailingComma": "all"` in Prettier).
- **Max line length:** 100 characters. Break long chains or function args across lines.
- **Blank lines:** One blank line between top-level declarations. No consecutive blank lines inside a function.
- **Brace style:** Always use braces for `if`/`else`/`for` — even single-line bodies.

```typescript
// ❌ Bad — no braces, inconsistent quotes
if (token) return res.status(401).json({error: "Unauthorized"})

// ✅ Good
if (!token) {
  throw new AppError('Unauthorized', 401);
}
```

### Imports — order and grouping

Always group imports in this order, separated by a blank line. ESLint `import/order` enforces this.

```typescript
// 1. Node built-ins
import crypto from 'node:crypto';

// 2. Third-party packages
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';

// 3. Internal path aliases — shared first, then modules
import { AppError } from '@middlewares/errorHandler';
import { logger } from '@utils/logger';
import { Config } from '@config/env';
import type { IUser } from '@modules/user';

// 4. Relative imports (only within the same module folder)
import { LoginSchema } from './auth.schema';
import type { TokenPair } from './auth.types';
```

- Prefer `import type` for type-only imports — erased at compile time, prevents circular dependency issues.
- Never use `require()` in `.ts` files.
- Never use default exports except for Express routers and Mongoose models.

### Functions

- Prefer named `function` declarations for top-level service functions — better stack traces.
- Use arrow functions for callbacks, middleware helpers, and inline handlers.
- Keep functions under 40 lines. If it's longer, split it.
- One responsibility per function. If the name needs "and", split it.

```typescript
// ✅ Named declaration for service functions
async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

// ✅ Arrow for inline callbacks
UserSchema.pre('save', async function () {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await hashPassword(this.passwordHash);
  }
});
```

### Comments

- Write comments for **why**, not **what**. The code says what; comments say why.
- Use `// TODO: <reason>` for known gaps. Never leave `// TODO` without context.
- Use JSDoc (`/** */`) only on exported service functions and public types — not on internals.
- Never commit commented-out code. Delete it; git remembers.

```typescript
// ❌ Noise comment — restates the code
// Hash the password
const hash = await bcrypt.hash(password, SALT_ROUNDS);

// ✅ Useful comment — explains the decision
// Store only the hash — never the plaintext. saltRounds=12 is the current OWASP recommendation.
const hash = await bcrypt.hash(password, SALT_ROUNDS);
```

---

## Warnings and Things to Avoid

These are patterns that cause bugs, security issues, or maintenance problems in this codebase. Claude Code must never introduce them, even if a tutorial, Stack Overflow answer, or earlier version of the code uses them.

### Security

**Never store plaintext passwords or tokens.**
```typescript
// ❌ NEVER
user.password = req.body.password;
user.refreshToken = token;

// ✅ Always hash
user.passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
user.refreshTokens.push(crypto.createHash('sha256').update(token).digest('hex'));
```

**Never expose internal error details to the client.**
```typescript
// ❌ Leaks stack traces and DB internals
res.status(500).json({ error: err.message, stack: err.stack });

// ✅ Let the central error handler decide what to expose
throw new AppError('Something went wrong', 500);
```

**Never use `*` for CORS in production.** Always whitelist explicit origins in `Config`.

**Never put secrets in code.** Not even in tests. Use `process.env` and `.env.test`.

**Never trust `req.body` without Zod validation.** Even for admin routes.

### TypeScript

**Never use non-null assertion (`!`) without a guard.**
```typescript
// ❌ Crashes at runtime if req.user is undefined
const id = req.user!.id;

// ✅ Guard first — requireAuth middleware guarantees this, but be explicit
if (!req.user) { throw new AppError('Unauthorized', 401); }
const id = req.user.id;
```

**Never use `as` casts to silence type errors.** Fix the type instead.
```typescript
// ❌ Hiding a real problem
const body = req.body as LoginDto;

// ✅ Validate and parse — Zod narrows the type correctly
const body = LoginSchema.parse(req.body);
```

**Never use `@ts-ignore` or `@ts-nocheck`.** Use `@ts-expect-error` with a comment if truly unavoidable, and open a follow-up ticket.

### Express

**Never call `next()` after sending a response.**
```typescript
// ❌ Causes "headers already sent" crash
res.json({ ok: true });
next();

// ✅ Return after sending
return res.json({ ok: true });
```

**Never use `res.send()` for JSON responses.** Always use `res.json()` — it sets `Content-Type` correctly.

**Never mutate `req.body` directly.** Parse into a new variable with Zod.

**Never add route-specific middleware globally in `app.ts`.** Rate limiters, auth, and validators belong on the router or individual route.

### Mongoose

**Never use `findById` + `save` for simple field updates — use `findByIdAndUpdate`.**
```typescript
// ❌ Two round-trips, race condition risk
const user = await User.findById(id);
user!.email = newEmail;
await user!.save();

// ✅ Atomic single round-trip
await User.findByIdAndUpdate(id, { email: newEmail }, { new: true, runValidators: true });
```

**Never use `Model.find()` without a limit in list endpoints.** Unbounded queries will OOM under load.
```typescript
// ❌ Returns entire collection
const users = await User.find({});

// ✅ Always paginate
const users = await User.find({}).limit(pageSize).skip(page * pageSize).lean();
```

**Never disable Mongoose validators on update.** Always pass `{ runValidators: true }`.

**Never use `{ strict: false }` on schemas.** It allows arbitrary fields to be saved to the DB.

### General

**Never `console.log` in production code.** Use `logger.info` / `logger.debug` / `logger.error`. The logger handles levels and formatting.

**Never use `setTimeout` / `setInterval` as a workaround for async timing issues.** Fix the root cause.

**Never return `undefined` implicitly from an `async` function** that callers depend on. Be explicit with return types.

**Never push directly to `main`.** All changes go through a branch + PR, even solo work.