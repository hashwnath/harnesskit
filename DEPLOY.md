# Deployment Instructions — `harness-lab`

> **For the deploying agent / human**: Follow these steps to publish `harness-lab` from a **personal GitHub account** to npm. No org account required.

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
  "url": "https://github.com/YOUR_USERNAME/harness-lab"
}
```

---

## 3. Create a GitHub Repository

```bash
# Option A — GitHub CLI
gh repo create YOUR_USERNAME/harness-lab --public --source=. --remote=origin --push

# Option B — Manual
# 1. Create repo at https://github.com/new  →  Name: harness-lab  →  Public  →  No template
# 2. Then:
git remote add origin https://github.com/YOUR_USERNAME/harness-lab.git
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
npx harness-lab init
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
| `bin/cli.js` | CLI entry point (`npx harness-lab init`) |
| `src/` | Core SDK — detect, discover, generate, enforce |
| `src/templates/` | `.tmpl` files rendered into target repos |
| `README.md` | User-facing docs |
| `LICENSE` | MIT license |

The `files` field in `package.json` controls what ships to npm. Only `bin/`, `src/`, `README.md`, and `LICENSE` are published — no dev artifacts, no `.git`.

---

## Important Notes

- **Package name**: `harness-lab` (not `harness-lab-sdk` — the folder name doesn't matter)
- **Zero dependencies**: No `npm install` needed; uses only Node.js built-ins
- **Requires**: Node.js >= 18 (for `node:util parseArgs`, `node:fs/promises`, etc.)
- **License**: MIT — authored by Hashwanth Sutharapu
- **Repository URL**: Must be filled in before `npm publish` (see step 2)
