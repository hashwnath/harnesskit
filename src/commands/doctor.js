/**
 * `harness-lab doctor` command.
 * Validates that the harness setup is complete and healthy.
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { heading, step, fail, warn, info, bold, color } from '../ui.js';

const CHECKS = [
  // Universal
  { path: 'AGENTS.md', label: 'AGENTS.md (universal agent instructions)', required: true },
  { path: 'docs/ARCHITECTURE.md', label: 'docs/ARCHITECTURE.md (layer rules)', required: true },
  { path: 'docs/QUALITY_SCORE.md', label: 'docs/QUALITY_SCORE.md (quality grades)', required: true },
  { path: 'docs/SECURITY.md', label: 'docs/SECURITY.md (security posture)', required: false },
  { path: 'docs/RELIABILITY.md', label: 'docs/RELIABILITY.md (reliability guide)', required: false },
  { path: 'docs/design-docs', label: 'docs/design-docs/ (design decisions)', required: false },
  { path: 'docs/design-docs/core-beliefs.md', label: 'docs/design-docs/core-beliefs.md', required: false },
  { path: 'docs/exec-plans/active', label: 'docs/exec-plans/active/ (execution plans)', required: true },
  { path: 'docs/exec-plans/active/_template.md', label: 'docs/exec-plans/active/_template.md', required: false },
  { path: 'docs/references', label: 'docs/references/ (source documents for ingest)', required: false },

  // VS Code
  { path: '.github/copilot-instructions.md', label: '.github/copilot-instructions.md', required: false, ide: 'vscode' },
  { path: '.github/agents', label: '.github/agents/ (custom agents)', required: false, ide: 'vscode' },

  // Cursor
  { path: '.cursor/rules', label: '.cursor/rules/ (Cursor rules)', required: false, ide: 'cursor' },

  // Claude Code
  { path: 'CLAUDE.md', label: 'CLAUDE.md (Claude Code memory)', required: false, ide: 'claude-code' },
  { path: '.claude/agents', label: '.claude/agents/ (Claude subagents)', required: false, ide: 'claude-code' },

  // Windsurf
  { path: '.windsurf/rules', label: '.windsurf/rules/ (Windsurf rules)', required: false, ide: 'windsurf' },

  // JetBrains
  { path: '.junie/guidelines.md', label: '.junie/guidelines.md (Junie)', required: false, ide: 'jetbrains' },
];

export async function doctor(targetDir) {
  heading('Harness Lab Doctor');
  info(`Checking: ${targetDir}\n`);

  let passed = 0;
  let failed = 0;
  let warned = 0;
  const ideFilesFound = new Set();

  for (const check of CHECKS) {
    const exists = existsSync(join(targetDir, check.path));
    if (exists) {
      step(`${check.label}`);
      passed++;
      if (check.ide) ideFilesFound.add(check.ide);
    } else if (check.required) {
      fail(`${check.label} ${color('(MISSING — required)', 'red')}`);
      failed++;
    } else {
      warn(`${check.label} ${color('(not found — optional)', 'dim')}`);
      warned++;
    }
  }

  // Report
  console.log('');
  heading('Summary');
  info(`${color(String(passed), 'green')} passed, ${color(String(failed), 'red')} failed, ${color(String(warned), 'yellow')} optional missing`);

  if (ideFilesFound.size > 0) {
    info(`IDE configs detected: ${[...ideFilesFound].join(', ')}`);
  }

  if (failed === 0) {
    step(bold(color('Harness setup is healthy!', 'green')));
  } else {
    fail(bold(color(`${failed} required file(s) missing. Run \`harness-lab init\` to fix.`, 'red')));
    process.exit(1);
  }
}
