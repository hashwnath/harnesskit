# Contributing to harnesskit

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/YOUR_USERNAME/harnesskit.git
cd harnesskit
node bin/cli.js --help    # no install needed — zero deps
```

**Requirements:** Node.js >= 18

## Project Structure

```
bin/cli.js              CLI entry point (arg parsing, command routing)
src/
  commands/
    init.js             Interactive wizard + scaffold generation
    enforce.js          Architecture layer rule enforcement
    doctor.js           Health-check for harness setup
    garden.js           Doc-gardener (stale docs, broken refs)
    ingest.js           Auto-populate SoT from reference docs
  detect.js             Auto-detect language, IDE, git provider
  discover.js           Scan project folders + imports for architecture
  prompt.js             Interactive prompts (readline-based)
  ui.js                 Terminal UI — banner, colors, tree, box
  template-engine.js    Mustache-lite template renderer
  generators/
    agents.js           AGENTS.md + per-IDE agent configs
    tooling.js          MCP server configs, .env.example, VS Code settings
  enforcers/
    index.js            Import-boundary validation
  templates/            .tmpl files rendered into target repos
```

## How to Contribute

### Bug Fixes
1. Open an issue describing the bug
2. Fork → branch (`fix/description`) → fix → PR
3. Include steps to reproduce

### New Features
1. Open a discussion/issue first — let's align on scope
2. Fork → branch (`feat/description`) → implement → PR
3. Add/update templates if the feature touches scaffold output

### New IDE/Agent Support
- Add detection logic in `src/detect.js`
- Add agent config generation in `src/generators/agents.js`
- Add template files in `src/templates/agents/`
- Update the multi-select in `src/commands/init.js`

### New Language Support
- Add detection in `src/detect.js` → `detectLanguage()`
- Add layer presets in `src/commands/init.js` → `LAYER_PRESETS`
- Test with a real project in that language

## Code Style

- **Zero dependencies** — do not add npm packages. Use Node.js built-ins only.
- **ES modules** — `import`/`export`, not `require()`
- **Template files** use `{{variable}}` syntax (Mustache-lite)
- Keep functions small and well-named
- Add JSDoc comments for exported functions

## Testing

```bash
# Self-test: run init in a temp directory
mkdir /tmp/test-project && cd /tmp/test-project
node /path/to/harnesskit/bin/cli.js init --yes

# Verify output
node /path/to/harnesskit/bin/cli.js doctor .
node /path/to/harnesskit/bin/cli.js enforce .
```

There's no test framework (zero deps). Manual testing with real projects is the gold standard.

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add Kiro (AWS) agent support
fix: doctor command missing exec-plans check
chore: update template wording
docs: add architecture decision record
```

## Pull Request Process

1. Ensure `node bin/cli.js --help` still works
2. Test `init --yes` on a sample project
3. Run `enforce` and `doctor` on the output
4. Update README if you added user-facing features
5. One approval required to merge

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
