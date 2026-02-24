# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [0.1.0] — 2026-02-23

### Added
- `harnesskit init` — interactive wizard to scaffold Harness Engineering in any repo
- Auto-detection of language (Node, Python, .NET, Java, Go, Rust), IDEs, and git provider
- Architecture discovery from project folder structure + import sampling
- AGENTS.md generation — universal agent instructions file
- Per-IDE agent configs: VS Code/Copilot, Cursor, Claude Code, Windsurf, JetBrains, Codex, Kiro, Antigravity, Gemini CLI
- MCP server config generation (per-IDE)
- docs/ knowledge base: ARCHITECTURE.md, SECURITY.md, RELIABILITY.md, QUALITY_SCORE.md, design-docs, exec-plans
- CI templates: GitHub Actions + Azure Pipelines
- `harnesskit enforce` — architecture layer rule enforcement (import boundary validation)
- `harnesskit doctor` — health-check for harness setup completeness
- `harnesskit garden` — doc-gardener (stale docs, broken refs, completed plans)
- `harnesskit ingest` — auto-populate Source-of-Truth files from reference docs
- Premium CLI visuals: gradient ASCII banner, tree output, boxed next-steps
- Zero dependencies — pure Node.js built-ins only
