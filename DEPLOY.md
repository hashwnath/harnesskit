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

### Suggested Title
> **"I Built an Open-Source CLI That Sets Up Any Repo for AI Agent Development in 30 Seconds"**

### Structure (~8–12 min read)

```markdown
# I Built an Open-Source CLI That Sets Up Any Repo for AI Agent Development in 30 Seconds

## The Problem
- OpenAI published "Harness Engineering" — a methodology for making AI coding
  agents actually productive
- The core ideas (structured knowledge, agent personas, architecture enforcement)
  are brilliant — but there's no universal tool to set it up
- Every team reinvents the wheel: custom AGENTS.md, scattered docs, no enforcement

## What Is Harness Engineering?
- Brief explainer (cite the OpenAI blog post)
- Key principles: repo-as-truth, layered architecture, review loops, quality tracking
- Why it works: agents perform 2–5x better when the repo has structured context

## Introducing harnesskit
- One command: `npx harnesskit init`
- Zero dependencies, works with any language, any IDE, any git provider
- [Embed demo GIF here]

## What It Generates
- Walk through each generated file with screenshots/code blocks:
  - AGENTS.md — the universal agent instruction file
  - docs/ARCHITECTURE.md — layer rules auto-discovered from your project
  - Agent personas (Planner, Implementer, Reviewer, Security, Arch)
  - MCP server configs
  - CI enforcement (GitHub Actions / Azure Pipelines)
  - Quality tracking, security posture, reliability docs

## The Architecture Discovery Engine
- How `harnesskit` scans your folder tree and samples imports
- How it maps folders → layers → dependency rules
- Before/after: generic presets vs. discovered architecture

## The Review Loop
- Explain the agent workflow: Plan → Implement → [Arch + Security + Reviewer] → Ship
- Agents open PRs, flag issues — humans approve and merge
- How `harnesskit enforce` catches architecture violations in CI

## Getting Started
- Step-by-step: `npx harnesskit init`, open IDE, try the Planner agent
- Link to GitHub repo + npm package

## What's Next
- Roadmap: more languages, more IDEs, plugin system
- Call for contributors
- Link to GitHub issues

---
*If you found this useful, star the repo and share it with your team.*
```

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

The problem:
OpenAI showed that AI coding agents work 2–5x better when repos have structured
context — AGENTS.md, architecture rules, review loops. But nobody packaged this
into a universal tool.

The solution:
npx harnesskit init

One command. Zero dependencies. Works with:
→ Any language (Node, Python, .NET, Java, Go, Rust)
→ Any IDE (VS Code, Cursor, Claude Code, Windsurf, JetBrains)
→ Any git provider (GitHub, Azure DevOps, GitLab, Bitbucket)

What it generates:
✅ AGENTS.md — universal agent instructions
✅ docs/ARCHITECTURE.md — auto-discovered layer rules
✅ Agent personas — Planner, Implementer, Reviewer, Security
✅ MCP server configs — per-IDE
✅ CI enforcement — architecture validation in your pipeline
✅ Quality tracking, security posture, reliability docs

The magic: it SCANS your actual project structure, samples your imports, and
generates architecture rules that match YOUR code — not generic templates.

Built with zero dependencies. Pure Node.js. MIT licensed.

Try it: npx harnesskit init
GitHub: [LINK]
npm: https://www.npmjs.com/package/harnesskit

If you work with AI coding agents — Copilot, Claude Code, Cursor, Codex — this
is the scaffolding layer you're missing.

Star it if it's useful ⭐

#OpenSource #AI #DeveloperTools #SoftwareEngineering #CodingAgents
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
