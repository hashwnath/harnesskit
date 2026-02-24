# Deployment Instructions — `harnesskit`

> **For the deploying agent / human**: Follow these steps to publish `harnesskit` from a **personal GitHub account** to npm. No org account required.

---

## Pre-flight Checklist

- [ ] Node.js >= 18 installed (`node -v`)
- [ ] npm CLI available (`npm -v`)
- [ ] An npmjs.com account (free) — [sign up](https://www.npmjs.com/signup)
- [ ] A personal GitHub account (not org) — for hosting the repo
- [ ] Git installed and configured with your identity

---

## 1. Set Your Git Identity

```bash
git config user.name "YOUR_NAME"
git config user.email "YOUR_EMAIL"
```

---

## 2. Fill In `package.json` → `repository.url`

The `repository.url` field is intentionally left empty. Set it to your personal GitHub repo URL:

```json
"repository": {
  "type": "git",
  "url": "https://github.com/YOUR_USERNAME/harnesskit"
}
```

---

## 3. Create a GitHub Repository

```bash
# Option A — GitHub CLI
gh repo create YOUR_USERNAME/harnesskit --public --source=. --remote=origin --push

# Option B — Manual
# 1. Create repo at https://github.com/new  →  Name: harnesskit  →  Public  →  No template
# 2. Then:
git remote add origin https://github.com/YOUR_USERNAME/harnesskit.git
git push -u origin master
```

---

## 4. Publish to npm

```bash
# Login to npm (one-time)
npm login

# Dry-run to verify what gets published (should list bin/, src/, README, LICENSE)
npm pack --dry-run

# Publish
npm publish --access public
```

After publishing, anyone in the world can run:

```bash
npx harnesskit init
```

---

## 5. Future Releases

```bash
# Bump version (patch/minor/major)
npm version patch -m "release: v%s"

# Push code + tag
git push origin master --tags

# Publish new version
npm publish
```

---

## 6. (Optional) Automate Publishing with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm
on:
  push:
    tags: ['v*']
jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

Then add your npm access token as a repository secret named `NPM_TOKEN`:
- npmjs.com → Access Tokens → Generate New Token (Automation)
- GitHub → Repo Settings → Secrets → New Repository Secret

---

## What's in the Package

| Path | Purpose |
|------|---------|
| `bin/cli.js` | CLI entry point (`npx harnesskit init`) |
| `src/` | Core SDK — detect, discover, generate, enforce |
| `src/templates/` | `.tmpl` files rendered into target repos |
| `README.md` | User-facing docs |
| `LICENSE` | MIT license |

The `files` field in `package.json` controls what ships to npm. Only `bin/`, `src/`, `README.md`, and `LICENSE` are published — no dev artifacts, no `.git`.

---

## Important Notes

- **Package name**: `harnesskit` (not `harnesskit-sdk` — the folder name doesn't matter)
- **Zero dependencies**: No `npm install` needed; uses only Node.js built-ins
- **Requires**: Node.js >= 18 (for `node:util parseArgs`, `node:fs/promises`, etc.)
- **License**: MIT — authored by Hashwanth Sutharapu

---

## 7. Record a Video Demo

A short, punchy terminal recording is the single highest-ROI promo asset. People share GIFs.

### What to Record

| Segment | Duration | What to Show |
|---------|----------|-------------|
| Intro | 5s | Empty repo with just a `package.json` or `requirements.txt` |
| Init | 15s | Run `npx harnesskit init --yes` — show the gradient banner, auto-detection, file tree |
| Output | 10s | Quick scroll through generated `AGENTS.md`, `docs/ARCHITECTURE.md` |
| Enforce | 5s | Run `npx harnesskit enforce` — show pass/fail output |
| Doctor | 5s | Run `npx harnesskit doctor` — show health check |
| **Total** | **~40s** | |

### Tools

- **[asciinema](https://asciinema.org/)** — records terminal sessions as text (shareable, embeddable)
- **[VHS](https://github.com/charmbracelet/vhs)** — converts a script to a GIF/MP4 automatically
- **[terminalizer](https://github.com/faressoft/terminalizer)** — Node.js terminal recorder → GIF

### VHS Script (fastest)

```
# demo.tape — run with: vhs demo.tape
Output demo.gif
Set FontSize 14
Set Width 900
Set Height 500
Set Theme "Catppuccin Mocha"

Type "mkdir my-project && cd my-project && npm init -y" Enter
Sleep 2s
Type "npx harnesskit init --yes" Enter
Sleep 8s
Type "npx harnesskit doctor ." Enter
Sleep 4s
Type "npx harnesskit enforce ." Enter
Sleep 4s
```

### Where to Post the GIF
- GitHub README (embed at top)
- Twitter/X post
- LinkedIn post (as video or GIF attachment)
- Medium article (inline)

---

## 8. Write a Medium Article (Long-form)

Below is a full, publish-ready draft. Copy into Medium, add the demo GIF at the top, and publish.

---

### Full Draft — Copy Below This Line

---

# I Built an Open-Source CLI That Sets Up Any Repo for AI Agent Development in 30 Seconds

*An open-source implementation of OpenAI's Harness Engineering methodology — for any language, any IDE, any git provider.*

<!-- [INSERT DEMO GIF HERE] -->

## The Turning Point: OpenAI's Harness Engineering

In 2025, OpenAI published something that quietly changed how serious teams think about AI-assisted development: **[Harness Engineering](https://openai.com/index/harness-engineering/)**.

The idea was deceptively simple: AI coding agents don't fail because they're dumb — they fail because repos are unstructured. Give an agent a flat repo with no architecture docs, no clear conventions, and no layered knowledge, and it will hallucinate file structures, violate import boundaries, and produce code that technically runs but architecturally decays.

Give that same agent a **harnessed** repo — one with structured knowledge (AGENTS.md, architecture docs, security posture), specialized agent personas (Planner, Implementer, Reviewer), and mechanical enforcement (layer rules validated in CI) — and suddenly, agents can build and ship real features.

OpenAI proved this works. Their internal Codex agents, powered by this methodology, achieved dramatically better results when the repo was properly "harnessed."

**But there was a catch: the tooling was deeply coupled to Codex.** The principles were universal. The implementation wasn't.

## The Gap Nobody Filled

After that blog post, the developer world adopted pieces of the pattern:
- **60,000+ repos** now have an `AGENTS.md` file
- Every major IDE — Copilot, Cursor, Claude Code, Windsurf — reads some form of agent instructions
- Teams started writing architecture docs and review workflows

But nobody packaged the **full orchestration layer**:
- Structured docs/ with architecture rules, security posture, reliability targets, and quality grades
- Specialized agent personas that hand off work in a defined flow
- Mechanical enforcement that catches architecture violations in CI — not just linting, but *layer boundary validation*
- Execution plans as first-class artifacts
- A discovery engine that understands YOUR project's actual structure

Every team was reinventing this wheel, one markdown file at a time.

## Introducing harnesskit

I built **harnesskit** to close that gap. One command:

```bash
npx harnesskit init
```

That's it. Your repo is now set up for agent-first development.

**Zero dependencies.** Pure Node.js built-ins. Works on Windows, macOS, Linux. No install step.

It detects your language, your IDE, and your git provider automatically — then generates the complete Harness Engineering infrastructure adapted to your specific stack:

<!-- [INSERT SCREENSHOT OF INIT OUTPUT WITH FILE TREE] -->

### What Gets Generated

| File | Purpose |
|------|---------|
| **AGENTS.md** | Universal agent instructions — the "table of contents" for every AI tool |
| **docs/ARCHITECTURE.md** | Layer rules and dependency graphs — auto-discovered from your project |
| **docs/SECURITY.md** | Security posture, data classification, auth patterns |
| **docs/RELIABILITY.md** | Bootability, health checks, SLA targets |
| **docs/QUALITY_SCORE.md** | Per-domain quality grades |
| **docs/design-docs/** | Design decisions + core beliefs |
| **docs/exec-plans/** | Execution plan templates (Plan → Implement → Review → Ship) |
| **Agent configs** | Per-IDE: `.github/agents/`, `.cursor/rules/`, `.claude/`, etc. |
| **MCP server configs** | Per-IDE — context7, sequential-thinking, GitHub |
| **CI workflows** | `harnesskit enforce` + `harnesskit doctor` in GitHub Actions or Azure Pipelines |

### The Architecture Discovery Engine

This is the part I'm most proud of: **harnesskit doesn't just paste generic templates.** It scans your actual project.

When you run `init`, the discovery engine:
1. Walks your folder tree
2. Identifies architectural layers (API, models, services, utils, config, etc.)
3. Samples import/require statements from actual source files
4. Maps real dependency flows between folders
5. Generates architecture rules that match **your** code

A Python FastAPI project gets different layer rules than a Node.js Express app or a Go microservice — because the engine *looked at the code*, not a preset.

If it can't detect structure (flat project, or too early), it falls back to sensible language-specific presets and tells you to re-run after adding folders.

### The Agent Review Loop

harnesskit generates 6 specialized agent personas:

```
You → Planner → Implementer → [Arch Reviewer · Security Reviewer · Reviewer] → Ship
```

Each persona has a specific role:
- **Planner** — breaks tasks into execution plans, creates branch strategy
- **Implementer** — writes code following the architecture rules
- **Arch Reviewer** — validates layer boundaries and dependency direction
- **Security Reviewer** — checks auth, crypto, data handling
- **Reviewer** — overall quality, test coverage, edge cases

If ANY reviewer fails → the Implementer gets the feedback → re-implements → re-review. This loop continues until all three pass.

**Critical rule**: Agents open PRs and flag issues. **Only humans approve and merge.** This isn't a technicality — it's a core principle from OpenAI's methodology, and harnesskit enforces it in the generated workflow instructions.

### Mechanical Enforcement

`harnesskit enforce` is a language-agnostic import boundary validator. It reads your `docs/ARCHITECTURE.md`, extracts the layer rules table, then scans every source file's imports to find violations.

If `Routes` imports from `UI` and the architecture says that's forbidden — it fails. In CI. Before merge.

This is what turns architecture docs from aspirational to structural.

### What It Supports

| Dimension | Options |
|-----------|---------|
| Languages | Node.js, Python, .NET, Java, Go, Rust, Other |
| IDEs | VS Code + Copilot, Cursor, Claude Code, Windsurf, JetBrains, Codex CLI, Kiro, Antigravity, Gemini CLI |
| Git | GitHub, Azure DevOps, GitLab, Bitbucket |
| CI | GitHub Actions, Azure Pipelines |

## Credit Where It's Due

**harnesskit is an open-source implementation of [OpenAI's Harness Engineering](https://openai.com/index/harness-engineering/) methodology.** The core principles — repository-as-source-of-truth, structured agent instructions, layered architecture enforcement, agent-to-agent review loops, execution plans, and progressive disclosure — all originate from OpenAI's published research on making AI coding agents effective at real codebases.

What harnesskit adds is the **universal packaging**: detecting your stack, generating adapted scaffolding, discovering your architecture, and working across every major IDE and git provider — not just Codex.

This project is not affiliated with, endorsed by, or sponsored by OpenAI.

## Getting Started

```bash
# Scaffold your repo
npx harnesskit init

# Check setup health
npx harnesskit doctor

# Validate architecture rules
npx harnesskit enforce

# Find stale docs
npx harnesskit garden

# Have reference docs? Auto-populate
npx harnesskit ingest
```

The interactive wizard takes ~30 seconds. The `--yes` flag auto-detects everything.

## What's Next

- More language-specific presets (Elixir, PHP, Swift)
- Plugin system for custom enforcers
- `harnesskit upgrade` to update scaffolding without overwriting customizations
- Dashboard / quality report generator

Star the repo if this is useful: **[GitHub](https://github.com/YOUR_USERNAME/harnesskit)**

Try it now: `npx harnesskit init`

---

*Built for the agent-first era. Humans steer. Agents execute. harnesskit sets up the environment.*

---

### Publishing Tips
- Add 5 tags: `AI`, `Developer Tools`, `Open Source`, `Software Engineering`, `Coding Agents`
- Add the demo GIF as the hero image
- Cross-post to dev.to and Hashnode for wider reach
- Submit to publications: "Better Programming", "Towards AI", "Level Up Coding"

---

## 9. Write a LinkedIn Post (Short-form)

### Template (~300 words)

```
🚀 I just open-sourced harnesskit — a CLI that sets up any repo for AI agent
development in 30 seconds.

The backstory:
In 2025, OpenAI published "Harness Engineering" — a methodology that showed AI
coding agents perform dramatically better when repos have structured context:
AGENTS.md, architecture rules, agent personas, review loops.

The principles are brilliant. But the tooling was built for Codex.

So I built harnesskit — an open-source implementation of those principles for
EVERY language, EVERY IDE, EVERY git provider.

npx harnesskit init

One command. Zero dependencies. What it does:
→ Auto-detects your language, IDE, git provider
→ Scans your folder structure + imports to discover architecture
→ Generates AGENTS.md, docs/, agent configs, MCP servers, CI workflows

Works with:
🔧 Node, Python, .NET, Java, Go, Rust
🖥️ VS Code, Cursor, Claude Code, Windsurf, JetBrains, Gemini CLI
🔀 GitHub, Azure DevOps, GitLab, Bitbucket

The magic: it doesn't paste templates. It READS your project structure, samples
your imports, and generates architecture rules that match YOUR code.

Then `harnesskit enforce` validates those rules in CI — mechanical enforcement,
not just documentation.

Credit: The core methodology (repo-as-truth, layered enforcement, agent review
loops, execution plans) comes from OpenAI's Harness Engineering research. This
tool packages those principles into a universal CLI.

Not affiliated with OpenAI — just inspired by their work.

Try it: npx harnesskit init
GitHub: [LINK]
npm: https://www.npmjs.com/package/harnesskit

MIT licensed. Zero dependencies. Pure Node.js.

⭐ Star if it's useful.

#OpenSource #AI #DeveloperTools #HarnessEngineering #CodingAgents
```

### LinkedIn Tips
- Post between 8–10 AM on Tuesday/Wednesday for max reach
- Add the demo GIF or a screenshot of the terminal output
- Tag relevant people (AI tool creators, dev advocacy accounts)
- Reply to every comment in the first 2 hours (algorithm boost)
- Re-share 1 week later with a "lessons learned" angle

---

## 10. Additional Promotion Channels

| Channel | Format | Notes |
|---------|--------|-------|
| Twitter/X | Short thread (5 tweets) | Hook → Problem → Solution → Demo GIF → CTA |
| Reddit | Post to r/programming, r/node, r/SideProject | Follow subreddit rules, don't be spammy |
| Hacker News | "Show HN: harnesskit — ..." | Best on weekday mornings US time |
| Product Hunt | Launch page + demo | Prepare 3 days ahead, rally upvotes |
| dev.to | Cross-post Medium article | Good for SEO + dev community |
| Discord | Post in AI/dev tool servers | Cursor, Claude Code, Copilot community servers |
- **Repository URL**: Must be filled in before `npm publish` (see step 2)
