# InfraCtl — Architecture

## Layer Diagram

```
┌─────────────────────────────────────┐
│           cmd/ (CLI)                │  Cobra commands, flag parsing
├─────────────────────────────────────┤
│     internal/handlers/              │  Command logic, orchestration
├─────────────────────────────────────┤
│     internal/services/              │  Business logic (provision, teardown)
├─────────────────────────────────────┤
│     internal/providers/             │  Cloud SDK wrappers (AWS, GCP, K8s)
├─────────────────────────────────────┤
│     internal/models/                │  Config structs, resource types
├─────────────────────────────────────┤
│     internal/config/                │  HCL parsing, env config
└─────────────────────────────────────┘
         Shared: pkg/ (logging, formatting, errors)
```

## Dependency Rules

| Layer | Can Import From | Cannot Import From |
|-------|----------------|-------------------|
| CLI (`cmd/`) | Handlers, Models, Pkg | Services, Providers, Config (direct) |
| Handlers (`internal/handlers/`) | Services, Models, Pkg | Providers (direct), Config (direct) |
| Services (`internal/services/`) | Providers, Models, Config, Pkg | Handlers, CLI |
| Providers (`internal/providers/`) | Models, Config, Pkg | Services, Handlers, CLI |
| Config (`internal/config/`) | Models, Pkg | Services, Handlers, Providers, CLI |
| Models (`internal/models/`) | Pkg only | Everything else (leaf nodes) |
| Pkg (`pkg/`) | Nothing (leaf nodes) | Everything |

### Critical Invariants

- **cmd → handlers → services → providers → models** is the only valid call chain.
- **pkg/** is shared — any layer can import it.
- **providers MUST NOT** import from services or handlers.
- **models** are leaf nodes — no imports from other internal packages.
- **handlers MUST NOT** import providers directly — all cloud operations go through services.

## Key Principle

**Enforce invariants, not implementations.** Within the allowed dependency directions, agents have freedom in how solutions are expressed. The code doesn't have to match human stylistic preference — it must be correct, tested, and maintainable.

## Layer Responsibilities

### cmd/ (CLI)
- Cobra command tree: `infractl env create|list|destroy|status`, `infractl apply`, `infractl diff`, `infractl cost`
- Flag parsing and validation
- Delegates all logic to handlers

### internal/handlers/
- Orchestrates multi-step operations (e.g., dry-run preview then apply)
- Manages confirmation prompts for destructive operations
- Coordinates between services for cross-cutting workflows

### internal/services/
- Provisioning, teardown, drift detection business logic
- Rollback orchestration for failed applies
- Cost estimation logic (P1)

### internal/providers/
- **AWS**: EC2, RDS, S3, Lambda, VPC via AWS SDK
- **GCP**: GCE, Cloud SQL, GCS, Cloud Functions via Google Cloud SDK
- **Kubernetes**: Deployments, Services, ConfigMaps via client-go
- Each provider implements a common interface for resource CRUD

### internal/models/
- Resource type definitions (compute, storage, database, function, network)
- Environment configuration structs
- Shared enums (provider type, resource state, operation type)

### internal/config/
- HCL file parsing and validation
- Environment configuration loading from `~/.infractl/`
- Config merging (file defaults + CLI flag overrides)

## Cross-Cutting Concerns

- **Logging**: Structured logging via `pkg/logging`, feeds audit log at `~/.infractl/audit.log`
- **Credentials**: Accessed through provider layer only; stored in OS keychain, never in plaintext
- **Error handling**: Shared error types in `pkg/errors`; providers surface cloud-specific errors as typed errors
- **Output formatting**: `pkg/formatting` handles table, JSON, and YAML output modes
