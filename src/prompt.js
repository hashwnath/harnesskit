/**
 * Interactive prompts — zero dependencies.
 * Uses Node.js readline for terminal input.
 * Premium styling via ANSI.
 */

import { createInterface } from 'node:readline';

let rl = null;

/* ── ANSI helpers (minimal inline — main palette lives in ui.js) ── */
const ESC = '\x1b[';
const RESET   = `${ESC}0m`;
const BOLD    = `${ESC}1m`;
const DIM     = `${ESC}2m`;
const fgRGB   = (r, g, b) => `${ESC}38;2;${r};${g};${b}m`;

const C = {
  primary:  fgRGB(255, 200, 60),
  secondary: fgRGB(100, 200, 255),
  accent:   fgRGB(180, 130, 255),
  success:  fgRGB(80, 220, 120),
  muted:    fgRGB(120, 120, 140),
  surface:  fgRGB(200, 200, 220),
};

function getRL() {
  if (!rl) {
    rl = createInterface({ input: process.stdin, output: process.stdout });
  }
  return rl;
}

export function closeRL() {
  if (rl) {
    rl.close();
    rl = null;
  }
}

/**
 * Ask a question and return the answer.
 */
export function ask(question, defaultValue = '') {
  const def = defaultValue ? ` ${DIM}(${defaultValue})${RESET}` : '';
  const prompt = `  ${C.secondary}?${RESET} ${C.surface}${question}${RESET}${def} ${C.muted}›${RESET} `;
  return new Promise((resolve) => {
    getRL().question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Ask user to select from a numbered list.
 */
export function select(question, options, defaultValue = '') {
  console.log('');
  console.log(`  ${C.secondary}?${RESET} ${BOLD}${C.surface}${question}${RESET}`);
  options.forEach((opt, i) => {
    const isDefault = opt.value === defaultValue;
    const num = `${C.muted}${String(i + 1).padStart(2)}.${RESET}`;
    const label = isDefault
      ? `${C.primary}${opt.label}${RESET} ${DIM}← default${RESET}`
      : `${C.surface}${opt.label}${RESET}`;
    console.log(`    ${num} ${label}`);
  });
  return new Promise((resolve) => {
    getRL().question(`  ${C.muted}›${RESET} `, (answer) => {
      const num = parseInt(answer, 10);
      if (num >= 1 && num <= options.length) {
        resolve(options[num - 1].value);
      } else {
        resolve(defaultValue || options[0].value);
      }
    });
  });
}

/**
 * Ask user to select multiple from a numbered list.
 */
export function multiSelect(question, options, defaults = []) {
  console.log('');
  console.log(`  ${C.secondary}?${RESET} ${BOLD}${C.surface}${question}${RESET}  ${DIM}(comma-separated, or "all")${RESET}`);
  options.forEach((opt, i) => {
    const isChecked = defaults.includes(opt.value);
    const num = `${C.muted}${String(i + 1).padStart(2)}.${RESET}`;
    const check = isChecked ? `${C.success}✓${RESET}` : `${C.muted}○${RESET}`;
    console.log(`    ${num} ${check} ${C.surface}${opt.label}${RESET}`);
  });
  return new Promise((resolve) => {
    getRL().question(`  ${C.muted}›${RESET} `, (answer) => {
      if (answer.toLowerCase() === 'all') {
        resolve(options.map((o) => o.value));
        return;
      }
      const nums = answer
        .split(',')
        .map((s) => parseInt(s.trim(), 10))
        .filter((n) => n >= 1 && n <= options.length);
      if (nums.length === 0) {
        resolve(defaults);
      } else {
        resolve(nums.map((n) => options[n - 1].value));
      }
    });
  });
}

/**
 * Yes/No confirmation.
 */
export function confirm(question, defaultYes = true) {
  const hint = defaultYes
    ? `${C.success}Y${RESET}${C.muted}/n${RESET}`
    : `${C.muted}y/${RESET}${C.primary}N${RESET}`;
  return new Promise((resolve) => {
    getRL().question(`  ${C.secondary}?${RESET} ${C.surface}${question}${RESET} [${hint}] ${C.muted}›${RESET} `, (answer) => {
      if (!answer.trim()) resolve(defaultYes);
      else resolve(answer.trim().toLowerCase().startsWith('y'));
    });
  });
}
