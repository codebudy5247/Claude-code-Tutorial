# Code Conventions

Detailed conventions for working in this codebase. See `CLAUDE.md` for the summary.

## Authentication

- **Access token**: `Authorization: Bearer <token>` header, 15m lifetime
- **Refresh token**: `HttpOnly; Secure; SameSite=Strict` cookie, 7d lifetime, stored **hashed** in `User.refreshTokens[]`, rotated on every use
- Auth errors: `new AppError('Unauthorized', 401)` or `AppError('Forbidden', 403)` — always route through the central error handler

### Token Storage Rules

- Never store plaintext tokens in the database
- Always hash refresh tokens before storing: `bcrypt.hash(token, 10)`
- Verify tokens using the secrets from env vars, never decode without verification

## Error Handling

`src/shared/middlewares/errorHandler.ts` handles all operational errors:

- **Zod validation**: Returns 400 with field-level messages
- **Mongoose errors**: CastError (bad ObjectId), ValidationError (schema violations)
- **Token errors**: Expired, invalid, missing tokens return 401
- **Custom AppError**: Any operational error with status code

## Security (Non-Negotiable)

- Never store plaintext passwords or tokens
- Never expose `err.stack` or internal error details to client
- Never use `*` for CORS in production — always whitelist specific origins
- Never trust `req.body` without Zod validation
- Never log tokens, passwords, or raw JWTs

## TypeScript

- Use `unknown` instead of `any` — narrow with type guards
- Use `type` for pure shapes, `interface` for extensible contracts
- Use `satisfies` for config objects (e.g., env validation result)
- Avoid enums — use `as const` objects instead (e.g., `const Role = { Admin: 'admin', User: 'user' } as const`)
- Always annotate async service function return types explicitly
- Never use non-null assertion (`!`) without a guard

### Example: Type Guard for `unknown`

```typescript
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'email' in obj;
}
```

## Express

- Route files are thin — no business logic, call services only
- Validate input with Zod before passing to services
- Never call `next()` after sending a response
- Never use `res.send()` for JSON — always `res.json()`
- Never add route-specific middleware (auth, rate limiters) globally in `app.ts` — attach to specific routes

### Response Pattern

```typescript
// ✅ Correct
res.status(201).json({ user });

// ❌ Wrong
res.send({ user }); // sends as text/html
next(); // unnecessary after response
```

## Mongoose

- Use `findByIdAndUpdate` for simple field updates — never `findById` + `save`
- Always paginate list queries with `.limit()`
- Always pass `{ runValidators: true }` on updates
- Never use `{ strict: false }` on schemas — prevents accidental field injection
- Use `.lean()` for read-only queries (performance optimization)

### Update Pattern

```typescript
// ✅ Correct - atomic, single round-trip
await User.findByIdAndUpdate(userId, { email: newEmail }, { runValidators: true });

// ❌ Wrong - loads then saves, race condition possible
const user = await User.findById(userId);
user.email = newEmail;
await user.save();
```

### Pagination

```typescript
// Always limit list queries
const users = await User.find({}).limit(50).skip(offset).lean();
```

## Config

`src/shared/config/env.ts` is a singleton that validates required env vars at startup. Missing `MONGO_URI`, `JWT_SECRET`, or `REFRESH_SECRET` will throw immediately on server start.

## Middleware Location

All shared middleware lives in `src/shared/middlewares/`:
- `errorHandler.ts` — central error handling (must be last in middleware chain)
- `auth.middleware.ts` — `requireAuth`, `optionalAuth` JWT verification functions