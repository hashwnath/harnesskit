/**
 * Terminal UI helpers — zero dependencies.
 * Premium ANSI CLI experience inspired by Gemini CLI, Vite, and Claude Code.
 */

/* ── ANSI codes ───────────────────────────────────────────────── */
const ESC = '\x1b[';
const RESET  = `${ESC}0m`;
const BOLD   = `${ESC}1m`;
const DIM    = `${ESC}2m`;
const ITALIC = `${ESC}3m`;
const UNDER  = `${ESC}4m`;
const BLINK  = `${ESC}5m`;

// Standard 16 colors
const FG = {
  black: 30, red: 31, green: 32, yellow: 33,
  blue: 34, magenta: 35, cyan: 36, white: 37,
  brightBlack: 90, brightRed: 91, brightGreen: 92,
  brightYellow: 93, brightBlue: 94, brightMagenta: 95,
  brightCyan: 96, brightWhite: 97,
};

// 256-color palette helpers
const fg256 = (n) => `${ESC}38;5;${n}m`;
const bg256 = (n) => `${ESC}48;5;${n}m`;

// RGB true-color helpers
const fgRGB = (r, g, b) => `${ESC}38;2;${r};${g};${b}m`;
const bgRGB = (r, g, b) => `${ESC}48;2;${r};${g};${b}m`;

/* ── Brand palette ────────────────────────────────────────────── */
const BRAND = {
  primary:    fgRGB(255, 200, 60),   // warm gold
  secondary:  fgRGB(100, 200, 255),  // electric blue
  accent:     fgRGB(180, 130, 255),  // soft purple
  success:    fgRGB(80, 220, 120),   // mint green
  warning:    fgRGB(255, 180, 50),   // amber
  error:      fgRGB(255, 90, 90),    // coral red
  muted:      fgRGB(120, 120, 140),  // slate gray
  surface:    fgRGB(200, 200, 220),  // light gray
  link:       fgRGB(100, 180, 255),  // link blue
};

/* ── Core helpers ─────────────────────────────────────────────── */
export function color(text, name) {
  if (BRAND[name]) return `${BRAND[name]}${text}${RESET}`;
  const code = FG[name];
  return code ? `${ESC}${code}m${text}${RESET}` : text;
}

export function bold(text) { return `${BOLD}${text}${RESET}`; }
export function dim(text)  { return `${DIM}${text}${RESET}`; }
export function italic(text) { return `${ITALIC}${text}${RESET}`; }

function gradientText(text, colors) {
  const chars = [...text];
  return chars.map((ch, i) => {
    const t = chars.length > 1 ? i / (chars.length - 1) : 0;
    const idx = Math.min(Math.floor(t * (colors.length - 1)), colors.length - 2);
    const local = t * (colors.length - 1) - idx;
    const [r1, g1, b1] = colors[idx];
    const [r2, g2, b2] = colors[idx + 1];
    const r = Math.round(r1 + (r2 - r1) * local);
    const g = Math.round(g1 + (g2 - g1) * local);
    const b = Math.round(b1 + (b2 - b1) * local);
    return `${fgRGB(r, g, b)}${ch}`;
  }).join('') + RESET;
}

/* ── ASCII Logo ───────────────────────────────────────────────── */
const LOGO_LINES = [
  ' ██╗  ██╗ █████╗ ██████╗ ███╗   ██╗███████╗███████╗███████╗',
  ' ██║  ██║██╔══██╗██╔══██╗████╗  ██║██╔════╝██╔════╝██╔════╝',
  ' ███████║███████║██████╔╝██╔██╗ ██║█████╗  ███████╗███████╗',
  ' ██╔══██║██╔══██║██╔══██╗██║╚██╗██║██╔══╝  ╚════██║╚════██║',
  ' ██║  ██║██║  ██║██║  ██║██║ ╚████║███████╗███████║███████║',
  ' ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝╚══════╝',
];

// Gradient: gold → electric blue → purple
const GRADIENT_STOPS = [
  [255, 200, 60],   // gold
  [100, 200, 255],  // electric blue
  [180, 130, 255],  // purple
];

/* ── Banner ───────────────────────────────────────────────────── */
export function printBanner() {
  const w = 62;
  const topBar = dim('─'.repeat(w));
  const botBar = dim('─'.repeat(w));

  console.log('');
  console.log(topBar);
  for (const line of LOGO_LINES) {
    console.log(gradientText(line, GRADIENT_STOPS));
  }
  console.log('');
  console.log(
    `  ${BRAND.primary}${BOLD}harnesskit${RESET}  ` +
    `${BRAND.muted}v0.1.0${RESET}  ` +
    `${dim('│')}  ` +
    `${BRAND.surface}Agent-first scaffolding for any repo${RESET}`
  );
  console.log(botBar);
  console.log('');
}

/* ── Section heading ──────────────────────────────────────────── */
export function heading(text) {
  const icon = text.toLowerCase().includes('done')
    ? `${BRAND.success}✔${RESET}`
    : `${BRAND.secondary}◆${RESET}`;
  console.log('');
  console.log(`  ${icon} ${BOLD}${BRAND.surface}${text}${RESET}`);
  console.log(`  ${dim('─'.repeat(Math.min(text.length + 4, 50)))}`);
}

/* ── Progress / step indicators ───────────────────────────────── */
export function step(msg) {
  console.log(`  ${BRAND.success}✔${RESET}  ${msg}`);
}

export function stepSpinner(msg) {
  // Static fallback for non-animated contexts
  console.log(`  ${BRAND.secondary}●${RESET}  ${msg}`);
}

export function warn(msg) {
  console.log(`  ${BRAND.warning}⚠${RESET}  ${msg}`);
}

export function fail(msg) {
  console.log(`  ${BRAND.error}✗${RESET}  ${msg}`);
}

export function info(msg) {
  console.log(`  ${BRAND.link}ℹ${RESET}  ${dim(msg)}`);
}

export function success(msg) {
  console.log(`  ${BRAND.success}✔${RESET}  ${BRAND.success}${msg}${RESET}`);
}

/* ── Tree / file-list rendering ───────────────────────────────── */
export function printTree(items, { indent = 2, icon = '◇' } = {}) {
  const pad = ' '.repeat(indent);
  const total = items.length;
  items.forEach((item, i) => {
    const isLast = i === total - 1;
    const branch = isLast ? '└─' : '├─';
    const line = typeof item === 'string'
      ? item
      : `${BRAND.surface}${item.label}${RESET}${item.detail ? `  ${dim(item.detail)}` : ''}`;
    console.log(`${pad}${dim(branch)} ${BRAND.accent}${icon}${RESET} ${line}`);
  });
}

/* ── Key-value table ──────────────────────────────────────────── */
export function printKV(pairs, { labelWidth = 22 } = {}) {
  for (const [k, v] of pairs) {
    const label = `${BRAND.muted}${k.padEnd(labelWidth)}${RESET}`;
    console.log(`  ${label} ${BRAND.surface}${v}${RESET}`);
  }
}

/* ── Boxed message ────────────────────────────────────────────── */
export function box(lines, { borderColor = 'secondary', padding = 1, width = 60 } = {}) {
  const bc = BRAND[borderColor] || BRAND.secondary;
  const inner = width - 2;
  const pad = ' '.repeat(padding);

  console.log(`${bc}╭${'─'.repeat(inner)}╮${RESET}`);
  for (let p = 0; p < padding; p++) {
    console.log(`${bc}│${' '.repeat(inner)}│${RESET}`);
  }
  for (const line of lines) {
    const stripped = line.replace(/\x1b\[[0-9;]*m/g, '');
    const rightPad = Math.max(0, inner - padding * 2 - stripped.length);
    console.log(`${bc}│${pad}${RESET}${line}${' '.repeat(rightPad)}${pad}${bc}│${RESET}`);
  }
  for (let p = 0; p < padding; p++) {
    console.log(`${bc}│${' '.repeat(inner)}│${RESET}`);
  }
  console.log(`${bc}╰${'─'.repeat(inner)}╯${RESET}`);
}

/* ── Divider ──────────────────────────────────────────────────── */
export function divider(width = 50) {
  console.log(`  ${dim('·'.repeat(width))}`);
}

/* ── Help screen ──────────────────────────────────────────────── */
export function printHelp() {
  console.log(`  ${BOLD}USAGE${RESET}`);
  console.log(`    ${BRAND.secondary}npx harnesskit${RESET} ${BRAND.primary}<command>${RESET} ${dim('[options]')}`);
  console.log('');

  console.log(`  ${BOLD}COMMANDS${RESET}`);
  const cmds = [
    ['init',    'Set up Harness Engineering in a project'],
    ['enforce', 'Run architecture layer enforcement checks'],
    ['doctor',  'Validate harness setup completeness'],
    ['garden',  'Run doc-gardener (find stale docs, broken refs)'],
    ['ingest',  'Auto-populate SoT from docs/references/'],
  ];
  for (const [cmd, desc] of cmds) {
    console.log(`    ${BRAND.primary}${cmd.padEnd(12)}${RESET}${BRAND.surface}${desc}${RESET}`);
  }
  console.log('');

  console.log(`  ${BOLD}INIT OPTIONS${RESET}`);
  const opts = [
    ['--yes, -y',  'Accept all defaults (non-interactive)'],
    ['--dir, -d',  'Target directory (default: .)'],
    ['--name',     'Project name'],
    ['--lang',     'node, python, dotnet, java, go, rust, other'],
    ['--ide',      'vscode, cursor, claude-code, windsurf, jetbrains, all'],
    ['--git',      'github, ado, gitlab, bitbucket'],
    ['--layers',   'Architecture layers (comma-separated)'],
  ];
  for (const [flag, desc] of opts) {
    console.log(`    ${BRAND.success}${flag.padEnd(14)}${RESET} ${dim(desc)}`);
  }
  console.log('');

  console.log(`  ${BOLD}EXAMPLES${RESET}`);
  const examples = [
    'npx harnesskit init',
    'npx harnesskit init --yes',
    'npx harnesskit init --lang node --ide vscode',
    'npx harnesskit enforce',
    'npx harnesskit doctor',
  ];
  for (const ex of examples) {
    console.log(`    ${dim('$')} ${BRAND.muted}${ex}${RESET}`);
  }
  console.log('');
}
