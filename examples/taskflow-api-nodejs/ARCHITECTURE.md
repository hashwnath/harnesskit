# taskflow-api — Architecture

## Layer Diagram

```
Models → Config → Services → Routes (API)
                  Services → WebSocket Handlers (WS)
Shared: middleware/, providers/
```

## Dependency Rules

| Layer | Can Import From | Cannot Import From |
|-------|----------------|-------------------|
| Routes (`src/routes/`) | Services, Models, Middleware | Repositories (direct), WS |
| WS Handlers (`src/ws/`) | Services, Models, Middleware | Repositories (direct), Routes |
| Services (`src/services/`) | Repositories, Models, Config, Providers | Routes, WS |
| Repositories (`src/repositories/`) | Models, Config | Services, Routes, WS |
| Models (`src/models/`) | Nothing (leaf nodes) | Everything |
| Config (`src/config/`) | Models | Services, Routes, WS, Repositories |
| Middleware (`src/middleware/`) | Config, Models, Providers | Services, Repositories |
| Providers (external integrations) | Config, Models | Services, Routes |

## Key Directories

| Directory | Purpose |
|-----------|---------|
| `src/routes/` | Express HTTP endpoints — auth, projects, tasks |
| `src/ws/` | Socket.IO real-time event handlers, room management |
| `src/services/` | Business logic — workflow engine, GitHub sync, notifications |
| `src/repositories/` | PostgreSQL queries via pg, data access layer |
| `src/models/` | TypeScript types, Zod schemas, DB model definitions |
| `src/config/` | Environment config, feature flags |
| `src/middleware/` | Auth (JWT), rate limiting, logging, error handling |

## Domain Boundaries

| Domain | Services | Key Entities |
|--------|----------|-------------|
| Auth | AuthService | User, Session, Token |
| Projects | ProjectService | Project, Column, Workflow |
| Tasks | TaskService | Task, Subtask, Label, Comment |
| Real-time | RealtimeService | WebSocket rooms, presence, events |
| GitHub Sync | GitHubSyncService | Issue, PR, Webhook |

## Key Principle

**Enforce invariants, not implementations.** Routes never touch the database directly — they always go through Services → Repositories. WebSocket handlers follow the same pattern as Routes.

## Cross-Cutting Concerns

Auth (JWT), logging, database connections, Redis cache, and rate limiting enter through the middleware and provider layers. No direct access from Routes or WS handlers.
