# Execution Plan: MVP Authentication

> **Status:** Not Started
> **Priority:** P0
> **Sprint:** 1

## Goal

Implement JWT-based authentication with GitHub OAuth2, rate limiting, and refresh token support.

## Steps

- [ ] 1. Create `src/models/user.ts` — User type + Zod schema (email, name, passwordHash, role)
- [ ] 2. Create `src/config/auth.ts` — JWT config (RS256 keys, expiry durations, rate limit config)
- [ ] 3. Create `src/repositories/userRepository.ts` — CRUD queries (create, findByEmail, findById)
- [ ] 4. Create `src/services/authService.ts` — register, login, refreshToken, validateToken
- [ ] 5. Create `src/middleware/auth.ts` — JWT verification middleware, rate limiting middleware
- [ ] 6. Create `src/routes/auth.ts` — POST /auth/register, POST /auth/login, POST /auth/refresh, GET /auth/github
- [ ] 7. Write tests for authService (target 80% coverage)
- [ ] 8. Write integration tests for auth routes
- [ ] 9. Run `harnesskit enforce` — verify no layer violations

## Acceptance Criteria

- [ ] Users can register with email/password
- [ ] Users can login and receive JWT access + refresh tokens
- [ ] Access tokens expire after 15 minutes
- [ ] Refresh tokens expire after 7 days (stored in Redis)
- [ ] Rate limiting: 100 req/min per user
- [ ] All auth routes return proper error codes (400, 401, 403, 429)
- [ ] No layer violations (`harnesskit enforce` passes)
- [ ] 80% test coverage on AuthService
