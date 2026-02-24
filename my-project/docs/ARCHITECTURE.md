# my-project — Architecture

## Layer Diagram

```
Types → Config → Service → Routes (API)
                 Service → Pages  (UI)
Shared: utils/, providers/
```

## Dependency Rules

| Layer | Can Import From | Cannot Import From |
|-------|----------------|-------------------|
| Routes | Service, Types, Providers, Utils | UI, Config (direct) |
| Service | Config, Types, Providers, Utils | Routes, UI |
| Config | Types, Utils | Service, Routes, UI |
| Types | Utils only | Everything else |
| Providers | Config, Types, Utils | Service, Routes, UI |
| Utils | Nothing (leaf nodes) | Everything |

## Key Principle

**Enforce invariants, not implementations.** Within the allowed dependency directions, agents have freedom in how solutions are expressed. The code doesn't have to match human stylistic preference — it must be correct, tested, and maintainable.

## Cross-Cutting Concerns

Auth, logging, database access, and other cross-cutting concerns enter through the shared/provider layer. No direct access from other layers.
