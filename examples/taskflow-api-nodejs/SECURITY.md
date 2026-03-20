# Security — taskflow-api

> **Purpose:** Agent-readable security posture. Agents MUST read this before modifying auth, crypto, networking, or data-handling code.

---

## Authentication

| Mechanism | Where Used | Notes |
|-----------|-----------|-------|
| JWT (access token) | `/api/*` | RS256, 15 min expiry |
| JWT (refresh token) | `/auth/refresh` | Stored in Redis, 7 day expiry |
| OAuth2 | `/auth/github` | GitHub OAuth2 flow for SSO |
| Rate limiting | All endpoints | 100 req/min per user |

## Secrets Management

- **Never** hard-code secrets in source.
- Secrets live in: `.env` (local), environment variables (prod)
- JWT signing keys: RS256 key pair, rotated every 90 days
- API keys: Never logged, never returned in responses
- Database credentials: Environment variables only

## Data Classification

| Level | Examples | Handling Rule |
|-------|----------|---------------|
| **Public** | API docs, project names | No restrictions |
| **Internal** | Task content, analytics, activity logs | Encrypted at rest |
| **Confidential** | User credentials (bcrypt), user PII | Encrypted at rest + in transit, bcrypt for passwords |
| **Secret** | JWT signing keys, API keys, DB credentials | Never logged, env vars / vault only, audit trail |

## Dependency Policy

- Run `npm run lint` before merge — includes security linting
- Audit deps monthly: `npm audit`
- No wildcard versions in production lockfiles
- All data encrypted at rest (AES-256) and in transit (TLS 1.3)
- OWASP Top 10 compliance required

## Incident Response

1. Rotate compromised secrets immediately
2. Notify #security channel
3. Create incident exec-plan in `docs/exec-plans/active/`
4. Post-mortem within 48 hours → `docs/design-docs/`

---

> **Agents:** When in doubt about a security decision, STOP and ask a human. Never auto-generate secrets, tokens, or auth logic without explicit approval.
