# End-to-End Examples

> True e2e tests: start with a **fresh PRD**, run the full pipeline, verify everything.

## What This Tests

The full harnesskit pipeline, as a real user would experience it:

```
Fresh PRD → git init → harnesskit init → drop PRD in docs/references/ →
harnesskit ingest → agent populates SoT files → harnesskit doctor ✔ →
harnesskit enforce ✔ → harnesskit garden ✔
```

Each example starts from **nothing** — an empty git repo + a `package.json`/`pyproject.toml`/`go.mod` + a realistic PRD.

---

## Results Summary

| Project | Language | IDEs | `init` | `ingest` | `doctor` | `enforce` | `garden` |
|---------|----------|------|--------|----------|----------|-----------|----------|
| **TaskFlow API** | Node.js | VS Code + Cursor | Pass | Pass | **13/13** | Pass | Pass |
| **ShopWave** | Python | VS Code + Cursor | Pass | Pass | **13/13** | Pass | Pass |
| **InfraCtl** | Go | VS Code | Pass | Pass | **12/12** | Pass | Pass |

---

## Example 1: TaskFlow API (Node.js)

**What:** Real-time collaborative task management API with WebSockets and GitHub sync.

**PRD:** [taskflow-api-nodejs/PRD.md](taskflow-api-nodejs/PRD.md) (7 KB, includes architecture diagram, API endpoints, data classification, SLA targets)

### Step 1 — Create project + init

```bash
mkdir taskflow-api && cd taskflow-api
git init

# Create package.json with express, pg, redis, socket.io, zod, jsonwebtoken
# (see taskflow-api-nodejs/PRD.md for full dependency list)

npx harnesskit init --yes --lang node --ide vscode,cursor --git github
```

**Output:**
```
Auto-detected: node project, vscode+cursor IDE(s), github git
✔ docs/ knowledge base
✔ CI: GitHub Actions workflow
✔ AGENTS.md (universal)
✔ .github/agents/ (6 agents: planner, implementer, reviewer, arch-reviewer, security-reviewer, doc-gardener)
✔ .github/copilot-instructions.md
✔ .cursor/rules/ (6 rules)
✔ .vscode/mcp.json, .cursor/mcp.json
✔ .env.example, .vscode/settings.json, .vscode/extensions.json
```

MCP servers auto-configured: GitHub, Filesystem, Fetch, **PostgreSQL** (detected from `pg` dependency), Memory.

### Step 2 — Drop PRD + ingest

```bash
cp PRD.md docs/references/
npx harnesskit ingest
```

**Output:**
```
Found 1 source document(s) in docs/references/
✔ docs/references/PRD.md
✔ docs/generated/INGEST_INSTRUCTION.md

What to do next:
  Option A — IDE Agent: paste INGEST_INSTRUCTION.md into agent chat
  Option C — Claude Code: claude "Follow docs/generated/INGEST_INSTRUCTION.md"
```

The ingest command generates a structured prompt in `INGEST_INSTRUCTION.md` that any coding agent (Copilot, Cursor, Claude Code, etc.) can follow to populate the SoT files.

### Step 3 — Agent populates SoT files from PRD

The coding agent reads the PRD and populates:

| File | What the agent extracted from PRD |
|------|----------------------------------|
| `docs/ARCHITECTURE.md` | Layer diagram: Models → Config → Services → Routes + WS. 5 domain boundaries. Dependency rules. |
| `docs/SECURITY.md` | JWT (RS256, 15 min), OAuth2 GitHub, data classification table (4 levels), rate limiting |
| `docs/RELIABILITY.md` | Health endpoints, SLA: 99.9% uptime / p95 < 200ms / WS < 50ms, 5 failure modes with mitigations |
| `docs/QUALITY_SCORE.md` | 6 domains graded F (greenfield), priorities listed |
| `docs/exec-plans/active/001-mvp-auth.md` | 9-step execution plan with acceptance criteria |
| `docs/exec-plans/active/002-mvp-projects-tasks.md` | 9-step plan for CRUD + search |
| `docs/product-specs/mvp-features.md` | User stories for Auth, Projects, Tasks, Real-time + 18 API endpoints |

**Key files:** [Browse all generated files](taskflow-api-nodejs/)

### Step 4 — Verify

```
$ npx harnesskit doctor
  ✔ AGENTS.md
  ✔ docs/ARCHITECTURE.md
  ✔ docs/QUALITY_SCORE.md
  ✔ docs/SECURITY.md
  ✔ docs/RELIABILITY.md
  ✔ docs/design-docs/
  ✔ docs/design-docs/core-beliefs.md
  ✔ docs/exec-plans/active/
  ✔ docs/exec-plans/active/_template.md
  ✔ docs/references/
  ✔ .github/copilot-instructions.md
  ✔ .github/agents/
  ✔ .cursor/rules/
  Summary: 13 passed, 0 failed, 4 optional missing
  ✔ Harness setup is healthy!

$ npx harnesskit enforce
  Architecture check PASSED — no layer violations

$ npx harnesskit garden
  ✔ No documentation issues found!
```

### Generated Architecture (from PRD)

```
Models → Config → Services → Routes (API)
                  Services → WebSocket Handlers (WS)
Shared: middleware/, providers/

Domains: Auth, Projects, Tasks, Real-time, GitHub Sync
```

---

## Example 2: ShopWave (Python)

**What:** E-commerce platform with AI-powered recommendations, Stripe payments, Celery workers.

**PRD:** [shopwave-python/PRD.md](shopwave-python/PRD.md) (6 KB, includes system diagram, GDPR requirements, flash sale handling)

### Step 1 — Init

```bash
npx harnesskit init --yes --lang python --ide vscode,cursor --git github
```

Detects: `pyproject.toml` → Python, generates `pytest`/`ruff check .`/`python -m build` commands.

### Step 2 — Ingest PRD

```bash
cp PRD.md docs/references/
npx harnesskit ingest
```

### Step 3 — Agent populates from PRD

| File | What was extracted |
|------|-------------------|
| `docs/ARCHITECTURE.md` | API → Services → Repositories → Models, with Tasks (Celery) + Providers (Stripe, S3) |
| `docs/SECURITY.md` | PCI DSS via Stripe, GDPR compliance, no card data stored locally |
| `docs/RELIABILITY.md` | Flash sale: 10x auto-scale, p95 < 300ms catalog / < 500ms checkout, 99.95% checkout uptime |
| `docs/QUALITY_SCORE.md` | 6 domains: Catalog, Cart, Orders, Payments, Recommendations, Admin |

### Step 4 — Verify

```
$ npx harnesskit doctor
  13 passed, 0 failed, 4 optional missing
  ✔ Harness setup is healthy!
```

**Key files:** [Browse all generated files](shopwave-python/)

---

## Example 3: InfraCtl (Go CLI)

**What:** Multi-cloud infrastructure CLI (AWS, GCP, K8s) with HCL configs and dry-run safety.

**PRD:** [infractl-go/PRD.md](infractl-go/PRD.md) (4 KB, includes Cobra CLI structure, cloud provider layers, audit logging)

### Step 1 — Init

```bash
npx harnesskit init --yes --lang go --ide vscode --git github
```

Detects: `go.mod` → Go, generates `go build ./...`/`go test ./...`/`golangci-lint run` commands.

### Step 2 — Ingest PRD

```bash
cp PRD.md docs/references/
npx harnesskit ingest
```

### Step 3 — Agent populates from PRD

| File | What was extracted |
|------|-------------------|
| `docs/ARCHITECTURE.md` | cmd → handlers → services → providers → models, pkg/ shared. Go-idiomatic `internal/` layout. |
| `docs/SECURITY.md` | Cloud credentials in OS keychain, audit logging, no plaintext secrets |
| `docs/RELIABILITY.md` | CLI < 500ms local / < 5s cloud, < 50MB binary, dry-run default, rollback support |
| `docs/QUALITY_SCORE.md` | 7 domains: CLI, Handlers, Services, AWS Provider, GCP Provider, K8s Provider, Config |

### Step 4 — Verify

```
$ npx harnesskit doctor
  12 passed, 0 failed, 5 optional missing
  ✔ Harness setup is healthy!
```

**Key files:** [Browse all generated files](infractl-go/)

---

## Cross-Language Comparison

| Feature | Node.js (TaskFlow) | Python (ShopWave) | Go (InfraCtl) |
|---------|--------------------|--------------------|---------------|
| **Detected by** | `package.json` | `pyproject.toml` | `go.mod` |
| **Build** | `npm run build` | `python -m build` | `go build ./...` |
| **Test** | `npm test` (Jest) | `pytest` | `go test ./...` |
| **Lint** | `npm run lint` (ESLint) | `ruff check .` | `golangci-lint run` |
| **Top layer** | Routes | API (FastAPI) | Handlers (Cobra) |
| **Bottom layer** | Models | Models | Models |
| **Async** | WebSocket (Socket.IO) | Celery workers | Goroutines |
| **MCP: PostgreSQL** | Auto-detected (pg dep) | Not detected | Not detected |
| **IDE configs** | VS Code + Cursor | VS Code + Cursor | VS Code |
| **Doctor result** | 13/13 | 13/13 | 12/12 |

## Full Pipeline Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. FRESH REPO         2. SCAFFOLD          3. INGEST           │
│  ┌───────────┐         ┌───────────┐        ┌───────────┐      │
│  │ PRD.md    │         │ AGENTS.md │        │ Drop PRD  │      │
│  │ go.mod    │  init   │ docs/     │ ingest │ into refs/│      │
│  │ (nothing  │ ──────▶ │ .github/  │ ──────▶│ Generate  │      │
│  │  else)    │  --yes  │ .cursor/  │        │ INGEST_   │      │
│  │           │         │ .vscode/  │        │ INSTRUCTION│      │
│  └───────────┘         └───────────┘        └─────┬─────┘      │
│                                                   │             │
│  4. AGENT POPULATES          5. VERIFY            │             │
│  ┌───────────────┐           ┌───────────┐        │             │
│  │ Agent reads    │           │ doctor ✔  │        │             │
│  │ INGEST_        │  doctor   │ enforce ✔ │        │             │
│  │ INSTRUCTION    │ ────────▶ │ garden ✔  │◀───────┘             │
│  │ Populates SoT: │  enforce  │           │                     │
│  │ ARCHITECTURE   │  garden   │ ALL PASS  │                     │
│  │ SECURITY       │           └───────────┘                     │
│  │ RELIABILITY    │                                             │
│  │ QUALITY_SCORE  │                                             │
│  │ exec-plans/    │                                             │
│  │ product-specs/ │                                             │
│  └───────────────┘                                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Try It Yourself

```bash
# 1. Create a fresh project
mkdir my-app && cd my-app && git init
echo '{ "name": "my-app", "scripts": { "test": "jest" } }' > package.json

# 2. Write a PRD (or use an existing one)
cat > PRD.md << 'EOF'
# My App — PRD
## Architecture
...your architecture here...
## Features
...your features here...
EOF

# 3. Run the full pipeline
npx harnesskit init --yes
cp PRD.md docs/references/
npx harnesskit ingest

# 4. Paste the generated instruction into your coding agent
# (Copilot, Cursor, Claude Code, etc.)
cat docs/generated/INGEST_INSTRUCTION.md

# 5. After the agent populates SoT files, verify
npx harnesskit doctor
npx harnesskit enforce
npx harnesskit garden
```
