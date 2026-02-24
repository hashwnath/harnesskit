/**
 * `harnesskit enforce` command.
 * Language-agnostic architecture enforcement via import/dependency scanning.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { heading, step, fail, info, color, bold } from '../ui.js';

/**
 * Run architecture enforcement checks.
 * @param {string} targetDir - Project root
 */
export async function enforce(targetDir) {
  heading('Architecture Enforcement');

  // Try to load layer rules from docs/ARCHITECTURE.md
  const archPath = join(targetDir, 'docs', 'ARCHITECTURE.md');
  if (!existsSync(archPath)) {
    fail('docs/ARCHITECTURE.md not found. Run `harnesskit init` first.');
    process.exit(1);
  }

  info('Scanning source files for import violations...');

  // Detect source directory
  const srcCandidates = ['src', 'app', 'lib', 'pkg', 'internal'];
  let srcDir = null;
  for (const c of srcCandidates) {
    if (existsSync(join(targetDir, c)) && statSync(join(targetDir, c)).isDirectory()) {
      srcDir = join(targetDir, c);
      break;
    }
  }

  if (!srcDir) {
    info('No standard source directory found (src/, app/, lib/). Checking all files...');
    srcDir = targetDir;
  }

  // Get all source files
  const extensions = ['.js', '.ts', '.mjs', '.mts', '.py', '.cs', '.java', '.go', '.rs'];
  const files = getAllFiles(srcDir, extensions);
  info(`Found ${files.length} source files`);

  let violations = 0;

  // Define layer patterns (common across languages)
  const layerPatterns = {
    types: ['types', 'models', 'domain', 'entities', 'schemas'],
    config: ['config', 'configuration', 'settings'],
    service: ['service', 'services', 'business', 'logic', 'usecases'],
    routes: ['routes', 'controllers', 'handlers', 'api', 'endpoints', 'views'],
    ui: ['ui', 'frontend', 'pages', 'components', 'templates'],
    providers: ['providers', 'infrastructure', 'adapters', 'ports'],
    utils: ['utils', 'helpers', 'common', 'shared/utils', 'pkg/utils'],
  };

  // Forbidden dependency directions (lower → higher is forbidden)
  const forbidden = {
    types: ['config', 'service', 'routes', 'ui', 'providers'],
    config: ['service', 'routes', 'ui'],
    service: ['routes', 'ui'],
    utils: ['types', 'config', 'service', 'routes', 'ui', 'providers'],
  };

  for (const file of files) {
    const layer = classifyFile(file, targetDir, layerPatterns);
    if (!layer || !forbidden[layer]) continue;

    const imports = extractImports(file);
    for (const imp of imports) {
      for (const bannedLayer of forbidden[layer]) {
        const bannedPatterns = layerPatterns[bannedLayer] || [];
        for (const pattern of bannedPatterns) {
          if (imp.includes(pattern)) {
            const rel = relative(targetDir, file).replace(/\\/g, '/');
            fail(`${rel}: ${layer} → ${bannedLayer} (imports "${imp}")`);
            violations++;
          }
        }
      }
    }
  }

  // Check for console.log in production code
  let consoleLogCount = 0;
  for (const file of files) {
    const rel = relative(targetDir, file).replace(/\\/g, '/');
    if (rel.includes('test') || rel.includes('spec')) continue;
    const content = readFileSync(file, 'utf-8');
    const matches = content.match(/console\.log\(/g);
    if (matches) consoleLogCount += matches.length;
  }

  if (consoleLogCount > 0) {
    info(`${consoleLogCount} console.log() calls in production code (use a logger provider)`);
  }

  // Report
  console.log('');
  if (violations === 0) {
    step(bold(color('Architecture check PASSED — no layer violations', 'green')));
    process.exit(0);
  } else {
    fail(bold(color(`Architecture check FAILED — ${violations} violation(s)`, 'red')));
    process.exit(1);
  }
}

function getAllFiles(dir, extensions) {
  const results = [];
  try {
    for (const entry of readdirSync(dir)) {
      if (entry.startsWith('.') || entry === 'node_modules' || entry === '__pycache__' || entry === 'vendor') continue;
      const full = join(dir, entry);
      try {
        if (statSync(full).isDirectory()) {
          results.push(...getAllFiles(full, extensions));
        } else if (extensions.some((ext) => full.endsWith(ext))) {
          results.push(full);
        }
      } catch { /* permission error */ }
    }
  } catch { /* dir not readable */ }
  return results;
}

function classifyFile(filePath, rootDir, patterns) {
  const rel = relative(rootDir, filePath).replace(/\\/g, '/').toLowerCase();
  for (const [layer, keywords] of Object.entries(patterns)) {
    for (const keyword of keywords) {
      if (rel.includes(`/${keyword}/`) || rel.includes(`${keyword}/`) || rel.startsWith(`${keyword}/`)) {
        return layer;
      }
    }
  }
  return null;
}

function extractImports(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const imports = [];

  // JS/TS: import ... from '...' or require('...')
  const jsImports = content.matchAll(/(?:from|require\()\s*['"]([^'"]+)['"]/g);
  for (const m of jsImports) imports.push(m[1]);

  // Python: from x import y / import x
  const pyImports = content.matchAll(/(?:from|import)\s+([\w.]+)/g);
  for (const m of pyImports) imports.push(m[1].replace(/\./g, '/'));

  // C#: using X.Y.Z;
  const csImports = content.matchAll(/using\s+([\w.]+);/g);
  for (const m of csImports) imports.push(m[1].replace(/\./g, '/').toLowerCase());

  // Go: "package/path"
  const goImports = content.matchAll(/"\s*([\w/.]+)\s*"/g);
  for (const m of goImports) imports.push(m[1]);

  return imports;
}
