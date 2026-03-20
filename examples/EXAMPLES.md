# Real-World Examples

> End-to-end runs of `harnesskit` against popular open-source repos.
> Each example shows: the command, auto-detected stack, generated file tree, and key output files.

---

## Table of Contents

| # | Repo | Language | Stars | What It Shows |
|---|------|----------|-------|---------------|
| 1 | [Express.js](#1-expressjs-nodejs) | Node.js | 66k+ | Classic JS framework, `package.json` detection |
| 2 | [FastAPI](#2-fastapi-python) | Python | 82k+ | Modern Python, `pyproject.toml` detection |
| 3 | [Gin](#3-gin-go) | Go | 80k+ | Go web framework, `go.mod` detection |
| 4 | [Axum](#4-axum-rust) | Rust | 20k+ | Tokio-based Rust, `Cargo.toml` detection |

---

## 1. Express.js (Node.js)

**Repo:** `expressjs/express` — Fast, unopinionated, minimalist web framework for Node.js

### Command

```bash
cd express
npx harnesskit init --yes
```

### Auto-Detection

```
Auto-detected: node project, vscode IDE(s), github git
```

### Generated File Tree

```
express/
├── AGENTS.md                          # Universal agent instructions
├── .env.example                       # Required tokens & keys template
├── docs/
│   ├── ARCHITECTURE.md                # Layer rules & dependency graph
│   ├── BRAIN.html                     # Interactive agent knowledge graph
│   ├── QUALITY_SCORE.md               # Per-domain quality grades (A-F)
│   ├── SECURITY.md                    # Security posture & data classification
│   ├── RELIABILITY.md                 # Bootability, health checks & SLAs
│   ├── design-docs/
│   │   ├── README.md
│   │   └── core-beliefs.md            # 8 agent-first operating principles
│   ├── exec-plans/
│   │   ├── active/
│   │   │   ├── README.md
│   │   │   └── _template.md           # Execution plan template
│   │   └── completed/
│   │       └── .gitkeep
│   ├── generated/
│   │   └── .gitkeep
│   ├── product-specs/
│   │   └── .gitkeep
│   └── references/
│       └── .gitkeep
├── .github/
│   ├── copilot-instructions.md        # GitHub Copilot instructions
│   ├── agents/
│   │   ├── planner.agent.md           # Read-only planning agent
│   │   ├── implementer.agent.md       # Code writing agent
│   │   ├── reviewer.agent.md          # Quality gate agent
│   │   ├── arch-reviewer.agent.md     # Architecture enforcement agent
│   │   ├── security-reviewer.agent.md # Security review agent
│   │   └── doc-gardener.agent.md      # Documentation maintenance agent
│   └── workflows/
│       └── harness-checks.yml         # CI: enforce + doctor
└── .vscode/
    ├── mcp.json                       # MCP server connections
    ├── settings.json                  # Editor settings
    └── extensions.json                # Recommended extensions
```

### Generated AGENTS.md (excerpt)

```markdown
# Agent Guide — express

## Build & Run

npm run build
npm test
npm run lint
npm start

## Layer Rules (Summary)

Types → Config → Service → Routes (API)
                 Service → Pages  (UI)
Shared: utils/, providers/
```

### Generated ARCHITECTURE.md

```markdown
# express — Architecture

## Layer Diagram

Types → Config → Service → Routes (API)
                 Service → Pages  (UI)
Shared: utils/, providers/

## Dependency Rules

| Layer   | Can Import From                    |
|---------|------------------------------------|
| Routes  | Service, Types, Providers, Utils   |
| Service | Config, Types, Providers, Utils    |
| Config  | Types, Utils                       |
| Types   | Utils only                         |
| Utils   | Nothing (leaf nodes)               |
```

### Doctor Check

```
$ npx harnesskit doctor

  Harness Lab Doctor
  ──────────────────
  Checking: express

  ✔ AGENTS.md (universal agent instructions)
  ✔ docs/ARCHITECTURE.md (layer rules)
  ✔ docs/QUALITY_SCORE.md (quality grades)
  ✔ docs/SECURITY.md (security posture)
  ✔ docs/RELIABILITY.md (reliability guide)
  ✔ docs/design-docs/ (design decisions)
  ✔ docs/design-docs/core-beliefs.md
  ✔ docs/exec-plans/active/ (execution plans)
  ✔ docs/exec-plans/active/_template.md
  ✔ docs/references/ (source documents for ingest)
  ✔ .github/copilot-instructions.md
  ✔ .github/agents/ (custom agents)

  Summary: 12 passed, 0 failed, 5 optional missing
  IDE configs detected: vscode
  ✔ Harness setup is healthy!
```

### Enforce Check

```
$ npx harnesskit enforce

  Architecture Enforcement
  ────────────────────────
  Scanning source files for import violations...
  Found 6 source files

  ✔ Architecture check PASSED — no layer violations
```

### Garden Check

```
$ npx harnesskit garden

  Doc Gardener
  ────────────
  Scanning: express

  ✔ No documentation issues found!
```

---

## 2. FastAPI (Python)

**Repo:** `tiangolo/fastapi` — Modern, fast (high-performance) web framework for building APIs with Python

### Command

```bash
cd fastapi
npx harnesskit init --yes
```

### Auto-Detection

```
Auto-detected: python project, vscode IDE(s), github git
```

### Generated AGENTS.md (key differences)

```markdown
# Agent Guide — fastapi

## Build & Run

python -m build
pytest
ruff check .
python -m app

## Layer Rules (Summary)

Models → Config → Services → API (FastAPI/Flask)
Shared: utils/, providers/
```

### Generated ARCHITECTURE.md

```markdown
# fastapi — Architecture

## Layer Diagram

Models → Config → Services → API (FastAPI/Flask)
Shared: utils/, providers/

## Dependency Rules

| Layer    | Can Import From                    |
|----------|------------------------------------|
| API      | Services, Models, Providers, Utils |
| Services | Config, Models, Providers, Utils   |
| Config   | Models, Utils                      |
| Models   | Utils only                         |
| Utils    | Nothing (leaf nodes)               |
```

### Doctor Check

```
12 passed, 0 failed, 5 optional missing
✔ Harness setup is healthy!
```

---

## 3. Gin (Go)

**Repo:** `gin-gonic/gin` — Gin is a HTTP web framework written in Go (Golang)

### Command

```bash
cd gin
npx harnesskit init --yes
```

### Auto-Detection

```
Auto-detected: go project, vscode IDE(s), github git
```

### Generated AGENTS.md (key differences)

```markdown
# Agent Guide — gin

## Build & Run

go build ./...
go test ./...
golangci-lint run
go run .

## Layer Rules (Summary)

Models → Config → Service → Handlers
Shared: pkg/
```

### Generated ARCHITECTURE.md

```markdown
# gin — Architecture

## Layer Diagram

Models → Config → Service → Handlers
Shared: pkg/

## Dependency Rules

| Layer    | Can Import From                |
|----------|--------------------------------|
| Handlers | Service, Models, Pkg           |
| Service  | Config, Models, Pkg            |
| Config   | Models, Pkg                    |
| Models   | Pkg only                       |
| Pkg      | Nothing (leaf nodes)           |
```

### Doctor Check

```
12 passed, 0 failed, 5 optional missing
✔ Harness setup is healthy!
```

---

## 4. Axum (Rust)

**Repo:** `tokio-rs/axum` — Ergonomic and modular web framework built with Tokio, Tower, and Hyper

### Command

```bash
cd axum
npx harnesskit init --yes
```

### Auto-Detection

```
Auto-detected: rust project, vscode IDE(s), github git
```

### Generated AGENTS.md (key differences)

```markdown
# Agent Guide — axum

## Build & Run

cargo build
cargo test
cargo clippy
cargo run

## Layer Rules (Summary)

Types → Config → Service → Handlers
Shared: utils/
```

### Generated ARCHITECTURE.md

```markdown
# axum — Architecture

## Layer Diagram

Types → Config → Service → Handlers
Shared: utils/

## Dependency Rules

| Layer    | Can Import From              |
|----------|------------------------------|
| Handlers | Service, Types, Utils        |
| Service  | Config, Types, Utils         |
| Config   | Types, Utils                 |
| Types    | Utils only                   |
| Utils    | Nothing (leaf nodes)         |
```

### Doctor Check

```
12 passed, 0 failed, 5 optional missing
✔ Harness setup is healthy!
```

---

## Cross-Language Comparison

| Feature | Node.js | Python | Go | Rust |
|---------|---------|--------|----|------|
| **Build** | `npm run build` | `python -m build` | `go build ./...` | `cargo build` |
| **Test** | `npm test` | `pytest` | `go test ./...` | `cargo test` |
| **Lint** | `npm run lint` | `ruff check .` | `golangci-lint run` | `cargo clippy` |
| **Top Layer** | Routes | API (FastAPI/Flask) | Handlers | Handlers |
| **Bottom Layer** | Types | Models | Models | Types |
| **Shared** | `utils/`, `providers/` | `utils/`, `providers/` | `pkg/` | `utils/` |
| **Detected By** | `package.json` | `pyproject.toml` | `go.mod` | `Cargo.toml` |

## Generated Agent Configs (same across all languages)

Every run generates **6 specialized agents** adapted for the detected IDE:

| Agent | File | Role |
|-------|------|------|
| Planner | `planner.agent.md` | Creates execution plans, never writes code (read-only tools) |
| Implementer | `implementer.agent.md` | Writes code following plans and architecture (full access) |
| Reviewer | `reviewer.agent.md` | Reviews quality, tests, and completeness |
| Arch Reviewer | `arch-reviewer.agent.md` | Validates layer rules and dependency direction |
| Security Reviewer | `security-reviewer.agent.md` | Checks for secrets, auth issues, OWASP risks |
| Doc Gardener | `doc-gardener.agent.md` | Finds stale docs, broken links, completed plans |

## Try It Yourself

```bash
# Pick any repo
git clone https://github.com/your-favorite/repo
cd repo

# One command — that's it
npx harnesskit init --yes

# Verify the setup
npx harnesskit doctor
npx harnesskit enforce
npx harnesskit garden
```
