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

`src/` — Express app entry. `src/modules/` — feature modules (auth, user). `src/shared/` — middleware, config, utils. Full details: `agent_docs/project-structure.md`

---

## Environment Variables

Configure `MONGO_URI`, `JWT_SECRET`, and `REFRESH_SECRET` — others have sensible defaults (`PORT`: 3000, `NODE_ENV`: development, token lifetimes: 15m/7d).

---

## Critical Conventions

Detailed conventions: `agent_docs/code-conventions.md`

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

Keep routes thin — validate with Zod, delegate to services. Never call `next()` after sending, never use `res.send()` for JSON.

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

Full reference: `agent_docs/project-structure.md`

- `src/app.ts` — middleware stack and router registration
- `src/server.ts` — startup and graceful shutdown
- `src/shared/middlewares/errorHandler.ts` — central error handling
- `src/shared/middlewares/auth.middleware.ts` — JWT verification
- `src/modules/auth/` — auth routes, service, and types
- `src/modules/user/` — user model and public types
