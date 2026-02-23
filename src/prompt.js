/**
 * Interactive prompts — zero dependencies.
 * Uses Node.js readline for terminal input.
 */

import { createInterface } from 'node:readline';

let rl = null;

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
 * @param {string} question
 * @param {string} [defaultValue]
 * @returns {Promise<string>}
 */
export function ask(question, defaultValue = '') {
  const prompt = defaultValue ? `${question} [${defaultValue}]: ` : `${question}: `;
  return new Promise((resolve) => {
    getRL().question(prompt, (answer) => {
      resolve(answer.trim() || defaultValue);
    });
  });
}

/**
 * Ask user to select from a numbered list.
 * @param {string} question
 * @param {Array<{ label: string, value: string }>} options
 * @param {string} [defaultValue]
 * @returns {Promise<string>}
 */
export function select(question, options, defaultValue = '') {
  console.log(`\n  ${question}`);
  options.forEach((opt, i) => {
    const marker = opt.value === defaultValue ? ' (default)' : '';
    console.log(`    ${i + 1}. ${opt.label}${marker}`);
  });
  return new Promise((resolve) => {
    getRL().question('  Choice: ', (answer) => {
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
 * @param {string} question
 * @param {Array<{ label: string, value: string }>} options
 * @param {string[]} [defaults]
 * @returns {Promise<string[]>}
 */
export function multiSelect(question, options, defaults = []) {
  console.log(`\n  ${question} (comma-separated numbers, or 'all')`);
  options.forEach((opt, i) => {
    const marker = defaults.includes(opt.value) ? ' ✓' : '';
    console.log(`    ${i + 1}. ${opt.label}${marker}`);
  });
  return new Promise((resolve) => {
    getRL().question('  Choices: ', (answer) => {
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
 * @param {string} question
 * @param {boolean} [defaultYes=true]
 * @returns {Promise<boolean>}
 */
export function confirm(question, defaultYes = true) {
  const hint = defaultYes ? '[Y/n]' : '[y/N]';
  return new Promise((resolve) => {
    getRL().question(`  ${question} ${hint}: `, (answer) => {
      if (!answer.trim()) resolve(defaultYes);
      else resolve(answer.trim().toLowerCase().startsWith('y'));
    });
  });
}
