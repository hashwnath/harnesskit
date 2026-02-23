/**
 * `harness-lab init` command.
 * Interactive wizard or --yes for auto-detect mode.
 */

import { join } from 'node:path';
import { detectLanguage, detectIDEs, detectGitProvider, detectProjectName, detectCLIAgents, detectToolingNeeds } from '../detect.js';
import { ask, select, multiSelect, confirm, closeRL } from '../prompt.js';
import { printBanner, heading, step, info, color, bold } from '../ui.js';
import { generate, writeFile } from '../template-engine.js';
import { generateAgents } from '../generators/agents.js';
import { generateTooling, getActiveMcpSummary } from '../generators/tooling.js';
import { discoverArchitecture } from '../discover.js';

/** Default architecture layers by language */
const LAYER_PRESETS = {
  node: { layers: 'Types → Config → Service → Routes', diagram: 'Types → Config → Service → Routes (API)\n                 Service → Pages  (UI)\nShared: utils/, providers/' },
  python: { layers: 'Models → Config → Services → API', diagram: 'Models → Config → Services → API (FastAPI/Flask)\nShared: utils/, providers/' },
  dotnet: { layers: 'Models → Config → Services → Controllers', diagram: 'Models → Config → Services → Controllers\nShared: Utils/, Infrastructure/' },
  java: { layers: 'Domain → Config → Service → Controller', diagram: 'Domain → Config → Service → Controller\nShared: util/, infrastructure/' },
  go: { layers: 'Models → Config → Service → Handlers', diagram: 'Models → Config → Service → Handlers\nShared: pkg/' },
  rust: { layers: 'Types → Config → Service → Handlers', diagram: 'Types → Config → Service → Handlers\nShared: utils/' },
  other: { layers: 'Types → Config → Service → Interface', diagram: 'Types → Config → Service → Interface\nShared: utils/' },
};

export async function init(targetDir, flags) {
  printBanner();

  // ─── Detect or ask ──────────────────────────────────────────────
  const detected = detectLanguage(targetDir);
  const detectedIDEs = detectIDEs(targetDir);
  const detectedGit = detectGitProvider(targetDir);
  const detectedName = detectProjectName(targetDir);
  const cliAgents = detectCLIAgents();

  let config;

  if (flags.yes) {
    // Non-interactive: use detected values + flag overrides
    config = {
      projectName: flags.name || detectedName,
      projectDescription: 'An agent-first project powered by harness-lab',
      lang: flags.lang || detected.lang,
      ides: flags.ide ? flags.ide.split(',') : detectedIDEs.length > 0 ? detectedIDEs : ['vscode'],
      git: flags.git || detectedGit,
      buildCmd: detected.buildCmd,
      testCmd: detected.testCmd,
      lintCmd: detected.lintCmd,
      startCmd: detected.startCmd,
    };
    info(`Auto-detected: ${config.lang} project, ${config.ides.join('+')} IDE(s), ${config.git} git`);
    const availableCLI = cliAgents.filter(a => a.available).map(a => a.name);
    if (availableCLI.length > 0) {
      info(`CLI agents found: ${availableCLI.join(', ')}`);
    }
  } else {
    // Interactive wizard
    heading('Project Setup');

    const projectName = await ask(`  Project name`, detectedName);
    const projectDescription = await ask(`  Description`, 'An agent-first project');

    const lang = await select('Language / Runtime:', [
      { label: 'Node.js / TypeScript', value: 'node' },
      { label: 'Python', value: 'python' },
      { label: '.NET (C# / F#)', value: 'dotnet' },
      { label: 'Java / Kotlin', value: 'java' },
      { label: 'Go', value: 'go' },
      { label: 'Rust', value: 'rust' },
      { label: 'Other', value: 'other' },
    ], detected.lang);

    const ides = await multiSelect('Target IDEs / Agents:', [
      { label: 'VS Code + GitHub Copilot', value: 'vscode' },
      { label: 'Cursor', value: 'cursor' },
      { label: 'Claude Code', value: 'claude-code' },
      { label: 'Windsurf / Codeium', value: 'windsurf' },
      { label: 'JetBrains (Junie)', value: 'jetbrains' },
      { label: 'OpenAI Codex CLI', value: 'codex' },
      { label: 'Kiro (AWS)', value: 'kiro' },
      { label: 'Antigravity (Google)', value: 'antigravity' },
      { label: 'Gemini CLI (Google)', value: 'gemini' },
      { label: 'All of the above', value: 'all' },
    ], detectedIDEs.length > 0 ? detectedIDEs : ['vscode']);

    const git = await select('Git provider:', [
      { label: 'GitHub', value: 'github' },
      { label: 'Azure DevOps', value: 'ado' },
      { label: 'GitLab', value: 'gitlab' },
      { label: 'Bitbucket', value: 'bitbucket' },
      { label: 'Other / None', value: 'unknown' },
    ], detectedGit);

    // Re-detect build commands for chosen language
    const langInfo = LAYER_PRESETS[lang] || LAYER_PRESETS.other;
    const langDetected = lang === detected.lang ? detected : { buildCmd: '# TODO', testCmd: '# TODO', lintCmd: '# TODO', startCmd: '# TODO' };

    config = {
      projectName,
      projectDescription,
      lang,
      ides,
      git,
      buildCmd: langDetected.buildCmd,
      testCmd: langDetected.testCmd,
      lintCmd: langDetected.lintCmd,
      startCmd: langDetected.startCmd,
    };
  }

  // ─── Discover architecture ──────────────────────────────────────
  const archResult = discoverArchitecture(targetDir, config.lang);
  const preset = LAYER_PRESETS[config.lang] || LAYER_PRESETS.other;
  const date = new Date().toISOString().split('T')[0];

  let layerDiagram, layerRules;
  if (archResult.discovered) {
    layerDiagram = archResult.diagram;
    layerRules   = archResult.rules;
    info(`Discovered ${archResult.layers.length} layers: ${archResult.layers.map(l => l.folder).join(', ')}`);
    if (archResult.unmapped.length) {
      info(`Unmapped folders (kept as-is): ${archResult.unmapped.join(', ')}`);
    }
  } else {
    layerDiagram = preset.diagram;
    layerRules   = generateLayerRules(config.lang);
    info('No layered structure detected — using generic layer presets.');
  }

  const ctx = {
    ...config,
    layerDiagram,
    layerRules,
    date,
  };

  // ─── Generate files ─────────────────────────────────────────────
  heading('Generating Harness Engineering scaffold...');

  // 1. Knowledge base (docs/)
  step('docs/ knowledge base');
  generate('docs/ARCHITECTURE.md.tmpl', join(targetDir, 'docs', 'ARCHITECTURE.md'), ctx);
  generate('docs/QUALITY_SCORE.md.tmpl', join(targetDir, 'docs', 'QUALITY_SCORE.md'), ctx);
  generate('docs/SECURITY.md.tmpl', join(targetDir, 'docs', 'SECURITY.md'), ctx);
  generate('docs/RELIABILITY.md.tmpl', join(targetDir, 'docs', 'RELIABILITY.md'), ctx);
  generate('docs/core-beliefs.md.tmpl', join(targetDir, 'docs', 'design-docs', 'core-beliefs.md'), ctx);
  generate('docs/DESIGN_DOCS_README.md.tmpl', join(targetDir, 'docs', 'design-docs', 'README.md'), ctx);
  generate('docs/exec-plans-readme.md.tmpl', join(targetDir, 'docs', 'exec-plans', 'active', 'README.md'), ctx);
  generate('docs/exec-plan-template.md.tmpl', join(targetDir, 'docs', 'exec-plans', 'active', '_template.md'), ctx);
  writeFile(join(targetDir, 'docs', 'exec-plans', 'completed', '.gitkeep'), '');

  // Empty placeholder directories (progressive docs/ structure)
  writeFile(join(targetDir, 'docs', 'product-specs', '.gitkeep'), '');
  writeFile(join(targetDir, 'docs', 'references', '.gitkeep'), '');
  writeFile(join(targetDir, 'docs', 'generated', '.gitkeep'), '');

  // 1b. CI/CD integration (optional — based on git provider)
  if (config.git === 'github') {
    step('CI: GitHub Actions workflow');
    generate('ci/github-actions.yml.tmpl', join(targetDir, '.github', 'workflows', 'harness-checks.yml'), ctx);
  } else if (config.git === 'ado') {
    step('CI: Azure Pipelines config');
    generate('ci/azure-pipelines.yml.tmpl', join(targetDir, 'harness-checks.azure-pipelines.yml'), ctx);
  }

  // 2. Agents (multi-environment)
  heading('Generating agent configs...');
  generateAgents(targetDir, config.ides, ctx);

  // 2b. Tool & MCP configs
  heading('Generating tool & MCP configs...');
  const toolingNeeds = detectToolingNeeds(targetDir);
  ctx.toolingNeeds = toolingNeeds;
  generateTooling(targetDir, config.ides, ctx);

  // 3. Summary
  heading('Done!');
  console.log(`
${bold('Your repo is now set up for Harness Engineering.')}

${color('What was created:', 'cyan')}
  ${color('●', 'green')} AGENTS.md — universal agent instructions (read by all tools)
  ${color('●', 'green')} docs/ARCHITECTURE.md — layer rules & dependency diagram
  ${color('●', 'green')} docs/QUALITY_SCORE.md — per-domain quality grades
  ${color('●', 'green')} docs/SECURITY.md — security posture & data classification
  ${color('●', 'green')} docs/RELIABILITY.md — bootability, health checks & SLA targets
  ${color('●', 'green')} docs/design-docs/ — design decisions (README + core-beliefs)
  ${color('●', 'green')} docs/exec-plans/ — execution plan templates
  ${color('●', 'green')} docs/product-specs/, references/, generated/ — placeholder dirs
  ${color('●', 'green')} Agent configs for: ${config.ides.join(', ')}
  ${color('●', 'green')} MCP server configs (per-IDE)
  ${color('●', 'green')} .env.example — required tokens & keys
  ${color('●', 'green')} .vscode/settings.json — editor & agent-mode settings
  ${color('●', 'green')} .vscode/extensions.json — recommended extensions${config.git === 'github' ? `\n  ${color('●', 'green')} .github/workflows/harness-checks.yml — CI enforcement` : config.git === 'ado' ? `\n  ${color('●', 'green')} harness-checks.azure-pipelines.yml — CI enforcement` : ''}

${color('Active MCP Servers:', 'cyan')}
${getActiveMcpSummary(ctx).map(s => `  ${color('●', 'green')} ${s.name} — ${s.description}`).join('\n')}

${color('PR Workflow:', 'magenta')}
  Plan → Implement → Self-check → Open PR → Review Loop → CI Gate → ${bold('Human Merges')}
  ${color('⚠', 'yellow')}  Agents open PRs and flag issues. ${bold('Only humans approve and merge.')}

${color('CLI Agents Detected:', 'cyan')}
${cliAgents.map(a => `  ${a.available ? color('●', 'green') : color('○', 'dim')} ${a.name}${a.available ? '' : ' (not found)'}`).join('\n')}

${color('Next steps:', 'yellow')}
  1. Review AGENTS.md and customize for your project
  2. Review docs/ARCHITECTURE.md — ${archResult.discovered ? `${archResult.layers.length} layers discovered from your project structure` : `generic layer rules for ${color(config.lang, 'cyan')} (add folders and re-run to auto-detect)`}
  3. Review docs/SECURITY.md and docs/RELIABILITY.md
  4. Open your IDE and try the ${bold('Planner')} agent
  5. Run ${color('harness-lab doctor', 'cyan')} to check setup health
  6. Run ${color('harness-lab enforce', 'cyan')} to validate architecture

${color('Workflow (Review Loop):', 'magenta')}
  You → Planner → Implementer → [Arch Reviewer → Security Reviewer → Reviewer] → Ship
  (If ANY reviewer FAILs → back to Implementer → re-review until ALL PASS)

${color('Have existing docs? (PRD, architecture, requirements):', 'magenta')}
  Drop them into ${color('docs/references/', 'cyan')} then run ${color('harness-lab ingest', 'cyan')}
`);

  closeRL();
}

function generateLayerRules(lang) {
  const rules = {
    node: `| Layer | Can Import From | Cannot Import From |
|-------|----------------|-------------------|
| Routes | Service, Types, Providers, Utils | UI, Config (direct) |
| Service | Config, Types, Providers, Utils | Routes, UI |
| Config | Types, Utils | Service, Routes, UI |
| Types | Utils only | Everything else |
| Providers | Config, Types, Utils | Service, Routes, UI |
| Utils | Nothing (leaf nodes) | Everything |`,
    python: `| Layer | Can Import From | Cannot Import From |
|-------|----------------|-------------------|
| API | Services, Models, Utils | Config (direct) |
| Services | Config, Models, Providers, Utils | API |
| Config | Models, Utils | Services, API |
| Models | Utils only | Everything else |
| Providers | Config, Models, Utils | Services, API |
| Utils | Nothing (leaf nodes) | Everything |`,
  };
  return rules[lang] || rules.node;
}
