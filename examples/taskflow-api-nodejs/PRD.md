# TaskFlow API — Product Requirements Document

## Overview

TaskFlow is a real-time collaborative task management API for engineering teams. It supports project boards with customizable workflows, real-time updates via WebSockets, and integrates with GitHub for automatic issue sync.

## Problem Statement

Engineering teams need a lightweight, API-first task management solution that:
- Integrates directly into their existing developer tools (CLI, CI/CD, IDE)
- Provides real-time collaboration without polling
- Supports customizable workflow states beyond "To Do / In Progress / Done"
- Syncs bidirectionally with GitHub Issues

## Target Users

- **Primary**: Engineering teams (5-50 people) using GitHub
- **Secondary**: DevOps teams tracking infrastructure tasks
- **Tertiary**: Product managers who need a developer-friendly interface

## Architecture

### System Components

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   REST API   │────▶│  PostgreSQL   │     │    Redis     │
│  (Express)   │     │   (Primary)   │     │  (Cache +    │
│              │────▶│              │     │   Pub/Sub)   │
└──────┬───────┘     └──────────────┘     └──────┬──────┘
       │                                          │
       ▼                                          ▼
┌─────────────┐                          ┌──────────────┐
│  WebSocket   │◀─────────────────────────│  Event Bus   │
│  (Socket.IO) │                          │  (Redis PS)  │
└─────────────┘                          └──────────────┘
       │
       ▼
┌─────────────┐
│  GitHub Sync │
│  (Webhooks)  │
└─────────────┘
```

### Layer Structure

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| **API Routes** | `src/routes/` | HTTP endpoints, request validation, response formatting |
| **WebSocket Handlers** | `src/ws/` | Real-time event handlers, room management |
| **Services** | `src/services/` | Business logic, workflow engine, GitHub sync |
| **Repositories** | `src/repositories/` | Database queries, data access |
| **Models** | `src/models/` | TypeScript types, Zod schemas, DB models |
| **Config** | `src/config/` | Environment config, feature flags |
| **Middleware** | `src/middleware/` | Auth, rate limiting, logging, error handling |

### Dependency Rules

- Routes → Services → Repositories → Models
- Routes MUST NOT import from Repositories directly
- Services MUST NOT import from Routes
- Models are leaf nodes (no upward imports)
- Middleware is cross-cutting (can be used by Routes)
- WebSocket handlers follow the same layering as Routes

## Core Features

### P0 — MVP (Sprint 1-2)

1. **User Authentication**
   - JWT-based auth with refresh tokens
   - OAuth2 with GitHub
   - Rate limiting: 100 req/min per user

2. **Project Boards**
   - CRUD for projects
   - Customizable workflow columns (states)
   - Default states: Backlog → To Do → In Progress → Review → Done
   - Max 10 projects per free-tier user

3. **Tasks**
   - CRUD with full-text search
   - Assignees, labels, priority (P0-P3), story points
   - Subtasks (1 level deep)
   - Markdown description with image uploads (S3)
   - Activity log per task

4. **Real-time Updates**
   - WebSocket connection per project board
   - Events: task.created, task.updated, task.moved, task.deleted
   - Presence: show who's viewing the board
   - Optimistic UI support (event includes request ID)

### P1 — Post-MVP (Sprint 3-4)

5. **GitHub Integration**
   - Bidirectional sync: GitHub Issue ↔ TaskFlow Task
   - Auto-create task when issue opened
   - Auto-close issue when task moved to "Done"
   - Link PRs to tasks

6. **Notifications**
   - In-app notification center
   - Email digests (daily/weekly)
   - @mention support in task comments

### P2 — Future

7. **Analytics Dashboard**
   - Cycle time, lead time, throughput
   - Burndown charts
   - Team velocity tracking

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, returns JWT |
| POST | `/auth/refresh` | Refresh access token |
| GET | `/auth/github` | OAuth2 GitHub flow |

### Projects
| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects` | List user's projects |
| POST | `/projects` | Create project |
| GET | `/projects/:id` | Get project with columns |
| PATCH | `/projects/:id` | Update project |
| DELETE | `/projects/:id` | Soft-delete project |

### Tasks
| Method | Path | Description |
|--------|------|-------------|
| GET | `/projects/:id/tasks` | List tasks (filterable, paginated) |
| POST | `/projects/:id/tasks` | Create task |
| GET | `/tasks/:id` | Get task with activity log |
| PATCH | `/tasks/:id` | Update task |
| PATCH | `/tasks/:id/move` | Move task to column |
| DELETE | `/tasks/:id` | Soft-delete task |

## Non-Functional Requirements

- **Latency**: p95 < 200ms for API responses
- **Availability**: 99.9% uptime
- **Security**: OWASP Top 10 compliance, SOC2 type II (future)
- **Scalability**: Support 10k concurrent WebSocket connections per instance
- **Data**: All data encrypted at rest (AES-256) and in transit (TLS 1.3)

## Data Classification

| Data Type | Classification | Storage | Encryption |
|-----------|---------------|---------|------------|
| User credentials | **Confidential** | PostgreSQL | bcrypt + at-rest |
| JWT tokens | **Confidential** | Redis (ephemeral) | Signed (RS256) |
| Task content | **Internal** | PostgreSQL | At-rest |
| API keys | **Secret** | Vault/env | Never logged |
| Analytics | **Internal** | PostgreSQL | At-rest |

## Success Metrics

- API response time p95 < 200ms
- WebSocket message delivery < 50ms
- Zero critical security vulnerabilities
- 80% test coverage on Services layer
- CI pipeline < 5 minutes
