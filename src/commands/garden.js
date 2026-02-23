/**
 * `harness-lab garden` command.
 * Doc-gardener: finds stale references, broken links, completed plans.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { heading, step, fail, warn, info, bold, color } from '../ui.js';

export async function garden(targetDir) {
  heading('Doc Gardener');
  info(`Scanning: ${targetDir}\n`);

  let issues = 0;

  // 1. Check file references in AGENTS.md
  issues += checkFileRefs(targetDir, 'AGENTS.md');

  // 2. Check file references in docs/
  const docsDir = join(targetDir, 'docs');
  if (existsSync(docsDir)) {
    const mdFiles = getAllMdFiles(docsDir);
    for (const file of mdFiles) {
      const rel = relative(targetDir, file).replace(/\\/g, '/');
      issues += checkFileRefs(targetDir, rel);
    }
  }

  // 3. Check for completed execution plans
  const activePlans = join(targetDir, 'docs', 'exec-plans', 'active');
  if (existsSync(activePlans)) {
    const plans = readdirSync(activePlans).filter((f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md');
    for (const plan of plans) {
      const content = readFileSync(join(activePlans, plan), 'utf-8');
      const unchecked = (content.match(/- \[ \]/g) || []).length;
      const checked = (content.match(/- \[x\]/gi) || []).length;
      if (unchecked === 0 && checked > 0) {
        warn(`Plan "${plan}" has all steps checked — ready to archive to completed/`);
        issues++;
      }
    }
  }

  // 4. Report
  console.log('');
  if (issues === 0) {
    step(bold(color('No documentation issues found!', 'green')));
  } else {
    info(bold(`Found ${issues} issue(s) to address`));
  }
}

function checkFileRefs(rootDir, relMdPath) {
  const fullPath = join(rootDir, relMdPath);
  if (!existsSync(fullPath)) return 0;

  const content = readFileSync(fullPath, 'utf-8');
  let issues = 0;

  // Find markdown links: [text](path)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const linkPath = match[2];
    // Skip URLs and anchors
    if (linkPath.startsWith('http') || linkPath.startsWith('#') || linkPath.startsWith('mailto:')) continue;

    // Resolve relative to the markdown file's directory
    const resolved = join(rootDir, linkPath.split('#')[0]);
    if (!existsSync(resolved)) {
      fail(`${relMdPath}: broken link → "${linkPath}"`);
      issues++;
    }
  }

  return issues;
}

function getAllMdFiles(dir) {
  const results = [];
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...getAllMdFiles(full));
      } else if (entry.name.endsWith('.md')) {
        results.push(full);
      }
    }
  } catch { /* permission */ }
  return results;
}
