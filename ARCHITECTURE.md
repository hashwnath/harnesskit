# Architecture — harnesskit

> How the SDK is structured internally. Read this before contributing.

## Design Principles

1. **Zero dependencies** — only Node.js built-ins (`node:fs`, `node:path`, `node:readline`, `node:util`)
2. **Template-driven** — all scaffold output comes from `.tmpl` files, not hardcoded strings
3. **Detect-then-generate** — auto-detect the project context, then generate adapted output
4. **Portable** — works on Windows, macOS, Linux. No shell scripts, no native binaries.

## High-Level Flow

```
User runs: npx harnesskit init
                │
                ▼
        ┌───────────────┐
        │   bin/cli.js   │  Parse args, route to command
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  detect.js     │  Language, IDE, git provider, CLI agents
        │  discover.js   │  Folder structure → architecture layers
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │  init.js       │  Interactive wizard OR --yes auto-mode
        └───────┬───────┘
                │
        ┌───────┴────────────────────────┐
        │                                │
        ▼                                ▼
┌────────────────┐            ┌────────────────────┐
│ template-engine │            │ generators/         │
│ (render .tmpl)  │            │ agents.js + tooling │
└────────────────┘            └────────────────────┘
        │                                │
        └────────────┬───────────────────┘
                     ▼
              Target repo gets:
              AGENTS.md, docs/*, agent configs,
              MCP configs, CI workflows
```

## Module Responsibilities

| Module | Responsibility |
|--------|---------------|
| `bin/cli.js` | Entry point. Parses CLI args with `node:util parseArgs`. Routes to commands. |
| `src/commands/init.js` | Core wizard. Detects context, prompts user, generates scaffold. |
| `src/commands/enforce.js` | Reads `docs/ARCHITECTURE.md`, parses layer rules, scans imports for violations. |
| `src/commands/doctor.js` | Checks that all expected harness files exist and aren't empty. |
| `src/commands/garden.js` | Finds stale docs, broken internal links, completed exec-plans. |
| `src/commands/ingest.js` | Reads `docs/references/` and generates an LLM prompt to populate SoT files. |
| `src/detect.js` | Detects language (by lockfile/config), IDEs (by config dirs), git provider (by remote URL), CLI agents (by `which`). |
| `src/discover.js` | Scans folder tree + samples import statements to discover architecture layers. |
| `src/prompt.js` | Interactive readline prompts: `ask()`, `select()`, `multiSelect()`, `confirm()`. |
| `src/ui.js` | ANSI terminal styling: gradient banner, tree output, boxed sections, colors. |
| `src/template-engine.js` | Mustache-lite renderer: loads `.tmpl` files, replaces `{{var}}` placeholders. |
| `src/generators/agents.js` | Generates AGENTS.md + per-IDE agent config files (.github/agents, .cursor/rules, etc.). |
| `src/generators/tooling.js` | Generates MCP server configs, .env.example, VS Code settings/extensions. |
| `src/enforcers/index.js` | Import-boundary validator used by `enforce` command. |

## Template System

Templates live in `src/templates/` and use `{{variable}}` syntax:

```
src/templates/
  AGENTS.md.tmpl                    → AGENTS.md
  agents/
    planner.agent.md.tmpl           → .github/agents/planner.agent.md (etc.)
  ci/
    github-actions.yml.tmpl         → .github/workflows/harness-checks.yml
    azure-pipelines.yml.tmpl        → harness-checks.azure-pipelines.yml
  docs/
    ARCHITECTURE.md.tmpl            → docs/ARCHITECTURE.md
    SECURITY.md.tmpl                → docs/SECURITY.md
    ...
```

Available template variables: `projectName`, `projectDescription`, `lang`, `date`, `layerDiagram`, `layerRules`, `buildCmd`, `testCmd`, `lintCmd`, `startCmd`, `packageRunner`.

## Adding a New Command

1. Create `src/commands/yourcommand.js` with an exported async function
2. Import and wire it in `bin/cli.js` switch statement
3. Add it to `printHelp()` in `src/ui.js`
4. Document in README.md

## Adding a New IDE/Agent

1. `src/detect.js` — add detection logic (check for config dirs/files)
2. `src/generators/agents.js` — add generation path
3. `src/templates/agents/` — add template files if needed
4. `src/commands/init.js` — add to the `multiSelect` options list
5. `src/generators/tooling.js` — add MCP config generation if the IDE supports it
