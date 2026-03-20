# fastapi — Architecture

## Layer Diagram

```
Models → Config → Services → API (FastAPI/Flask)
Shared: utils/, providers/
```

## Dependency Rules

| Layer | Can Import From | Cannot Import From |
|-------|----------------|-------------------|
| API | Services, Models, Utils | Config (direct) |
| Services | Config, Models, Providers, Utils | API |
| Config | Models, Utils | Services, API |
| Models | Utils only | Everything else |
| Providers | Config, Models, Utils | Services, API |
| Utils | Nothing (leaf nodes) | Everything |

## Key Principle

**Enforce invariants, not implementations.** Within the allowed dependency directions, agents have freedom in how solutions are expressed. The code doesn't have to match human stylistic preference — it must be correct, tested, and maintainable.

## Cross-Cutting Concerns

Auth, logging, database access, and other cross-cutting concerns enter through the shared/provider layer. No direct access from other layers.
