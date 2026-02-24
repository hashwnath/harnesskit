/**
 * Template engine — reads template files, replaces {{variables}}, writes to target.
 * Zero dependencies.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = join(__dirname, 'templates');

/**
 * Render a template string with context variables.
 * Supports {{var}}, {{#if var}}...{{/if}}, {{#each var}}...{{/each}}
 * @param {string} template
 * @param {object} ctx
 * @returns {string}
 */
export function render(template, ctx) {
  let result = template;

  // {{#if var}} ... {{/if}}
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_match, key, body) => {
    return ctx[key] ? body : '';
  });

  // {{#unless var}} ... {{/unless}}
  result = result.replace(/\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (_match, key, body) => {
    return ctx[key] ? '' : body;
  });

  // {{#each var}} ... {{item}} ... {{/each}}
  result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (_match, key, body) => {
    const arr = ctx[key];
    if (!Array.isArray(arr)) return '';
    return arr.map((item) => body.replace(/\{\{item\}\}/g, typeof item === 'string' ? item : JSON.stringify(item))).join('');
  });

  // Simple {{var}} replacement
  result = result.replace(/\{\{(\w+)\}\}/g, (_match, key) => {
    return ctx[key] !== undefined ? String(ctx[key]) : `{{${key}}}`;
  });

  return result;
}

/**
 * Load a template file from the templates directory.
 * @param {...string} pathParts - Path relative to templates/
 * @returns {string}
 */
export function loadTemplate(...pathParts) {
  const fullPath = join(TEMPLATES_DIR, ...pathParts);
  return readFileSync(fullPath, 'utf-8');
}

/**
 * Write a file, creating directories as needed. Skip if file exists and overwrite is false.
 * @param {string} filePath - Absolute path
 * @param {string} content
 * @param {boolean} [overwrite=false]
 * @returns {boolean} true if written, false if skipped
 */
export function writeFile(filePath, content, overwrite = false) {
  if (existsSync(filePath) && !overwrite) {
    return false;
  }
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf-8');
  return true;
}

/**
 * Generate a file from a template.
 * @param {string} templatePath - Relative to templates/
 * @param {string} outputPath - Absolute target path
 * @param {object} ctx - Template variables
 * @param {boolean} [overwrite=false]
 * @returns {boolean}
 */
export function generate(templatePath, outputPath, ctx, overwrite = false) {
  const template = loadTemplate(templatePath);
  const content = render(template, ctx);
  return writeFile(outputPath, content, overwrite);
}
