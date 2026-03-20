# Reliability — taskflow-api

> **Purpose:** Agent-readable reliability posture. Agents MUST consult this before changing startup, shutdown, health-checks, or deployment code.

---

## Application Bootability

Every service MUST be bootable from a clean worktree in 2 commands:

```bash
npm install
npm start
```

Prerequisites: Node.js >= 18, PostgreSQL, Redis

### Health Endpoint

| Path | Expected Response | Purpose |
|------|-------------------|---------|
| `/healthz` | `200 { "status": "ok" }` | Liveness probe |
| `/readyz` | `200 { "ready": true }` | Dependency readiness (DB + Redis) |

> **Agents:** After ANY infrastructure change, verify the app boots and health endpoints respond before marking a task complete.

## Observability

| Signal | Tool | Notes |
|--------|------|-------|
| Logs | Structured JSON, stdout | No PII in logs |
| Metrics | Prometheus-compatible | Track p50/p95/p99 latency per endpoint |
| Traces | OpenTelemetry | Propagate trace-id across HTTP + WebSocket |

## SLA Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Monthly |
| API p95 latency | < 200ms | Per-endpoint |
| WebSocket message delivery | < 50ms | Event-to-client |
| Error rate | < 0.1% | Rolling 1h window |

## Failure Modes & Mitigations

| Failure | Impact | Mitigation |
|---------|--------|------------|
| PostgreSQL connection lost | Service degraded (no writes) | Connection pool retry + circuit breaker |
| Redis connection lost | No real-time updates, no caching | Graceful fallback to DB reads, WS reconnect |
| GitHub API timeout | Sync paused | Timeout + retry queue, manual sync trigger |
| WebSocket overload (>10k connections) | Dropped connections | Horizontal scaling, connection limits per instance |
| OOM | Pod restart | Memory limits + leak detection |

## Deployment Safety

- **Zero-downtime required** — rolling deploys or blue/green
- **Rollback procedure:** Revert last merge commit, auto-redeploy via CI
- **Canary threshold:** 1% traffic for 10 min, auto-rollback on error spike
- Run `harnesskit enforce` in CI — block merge on architecture violations
- CI pipeline target: < 5 minutes

---

> **Principle:** "If an agent can't boot the app and verify it works, the agent can't safely modify it." — Harness Engineering
