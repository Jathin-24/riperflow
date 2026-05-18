import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { spawnSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

// These tests run the COMPILED dist/ CLI as a subprocess so that ESM-only
// regressions (e.g. `import * as fs from 'fs-extra'` losing its named methods)
// are caught even when vitest's TS transformer would silently normalize them.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CLI = path.resolve(__dirname, '..', 'dist', 'index.js');

function run(cwd: string, args: string[]): { code: number; stdout: string; stderr: string } {
  const r = spawnSync(process.execPath, [CLI, ...args], { cwd, encoding: 'utf-8' });
  return { code: r.status ?? -1, stdout: r.stdout, stderr: r.stderr };
}

describe('dist smoke (ESM regression guard)', () => {
  let tmp: string;

  beforeAll(() => {
    if (!fs.existsSync(CLI)) {
      throw new Error(`dist build missing at ${CLI} — run \`npm run build\` first`);
    }
  });

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'riper-dist-smoke-'));
    run(tmp, ['init', '--yes']);
  });

  afterEach(() => {
    fs.removeSync(tmp);
  });

  it('mcp generate writes config without TypeError (Bug #4)', () => {
    run(tmp, ['mcp', 'add', 'github']);
    const r = run(tmp, ['mcp', 'generate']);
    const combined = r.stdout + r.stderr;
    expect(combined).not.toMatch(/TypeError/);
    expect(combined).not.toMatch(/fs\.writeJson is not a function/);
    expect(combined).toMatch(/✓.*claude-code/);
  });

  it('analytics migrate runs without TypeError (Bug #5)', () => {
    const r = run(tmp, ['analytics', 'migrate']);
    const combined = r.stdout + r.stderr;
    expect(combined).not.toMatch(/TypeError/);
    expect(combined).not.toMatch(/fs\.readFile is not a function/);
    expect(r.code).toBe(0);
  });
});

describe('init UX', () => {
  let tmp: string;

  beforeAll(() => {
    if (!fs.existsSync(CLI)) {
      throw new Error(`dist build missing at ${CLI} — run \`npm run build\` first`);
    }
  });

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'riper-init-ux-'));
  });

  afterEach(() => {
    fs.removeSync(tmp);
  });

  it('init with no flags and non-TTY stdin falls back to defaults (Bug #3)', () => {
    // spawnSync inherits a non-TTY stdin by default — exactly the CI/Docker case
    const r = run(tmp, ['init']);
    expect(r.code).toBe(0);
    expect(r.stderr + r.stdout).not.toMatch(/ERR_USE_AFTER_CLOSE/);
    expect(fs.existsSync(path.join(tmp, '.riper', 'config.json'))).toBe(true);
    expect(fs.existsSync(path.join(tmp, 'memory-bank'))).toBe(true);
  });

  it('init output is free of stack traces and JSON parse warnings (Bug #11)', () => {
    const r = run(tmp, ['init', '--yes']);
    const combined = r.stdout + r.stderr;
    expect(combined).not.toMatch(/SyntaxError/);
    expect(combined).not.toMatch(/Unexpected end of JSON input/);
    expect(combined).not.toMatch(/at JSON\.parse/);
    expect(combined).not.toMatch(/Error loading config/);
  });
});

// Bugs surfaced only by testing against a real project at a non-tmpdir path
// that's intended for git commit (see REAL-WORLD-TEST.md).
describe('generated-file portability + brand hygiene', () => {
  let tmp: string;

  beforeAll(() => {
    if (!fs.existsSync(CLI)) {
      throw new Error(`dist build missing at ${CLI} — run \`npm run build\` first`);
    }
  });

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'riper-portability-'));
    run(tmp, ['init', '--yes']);
    run(tmp, ['setup', '--tools', 'cursor,claude-code,opencode,kilocode,vscode,roo,aider,windsurf,cline,codex']);
  });

  afterEach(() => {
    fs.removeSync(tmp);
  });

  const ALL_FILES = [
    '.cursor/rules/riper.mdc', 'CLAUDE.md', '.claude/rules/riper.md',
    '.opencode/AGENTS.md', '.opencode/opencode.json', '.kilocode/rules/riper.md',
    '.vscode/.riper.md', '.roo/rules/riper.md', '.roo/settings.json',
    'CONVENTIONS.md', '.aider/riper.md', '.aider.conf.yml',
    '.windsurf/rules/riper.md', '.windsurf/cascade.md', '.windsurf/config.json',
    '.cline/instructions/riper.md', '.cline/global_instructions.json', '.cline/settings.json',
    'AGENT.md', '.codex/riper.md', '.codex/config.json', '.codex/instructions.md',
  ];

  it('no generated file leaks an absolute project path (Bug #16)', () => {
    const leaks: string[] = [];
    // Match the tmpdir prefix (e.g. /tmp/riper-portability-XXXXXX) anywhere in any file
    const tmpRe = new RegExp(tmp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    for (const rel of ALL_FILES) {
      const p = path.join(tmp, rel);
      if (!fs.existsSync(p)) continue;
      const body = fs.readFileSync(p, 'utf-8');
      if (tmpRe.test(body)) leaks.push(rel);
    }
    expect(leaks, `files leaking the project's absolute path: ${leaks.join(', ')}`).toEqual([]);
  });

  it('no generated file contains the legacy "ripper" typo (Bug #17)', () => {
    const offenders: string[] = [];
    for (const rel of ALL_FILES) {
      const p = path.join(tmp, rel);
      if (!fs.existsSync(p)) continue;
      const body = fs.readFileSync(p, 'utf-8');
      // "ripper" as a word (typo of "riper") — but NOT inside ".riper" paths
      if (/\bripper\b/.test(body)) offenders.push(rel);
    }
    expect(offenders, `files still containing "ripper": ${offenders.join(', ')}`).toEqual([]);
  });

  it('CLAUDE.md has exactly one H1 and one Protection Categories table (Bug #18)', () => {
    const md = fs.readFileSync(path.join(tmp, 'CLAUDE.md'), 'utf-8');
    // Strip fenced code blocks so commented `# ...` inside code samples don't count
    const stripped = md.replace(/```[\s\S]*?```/g, '');
    const h1s = stripped.match(/^# [^#]/gm) || [];
    expect(h1s.length, `CLAUDE.md should have exactly one H1, got ${h1s.length}: ${h1s.join(' | ')}`).toBe(1);

    const protTables = (md.match(/^\| Category \| Symbol \| Description \|/gm) || []).length;
    expect(protTables, 'Protection Categories table should appear exactly once').toBe(1);

    const protBulleted = (md.match(/^\*\*Protection Categories\*\*:/gm) || []).length;
    expect(protBulleted, 'redundant **Protection Categories**: bulleted list should not appear').toBe(0);
  });
});
