# ShopWave — Architecture

## System Components

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   FastAPI     │────▶│  PostgreSQL   │     │    Redis      │
│   (API)       │     │  (Primary DB) │     │  (Cache +     │
│               │────▶│              │     │   Sessions)   │
└──────┬────────┘     └──────────────┘     └──────┬───────┘
       │                                           │
       ▼                                           ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Celery      │────▶│  Stripe API   │     │  S3 / Minio   │
│  (Workers)    │     │  (Payments)   │     │  (Images)     │
└──────────────┘     └──────────────┘     └──────────────┘
```

- **FastAPI** — HTTP API layer, serves all REST endpoints
- **PostgreSQL** — Primary data store (products, orders, users), full-text search via tsvector
- **Redis** — Shopping cart storage, session cache, rate limiting for flash sales
- **Celery** — Async workers for emails, payment webhooks, recommendation model retraining
- **Stripe API** — Payment processing (Checkout Sessions, webhooks, refunds, multi-currency)
- **S3 / Minio** — Product image storage with thumbnail generation

## Layer Diagram

```
API (FastAPI routers)
  │
  ▼
Services (business logic, orchestration)
  │
  ▼
Repositories (SQLAlchemy queries, data access)
  │
  ▼
Models (SQLAlchemy ORM + Pydantic schemas)

Side channels:
  Tasks (Celery) → Services
  Providers (Stripe, S3, email) → injected into Services
  Config (settings, feature flags) → consumed by Services, Providers
```

## Layer Structure

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| **API** | `src/api/` | FastAPI routers, request/response schemas, input validation |
| **Services** | `src/services/` | Business logic, orchestration, enforces domain invariants |
| **Repositories** | `src/repositories/` | SQLAlchemy queries, data access patterns |
| **Models** | `src/models/` | SQLAlchemy ORM models, Pydantic schemas |
| **Tasks** | `src/tasks/` | Celery async tasks (emails, payment processing, recommendation retraining) |
| **Config** | `src/config/` | Settings, feature flags, environment configuration |
| **Providers** | `src/providers/` | External integrations (Stripe, S3, email services) |

## Dependency Rules

| Layer | Can Import From | Cannot Import From |
|-------|----------------|-------------------|
| API | Services, Models | Repositories, Config (direct), Tasks, Providers |
| Services | Repositories, Models, Config, Providers | API, Tasks |
| Repositories | Models, Config | API, Services, Tasks, Providers |
| Models | Nothing (leaf nodes) | Everything |
| Tasks | Services | API, Repositories (direct), Providers (direct) |
| Providers | Config, Models | API, Services, Repositories, Tasks |
| Config | Nothing (leaf nodes) | Everything |

### Critical Rules

- **API MUST NOT import from Repositories directly** — all data access goes through Services
- **Tasks call Services** — they are async entry points to the same business logic
- **Providers are injected into Services** via dependency injection, never instantiated directly in API or Tasks
- **Models are leaf nodes** — they define data shapes only, no business logic

## Key Principle

**Enforce invariants, not implementations.** Within the allowed dependency directions, agents have freedom in how solutions are expressed. The code doesn't have to match human stylistic preference — it must be correct, tested, and maintainable.

## Cross-Cutting Concerns

- **Auth**: JWT-based authentication, enters through FastAPI middleware and dependency injection
- **Logging**: Structured JSON to stdout, no PII in logs
- **Database access**: SQLAlchemy sessions managed via FastAPI dependencies, connection pooling
- **Caching**: Redis-backed, applied at Service layer for catalog reads
- **Rate limiting**: Redis-based, applied at API layer for flash sale traffic management
