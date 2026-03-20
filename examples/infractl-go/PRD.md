# InfraCtl — Product Requirements Document

## Overview

InfraCtl is a Go CLI tool for managing multi-cloud infrastructure. It provides a unified interface to provision, inspect, and teardown resources across AWS, GCP, and Kubernetes clusters using HCL-based configuration files.

## Problem Statement

Platform engineering teams juggle multiple cloud CLIs (aws, gcloud, kubectl, terraform). InfraCtl provides:
- A single CLI for common infra operations across clouds
- Declarative HCL configs for environment definitions
- Dry-run mode for safe change previews
- Audit logging for compliance

## Architecture

### Layer Structure

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| **CLI** | `cmd/` | Cobra command definitions, flag parsing |
| **Handlers** | `internal/handlers/` | Command logic, orchestration |
| **Services** | `internal/services/` | Business logic (provisioning, teardown) |
| **Providers** | `internal/providers/` | Cloud SDK wrappers (AWS, GCP, K8s) |
| **Models** | `internal/models/` | Config structs, resource types |
| **Config** | `internal/config/` | HCL parsing, env config |
| **Pkg** | `pkg/` | Shared utilities (logging, formatting, errors) |

### Dependency Rules

- cmd → handlers → services → providers → models
- pkg is shared (any layer can import)
- providers MUST NOT import from services or handlers
- models are leaf nodes (no imports from other internal packages)
- handlers MUST NOT import providers directly (go through services)

## Core Features

### P0 — MVP

1. **Environment Management**
   - `infractl env create --config env.hcl` — provision from HCL
   - `infractl env list` — list all managed environments
   - `infractl env destroy <name>` — teardown with confirmation
   - `infractl env status <name>` — health check

2. **Resource Operations**
   - `infractl apply --config resources.hcl --dry-run` — preview changes
   - `infractl apply --config resources.hcl` — apply changes
   - `infractl diff <env>` — show drift from desired state

3. **Multi-Cloud Providers**
   - AWS: EC2, RDS, S3, Lambda, VPC
   - GCP: GCE, Cloud SQL, GCS, Cloud Functions
   - Kubernetes: Deployments, Services, ConfigMaps

4. **Safety**
   - Dry-run by default for destructive operations
   - Confirmation prompt for destroy operations
   - Audit log to `~/.infractl/audit.log`
   - Rollback support for failed applies

### P1 — Post-MVP

5. **Cost Estimation**
   - `infractl cost estimate --config env.hcl`
   - Monthly cost projection before provisioning
   - Cost comparison between cloud providers

6. **Secrets Management**
   - Integration with HashiCorp Vault
   - `infractl secrets set/get/list`
   - Auto-inject secrets into environment configs

## Non-Functional Requirements

- **CLI response time**: < 500ms for local operations, < 5s for cloud API calls
- **Binary size**: < 50MB (single static binary)
- **Platforms**: Linux (amd64, arm64), macOS (amd64, arm64), Windows (amd64)
- **Security**: No credentials stored in plaintext, use OS keychain
- **Offline**: Config validation and dry-run work offline

## Data Classification

| Data Type | Classification | Notes |
|-----------|---------------|-------|
| Cloud credentials | **Secret** | OS keychain, never logged |
| HCL configs | **Internal** | May contain resource names |
| Audit logs | **Internal** | Timestamped, append-only |
| Resource state | **Internal** | Cached locally |

## Success Metrics

- Zero accidental resource deletions (dry-run default)
- CLI commands complete in < 5s (cloud ops) / < 500ms (local ops)
- Support all 3 cloud providers with unified syntax
- 85% test coverage on services and providers
