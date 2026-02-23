/**
 * Smart project structure discovery.
 * Scans real folder structure and samples imports to produce
 * project-specific architecture rules — zero dependencies.
 */

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, extname } from 'node:path';

// ─── Known layer patterns ─────────────────────────────────────────
// Each pattern: regex to match folder names → canonical key, tier (1 = top), label
const LAYER_PATTERNS = [
  { key: 'api',        match: /^(routes?|api|controllers?|handlers?|endpoints?|routers?)$/i,            tier: 1, label: 'API / Routes' },
  { key: 'ui',         match: /^(pages?|components?|views?|layouts?|ui|frontend|client|screens?)$/i,    tier: 1, label: 'UI / Frontend' },
  { key: 'middleware',  match: /^(middleware|interceptors?|guards?|filters?|pipes?)$/i,                  tier: 2, label: 'Middleware' },
  { key: 'service',    match: /^(services?|use-?cases?|business|logic|application)$/i,                  tier: 3, label: 'Service' },
  { key: 'domain',     match: /^(models?|types?|schemas?|entities?|domain|dtos?|interfaces?)$/i,        tier: 4, label: 'Domain / Types' },
  { key: 'config',     match: /^(config|configuration|settings?|env|constants?)$/i,                     tier: 5, label: 'Config' },
  { key: 'providers',  match: /^(providers?|infrastructure|adapters?|gateways?|repos?|repositories?|data-?access|dal|db)$/i, tier: 6, label: 'Providers / Infra' },
  { key: 'shared',     match: /^(utils?|helpers?|lib|shared|common|core|pkg|support|internal)$/i,       tier: 7, label: 'Shared / Utils' },
];

/** File extensions per language family */
const EXTENSIONS = {
  node:   ['.js', '.ts', '.mjs', '.cjs', '.tsx', '.jsx'],
  python: ['.py'],
  dotnet: ['.cs', '.fs'],
  java:   ['.java', '.kt'],
  go:     ['.go'],
  rust:   ['.rs'],
  other:  ['.js', '.ts', '.py'],
};

/** Folders to skip during scanning */
const IGNORED = /^(\.|node_modules|__pycache__|venv|\.venv|vendor|dist|build|out|target|bin|obj|coverage|\.git|test|tests|__tests__|spec|e2e|cypress|docs|scripts|migrations|seeds)$/i;

// ─── Public API ────────────────────────────────────────────────────

/**
 * Master function — discover architecture from the real project.
 * Returns { discovered, diagram, rules, layers, unmapped, depMap }
 * When < 2 layers found, returns { discovered: false } → caller falls back to generic.
 *
 * @param {string} targetDir - Absolute path to the project root
 * @param {string} lang      - Detected language key (node, python, etc.)
 * @returns {{ discovered: boolean, diagram?: string, rules?: string, layers?: object[], unmapped?: string[], depMap?: object }}
 */
export function discoverArchitecture(targetDir, lang) {
  const { layers, unmapped, srcDir } = discoverLayers(targetDir, lang);

  if (layers.length < 2) {
    return { discovered: false, layers, unmapped };
  }

  const depMap = sampleImports(srcDir, layers, lang);
  const diagram = buildDiagram(layers);
  const rules = buildRulesTable(layers, depMap);

  return { discovered: true, diagram, rules, layers, unmapped, depMap };
}

// ─── Layer discovery ───────────────────────────────────────────────

/**
 * Walk the source root and match directories against known layer patterns.
 * @param {string} targetDir - Project root
 * @returns {{ layers: object[], unmapped: string[], srcDir: string }}
 */
export function discoverLayers(targetDir) {
  const srcDir = findSourceRoot(targetDir);
  const entries = safeReadDir(srcDir);

  const layers = [];
  const unmapped = [];

  for (const entry of entries) {
    const fullPath = join(srcDir, entry);
    if (!isDir(fullPath) || IGNORED.test(entry)) continue;

    let matched = false;
    for (const pattern of LAYER_PATTERNS) {
      if (pattern.match.test(entry)) {
        layers.push({
          key: pattern.key,
          folder: entry,
          label: pattern.label,
          tier: pattern.tier,
          path: fullPath,
          relativePath: relative(targetDir, fullPath),
        });
        matched = true;
        break;
      }
    }
    if (!matched) unmapped.push(entry);
  }

  // Sort by tier (top of stack first)
  layers.sort((a, b) => a.tier - b.tier);

  return { layers, unmapped, srcDir };
}

/**
 * Find the source root — could be targetDir itself, or src/, app/, etc.
 */
function findSourceRoot(targetDir) {
  const candidates = ['src', 'app', 'lib', 'server', 'backend', 'internal'];
  for (const c of candidates) {
    const p = join(targetDir, c);
    if (existsSync(p) && isDir(p)) {
      // Only use this sub-dir if it actually has sub-folders (not just flat files)
      const children = safeReadDir(p).filter((e) => isDir(join(p, e)) && !IGNORED.test(e));
      if (children.length >= 2) return p;
    }
  }
  return targetDir;
}

// ─── Import sampling ───────────────────────────────────────────────

/**
 * For each discovered layer, read up to 3 files and extract import paths.
 * Builds a dependency map: { layerKey: Set<importedLayerKey> }
 */
export function sampleImports(srcDir, layers, lang) {
  const exts = EXTENSIONS[lang] || EXTENSIONS.other;
  /** @type {Record<string, Set<string>>} */
  const depMap = {};

  for (const layer of layers) {
    depMap[layer.key] = new Set();
    const files = findFiles(layer.path, exts, 3);

    for (const file of files) {
      const content = safeRead(file);
      if (!content) continue;

      const imports = extractImports(content, lang);
      for (const imp of imports) {
        const resolved = resolveImportToLayer(imp, layers);
        if (resolved && resolved !== layer.key) {
          depMap[layer.key].add(resolved);
        }
      }
    }
  }

  return depMap;
}

/**
 * Extract local import paths from source code.
 * Returns an array of import path strings (only local / relative imports).
 */
function extractImports(content, lang) {
  const paths = [];

  if (lang === 'node' || lang === 'other') {
    // ES: import ... from '...'
    for (const m of content.matchAll(/import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g)) {
      paths.push(m[1]);
    }
    // CJS: require('...')
    for (const m of content.matchAll(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g)) {
      paths.push(m[1]);
    }
    // Only keep local imports (relative paths or @/ aliases)
    return paths.filter((p) => p.startsWith('.') || p.startsWith('@/'));
  }

  if (lang === 'python') {
    // from X import Y  (relative: from .foo or from foo where foo is a project folder)
    for (const m of content.matchAll(/from\s+([\w.]+)\s+import/g)) {
      paths.push(m[1]);
    }
    return paths; // we'll resolve against layer folder names
  }

  if (lang === 'go') {
    for (const m of content.matchAll(/"([^"]+)"/g)) {
      if (!m[1].includes('.')) continue; // skip stdlib
      paths.push(m[1]);
    }
    return paths;
  }

  if (lang === 'dotnet') {
    for (const m of content.matchAll(/using\s+([\w.]+)\s*;/g)) {
      paths.push(m[1]);
    }
    return paths;
  }

  if (lang === 'java') {
    for (const m of content.matchAll(/import\s+([\w.]+)\s*;/g)) {
      paths.push(m[1]);
    }
    return paths;
  }

  if (lang === 'rust') {
    for (const m of content.matchAll(/use\s+([\w:]+)/g)) {
      paths.push(m[1].replace(/::/g, '/'));
    }
    return paths;
  }

  return paths;
}

/**
 * Resolve an import path to a layer key by checking if it references
 * any known layer folder name.
 */
function resolveImportToLayer(importPath, layers) {
  const lower = importPath.toLowerCase().replace(/\\/g, '/');

  for (const layer of layers) {
    const folder = layer.folder.toLowerCase();
    // Match: ../routes/..., @/services/..., ./models, config.something, etc.
    if (
      lower.includes(`/${folder}/`) ||
      lower.includes(`/${folder}`) ||
      lower.startsWith(`./${folder}`) ||
      lower.startsWith(`../${folder}`) ||
      lower.startsWith(`@/${folder}`) ||
      lower === folder ||
      lower.startsWith(`${folder}.`)  // Python: models.user
    ) {
      return layer.key;
    }
  }
  return null;
}

// ─── Diagram & rules generation ────────────────────────────────────

/**
 * Build a project-specific ASCII dependency diagram.
 */
export function buildDiagram(layers) {
  if (layers.length === 0) return null;

  // Separate main-chain layers from shared/ui
  const mainLayers = layers.filter((l) => l.key !== 'shared' && l.key !== 'ui');
  const sharedLayers = layers.filter((l) => l.key === 'shared');
  const uiLayers = layers.filter((l) => l.key === 'ui');

  const lines = [];

  // Main dependency chain (by tier, top → bottom)
  if (mainLayers.length > 0) {
    lines.push(mainLayers.map((l) => `${l.folder}/`).join(' → '));
  }

  // UI branch (same tier as API, parallel path)
  if (uiLayers.length > 0 && mainLayers.some((l) => l.key === 'service')) {
    const svc = mainLayers.find((l) => l.key === 'service');
    if (svc) {
      lines.push(`${' '.repeat(svc.folder.length + 4)}${svc.folder}/ → ${uiLayers.map((l) => l.folder + '/').join(', ')}  (UI)`);
    }
  }

  // Shared layers
  if (sharedLayers.length > 0) {
    lines.push(`Shared: ${sharedLayers.map((l) => l.folder + '/').join(', ')}`);
  }

  return lines.join('\n');
}

/**
 * Build project-specific dependency rules table.
 */
export function buildRulesTable(layers, depMap) {
  if (layers.length === 0) return null;

  const lines = [
    '| Layer | Folder | Observed Imports | Should Not Import From |',
    '|-------|--------|-----------------|------------------------|',
  ];

  for (const layer of layers) {
    const deps = depMap[layer.key] || new Set();
    const observed =
      deps.size > 0
        ? [...deps].map((k) => layers.find((l) => l.key === k)?.folder || k).join(', ')
        : '(none observed)';

    // Layers with LOWER tier number are upstream — this layer should NOT import from them
    const shouldNot = layers
      .filter((l) => l.tier < layer.tier && l.key !== 'shared')
      .map((l) => l.folder)
      .join(', ') || '—';

    lines.push(`| ${layer.label} | \`${layer.folder}/\` | ${observed} | ${shouldNot} |`);
  }

  return lines.join('\n');
}

// ─── Helpers ───────────────────────────────────────────────────────

function safeReadDir(dir) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function safeRead(file) {
  try {
    return readFileSync(file, 'utf8');
  } catch {
    return '';
  }
}

function isDir(p) {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

/**
 * Find up to `max` files with matching extensions in a directory (shallow + one level deep).
 */
function findFiles(dir, exts, max = 3) {
  const results = [];

  const scan = (d, depth) => {
    if (results.length >= max || depth > 1) return;
    const entries = safeReadDir(d);
    for (const entry of entries) {
      if (results.length >= max) break;
      const full = join(d, entry);
      if (isDir(full) && depth < 1 && !IGNORED.test(entry)) {
        scan(full, depth + 1);
      } else if (exts.includes(extname(entry).toLowerCase())) {
        results.push(full);
      }
    }
  };

  scan(dir, 0);
  return results;
}
