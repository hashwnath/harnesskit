/**
 * Tool & MCP configuration generator.
 * Detects what integrations the project needs, then generates:
 *   - MCP server configs per IDE (.vscode/mcp.json, .cursor/mcp.json, .mcp.json)
 *   - VS Code settings & extension recommendations
 *   - .env.example with required tokens/keys
 *   - Claude Code permissions (.claude/settings.json)
 *
 * Design principle: auto-detect what the project needs → wire up the tools.
 * The coding agent already exists — we just give it hands.
 */

import { join } from 'node:path';
import { writeFile } from '../template-engine.js';
import { step, heading } from '../ui.js';

// ─── MCP Server Registry ──────────────────────────────────────────
// Each entry: { id, name, when, package, args, env, description }
// "when" controls auto-inclusion based on detected needs

const MCP_REGISTRY = [
  {
    id: 'github',
    name: 'GitHub',
    when: (ctx) => ctx.toolingNeeds?.github,
    package: '@modelcontextprotocol/server-github',
    args: [],
    env: { GITHUB_PERSONAL_ACCESS_TOKEN: '${env:GITHUB_TOKEN}' },
    envExample: { GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
    description: 'Create issues, PRs, read repos, manage branches',
  },
  {
    id: 'filesystem',
    name: 'Filesystem',
    when: () => true, // Always useful
    package: '@modelcontextprotocol/server-filesystem',
    args: ['${workspaceFolder}'],
    env: {},
    envExample: {},
    description: 'Enhanced file operations (search, batch edit, tree)',
  },
  {
    id: 'fetch',
    name: 'Fetch',
    when: () => true, // Always useful
    package: '@modelcontextprotocol/server-fetch',
    args: [],
    env: {},
    envExample: {},
    description: 'Fetch web pages, APIs, documentation',
  },
  {
    id: 'postgres',
    name: 'PostgreSQL',
    when: (ctx) => ctx.toolingNeeds?.database === 'postgres',
    package: '@modelcontextprotocol/server-postgres',
    args: ['${env:DATABASE_URL}'],
    env: {},
    envExample: { DATABASE_URL: 'postgresql://user:pass@localhost:5432/mydb' },
    description: 'Query and inspect PostgreSQL databases',
  },
  {
    id: 'sqlite',
    name: 'SQLite',
    when: (ctx) => ctx.toolingNeeds?.database === 'sqlite',
    package: '@modelcontextprotocol/server-sqlite',
    args: ['${workspaceFolder}/db.sqlite'],
    env: {},
    envExample: {},
    description: 'Query and inspect SQLite databases',
  },
  {
    id: 'memory',
    name: 'Memory',
    when: () => true, // Always useful for persistent context
    package: '@modelcontextprotocol/server-memory',
    args: [],
    env: {},
    envExample: {},
    description: 'Persistent key-value memory across sessions',
  },
  {
    id: 'playwright',
    name: 'Playwright (Browser)',
    when: (ctx) => ctx.toolingNeeds?.browser,
    package: '@anthropic/mcp-server-playwright',
    args: [],
    env: {},
    envExample: {},
    description: 'Browser automation, screenshots, testing',
  },
  {
    id: 'docker',
    name: 'Docker',
    when: (ctx) => ctx.toolingNeeds?.docker,
    package: '@modelcontextprotocol/server-docker',
    args: [],
    env: {},
    envExample: {},
    description: 'Manage containers, images, compose stacks',
  },
];

/**
 * Main entry point — generates all tool/MCP configs.
 * @param {string} targetDir - Project root
 * @param {string[]} ides - Selected IDEs
 * @param {object} ctx - Full context including toolingNeeds
 */
export function generateTooling(targetDir, ides, ctx) {
  heading('Generating tool & MCP configs...');

  // Determine which MCP servers to include
  const activeMcps = MCP_REGISTRY.filter((mcp) => mcp.when(ctx));

  if (activeMcps.length === 0) return;

  const targets = ides.includes('all')
    ? ['vscode', 'cursor', 'claude-code', 'windsurf', 'kiro']
    : ides;

  // Generate per-IDE MCP configs
  for (const ide of targets) {
    MCP_GENERATORS[ide]?.(targetDir, activeMcps, ctx);
  }

  // Always generate .env.example and VS Code extensions
  genEnvExample(targetDir, activeMcps, ctx);
  if (targets.includes('vscode') || ides.includes('all')) {
    genVSCodeSettings(targetDir, ctx);
    genVSCodeExtensions(targetDir, ctx);
  }
}

// ─── Per-IDE MCP Generators ───────────────────────────────────────

function genVSCodeMcp(targetDir, mcps, _ctx) {
  const servers = {};
  for (const mcp of mcps) {
    servers[mcp.id] = {
      command: 'npx',
      args: ['-y', mcp.package, ...mcp.args],
      ...(Object.keys(mcp.env).length > 0 ? { env: mcp.env } : {}),
    };
  }
  const content = JSON.stringify({ servers }, null, 2) + '\n';
  const w = writeFile(join(targetDir, '.vscode', 'mcp.json'), content);
  if (w) step('.vscode/mcp.json');
}

function genCursorMcp(targetDir, mcps, _ctx) {
  const mcpServers = {};
  for (const mcp of mcps) {
    mcpServers[mcp.id] = {
      command: 'npx',
      args: ['-y', mcp.package, ...mcp.args],
      ...(Object.keys(mcp.env).length > 0 ? { env: mcp.env } : {}),
    };
  }
  const content = JSON.stringify({ mcpServers }, null, 2) + '\n';
  const w = writeFile(join(targetDir, '.cursor', 'mcp.json'), content);
  if (w) step('.cursor/mcp.json');
}

function genClaudeMcp(targetDir, mcps, _ctx) {
  // Claude Code uses .mcp.json at project root (project-scoped)
  const mcpServers = {};
  for (const mcp of mcps) {
    // Claude uses env vars directly, not ${env:VAR} syntax
    const env = {};
    for (const [key, val] of Object.entries(mcp.env)) {
      env[key] = val.replace(/\$\{env:(\w+)\}/g, (_, k) => `\${${k}}`);
    }
    mcpServers[mcp.id] = {
      command: 'npx',
      args: ['-y', mcp.package, ...mcp.args.map(a => a.replace('${workspaceFolder}', '.'))],
      ...(Object.keys(env).length > 0 ? { env } : {}),
    };
  }
  const content = JSON.stringify({ mcpServers }, null, 2) + '\n';
  const w = writeFile(join(targetDir, '.mcp.json'), content);
  if (w) step('.mcp.json (Claude Code MCP config)');
}

function genWindsurfMcp(targetDir, mcps, _ctx) {
  // Windsurf uses same format as Cursor
  const mcpServers = {};
  for (const mcp of mcps) {
    mcpServers[mcp.id] = {
      command: 'npx',
      args: ['-y', mcp.package, ...mcp.args],
      ...(Object.keys(mcp.env).length > 0 ? { env: mcp.env } : {}),
    };
  }
  const content = JSON.stringify({ mcpServers }, null, 2) + '\n';
  const w = writeFile(join(targetDir, '.windsurf', 'mcp.json'), content);
  if (w) step('.windsurf/mcp.json');
}

function genKiroMcp(targetDir, mcps, _ctx) {
  // Kiro uses .kiro/mcp.json
  const mcpServers = {};
  for (const mcp of mcps) {
    mcpServers[mcp.id] = {
      command: 'npx',
      args: ['-y', mcp.package, ...mcp.args],
      ...(Object.keys(mcp.env).length > 0 ? { env: mcp.env } : {}),
    };
  }
  const content = JSON.stringify({ mcpServers }, null, 2) + '\n';
  const w = writeFile(join(targetDir, '.kiro', 'mcp.json'), content);
  if (w) step('.kiro/mcp.json');
}

const MCP_GENERATORS = {
  vscode: genVSCodeMcp,
  cursor: genCursorMcp,
  'claude-code': genClaudeMcp,
  windsurf: genWindsurfMcp,
  kiro: genKiroMcp,
};

// ─── .env.example ─────────────────────────────────────────────────

function genEnvExample(targetDir, mcps, ctx) {
  const lines = [
    `# ${ctx.projectName} — Environment Variables`,
    `# Copy to .env and fill in real values`,
    `# Generated by harnesskit init`,
    ``,
    `# ─── MCP Server Tokens ────────────────────────────────────`,
  ];

  let hasTokens = false;
  for (const mcp of mcps) {
    for (const [key, placeholder] of Object.entries(mcp.envExample)) {
      lines.push(`# ${mcp.description}`);
      lines.push(`${key}=${placeholder}`);
      lines.push('');
      hasTokens = true;
    }
  }

  if (!hasTokens) {
    lines.push(`# No API tokens needed for current MCP configuration.`);
    lines.push('');
  }

  lines.push(`# ─── Application ─────────────────────────────────────────`);
  lines.push(`NODE_ENV=development`);
  lines.push(`PORT=3000`);
  lines.push('');

  const content = lines.join('\n');
  const w = writeFile(join(targetDir, '.env.example'), content);
  if (w) step('.env.example');
}

// ─── VS Code Settings ────────────────────────────────────────────

function genVSCodeSettings(targetDir, ctx) {
  const settings = {
    // Copilot agent mode
    'chat.agent.enabled': true,
    'chat.agent.maxRequests': 30,

    // File associations
    'files.associations': {
      'AGENTS.md': 'markdown',
      'CLAUDE.md': 'markdown',
      'codex.md': 'markdown',
    },

    // Exclude noisy dirs from search
    'search.exclude': {
      'docs/generated/**': true,
      'docs/exec-plans/completed/**': true,
    },

    // Editor
    'editor.formatOnSave': true,
  };

  // Add language-specific settings
  if (ctx.lang === 'node') {
    settings['editor.defaultFormatter'] = 'esbenp.prettier-vscode';
    settings['[javascript]'] = { 'editor.defaultFormatter': 'esbenp.prettier-vscode' };
    settings['[typescript]'] = { 'editor.defaultFormatter': 'esbenp.prettier-vscode' };
  } else if (ctx.lang === 'python') {
    settings['[python]'] = { 'editor.defaultFormatter': 'ms-python.black-formatter' };
    settings['python.analysis.typeCheckingMode'] = 'basic';
  }

  const content = JSON.stringify(settings, null, 2) + '\n';
  const w = writeFile(join(targetDir, '.vscode', 'settings.json'), content);
  if (w) step('.vscode/settings.json');
}

// ─── VS Code Extension Recommendations ───────────────────────────

function genVSCodeExtensions(targetDir, ctx) {
  const recommendations = [
    'github.copilot',
    'github.copilot-chat',
  ];

  // Language-specific extensions
  if (ctx.lang === 'node') {
    recommendations.push('dbaeumer.vscode-eslint', 'esbenp.prettier-vscode');
  } else if (ctx.lang === 'python') {
    recommendations.push('ms-python.python', 'ms-python.vscode-pylance', 'charliermarsh.ruff');
  } else if (ctx.lang === 'dotnet') {
    recommendations.push('ms-dotnettools.csdevkit', 'ms-dotnettools.csharp');
  } else if (ctx.lang === 'java') {
    recommendations.push('vscjava.vscode-java-pack');
  } else if (ctx.lang === 'go') {
    recommendations.push('golang.go');
  } else if (ctx.lang === 'rust') {
    recommendations.push('rust-lang.rust-analyzer');
  }

  const content = JSON.stringify({
    recommendations,
    unwantedRecommendations: [],
  }, null, 2) + '\n';
  const w = writeFile(join(targetDir, '.vscode', 'extensions.json'), content);
  if (w) step('.vscode/extensions.json');
}

/**
 * Returns a summary of active MCP servers for display.
 * @param {object} ctx - Context with toolingNeeds
 * @returns {{ id: string, name: string, description: string }[]}
 */
export function getActiveMcpSummary(ctx) {
  return MCP_REGISTRY.filter((mcp) => mcp.when(ctx)).map(({ id, name, description }) => ({ id, name, description }));
}
