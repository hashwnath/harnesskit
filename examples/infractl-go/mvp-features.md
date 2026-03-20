# Product Spec: InfraCtl MVP Features

> **Status:** Draft
> **Priority:** P0
> **Target:** MVP Release

---

## Overview

InfraCtl MVP delivers a unified CLI for managing multi-cloud infrastructure across AWS, GCP, and Kubernetes. Platform engineering teams can provision, inspect, and teardown resources using declarative HCL configs with safety defaults.

## Problem

Platform engineering teams currently juggle multiple cloud CLIs (`aws`, `gcloud`, `kubectl`, `terraform`). This leads to:
- Inconsistent workflows across cloud providers
- No unified audit trail for infrastructure changes
- Risk of accidental resource deletion without preview/confirmation
- No single tool for cross-cloud drift detection

## User Stories

### Environment Management

**US-1: Create an environment from config**
> As a platform engineer, I want to run `infractl env create --config env.hcl` so that I can provision a complete environment from a declarative config file.

- Parses HCL config and resolves resource dependencies
- Dry-run by default: shows a plan of what will be created
- Pass `--confirm` to execute the plan
- Logs operation to audit log
- On partial failure, rolls back completed steps

**US-2: List managed environments**
> As a platform engineer, I want to run `infractl env list` so that I can see all environments InfraCtl is tracking.

- Displays environment name, provider, status, and resource count
- Supports `--output json` for script consumption
- Local operation (< 500ms response time)

**US-3: Destroy an environment**
> As a platform engineer, I want to run `infractl env destroy <name>` so that I can tear down all resources in an environment.

- Requires interactive confirmation prompt (or `--yes` flag)
- Shows resources that will be destroyed before confirming
- Tears down resources in reverse dependency order
- Logs operation to audit log

**US-4: Check environment status**
> As a platform engineer, I want to run `infractl env status <name>` so that I can verify the health of a running environment.

- Queries cloud provider APIs for resource health
- Reports per-resource status (healthy, degraded, missing)
- Detects drift from declared config

### Resource Operations

**US-5: Preview changes with dry-run**
> As a platform engineer, I want to run `infractl apply --config resources.hcl --dry-run` so that I can safely preview what changes will be made before applying.

- Parses HCL, compares to current state, shows diff
- Works offline (validates config locally, compares to cached state)
- Dry-run is the default mode

**US-6: Apply resource changes**
> As a platform engineer, I want to run `infractl apply --config resources.hcl --confirm` so that I can apply infrastructure changes across any supported cloud.

- Creates, updates, or deletes resources to match declared state
- Rolls back on partial failure
- Logs all changes to audit log

**US-7: Detect drift**
> As a platform engineer, I want to run `infractl diff <env>` so that I can see what has changed between the declared config and actual cloud state.

- Queries cloud APIs for current state
- Compares to local declared state
- Shows additions, modifications, and deletions

### Multi-Cloud Providers

**US-8: Manage AWS resources**
> As a platform engineer, I want InfraCtl to support AWS resources (EC2, RDS, S3, Lambda, VPC) so that I can manage AWS infrastructure with the same CLI.

**US-9: Manage GCP resources**
> As a platform engineer, I want InfraCtl to support GCP resources (GCE, Cloud SQL, GCS, Cloud Functions) so that I can manage GCP infrastructure with the same CLI.

**US-10: Manage Kubernetes resources**
> As a platform engineer, I want InfraCtl to support Kubernetes resources (Deployments, Services, ConfigMaps) so that I can manage K8s workloads with the same CLI.

### Safety & Compliance

**US-11: Audit logging**
> As a compliance officer, I want all InfraCtl operations logged to `~/.infractl/audit.log` so that I can review infrastructure changes for audit purposes.

- Structured JSON, timestamped, append-only
- Records: command, user, provider, resource, operation, result
- Never logs credentials or secrets

**US-12: Secure credential storage**
> As a platform engineer, I want my cloud credentials stored in the OS keychain so that they are never exposed in plaintext files or logs.

## Non-Functional Requirements

| Requirement | Target |
|------------|--------|
| Local operation latency | < 500ms |
| Cloud operation latency | < 5s |
| Binary size | < 50MB (single static binary) |
| Platform support | Linux (amd64, arm64), macOS (amd64, arm64), Windows (amd64) |
| Test coverage (services + providers) | >= 85% |
| Offline support | Config validation and dry-run work without network |

## Success Metrics

- Zero accidental resource deletions (dry-run default enforced)
- CLI commands complete within performance targets
- All 3 cloud providers supported with unified command syntax
- 85% test coverage on services and providers

## Out of Scope (P1 — Post-MVP)

- Cost estimation (`infractl cost estimate`)
- HashiCorp Vault integration for secrets management (`infractl secrets set/get/list`)
- Auto-inject secrets into environment configs
- Cost comparison between cloud providers
