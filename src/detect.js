/**
 * Environment detector — auto-detects language, IDE, git provider, and project structure.
 * Zero dependencies, uses filesystem heuristics.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Detect the primary programming language of the project.
 * @param {string} dir - Project root directory
 * @returns {{ lang: string, buildCmd: string, testCmd: string, lintCmd: string, startCmd: string, packageFile: string }}
 */
export function detectLanguage(dir) {
  const checks = [
    {
      lang: 'node',
      files: ['package.json'],
      buildCmd: 'npm run build',
      testCmd: 'npm test',
      lintCmd: 'npm run lint',
      startCmd: 'npm start',
      packageFile: 'package.json',
    },
    {
      lang: 'python',
      files: ['pyproject.toml', 'setup.py', 'requirements.txt', 'Pipfile'],
      buildCmd: 'python -m build',
      testCmd: 'pytest',
      lintCmd: 'ruff check .',
      startCmd: 'python -m app',
      packageFile: 'pyproject.toml',
    },
    {
      lang: 'dotnet',
      files: ['*.csproj', '*.sln', '*.fsproj'],
      buildCmd: 'dotnet build',
      testCmd: 'dotnet test',
      lintCmd: 'dotnet format --verify-no-changes',
      startCmd: 'dotnet run',
      packageFile: '*.csproj',
    },
    {
      lang: 'java',
      files: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
      buildCmd: './gradlew build',
      testCmd: './gradlew test',
      lintCmd: './gradlew check',
      startCmd: './gradlew run',
      packageFile: 'build.gradle',
    },
    {
      lang: 'go',
      files: ['go.mod'],
      buildCmd: 'go build ./...',
      testCmd: 'go test ./...',
      lintCmd: 'golangci-lint run',
      startCmd: 'go run .',
      packageFile: 'go.mod',
    },
    {
      lang: 'rust',
      files: ['Cargo.toml'],
      buildCmd: 'cargo build',
      testCmd: 'cargo test',
      lintCmd: 'cargo clippy',
      startCmd: 'cargo run',
      packageFile: 'Cargo.toml',
    },
  ];

  for (const check of checks) {
    for (const file of check.files) {
      if (file.includes('*')) {
        // Glob check
        try {
          const entries = readdirSync(dir);
          const ext = file.replace('*', '');
          if (entries.some((e) => e.endsWith(ext))) {
            return check;
          }
        } catch { /* dir not readable */ }
      } else if (existsSync(join(dir, file))) {
        return check;
      }
    }
  }

  return {
    lang: 'other',
    buildCmd: '# TODO: add build command',
    testCmd: '# TODO: add test command',
    lintCmd: '# TODO: add lint command',
    startCmd: '# TODO: add start command',
    packageFile: '',
  };
}

/**
 * Detect which IDEs/agents are configured in the project.
 * @param {string} dir
 * @returns {string[]} Array of detected IDEs
 */
export function detectIDEs(dir) {
  const ides = [];
  if (existsSync(join(dir, '.github', 'copilot-instructions.md')) || existsSync(join(dir, '.github', 'agents'))) {
    ides.push('vscode');
  }
  if (existsSync(join(dir, '.cursor')) || existsSync(join(dir, '.cursorrules'))) {
    ides.push('cursor');
  }
  if (existsSync(join(dir, '.claude')) || existsSync(join(dir, 'CLAUDE.md'))) {
    ides.push('claude-code');
  }
  if (existsSync(join(dir, '.windsurf'))) {
    ides.push('windsurf');
  }
  if (existsSync(join(dir, '.junie'))) {
    ides.push('jetbrains');
  }
  if (existsSync(join(dir, '.kiro')) || existsSync(join(dir, '.kiro', 'steering'))) {
    ides.push('kiro');
  }
  if (existsSync(join(dir, '.agent')) || existsSync(join(dir, '.agent', 'skills'))) {
    ides.push('antigravity');
  }
  if (existsSync(join(dir, '.gemini')) || existsSync(join(dir, '.gemini', 'skills'))) {
    ides.push('gemini');
  }
  return ides;
}

/**
 * Detect the git hosting provider from remotes.
 * @param {string} dir
 * @returns {string} 'github' | 'ado' | 'gitlab' | 'bitbucket' | 'unknown'
 */
export function detectGitProvider(dir) {
  try {
    const gitConfig = readFileSync(join(dir, '.git', 'config'), 'utf-8');
    if (gitConfig.includes('github.com')) return 'github';
    if (gitConfig.includes('dev.azure.com') || gitConfig.includes('visualstudio.com')) return 'ado';
    if (gitConfig.includes('gitlab.com') || gitConfig.includes('gitlab')) return 'gitlab';
    if (gitConfig.includes('bitbucket.org')) return 'bitbucket';
  } catch { /* no git */ }
  return 'unknown';
}

/**
 * Detect existing harnesskit artifacts.
 * @param {string} dir
 * @returns {{ hasAgentsMd: boolean, hasDocs: boolean, hasSkills: boolean, hasInstructions: boolean, hasExecPlans: boolean, hasQualityScore: boolean, hasArchitecture: boolean }}
 */
export function detectExistingSetup(dir) {
  return {
    hasAgentsMd: existsSync(join(dir, 'AGENTS.md')),
    hasDocs: existsSync(join(dir, 'docs', 'ARCHITECTURE.md')),
    hasSkills: existsSync(join(dir, '.github', 'skills')) || existsSync(join(dir, '.claude', 'skills')),
    hasInstructions: existsSync(join(dir, '.github', 'copilot-instructions.md')),
    hasExecPlans: existsSync(join(dir, 'docs', 'exec-plans')),
    hasQualityScore: existsSync(join(dir, 'docs', 'QUALITY_SCORE.md')),
    hasArchitecture: existsSync(join(dir, 'docs', 'ARCHITECTURE.md')),
  };
}

/**
 * Detect CLI-based coding agents installed on the system.
 * Checks PATH for known agent CLIs — zero dependencies, uses execSync.
 * @returns {{ name: string, cmd: string, available: boolean, howToUse: string }[]}
 */
export function detectCLIAgents() {
  const agents = [
    {
      name: 'GitHub Copilot CLI',
      cmd: 'gh',
      checkArg: 'copilot --version',
      howToUse: 'gh copilot suggest "Read AGENTS.md then implement feature X"',
    },
    {
      name: 'OpenAI Codex CLI',
      cmd: 'codex',
      checkArg: '--version',
      howToUse: 'codex "Read AGENTS.md then implement feature X"',
    },
    {
      name: 'Claude Code CLI',
      cmd: 'claude',
      checkArg: '--version',
      howToUse: 'claude "Read AGENTS.md then implement feature X"',
    },
    {
      name: 'Aider',
      cmd: 'aider',
      checkArg: '--version',
      howToUse: 'aider --read AGENTS.md --read docs/ARCHITECTURE.md',
    },
    {
      name: 'Amazon Q CLI',
      cmd: 'q',
      checkArg: '--version',
      howToUse: 'q chat "Read AGENTS.md then implement feature X"',
    },
    {
      name: 'Cline',
      cmd: 'cline',
      checkArg: '--version',
      howToUse: 'cline "Read AGENTS.md then implement feature X"',
    },
    {
      name: 'Kiro CLI',
      cmd: 'kiro',
      checkArg: '--version',
      howToUse: 'kiro "Read AGENTS.md then implement feature X"',
    },
    {
      name: 'Gemini CLI',
      cmd: 'gemini',
      checkArg: '--version',
      howToUse: 'gemini "Read AGENTS.md then implement feature X"',
    },
  ];

  const isWin = process.platform === 'win32';
  const whichCmd = isWin ? 'where' : 'which';

  return agents.map((agent) => {
    let available = false;
    try {
      execSync(`${whichCmd} ${agent.cmd}`, { stdio: 'ignore', timeout: 3000 });
      available = true;
    } catch { /* not found */ }
    return { ...agent, available };
  });
}

/**
 * Get the project name from package files or directory name.
 * @param {string} dir
 * @returns {string}
 */
export function detectProjectName(dir) {
  try {
    if (existsSync(join(dir, 'package.json'))) {
      return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf-8')).name || basename(dir);
    }
  } catch { /* no package.json */ }
  return basename(dir);
}

/**
 * Detect what tooling/MCP integrations the project needs.
 * Checks for GitHub, Docker, databases, and browser testing.
 * @param {string} dir - Project root directory
 * @returns {{ github: boolean, docker: boolean, database: string|null, browser: boolean }}
 */
export function detectToolingNeeds(dir) {
  const needs = { github: false, docker: false, database: null, browser: false };

  // GitHub — if it has .github dir or is a git repo
  if (existsSync(join(dir, '.github')) || existsSync(join(dir, '.git'))) {
    needs.github = true;
  }

  // Docker — Dockerfile or docker-compose
  if (
    existsSync(join(dir, 'Dockerfile')) ||
    existsSync(join(dir, 'docker-compose.yml')) ||
    existsSync(join(dir, 'docker-compose.yaml'))
  ) {
    needs.docker = true;
  }

  // Database — ORM configs or package references
  if (existsSync(join(dir, 'prisma'))) {
    needs.database = 'postgres';
  } else if (existsSync(join(dir, 'drizzle.config.ts')) || existsSync(join(dir, 'drizzle.config.js'))) {
    needs.database = 'postgres';
  }

  // Fallback: check package.json for DB hints
  if (!needs.database) {
    try {
      const pkg = readFileSync(join(dir, 'package.json'), 'utf-8');
      if (pkg.includes('"pg"') || pkg.includes('"postgres"') || pkg.includes('"typeorm"') || pkg.includes('"sequelize"')) {
        needs.database = 'postgres';
      } else if (pkg.includes('"sqlite"') || pkg.includes('"better-sqlite3"')) {
        needs.database = 'sqlite';
      }
    } catch { /* no package.json */ }
  }

  // Python: check requirements.txt for DB hints
  if (!needs.database) {
    try {
      const reqs = readFileSync(join(dir, 'requirements.txt'), 'utf-8');
      if (reqs.includes('psycopg') || reqs.includes('asyncpg') || reqs.includes('sqlalchemy')) {
        needs.database = 'postgres';
      }
    } catch { /* no requirements.txt */ }
  }

  // Browser / Playwright testing
  if (
    existsSync(join(dir, 'playwright.config.ts')) ||
    existsSync(join(dir, 'playwright.config.js')) ||
    existsSync(join(dir, 'e2e'))
  ) {
    needs.browser = true;
  }

  return needs;
}
