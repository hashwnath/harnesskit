# Execution Plan: MVP Environment Management

## Goal
Implement the P0 environment management commands (`env create`, `env list`, `env destroy`, `env status`) with dry-run safety defaults and audit logging.

## Context
- Spec / Issue: [PRD.md — P0 Core Features](../../../PRD.md)
- Related plans: None (this is the first execution plan)
- Product spec: [mvp-features.md](../../product-specs/mvp-features.md)

## Steps

- [ ] **Step 1**: Define models — Create resource types, environment config structs, and provider enums in `internal/models/`
- [ ] **Step 2**: Implement HCL config parser — Parse environment HCL files in `internal/config/`, validate schema, return typed config structs
- [ ] **Step 3**: Define provider interface — Create common `Provider` interface in `internal/providers/` with `Create`, `Read`, `Update`, `Delete`, `Status` methods
- [ ] **Step 4**: Implement AWS provider stub — Implement the `Provider` interface for AWS (EC2, RDS, S3, Lambda, VPC) in `internal/providers/aws/`
- [ ] **Step 5**: Implement GCP provider stub — Implement the `Provider` interface for GCP (GCE, Cloud SQL, GCS, Cloud Functions) in `internal/providers/gcp/`
- [ ] **Step 6**: Implement K8s provider stub — Implement the `Provider` interface for Kubernetes (Deployments, Services, ConfigMaps) in `internal/providers/k8s/`
- [ ] **Step 7**: Implement environment service — Business logic for provisioning, teardown, status checks, and environment listing in `internal/services/`
- [ ] **Step 8**: Implement rollback logic — On partial apply failure, revert completed steps in reverse order via the service layer
- [ ] **Step 9**: Implement handlers — Orchestrate dry-run previews, confirmation prompts, and audit log writes in `internal/handlers/`
- [ ] **Step 10**: Implement CLI commands — Wire up Cobra commands (`env create`, `env list`, `env destroy`, `env status`) in `cmd/`
- [ ] **Step 11**: Implement audit logging — Append-only structured JSON log to `~/.infractl/audit.log` via `pkg/logging`
- [ ] **Step 12**: Implement OS keychain credential storage — Read/write cloud credentials via OS keychain in the provider layer
- [ ] **Step 13**: Add unit tests for models and config — Validate HCL parsing, struct validation, edge cases
- [ ] **Step 14**: Add unit tests for services — Mock providers, test provisioning/teardown/rollback logic, target 85% coverage
- [ ] **Step 15**: Add unit tests for providers — Mock cloud SDKs, test CRUD operations, target 85% coverage
- [ ] **Step 16**: Add integration tests — End-to-end CLI tests with mock providers
- [ ] **Step 17**: Verify performance targets — Local ops < 500ms, cloud ops < 5s, binary < 50MB
- [ ] **Step 18**: Set up CI pipeline — Build, test, `harnesskit enforce`, `harnesskit doctor`

## Acceptance Criteria
- [ ] `infractl env create --config env.hcl` provisions resources (or dry-runs by default)
- [ ] `infractl env list` displays all managed environments
- [ ] `infractl env destroy <name>` requires confirmation, tears down resources
- [ ] `infractl env status <name>` shows environment health
- [ ] Dry-run is the default for all destructive operations
- [ ] Audit log records all operations to `~/.infractl/audit.log`
- [ ] No credentials stored in plaintext anywhere
- [ ] Rollback executes on partial apply failure
- [ ] 85% test coverage on services and providers
- [ ] All tests pass
- [ ] `harnesskit enforce` passes
- [ ] QUALITY_SCORE.md updated to reflect implementation progress

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-03-20 | Start with models and config before providers | Bottom-up build: models are leaf nodes, everything depends on them |
| 2026-03-20 | Implement all three providers in MVP | PRD requires unified multi-cloud support as P0 |
| 2026-03-20 | Dry-run as default, not opt-in | PRD safety requirement: zero accidental resource deletions |
