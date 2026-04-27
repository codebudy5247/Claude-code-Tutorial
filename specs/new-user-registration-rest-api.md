# Spec for New User Registration REST API

## Summary

Implement a `/auth/register` endpoint that creates a new user account with name/email/password authentication. The endpoint validates input, hashes the password using bcrypt, generates JWT access and refresh tokens, stores the hashed refresh token, and returns the access token to the client while setting the refresh token as an HttpOnly cookie.

## Functional Requirements

- POST `/auth/register` accepts JSON body with `name`, `email` and `password` fields
- Email must be a valid email format and unique in the database
- Password must be at least 8 characters
- Password is hashed using bcrypt with saltRounds=12 before storage
- On successful registration, generate short-lived access token (JWT, 15m) and long-lived refresh token (JWT, 7d)
- Store only the hashed refresh token in the database (never plaintext)
- Return access token in response body and set refresh token in `HttpOnly; Secure; SameSite=Strict` cookie
- Return 201 Created with user data (excluding passwordHash and refreshTokens) and accessToken
- Return 409 Conflict if email already exists
- Return 400 Bad Request for validation errors

## Figma Design Reference (only if referenced)

- File: ...
- Component name: ...
- Key visual constraints: ...

## Possible Edge Cases

- Email already registered (duplicate key error)
- Invalid email format
- Password too short
- Missing required fields
- Malformed JSON body
- Database connection failure during registration

## Acceptance Criteria

- [ ] POST `/auth/register` accepts `{ email, password }` and returns 201 with `{ user, accessToken }`
- [ ] Email validation rejects invalid formats with 400
- [ ] Password validation rejects shorter than 8 characters with 400
- [ ] Duplicate email returns 409 Conflict
- [ ] Password is never stored in plaintext (bcrypt hash only)
- [ ] Refresh token is hashed before storage in database
- [ ] Access token payload includes `{ sub: userId, iat, exp }`
- [ ] Refresh token is set in `HttpOnly; Secure; SameSite=Strict` cookie
- [ ] Response user object excludes `passwordHash` and `refreshTokens`
- [ ] All errors route through central error handler (never raw 500 responses)

## Open Questions

- Should there be a rate limit on registration attempts? No.
- Should registration emit any events/notifications? No.

## Testing Guidelines

Create a test file(s) in the ./tests folder for the new feature, and
create meaningful tests for the following cases, without going too heavy:
- Successful registration with valid email and password returns 201
- Missing email field returns 400
- Missing password field returns 400
- Invalid email format returns 400
- Password shorter than 8 characters returns 400
- Duplicate email returns 409
- Response does not include passwordHash