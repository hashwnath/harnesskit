<div align="center">

# ⚡ harness-lab

**Plug-and-play SDK for Harness Engineering — agent-first development in any repo, any IDE, any git provider.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-green)](https://nodejs.org)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-zero-blue)]()

</div>

---

## What Is This?

**harness-lab** implements the [Harness Engineering](https://openai.com/index/harness-engineering/) workflow as a **universal, pluggable SDK**. One command scaffolds the complete agent-first development infrastructure — structured knowledge base, specialized agent personas, architecture enforcement, execution plans, and quality tracking — adapted to **your** language, IDE, and git provider.

```bash
npx harness-lab init
```

That's it. Your repo is now set up for agent-first development.

## The Problem

OpenAI showed that with the right *scaffolding*, AI agents can build and ship real products. But their setup is deeply integrated with Codex. The patterns are universal — the tooling isn't:

- **AGENTS.md** tells agents about your repo (60k+ repos use it)
- **Agent Skills** give agents reusable capabilities (adopted by every major tool)
- But **nobody has packaged the full orchestration layer**: execution plans, quality grades, architecture enforcement, agent-to-agent review loops, doc gardening

**harness-lab** is that missing layer.

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│  npx harness-lab init                                           │
│                                                                 │
│  Detects: language, IDE, git provider                           │
│  Generates: AGENTS.md + docs/ + agents + skills + enforcement   │
│  Adapts to: VS Code, Cursor, Claude Code, Windsurf, JetBrains  │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  YOUR REPO (any language, any IDE)                              │
│                                                                 │
│  AGENTS.md ............... Universal agent instructions          │
│  docs/ARCHITECTURE.md .... Layer rules + dependency diagram     │
│  docs/QUALITY_SCORE.md ... Per-domain quality grades            │
│  docs/exec-plans/ ........ Execution plan templates             │
│  docs/design-docs/ ....... Core beliefs + design decisions      │
│                                                                 │
│  .github/agents/ ......... VS Code custom agents                │
│  .cursor/rules/ .......... Cursor rules                         │
│  .claude/agents/ ......... Claude Code subagents                │
│  .windsurf/rules/ ........ Windsurf rules                       │
│  .junie/guidelines.md .... JetBrains Junie                      │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│  THE WORKFLOW                                                   │
│                                                                 │
│  You → Planner → [review] → Implementer → Reviewer → Ship      │
│                                                                 │
│  harness-lab enforce ... validate architecture rules            │
│  harness-lab doctor .... check setup health                     │
│  harness-lab garden .... find stale docs & broken refs          │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### New Project
```bash
mkdir my-project && cd my-project
git init
npx harness-lab init
```

### Existing Project
```bash
cd my-existing-repo
npx harness-lab init          # Interactive wizard
# or
npx harness-lab init --yes    # Auto-detect everything
```

### Specify Your Stack
```bash
npx harness-lab init --lang python --ide cursor,vscode --git ado
```

## Supported Environments

### Languages
| Language | Auto-Detected By | Build/Test/Lint Commands |
|----------|-----------------|------------------------|
| Node.js / TypeScript | `package.json` | `npm run build`, `npm test`, `npm run lint` |
| Python | `pyproject.toml`, `requirements.txt` | `python -m build`, `pytest`, `ruff check` |
| .NET (C#/F#) | `*.csproj`, `*.sln` | `dotnet build`, `dotnet test`, `dotnet format` |
| Java / Kotlin | `pom.xml`, `build.gradle` | `./gradlew build`, `./gradlew test` |
| Go | `go.mod` | `go build`, `go test`, `golangci-lint` |
| Rust | `Cargo.toml` | `cargo build`, `cargo test`, `cargo clippy` |

### IDEs / Agent Runtimes

| IDE | Config Format | What's Generated |
|-----|--------------|-----------------|
| **VS Code + GitHub Copilot** | `.github/agents/*.agent.md` | 4 custom agents + copilot-instructions.md |
| **Cursor** | `.cursor/rules/*.md` | 4 rules with Cursor frontmatter |
| **Claude Code** | `.claude/agents/*.md` + `CLAUDE.md` | CLAUDE.md with @-imports + 4 subagents |
| **Windsurf** | `.windsurf/rules/*.md` | 4 workspace rules |
| **JetBrains (Junie)** | `.junie/guidelines.md` | Unified guidelines file |
| **All tools** | `AGENTS.md` | Always generated (universal standard) |

### Git Providers
| Provider | Auto-Detected By | Special Features |
|----------|-----------------|-----------------|
| GitHub | `github.com` in remote | Cloud agent support, PR via `gh` |
| Azure DevOps | `dev.azure.com` in remote | PR via `az repos`, work item linking |
| GitLab | `gitlab` in remote | MR via `glab` |
| Bitbucket | `bitbucket.org` in remote | PR via `bb` |

## Commands

| Command | What It Does |
|---------|-------------|
| `harness-lab init` | Interactive setup wizard |
| `harness-lab init --yes` | Non-interactive, auto-detect everything |
| `harness-lab enforce` | Validate architecture layer rules |
| `harness-lab doctor` | Check setup health and completeness |
| `harness-lab garden` | Find stale docs, broken refs, completed plans |

## What Gets Generated

### 4 Specialized Agents

| Agent | Role | Tools |
|-------|------|-------|
| **Planner** | Creates execution plans, never writes code | Read-only |
| **Implementer** | Writes code following plans and architecture | Full access |
| **Reviewer** | Reviews for architecture, tests, quality | Read + terminal |
| **Doc Gardener** | Finds and fixes stale documentation | Read + write |

### Knowledge Base (docs/)

| File | Purpose |
|------|---------|
| `ARCHITECTURE.md` | Layer rules, dependency diagram, key directories |
| `QUALITY_SCORE.md` | Per-domain quality grades (A through F) |
| `design-docs/core-beliefs.md` | 8 agent-first operating principles |
| `exec-plans/active/` | In-flight execution plans |
| `exec-plans/active/_template.md` | Plan template with Goal, Steps, Acceptance Criteria |
| `exec-plans/completed/` | Archived completed plans |

### The Agent Workflow

```
You (human intent)
  │
  ├─→ Planner Agent
  │     Creates structured execution plan
  │     Saves to docs/exec-plans/active/
  │     → Handoff: "Start Implementation"
  │
  ├─→ Implementer Agent
  │     Follows plan step by step
  │     Runs tests after each step
  │     → Handoff: "Request Review"
  │
  ├─→ Reviewer Agent
  │     Checks architecture + tests + quality
  │     Reports PASS or FAIL
  │     → If FAIL: "Fix Issues" → back to Implementer
  │     → If PASS: Ship it
  │
  └─→ Doc Gardener Agent (periodic)
        Finds stale docs, broken links
        Archives completed plans
        Updates quality scores
```

## Design Principles

1. **Zero dependencies** — pure Node.js, no npm install needed for the CLI
2. **Universal standard first** — always generates `AGENTS.md` (read by every tool)
3. **Progressive disclosure** — short AGENTS.md → deep docs/ → IDE-specific configs
4. **Language agnostic** — works with Node, Python, .NET, Java, Go, Rust
5. **IDE agnostic** — one `init` generates configs for all your IDEs at once
6. **Git provider agnostic** — GitHub, ADO, GitLab, Bitbucket
7. **Non-destructive** — never overwrites existing files (safe for existing repos)
8. **Composable** — use the CLI or import as a library

## Programmatic API

```javascript
import { init, enforce, doctor, garden, generateAgents } from 'harness-lab';

// Generate harness scaffold programmatically
await init('/path/to/repo', { yes: true, lang: 'python', ide: 'cursor,vscode' });

// Run architecture enforcement
await enforce('/path/to/repo');

// Check setup health
await doctor('/path/to/repo');
```

## Mapping to OpenAI's Harness Engineering

| Harness Principle | harness-lab Implementation |
|---|---|
| AGENTS.md as table of contents | Auto-generated `AGENTS.md` (~50 lines, links to docs/) |
| Structured docs/ knowledge base | `docs/` — ARCHITECTURE, QUALITY_SCORE, exec-plans, core-beliefs |
| Layered architecture enforcement | `harness-lab enforce` — language-agnostic import scanner |
| Agent-to-agent review loop | Planner → Implementer → Reviewer handoff agents |
| Execution plans as first-class artifacts | `docs/exec-plans/active/` with templates |
| Garbage collection / doc gardening | `harness-lab garden` + Doc Gardener agent |
| Progressive disclosure | AGENTS.md → docs/ → IDE-specific instructions |
| Corrections are cheap | Non-blocking flow, fix-up PRs encouraged |

## Contributing

1. Fork the repo
2. Create a feature branch
3. Add or update templates, generators, or commands
4. Test: `node --test tests/`
5. Submit a PR

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

**Built for the agent-first era.**

*Humans steer. Agents execute. harness-lab sets up the environment.*

</div>
