#!/usr/bin/env node

/**
 * harnesskit CLI
 *
 * Usage:
 *   npx harnesskit init          Interactive setup wizard
 *   npx harnesskit init --yes    Accept all defaults
 *   npx harnesskit enforce       Run architecture enforcement checks
 *   npx harnesskit doctor        Validate harness setup completeness
 *   npx harnesskit garden        Run doc-gardener checks
 *   npx harnesskit ingest        Auto-populate SoT from docs/references/
 */

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { init } from '../src/commands/init.js';
import { enforce } from '../src/commands/enforce.js';
import { doctor } from '../src/commands/doctor.js';
import { garden } from '../src/commands/garden.js';
import { ingest } from '../src/commands/ingest.js';
import { printBanner, printHelp, color } from '../src/ui.js';

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    yes: { type: 'boolean', short: 'y', default: false },
    help: { type: 'boolean', short: 'h', default: false },
    version: { type: 'boolean', short: 'v', default: false },
    dir: { type: 'string', short: 'd', default: '.' },
    // init options
    name: { type: 'string' },
    lang: { type: 'string' },
    ide: { type: 'string' },
    git: { type: 'string' },
    layers: { type: 'string' },
  },
});

const command = positionals[0];

if (values.version) {
  // Read from package.json dynamically
  const { readFileSync } = await import('node:fs');
  const { fileURLToPath } = await import('node:url');
  const { dirname, join } = await import('node:path');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf-8'));
  console.log(pkg.version);
  process.exit(0);
}

if (values.help || !command) {
  printBanner();
  printHelp();
  process.exit(0);
}

const targetDir = resolve(positionals[1] || values.dir);

try {
  switch (command) {
    case 'init':
      await init(targetDir, values);
      break;
    case 'enforce':
      await enforce(targetDir);
      break;
    case 'doctor':
      await doctor(targetDir);
      break;
    case 'garden':
      await garden(targetDir);
      break;
    case 'ingest':
      await ingest(targetDir);
      break;
    default:
      console.error(color(`Unknown command: ${command}`, 'red'));
      printHelp();
      process.exit(1);
  }
} catch (err) {
  console.error(color(`\nError: ${err.message}`, 'red'));
  if (process.env.DEBUG) console.error(err.stack);
  process.exit(1);
}
