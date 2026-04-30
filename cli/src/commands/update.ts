import chalk from 'chalk';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promises as fs } from 'node:fs';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_NAME = 'riper-for-all';

interface UpdateOptions {
  adaptersOnly?: boolean;
}

/**
 * Compare two semver-shaped version strings. Returns positive if a > b,
 * negative if a < b, 0 if equal. Pre-release suffixes are ignored.
 */
export function compareSemver(a: string, b: string): number {
  const norm = (v: string) => v.replace(/^v/, '').split('-')[0].split('.').map((n) => parseInt(n, 10) || 0);
  const av = norm(a);
  const bv = norm(b);
  for (let i = 0; i < 3; i++) {
    const ai = av[i] ?? 0;
    const bi = bv[i] ?? 0;
    if (ai !== bi) return ai - bi;
  }
  return 0;
}

async function readLocalVersion(): Promise<string> {
  const pkgPath = path.resolve(__dirname, '..', '..', 'package.json');
  const content = await fs.readFile(pkgPath, 'utf-8');
  const pkg = JSON.parse(content);
  return String(pkg.version ?? '0.0.0');
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`npm view ${PKG_NAME} version`, { timeout: 8000 });
    return stdout.trim();
  } catch {
    return null;
  }
}

export async function updateCommand(options: UpdateOptions = {}): Promise<void> {
  console.log(chalk.cyan('\n🔄 Checking for updates...\n'));

  if (options.adaptersOnly) {
    console.log(chalk.gray('  (--adapters-only is reserved for a future feature; checking framework version.)\n'));
  }

  const current = await readLocalVersion();
  const latest = await fetchLatestVersion();

  if (!latest) {
    console.log(chalk.yellow(`⚠ Could not reach the npm registry (offline or network error).`));
    console.log(chalk.gray(`  Current version: ${current}\n`));
    return;
  }

  const cmp = compareSemver(latest, current);

  if (cmp > 0) {
    console.log(chalk.green(`✨ Update available: ${chalk.bold(current)} → ${chalk.bold(latest)}\n`));
    console.log(chalk.gray(`  Install via:`));
    console.log(chalk.cyan(`    npm install -g ${PKG_NAME}@${latest}`));
    console.log(chalk.gray(`  or with npx:`));
    console.log(chalk.cyan(`    npx ${PKG_NAME}@${latest} <command>\n`));
  } else if (cmp < 0) {
    console.log(chalk.gray(`ℹ Local version (${current}) is ahead of the published one (${latest}). Likely a dev build.\n`));
  } else {
    console.log(chalk.green(`✓ You are on the latest version (${current}).\n`));
  }
}
