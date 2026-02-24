/**
 * Multi-environment agent generator.
 * Takes agent templates and emits them in the right format for each IDE.
 *
 * Targets:
 *   vscode     → .github/agents/*.agent.md + .github/copilot-instructions.md
 *   cursor     → .cursor/rules/*.md
 *   claude-code → .claude/agents/*.md + CLAUDE.md
 *   windsurf   → .windsurf/rules/*.md
 *   jetbrains  → .junie/guidelines.md
 *   universal  → AGENTS.md (always)
 */

import { join, dirname } from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { render, writeFile, generate } from '../template-engine.js';
import { step, warn } from '../ui.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, '..', 'templates');
const AGENT_NAMES = ['planner', 'implementer', 'reviewer', 'arch-reviewer', 'security-reviewer', 'doc-gardener'];

function renderAgent(name, ctx) {
  const raw = readFileSync(join(TEMPLATES_DIR, 'agents', `${name}.agent.md.tmpl`), 'utf-8');
  return render(raw, ctx);
}

function stripFrontmatter(md) {
  return md.replace(/^---[\s\S]*?---\n*/m, '');
}

const DESCRIPTIONS = {
  planner: 'Create execution plans without writing code',
  implementer: 'Implement code following plans and architecture rules',
  reviewer: 'Review code for architecture compliance and quality',
  'arch-reviewer': 'Peer reviewer for architectural compliance and layer violations',
  'security-reviewer': 'Peer reviewer for security posture, secrets hygiene, and vulnerabilities',
  'doc-gardener': 'Find and fix stale documentation',
};

const CLAUDE_TOOLS = {
  planner: 'Read, Grep, Glob, LS',
  implementer: 'Read, Write, Edit, Bash, Grep, Glob, LS',
  reviewer: 'Read, Grep, Glob, LS, Bash',
  'arch-reviewer': 'Read, Grep, Glob, LS, Bash',
  'security-reviewer': 'Read, Grep, Glob, LS, Bash',
  'doc-gardener': 'Read, Write, Edit, Grep, Glob, LS, Bash',
};

export function generateAgents(targetDir, ides, ctx) {
  const wrote = generate('AGENTS.md.tmpl', join(targetDir, 'AGENTS.md'), ctx);
  if (wrote) step('AGENTS.md (universal)');
  else warn('AGENTS.md exists — skipped');

  const targets = ides.includes('all')
    ? ['vscode', 'cursor', 'claude-code', 'windsurf', 'jetbrains', 'codex', 'kiro', 'antigravity', 'gemini']
    : ides;

  for (const ide of targets) {
    GENERATORS[ide]?.(targetDir, ctx);
  }
}

// ─── Per-IDE Generators ───────────────────────────────────────────

function genVSCode(targetDir, ctx) {
  for (const name of AGENT_NAMES) {
    const content = renderAgent(name, ctx);
    const w = writeFile(join(targetDir, '.github', 'agents', `${name}.agent.md`), content);
    if (w) step(`.github/agents/${name}.agent.md`);
  }
  const instr = `# ${ctx.projectName} — Copilot Instructions\n\n## Tech Stack\nLanguage: ${ctx.lang}\n\n## Build & Validate\n\`\`\`bash\n${ctx.buildCmd}\n${ctx.testCmd}\n${ctx.lintCmd}\n${ctx.startCmd}\n\`\`\`\n\n## Architecture\nSee docs/ARCHITECTURE.md. Run \`harnesskit enforce\` to validate.\n\n## Conventions\n- Parse at boundaries\n- Cross-cutting through shared/provider layer only\n- Every new function needs tests\n- Update docs/QUALITY_SCORE.md when quality changes\n`;
  const w = writeFile(join(targetDir, '.github', 'copilot-instructions.md'), instr);
  if (w) step('.github/copilot-instructions.md');
}

function genCursor(targetDir, ctx) {
  for (const name of AGENT_NAMES) {
    const body = stripFrontmatter(renderAgent(name, ctx));
    const content = `---\ndescription: "${DESCRIPTIONS[name]}"\nalwaysApply: false\n---\n\n${body}`;
    const w = writeFile(join(targetDir, '.cursor', 'rules', `${name}.md`), content);
    if (w) step(`.cursor/rules/${name}.md`);
  }
}

function genClaude(targetDir, ctx) {
  const claudeMd = `# CLAUDE.md — ${ctx.projectName}\n\n@AGENTS.md\n@docs/ARCHITECTURE.md\n@docs/design-docs/core-beliefs.md\n\n## Build Commands\n\`\`\`bash\n${ctx.buildCmd}\n${ctx.testCmd}\n${ctx.lintCmd}\n\`\`\`\n`;
  let w = writeFile(join(targetDir, 'CLAUDE.md'), claudeMd);
  if (w) step('CLAUDE.md');
  for (const name of AGENT_NAMES) {
    const body = stripFrontmatter(renderAgent(name, ctx));
    const content = `---\nname: ${name}\ndescription: ${DESCRIPTIONS[name]}\ntools: "${CLAUDE_TOOLS[name]}"\n---\n\n${body}`;
    w = writeFile(join(targetDir, '.claude', 'agents', `${name}.md`), content);
    if (w) step(`.claude/agents/${name}.md`);
  }
}

function genWindsurf(targetDir, ctx) {
  for (const name of AGENT_NAMES) {
    const body = stripFrontmatter(renderAgent(name, ctx));
    const w = writeFile(join(targetDir, '.windsurf', 'rules', `${name}.md`), body);
    if (w) step(`.windsurf/rules/${name}.md`);
  }
}

function genJetBrains(targetDir, ctx) {
  const content = `# Junie Guidelines — ${ctx.projectName}\n\n## Architecture\nSee docs/ARCHITECTURE.md.\n\n## Build\n\`\`\`bash\n${ctx.buildCmd}\n${ctx.testCmd}\n${ctx.lintCmd}\n\`\`\`\n\n## Workflow\n1. Read AGENTS.md\n2. Check docs/exec-plans/active/\n3. Follow layer rules\n4. Run tests after changes\n5. Update docs/QUALITY_SCORE.md\n`;
  const w = writeFile(join(targetDir, '.junie', 'guidelines.md'), content);
  if (w) step('.junie/guidelines.md');
}

function genCodex(targetDir, ctx) {
  const content = `# Codex CLI Instructions — ${ctx.projectName}

You are working on **${ctx.projectName}**.

## First Steps
1. Read \`AGENTS.md\` in the project root — it is the universal agent guide.
2. Check \`docs/exec-plans/active/\` for your current task.
3. Follow the architecture layer rules in \`docs/ARCHITECTURE.md\`.

## Build & Test
\`\`\`bash
${ctx.buildCmd}
${ctx.testCmd}
${ctx.lintCmd}
\`\`\`

## Workflow
1. Read AGENTS.md for role definitions and review loop.
2. Follow layer rules — never import against the grain.
3. Run tests after every change.
4. Open a PR when done — do NOT merge (human reviews and merges).
5. If CI fails, read the logs and self-correct.

## Key Docs
- \`AGENTS.md\` — agent roles & review loop
- \`docs/ARCHITECTURE.md\` — layer rules
- \`docs/QUALITY_SCORE.md\` — quality grades
- \`docs/SECURITY.md\` — security posture
- \`docs/design-docs/\` — prior decisions
`;
  const w = writeFile(join(targetDir, 'codex.md'), content);
  if (w) step('codex.md');
}

const GENERATORS = {
  vscode: genVSCode,
  cursor: genCursor,
  'claude-code': genClaude,
  windsurf: genWindsurf,
  jetbrains: genJetBrains,
  codex: genCodex,
  kiro: genKiro,
  antigravity: genAntigravity,
  gemini: genGemini,
};

function genKiro(targetDir, ctx) {
  const steering = `# Kiro Steering — ${ctx.projectName}\n\n## First Steps\n1. Read \`AGENTS.md\` — universal agent guide.\n2. Check \`docs/exec-plans/active/\` for current tasks.\n3. Follow layer rules in \`docs/ARCHITECTURE.md\`.\n\n## Build & Test\n\`\`\`bash\n${ctx.buildCmd}\n${ctx.testCmd}\n${ctx.lintCmd}\n\`\`\`\n\n## Key Docs\n- \`AGENTS.md\` — roles & review loop\n- \`docs/ARCHITECTURE.md\` — layer rules\n- \`docs/QUALITY_SCORE.md\` — quality grades\n- \`docs/SECURITY.md\` — security posture\n`;
  const w = writeFile(join(targetDir, '.kiro', 'steering', 'harness.md'), steering);
  if (w) step('.kiro/steering/harness.md');
}

function genAntigravity(targetDir, ctx) {
  const content = `# Antigravity Agent — ${ctx.projectName}\n\n## First Steps\n1. Read \`AGENTS.md\` — universal agent guide.\n2. Check \`docs/exec-plans/active/\` for current tasks.\n3. Follow layer rules in \`docs/ARCHITECTURE.md\`.\n\n## Build & Test\n\`\`\`bash\n${ctx.buildCmd}\n${ctx.testCmd}\n${ctx.lintCmd}\n\`\`\`\n\n## Workflow\n1. Follow the review loop in AGENTS.md.\n2. Run tests after every change.\n3. Open a PR when done — humans review and merge.\n\n## Key Docs\n- \`AGENTS.md\` — roles & review loop\n- \`docs/ARCHITECTURE.md\` — layer rules\n- \`docs/QUALITY_SCORE.md\` — quality grades\n- \`docs/SECURITY.md\` — security posture\n`;
  const w = writeFile(join(targetDir, '.agent', 'harness-instructions.md'), content);
  if (w) step('.agent/harness-instructions.md');
}

function genGemini(targetDir, ctx) {
  const content = `# Gemini CLI Instructions — ${ctx.projectName}\n\n## First Steps\n1. Read \`AGENTS.md\` — universal agent guide.\n2. Check \`docs/exec-plans/active/\` for current tasks.\n3. Follow layer rules in \`docs/ARCHITECTURE.md\`.\n\n## Build & Test\n\`\`\`bash\n${ctx.buildCmd}\n${ctx.testCmd}\n${ctx.lintCmd}\n\`\`\`\n\n## Workflow\n1. Follow the review loop in AGENTS.md.\n2. Run tests after every change.\n3. Open a PR when done — humans review and merge.\n\n## Key Docs\n- \`AGENTS.md\` — roles & review loop\n- \`docs/ARCHITECTURE.md\` — layer rules\n- \`docs/QUALITY_SCORE.md\` — quality grades\n- \`docs/SECURITY.md\` — security posture\n`;
  const w = writeFile(join(targetDir, '.gemini', 'harness-instructions.md'), content);
  if (w) step('.gemini/harness-instructions.md');
}
