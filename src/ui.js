/**
 * Terminal UI helpers — zero dependencies.
 * ANSI colors, banner, progress indicators.
 */

const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

export function color(text, name) {
  return `${COLORS[name] || ''}${text}${COLORS.reset}`;
}

export function bold(text) {
  return `${COLORS.bold}${text}${COLORS.reset}`;
}

export function printBanner() {
  console.log(`
${color('╔═══════════════════════════════════════════════════╗', 'cyan')}
${color('║', 'cyan')}  ${bold(color('⚡ harness-lab', 'yellow'))}  ${color('v0.1.0', 'dim')}                         ${color('║', 'cyan')}
${color('║', 'cyan')}  ${color('Agent-first development for any repo,', 'white')}             ${color('║', 'cyan')}
${color('║', 'cyan')}  ${color('any IDE, any git provider.', 'white')}                        ${color('║', 'cyan')}
${color('╚═══════════════════════════════════════════════════╝', 'cyan')}
`);
}

export function printHelp() {
  console.log(`${bold('USAGE')}
  ${color('npx harness-lab', 'cyan')} ${color('<command>', 'yellow')} [options]

${bold('COMMANDS')}
  ${color('init', 'yellow')}      Set up Harness Engineering in a project
  ${color('enforce', 'yellow')}   Run architecture layer enforcement checks
  ${color('doctor', 'yellow')}    Validate harness setup completeness
  ${color('garden', 'yellow')}    Run doc-gardener (find stale docs, broken refs)

${bold('INIT OPTIONS')}
  ${color('--yes, -y', 'green')}       Accept all defaults (non-interactive)
  ${color('--dir, -d', 'green')}       Target directory (default: .)
  ${color('--name', 'green')}          Project name
  ${color('--lang', 'green')}          Language: node, python, dotnet, java, go, rust, other
  ${color('--ide', 'green')}           IDE: vscode, cursor, claude-code, windsurf, jetbrains, all
  ${color('--git', 'green')}           Git provider: github, ado, gitlab, bitbucket
  ${color('--layers', 'green')}        Architecture layers (comma-separated)

${bold('EXAMPLES')}
  ${color('npx harness-lab init', 'dim')}                          Interactive wizard
  ${color('npx harness-lab init --yes', 'dim')}                    Defaults for detected env
  ${color('npx harness-lab init --lang node --ide vscode', 'dim')} Specify stack
  ${color('npx harness-lab enforce', 'dim')}                       Check architecture rules
  ${color('npx harness-lab doctor', 'dim')}                        Validate setup health
`);
}

export function step(msg) {
  console.log(`  ${color('●', 'green')} ${msg}`);
}

export function warn(msg) {
  console.log(`  ${color('⚠', 'yellow')} ${msg}`);
}

export function fail(msg) {
  console.log(`  ${color('✗', 'red')} ${msg}`);
}

export function info(msg) {
  console.log(`  ${color('ℹ', 'blue')} ${msg}`);
}

export function heading(msg) {
  console.log(`\n${bold(color(msg, 'cyan'))}`);
}
