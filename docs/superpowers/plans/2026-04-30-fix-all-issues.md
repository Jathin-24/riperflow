# Riperflow — Comprehensive Fix & Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve every issue identified in the 2026-04-30 code audit (~52 findings) and bring the CLI from "scaffold + 4 working adapters" to "all advertised features actually work, with concurrency safety and measurable performance wins."

**Architecture:** Eight dependency-ordered phases. Each phase is self-contained: it leaves the build green, the tests passing, and the CLI usable. Phases 0–1 stabilize the foundation (build, tests, single-source-of-truth refactors). Phases 2–4 fix the adapter system, concurrency, and enforcement. Phases 5–8 implement the missing P0 sync, repair the dashboard/analytics, harden remaining commands, and polish performance and cross-platform behavior.

**Tech Stack:** Node.js 20+, TypeScript 5 (ES2022, strict), Commander.js, Vitest, `proper-lockfile`, `chokidar`, `express`, `inquirer`, `fs-extra`.

**Repo state:** `/home/nitin/riperflow` is **not** currently a git repo. Phase 0 initializes it so the per-task `git commit` discipline below works. If you prefer to keep it un-versioned, drop the commit steps; everything else is identical.

**Audit reference:** All findings below cite `[#N]` numbers from the review. Re-read the audit output before each phase to keep context fresh.

---

## Phase 0 — Make the project buildable, testable, and committable

**Why first:** Currently `npm install` fails on Node <24, `npm test` has at least three broken assertions, and we have no version control to make per-task commits safe. Nothing else can be verified until this is green.

**Covers findings:** #2, #3, #7, #8, #10, #11, #52

### Task 0.1: Initialize git and baseline commit

**Files:**
- Create: `/home/nitin/riperflow/.gitignore`

- [ ] **Step 1: Initialize repo**

```bash
cd /home/nitin/riperflow
git init
git config --local user.email "$(git config --global user.email || echo 'dev@example.com')"
git config --local user.name "$(git config --global user.name || echo 'dev')"
```

- [ ] **Step 2: Add `.gitignore`**

```
node_modules/
dist/
coverage/
.riper/
test-project/.riper/
test-project/memory-bank/
*.log
.DS_Store
```

- [ ] **Step 3: Baseline commit**

```bash
git add -A
git commit -m "chore: baseline before fix plan"
```

### Task 0.2: Fix `engines.node` so npm install works on common versions

**Files:**
- Modify: `cli/package.json:35-37`

- [ ] **Step 1: Lower the engine requirement**

Change `"node": ">=24.0.0"` to `"node": ">=20.0.0"`. Node 24 isn't shipped as LTS; 20 is the minimum supported LTS at writing.

- [ ] **Step 2: Verify install**

```bash
cd cli && npm install
```

Expected: install completes without `EBADENGINE`.

- [ ] **Step 3: Commit**

```bash
git add cli/package.json cli/package-lock.json
git commit -m "fix(deps): require node >=20 instead of >=24"
```

### Task 0.3: Add missing coverage dep so `npm run test:coverage` works

**Files:**
- Modify: `cli/package.json` (devDependencies)

- [ ] **Step 1: Install coverage provider**

```bash
cd cli && npm install -D @vitest/coverage-v8
```

- [ ] **Step 2: Verify**

```bash
npm run test:coverage -- --run
```

Expected: vitest reports coverage instead of "Coverage provider not installed".

- [ ] **Step 3: Commit**

```bash
git add cli/package.json cli/package-lock.json
git commit -m "test: add @vitest/coverage-v8 for npm run test:coverage"
```

### Task 0.4: Fix the `developer` role assertions in enforcer tests

**Files:**
- Modify: `cli/test/enforcer.test.ts:78,90,102` (and any other `'developer'` literals)

- [ ] **Step 1: Replace role id**

Use `git grep -n "'developer'" cli/test` and change every occurrence to `'dev'` to match `ROLES['dev']` in `cli/src/core/roles.ts`.

- [ ] **Step 2: Run the suite**

```bash
cd cli && npm test -- --run
```

Expected: all six test files now pass.

- [ ] **Step 3: Commit**

```bash
git add cli/test/enforcer.test.ts
git commit -m "fix(test): use real role id 'dev' instead of nonexistent 'developer'"
```

### Task 0.5: Fix `PROTECTION_LEVELS.warn.id === 'none'` collision

**Files:**
- Modify: `cli/src/core/protection.ts:26`

- [ ] **Step 1: Add a regression test first**

Append to `cli/test/protection.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { PROTECTION_LEVELS } from '../src/core/protection';

describe('PROTECTION_LEVELS ids', () => {
  it('all level ids are unique', () => {
    const ids = Object.values(PROTECTION_LEVELS).map(l => l.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
npm test -- --run protection
```

Expected: FAIL — duplicate `'none'`.

- [ ] **Step 3: Fix the id**

In `protection.ts:26` change `id: 'none'` (under `warn:`) to `id: 'warn'`.

- [ ] **Step 4: Run, expect pass; commit**

```bash
npm test -- --run protection
git add cli/src/core/protection.ts cli/test/protection.test.ts
git commit -m "fix(core): give protection.warn its own id (was duplicate 'none')"
```

### Task 0.6: Fix `MEMORY_FILES.decisions` reference in tier-3 loader

**Files:**
- Modify: `cli/src/memory/loader.ts:140`
- Modify: `cli/test/integration.test.ts` (extend tier-3 coverage)

- [ ] **Step 1: Add failing test for tier-3 load**

Append to `integration.test.ts` an assertion that `loadTier(3)` does not throw and returns the file list defined for tier 3.

- [ ] **Step 2: Decide: drop the reference or add the file**

`memory/loader.ts` is the only place `decisions` appears. The 6-file memory bank has no decisions file. Drop the reference: in `loader.ts:140` remove the `MEMORY_FILES.decisions` entry from the tier-3 array. If `decisions` is wanted later, add it as `Σ₇` to `core/modes.ts:MEMORY_FILES` first.

- [ ] **Step 3: Run integration test; expect pass; commit**

```bash
npm test -- --run integration
git add cli/src/memory/loader.ts cli/test/integration.test.ts
git commit -m "fix(memory): drop reference to nonexistent decisions key in tier-3"
```

### Task 0.7: Fix banner `[object Object]` rendering

**Files:**
- Modify: `cli/src/index.ts:32-44`

- [ ] **Step 1: Render names, not objects**

In the `preAction` hook replace:

```ts
console.log(`Tools: ${tools.join(', ')}`);
```

with:

```ts
console.log(`Tools: ${tools.map(t => t.name).join(', ') || 'none'}`);
```

(`DetectedTool` shape lives in `utils/detection.ts` — confirm the property is `name`; if it's `id`, use that.)

- [ ] **Step 2: Smoke check**

```bash
node dist/index.js --version
```

Expected: banner reads `Tools: cursor, claude-code` (or similar), not `[object Object]…`.

- [ ] **Step 3: Commit**

```bash
git add cli/src/index.ts
git commit -m "fix(cli): render detected tool names instead of [object Object]"
```

### Task 0.8: Remove unicode mojibake from `rules-generator.ts`

**Files:**
- Modify: `cli/src/adapters/rules-generator.ts:310,338` (and any other `�` occurrences)

- [ ] **Step 1: Find them**

```bash
grep -n $'\xef\xbf\xbd' cli/src/adapters/rules-generator.ts || grep -nP "[^\x00-\x7F]" cli/src/adapters/rules-generator.ts | grep -v '✓\|✗\|🛡️\|🔍\|💡\|📝\|⚙️\|🔎\|Ω\|Π\|Σ\|ℙ\|Ψ'
```

- [ ] **Step 2: Replace mojibake with intended glyph**

Line 310: replace `Π₄ �` with `Π₄ ✓`. Line 338: replace `�️ Protection Enforcement` with `🛡️ Protection Enforcement`.

- [ ] **Step 3: Verify generation, commit**

```bash
cd test-project && rm -rf .cursor .claude && node ../cli/dist/index.js init --force
grep -P "[^\x00-\x7F]" .claude/rules/*.md | grep -c $'\xef\xbf\xbd'
```

Expected count: 0.

```bash
git add cli/src/adapters/rules-generator.ts
git commit -m "fix(rules): replace mojibake with intended glyphs"
```

### Task 0.9: Phase 0 verification gate

- [ ] **Step 1: Full suite**

```bash
cd cli && npm install && npm run build && npm test -- --run
```

Expected: build succeeds, all tests pass.

- [ ] **Step 2: Tag the milestone**

```bash
git tag phase-0-complete
```

---

## Phase 1 — Single-source-of-truth refactor

**Why next:** The codebase has at least three duplicated registries/functions (`loadState`/`saveState`, `ensureMemoryBank`, `PROTECTION_LEVELS`). Fixing bugs across two copies multiplies them. Consolidate before doing the larger work.

**Covers findings:** #14, #15, #16, #17, #32, #36, #37, #39, #42

### Task 1.1: Consolidate `loadState`/`saveState`

**Files:**
- Modify: `cli/src/memory/manager.ts:199-216` — delete the duplicate
- Verify: `cli/src/core/workflow.ts:3` and any other importers point at `config/loader.ts`

- [ ] **Step 1: Find all importers**

```bash
git grep -n "from.*memory/manager" cli/src
git grep -n "saveState\|loadState" cli/src
```

- [ ] **Step 2: Repoint imports to `config/loader.ts`**

For every file that imports `loadState`/`saveState` from `memory/manager`, change the path to `../config/loader` (relative to that file).

- [ ] **Step 3: Delete the duplicate functions** in `memory/manager.ts`. If the file has nothing else load-bearing, delete the whole file and remove its imports.

- [ ] **Step 4: Build + test**

```bash
npm run build && npm test -- --run
```

- [ ] **Step 5: Commit**

```bash
git add cli/src
git commit -m "refactor: single source of truth for state load/save (config/loader.ts)"
```

### Task 1.2: Consolidate `ensureMemoryBank`

**Files:**
- Modify: `cli/src/memory/manager.ts:9` — delete the inline-template duplicate
- Verify: `config/loader.ts:162` is the only definition; `commands/init.ts` imports from there

- [ ] **Step 1:** Delete the manager.ts copy.
- [ ] **Step 2:** Search & repoint imports as in 1.1.
- [ ] **Step 3:** Build, test, commit.

```bash
git commit -m "refactor: single source of truth for ensureMemoryBank"
```

### Task 1.3: Consolidate `PROTECTION_LEVELS` registries

**Files:**
- Modify: `cli/src/core/modes.ts:174` — remove the second `PROTECTION_LEVELS` definition
- Modify: `cli/src/core/protection.ts:14` — keep this as the single source
- Modify: `cli/src/adapters/rules-generator.ts` — switch import to `core/protection`
- Modify: any consumer that expected the numeric `id` shape

- [ ] **Step 1: Pick the canonical schema**

`protection.ts` has the richer shape (`allowsWrite`, `allowsDelete`, `requiresApproval`). Make `id` a string here (`'protected' | 'guarded' | 'info' | 'debug' | 'test' | 'critical'`) and ensure each level also has a numeric `level` for symbolic mapping (`Ψ₁`..`Ψ₆`).

- [ ] **Step 2: Update `rules-generator.ts`**

Replace `import { PROTECTION_LEVELS } from '../core/modes'` with `import { PROTECTION_LEVELS } from '../core/protection'`. Update template strings to use `level.id` (string) and `level.level` (number) instead of the old numeric id.

- [ ] **Step 3: Delete the modes.ts definition** and its export.

- [ ] **Step 4: Add a regression test**

```ts
// cli/test/protection.test.ts
it('exposes one PROTECTION_LEVELS registry with required fields', async () => {
  const protection = await import('../src/core/protection');
  const modes = await import('../src/core/modes');
  expect((modes as any).PROTECTION_LEVELS).toBeUndefined();
  for (const lvl of Object.values(protection.PROTECTION_LEVELS)) {
    expect(typeof lvl.id).toBe('string');
    expect(typeof lvl.level).toBe('number');
    expect(typeof lvl.allowsWrite).toBe('boolean');
  }
});
```

- [ ] **Step 5: Build, test, commit**

```bash
npm run build && npm test -- --run
git add cli/src cli/test
git commit -m "refactor: single PROTECTION_LEVELS registry with consistent schema"
```

### Task 1.4: Fix `DEFAULT_PROTECTED_PATHS`

**Files:**
- Modify: `cli/src/core/protection.ts:126-133`

- [ ] **Step 1: Update paths**

Replace `.riper/projectbrief.md`, `.riper/protection.md` (and any other `.riper/*.md`) with `memory-bank/projectbrief.md`, `memory-bank/protection.md`. Also include the rest of the bank: `systemPatterns.md`, `techContext.md`, `activeContext.md`, `progress.md`.

- [ ] **Step 2: Add test**

```ts
// cli/test/protection.test.ts
import { DEFAULT_PROTECTED_PATHS } from '../src/core/protection';

it('default protected paths point at memory-bank/, not .riper/', () => {
  for (const p of DEFAULT_PROTECTED_PATHS) {
    expect(p.startsWith('memory-bank/')).toBe(true);
  }
});
```

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(core): default protected paths point at memory-bank/"
```

### Task 1.5: Type the schema drift in `RuntimeState`

**Files:**
- Modify: `cli/src/core/types.ts:95-106`

- [ ] **Step 1: Extend the type**

Add the fields actually written by `commands/role.ts:101`, `gate.ts:124`, `protect.ts`:

```ts
export interface RuntimeState {
  currentMode: ModeId;
  currentPhase: PhaseId;
  startedAt: string;
  lastUpdated: string;
  history: ModeTransition[];
  currentRole?: RoleId;
  gateStatuses?: Record<GateId, GateStatus>;
  approvals?: GateApproval[];
  protectionOverrides?: ProtectionOverride[];
}
```

(Define `RoleId`, `GateId`, `GateStatus`, `GateApproval`, `ProtectionOverride` with the literal types already used by their commands — search those commands for shape.)

- [ ] **Step 2: Replace any `(state as any)` casts** in those commands now that the type is real.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "refactor(types): make RuntimeState describe role/gate/approval fields"
```

### Task 1.6: Decide and act on dead modules

**Files:**
- `cli/src/dashboard/cli/index.ts` (TerminalDashboard ~270 lines, never imported) — **delete**
- `cli/src/memory/loader.ts` (tiered loading, never imported in production) — **delete unless Phase 8 wires it; this plan does not, so delete**
- `cli/src/types/inquirer.d.ts` (shadows the real types) — **delete**
- `cli/src/core/types.ts:50-58` `ToolAdapter` interface — **delete unless Phase 2 implements it; Phase 2 does, so keep and align**
- `cli/src/mcp/client.ts` — **delete**, expose nothing; Phase 7 does not need it

- [ ] **Step 1: Delete the files / blocks** above. For each delete, run `git grep` to confirm no remaining importers.

- [ ] **Step 2: Build, test, commit each deletion individually**

```bash
git commit -m "refactor: drop dead TerminalDashboard"
git commit -m "refactor: drop unused tiered-loading loader.ts"
git commit -m "refactor: drop type-shadowing inquirer.d.ts"
git commit -m "refactor: drop unused MCPClient stub"
```

### Task 1.7: Move `better-sqlite3` to optional

**Files:**
- Modify: `cli/package.json:39`

- [ ] **Step 1:** Move `better-sqlite3` from `dependencies` to `optionalDependencies`. The `AnalyticsDatabase` class will be wired in Phase 6; in the meantime nothing in production imports it.

- [ ] **Step 2:** `npm install` to refresh lockfile, build, test.

- [ ] **Step 3: Commit**

```bash
git commit -m "chore(deps): move better-sqlite3 to optionalDependencies until wired"
```

### Task 1.8: Phase 1 verification gate

```bash
cd cli && npm run build && npm test -- --run && git tag phase-1-complete
```

---

## Phase 2 — Adapter system overhaul

**Why next:** Sync (Phase 5) and enforcement (Phase 4) both rely on every adapter being reachable, every adapter honoring `dryRun`, and every adapter producing rule files from real templates. Fixing the adapter layer first makes those phases small.

**Covers findings:** #1, #18, #40, #49, plus the missing VS Code adapter referenced by README

### Task 2.1: Replace switch with adapter registry

**Files:**
- Modify: `cli/src/adapters/base.ts:128-148`

- [ ] **Step 1: Add a regression test**

```ts
// cli/test/adapters.test.ts
import { describe, it, expect } from 'vitest';
import { createAdapter, ADAPTER_IDS } from '../src/adapters/base';

describe('adapter registry', () => {
  for (const id of ADAPTER_IDS) {
    it(`returns an adapter for "${id}"`, () => {
      const a = createAdapter(id, '/tmp/fake');
      expect(a, `adapter "${id}" must be created`).toBeTruthy();
      expect(typeof a!.install).toBe('function');
    });
  }
});
```

- [ ] **Step 2: Run, expect failure** (adapters for `roo`, `aider`, `windsurf`, `cline`, `codex`, `vscode` are missing).

- [ ] **Step 3: Implement registry**

In `adapters/base.ts`:

```ts
import { CursorAdapter } from './cursor';
import { ClaudeCodeAdapter } from './claude-code';
import { OpenCodeAdapter } from './opencode';
import { KiloCodeAdapter } from './kilocode';
import { RooCodeAdapter } from './roo-code';
import { AiderAdapter } from './aider';
import { WindsurfAdapter } from './windsurf';
import { ClineAdapter } from './cline';
import { CodexAdapter } from './codex';
import { VSCodeAdapter } from './vscode';

const REGISTRY: Record<string, new (root: string) => BaseAdapter> = {
  cursor: CursorAdapter,
  'claude-code': ClaudeCodeAdapter,
  claudeCode: ClaudeCodeAdapter,
  opencode: OpenCodeAdapter,
  kilocode: KiloCodeAdapter,
  roo: RooCodeAdapter,
  'roo-code': RooCodeAdapter,
  aider: AiderAdapter,
  windsurf: WindsurfAdapter,
  cline: ClineAdapter,
  codex: CodexAdapter,
  vscode: VSCodeAdapter,
};

export const ADAPTER_IDS = Object.keys(REGISTRY);

export function createAdapter(id: string, projectRoot: string): BaseAdapter | null {
  const Cls = REGISTRY[id];
  return Cls ? new Cls(projectRoot) : null;
}
```

- [ ] **Step 4: Run test, expect pass; commit.**

```bash
git commit -m "refactor(adapters): registry-based createAdapter covering all 10 ids"
```

### Task 2.2: Create `VSCodeAdapter`

**Files:**
- Create: `cli/src/adapters/vscode.ts`
- Create: `cli/templates/adapters/vscode.md`

- [ ] **Step 1: Add target-path test**

```ts
// cli/test/adapters.test.ts
it('vscode adapter writes to .vscode/.riper.md', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-'));
  const a = createAdapter('vscode', root)!;
  const res = await a.install(false);
  expect(res.success).toBe(true);
  expect(await fs.pathExists(path.join(root, '.vscode/.riper.md'))).toBe(true);
});
```

- [ ] **Step 2: Implement**

`vscode.ts`:

```ts
import path from 'node:path';
import fs from 'fs-extra';
import { BaseAdapter, AdapterResult } from './base';
import { generateRules } from './rules-generator';

export class VSCodeAdapter extends BaseAdapter {
  id = 'vscode';
  async install(dryRun = false): Promise<AdapterResult> {
    const target = path.join(this.projectRoot, '.vscode/.riper.md');
    const content = generateRules('vscode');
    if (dryRun) {
      return { success: true, message: `Would write ${target}`, filesCreated: [target] };
    }
    await fs.ensureDir(path.dirname(target));
    await fs.writeFile(target, content, 'utf8');
    return { success: true, message: `Wrote ${target}`, filesCreated: [target] };
  }
}
```

- [ ] **Step 3: Template** (`templates/adapters/vscode.md`) — copy `claude-code.md`'s body and adjust the heading.

- [ ] **Step 4: Build, test, commit.**

```bash
git commit -m "feat(adapters): add VSCodeAdapter"
```

### Task 2.3: Unify `install()` signature across all adapters

**Files:**
- Modify: `cli/src/adapters/base.ts` — define `install(dryRun: boolean): Promise<AdapterResult>` as abstract
- Modify: `cline.ts:76`, `codex.ts:123`, `roo-code.ts:82`, `aider.ts:72`, `windsurf.ts:94` — adopt the signature, branch on `dryRun`, return full `AdapterResult` (`success`, `message`, `filesCreated: string[]`)

- [ ] **Step 1: Add a dry-run regression test for each adapter**

```ts
// cli/test/adapters.test.ts
for (const id of ADAPTER_IDS) {
  it(`${id}: dryRun writes nothing`, async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'riper-'));
    const before = await listAll(root);
    const res = await createAdapter(id, root)!.install(true);
    const after = await listAll(root);
    expect(res.success).toBe(true);
    expect(after).toEqual(before);
  });
}
```

(`listAll` is a small recursive readdir helper in the test file.)

- [ ] **Step 2: Run, expect failures** for the 5 misbehaving adapters.

- [ ] **Step 3: Refactor each offending adapter** to match `BaseAdapter.install(dryRun: boolean)`. The body shape:

```ts
async install(dryRun = false): Promise<AdapterResult> {
  const targets = this.targetFiles(); // [{path, content}]
  if (dryRun) return { success: true, message: 'dry-run', filesCreated: targets.map(t => t.path) };
  for (const t of targets) {
    await fs.ensureDir(path.dirname(t.path));
    await fs.writeFile(t.path, t.content, 'utf8');
  }
  return { success: true, message: `Wrote ${targets.length} files`, filesCreated: targets.map(t => t.path) };
}
```

- [ ] **Step 4: Run, expect pass; commit.**

```bash
git commit -m "fix(adapters): all adapters honor dryRun and return full AdapterResult"
```

### Task 2.4: Implement `ToolAdapter` interface contract

**Files:**
- Modify: `cli/src/core/types.ts:50-58`
- Modify: `cli/src/adapters/base.ts`

- [ ] **Step 1:** In `base.ts`, declare `BaseAdapter implements ToolAdapter`. Adjust the interface so it matches what `BaseAdapter` actually exposes (id, install, uninstall (if any), update (if any)). If `ToolAdapter` is too aspirational, trim it to match reality — don't pretend to support methods we haven't built.

- [ ] **Step 2: Build (TypeScript will surface mismatches), test, commit.**

```bash
git commit -m "refactor(types): BaseAdapter implements ToolAdapter contract"
```

### Task 2.5: Replace inline rule fallbacks with real templates

**Files:**
- Create: `cli/templates/adapters/universal.md`
- Create: `cli/templates/adapters/roo.md`
- Create: `cli/templates/adapters/aider.md`
- Create: `cli/templates/adapters/windsurf.md`
- Create: `cli/templates/adapters/cline.md`
- Create: `cli/templates/adapters/codex.md`
- Modify: `cli/src/adapters/rules-generator.ts:277` (and surrounding fallback code) — remove the inline `?? '<<inline default>>'` once templates exist; throw if a template is missing so we notice regressions

- [ ] **Step 1:** Copy `templates/adapters/claude-code.md` to each new file, then adjust headings and tool-specific notes.

- [ ] **Step 2:** Add a test that loads every template:

```ts
it('all adapter templates exist', () => {
  for (const id of ['universal', 'roo', 'aider', 'windsurf', 'cline', 'codex', 'cursor', 'claude-code', 'opencode', 'kilocode', 'vscode']) {
    expect(loadTemplate(`${id}.md`)).toMatch(/RIPER/);
  }
});
```

- [ ] **Step 3:** Remove inline fallbacks in `rules-generator.ts`. Throw a clear error if `loadTemplate` returns nothing.

- [ ] **Step 4: Build, test, commit.**

```bash
git commit -m "feat(adapters): real templates for all adapters; no more inline fallback"
```

### Task 2.6: Phase 2 verification

```bash
cd cli && npm run build && npm test -- --run
cd ../test-project && rm -rf .cursor .claude .opencode .kilocode .roo .windsurf .vscode .aider* CLAUDE.md AGENT.md CONVENTIONS.md
node ../cli/dist/index.js init
# should now create rule files for all selected tools, including vscode/cline/etc.
git tag phase-2-complete
```

---

## Phase 3 — Concurrency, persistence, recovery

**Why next:** With state writes consolidated (Phase 1) and adapters writing real files (Phase 2), we can now plug locking and backup into the same hot paths.

**Covers findings:** #9, #13, #20, #21, #26

### Task 3.1: Generic `withLock(filePath, fn)` helper

**Files:**
- Modify: `cli/src/memory/lock.ts`

- [ ] **Step 1: Add test**

```ts
// cli/test/lock.test.ts
import { withLock } from '../src/memory/lock';

it('serializes concurrent writers', async () => {
  const file = path.join(os.tmpdir(), `lock-${Date.now()}.txt`);
  await fs.writeFile(file, '0');
  await Promise.all(
    Array.from({ length: 20 }, () =>
      withLock(file, async () => {
        const v = parseInt(await fs.readFile(file, 'utf8'), 10);
        await fs.writeFile(file, String(v + 1));
      })
    )
  );
  expect(parseInt(await fs.readFile(file, 'utf8'), 10)).toBe(20);
});
```

- [ ] **Step 2: Implement**

```ts
import lockfile from 'proper-lockfile';

export async function withLock<T>(file: string, fn: () => Promise<T>): Promise<T> {
  // Ensure file exists before locking — proper-lockfile requires it
  await fs.ensureFile(file);
  const release = await lockfile.lock(file, { retries: { retries: 5, minTimeout: 50, maxTimeout: 500 }, realpath: false });
  try {
    return await fn();
  } finally {
    await release();
  }
}
```

- [ ] **Step 3: Run, pass, commit.**

```bash
git commit -m "feat(memory): withLock helper for serialized writes"
```

### Task 3.2: Wire `withLock` into every production write path

**Files:** every callsite that writes one of the persistent JSON/JSONL/MD files.

Specifically:

- `cli/src/config/loader.ts` — `saveConfig`, `saveState` (wrap the body in `withLock(filePath, async () => { await fs.writeJson(...); })`)
- `cli/src/analytics/storage.ts:23` — `appendEvent` (lock the JSONL file)
- `cli/src/core/violations.ts:136` — `appendViolation`
- `cli/src/commands/protect.ts`, `gate.ts`, `prd.ts`, `role.ts` — any `fs.writeJson`/`fs.writeFile` to `.riper/*` or `memory-bank/*`
- `cli/src/commands/backup.ts` — `autoBackupFile`'s rename + write

- [ ] **Step 1: Concurrency test for each write path**

```ts
// cli/test/concurrency.test.ts
it('analytics append survives 50 concurrent calls', async () => {
  const tmp = await fs.mkdtemp(...);
  const storage = new AnalyticsStorage(tmp);
  await Promise.all(Array.from({ length: 50 }, (_, i) => storage.append({ type: 'cmd', ts: i, payload: { i } })));
  const events = await storage.read(100);
  expect(events.length).toBe(50);
  expect(new Set(events.map(e => e.payload.i)).size).toBe(50); // no torn writes
});
```

- [ ] **Step 2: Run, expect failures (race-induced loss).**

- [ ] **Step 3: Wrap each write site with `withLock`. Build, test, commit.**

```bash
git commit -m "fix(concurrency): wrap all production writes with proper-lockfile"
```

### Task 3.3: Honor `backup.maxBackups` config

**Files:**
- Modify: `cli/src/commands/backup.ts:7` (remove hardcoded `MAX_BACKUPS = 10`)
- Modify: the prune loop that trims old `*.bak` files

- [ ] **Step 1: Test**

```ts
it('autoBackupFile retains exactly config.backup.maxBackups files', async () => {
  const cfg = { ...defaultConfig, backup: { ...defaultConfig.backup, maxBackups: 3 } };
  await saveConfig(tmpRoot, cfg);
  for (let i = 0; i < 7; i++) await autoBackupFile(tmpRoot, 'state.json');
  const baks = (await fs.readdir(path.join(tmpRoot, '.riper/backups'))).filter(f => f.endsWith('.bak'));
  expect(baks.length).toBe(3);
});
```

- [ ] **Step 2: Implement**

Read `cfg.backup.maxBackups` (default 10) inside `autoBackupFile`, sort `.bak` files for the same base by mtime, unlink the oldest beyond the limit.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(backup): respect backup.maxBackups instead of hardcoded 10"
```

### Task 3.4: Restore should write missing target files

**Files:**
- Modify: `cli/src/commands/restore.ts:66-69`

- [ ] **Step 1: Test**

```ts
it('restore re-creates a deleted file', async () => {
  const file = path.join(tmpRoot, '.riper/state.json');
  await autoBackupFile(tmpRoot, 'state.json');
  await fs.unlink(file);
  await restore(tmpRoot, 'state.json'); // latest backup
  expect(await fs.pathExists(file)).toBe(true);
});
```

- [ ] **Step 2: Drop the early `return` when target absent.** Always copy the chosen backup over the inferred target.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(restore): restore deleted files instead of aborting"
```

### Task 3.5: Fix analytics singleton path bug

**Files:**
- Modify: `cli/src/analytics/storage.ts:111-118`

- [ ] **Step 1: Test**

```ts
it('getAnalyticsStorage rebinds projectPath when explicitly provided', async () => {
  const a = getAnalyticsStorage();          // implicit cwd
  const b = getAnalyticsStorage('/tmp/x');   // explicit
  expect(b.projectPath).toBe('/tmp/x');
  expect(b).not.toBe(a);
});
```

- [ ] **Step 2: Implement** — when a `projectPath` arg is provided that differs from the cached instance, return a new instance (or invalidate cache and recreate).

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(analytics): respect explicit projectPath on getAnalyticsStorage"
```

### Task 3.6: Fix workflow engine cross-process drift

**Files:**
- Modify: `cli/src/core/workflow.ts:114-122`

- [ ] **Step 1: Test**

```ts
it('workflow engine reads state from disk, not stale cache', async () => {
  const e = getWorkflowEngine(tmpRoot);
  await e.setMode('research');
  await fs.writeJson(path.join(tmpRoot, '.riper/state.json'), { ...await fs.readJson(...), currentMode: 'execute' });
  await new Promise(r => setTimeout(r, 10));
  expect((await getWorkflowEngine(tmpRoot).getState()).currentMode).toBe('execute');
});
```

- [ ] **Step 2: Implement**

Either (a) keep the singleton but make every `getState()`/`setMode()` re-read `state.json` under `withLock`, or (b) drop the singleton and re-instantiate per call. (a) is cheaper.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(workflow): always read state from disk; no more cross-process drift"
```

### Task 3.7: Phase 3 verification

```bash
cd cli && npm run build && npm test -- --run && git tag phase-3-complete
```

---

## Phase 4 — Wire the enforcement engine

**Why next:** Concurrency is safe (Phase 3); we can now plug `enforcer.canPerformOperation` into the commands that mutate files without worrying about the writes themselves.

**Covers findings:** #12, #28, #29, #38

### Task 4.1: Wire `canPerformOperation` into mutation commands

**Files:**
- Modify: `cli/src/commands/{protect,gate,prd,role}.ts`
- Modify: every adapter's `install()` (or a wrapping function called by `setup`)

- [ ] **Step 1: Define a tiny `enforce` helper**

`cli/src/core/enforce.ts`:

```ts
import { canPerformOperation, validateOperation } from './enforcer';
import { loadState } from '../config/loader';

export async function enforce(projectRoot: string, op: 'read'|'create'|'update'|'delete', target: string) {
  const state = await loadState(projectRoot);
  const verdict = canPerformOperation({ mode: state.currentMode, role: state.currentRole, op, target });
  if (!verdict.allowed) {
    throw new EnforcementError(verdict.reason, { op, target, mode: state.currentMode });
  }
}
```

- [ ] **Step 2: Test**

```ts
it('blocks update in research mode', async () => {
  await setMode(tmpRoot, 'research');
  await expect(enforce(tmpRoot, 'update', 'memory-bank/progress.md')).rejects.toThrow(/research/);
});
```

- [ ] **Step 3: Wire** — at the top of every command handler that mutates files, call `await enforce(...)` before doing the work.

- [ ] **Step 4: Build, test, commit.**

```bash
git commit -m "feat(enforcer): wire canPerformOperation into all mutation commands"
```

### Task 4.2: Wire `validateGateProgression` into `gate advance`

**Files:**
- Modify: `cli/src/commands/gate.ts:104-128`

- [ ] **Step 1: Test**

```ts
it('gate advance is blocked when validation fails', async () => {
  // set up state where current gate has unmet blockers
  await expect(advance(tmpRoot, 'design')).rejects.toThrow(/blocker/i);
});
```

- [ ] **Step 2: Call `validateGateProgression`** before assigning `current = nextGate`. Surface the `reason` string in the error.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(gate): validate progression before advancing"
```

### Task 4.3: Wire `canApproveGate` into `gate approve`

**Files:**
- Modify: `cli/src/commands/gate.ts:155`

- [ ] **Step 1: Test**

```ts
it('only roles authorized for the gate can approve', async () => {
  await setRole(tmpRoot, 'dev');
  await expect(approve(tmpRoot, 'prd')).rejects.toThrow(/not authorized/i);
});
```

- [ ] **Step 2: Replace `'current-user'`** with the actual `currentRole` from state. Call `canApproveGate(role, gate)` and reject if false. Record `approver: role` in the approval entry.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(gate): only authorized roles can approve; record real approver"
```

### Task 4.4: Activate `ViolationLogger`

**Files:**
- Modify: `cli/src/core/enforce.ts` (the helper from 4.1)
- Verify: `cli/src/core/violations.ts` exposes `appendViolation`

- [ ] **Step 1: Test**

```ts
it('blocked operation appends a violation', async () => {
  await setMode(tmpRoot, 'research');
  await enforce(tmpRoot, 'update', 'memory-bank/progress.md').catch(() => {});
  const log = await fs.readFile(path.join(tmpRoot, '.riper/violations.jsonl'), 'utf8');
  expect(log).toMatch(/research/);
});
```

- [ ] **Step 2: In the `enforce` helper**, on a denied verdict, `await appendViolation(projectRoot, { mode, op, target, reason, ts })` before throwing.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "feat(violations): record blocked operations to .riper/violations.jsonl"
```

### Task 4.5: Phase 4 verification

```bash
cd cli && npm run build && npm test -- --run && git tag phase-4-complete
```

---

## Phase 5 — Implement `riperflow sync`

**Why next:** Sync is the marketed P0 feature. With adapters fixed, locking in place, and enforcement wired, sync is just "regenerate per-tool rule files from the canonical memory bank, plus pull tool-side memory edits back into `memory-bank/`".

**Covers findings:** #4

### Task 5.1: Decide the sync semantics

**Architecture:** `memory-bank/*.md` is the source of truth. Adapter rule files (`.cursor/rules/*.mdc`, `.claude/rules/*.md`, …) are derived. Sync does:

1. **Pull (optional, default off):** if a per-tool memory clone (`.cursor/memory-bank/`, etc.) is newer than `memory-bank/`, refuse and tell the user to merge manually. We do not auto-merge — that risks clobber.
2. **Push:** for every enabled adapter, regenerate rule files via the adapter's `install(dryRun)` (now uniform after Phase 2).
3. **Report:** number of files updated, number unchanged, any tools skipped.

`--dry-run` runs the same flow with `dryRun=true` on every adapter and prints what would change.

### Task 5.2: Implement sync

**Files:**
- Modify: `cli/src/commands/sync.ts` (replace stub)

- [ ] **Step 1: Test**

```ts
// cli/test/sync.test.ts
it('sync regenerates rule files for every enabled adapter', async () => {
  await init(tmpRoot, { tools: ['cursor', 'claude-code'] });
  // Mutate memory bank
  await fs.writeFile(path.join(tmpRoot, 'memory-bank/projectbrief.md'), '# new');
  const result = await sync(tmpRoot, { dryRun: false });
  expect(result.updated).toContain(path.join(tmpRoot, '.cursor/rules/riper.mdc'));
  expect(result.updated).toContain(path.join(tmpRoot, '.claude/rules/riper.md'));
});

it('sync --dry-run does not write', async () => {
  await init(tmpRoot, { tools: ['cursor'] });
  const before = await readMtime(path.join(tmpRoot, '.cursor/rules/riper.mdc'));
  await sync(tmpRoot, { dryRun: true });
  expect(await readMtime(path.join(tmpRoot, '.cursor/rules/riper.mdc'))).toBe(before);
});
```

- [ ] **Step 2: Implement**

```ts
// commands/sync.ts
import { loadConfig } from '../config/loader';
import { createAdapter } from '../adapters/base';

export interface SyncOptions { dryRun?: boolean; }
export interface SyncResult { updated: string[]; skipped: string[]; }

export async function sync(projectRoot: string, opts: SyncOptions = {}): Promise<SyncResult> {
  const cfg = await loadConfig(projectRoot);
  const updated: string[] = [];
  const skipped: string[] = [];
  for (const id of cfg.tools.enabled) {
    const adapter = createAdapter(id, projectRoot);
    if (!adapter) { skipped.push(id); continue; }
    const r = await adapter.install(!!opts.dryRun);
    updated.push(...(r.filesCreated ?? []));
  }
  return { updated, skipped };
}
```

Wire the Commander action to call `sync(projectRoot, { dryRun: program.opts().dryRun })` and print a human-readable report.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "feat(sync): regenerate rule files for all enabled adapters; honor --dry-run"
```

### Task 5.3: Add `analytics` event for sync

**Files:**
- Modify: `cli/src/commands/sync.ts`

- [ ] **Step 1:** After a successful sync, `await getAnalyticsStorage(projectRoot).append({ type: 'sync', ts: Date.now(), payload: { updated: result.updated.length, skipped: result.skipped.length, dryRun }})`.

- [ ] **Step 2: Build, test, commit.**

```bash
git commit -m "feat(analytics): record sync events"
```

### Task 5.4: Phase 5 verification

```bash
cd cli && npm run build && npm test -- --run
cd ../test-project && node ../cli/dist/index.js sync --dry-run
node ../cli/dist/index.js sync
git tag phase-5-complete
```

---

## Phase 6 — Dashboard, analytics, and SQLite decision

**Why next:** With sync done, the dashboard finally has truthful data to show. Fix dashboard reliability and analytics performance together.

**Covers findings:** #22, #23, #24, #25, #27, #33, #35, #47

### Task 6.1: Wire `trackCommand` in preAction

**Files:**
- Modify: `cli/src/index.ts` (preAction hook)

- [ ] **Step 1: Test**

```ts
it('every CLI invocation appends a command event', async () => {
  await execCli(tmpRoot, ['mode', 'research']);
  const events = await getAnalyticsStorage(tmpRoot).read(10);
  expect(events.find(e => e.type === 'command' && e.payload.name === 'mode')).toBeTruthy();
});
```

- [ ] **Step 2: Implement** by calling `trackCommand(name, argv)` from the `preAction` hook (already exported in `analytics/events.ts`).

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "feat(analytics): record every CLI invocation via trackCommand"
```

### Task 6.2: Cache `detectTools`

**Files:**
- Modify: `cli/src/utils/detection.ts`
- Modify: `cli/src/index.ts` preAction

- [ ] **Step 1:** Memoize `detectTools()` with a 60s in-memory TTL. Add an env-var bypass (`RIPER_FORCE_DETECT=1`) for tests.

- [ ] **Step 2:** Skip the preAction call entirely for `--help`/`--version` invocations and for commands that don't need it (e.g., `update`, `dashboard tui`).

- [ ] **Step 3:** Convert `execSync('which …')` to async (`execAsync` is already imported elsewhere) — `utils/detection.ts:97`.

- [ ] **Step 4: Build, time `node dist/index.js --help` before and after** (`time node dist/index.js --help` should drop noticeably).

- [ ] **Step 5: Commit.**

```bash
git commit -m "perf(cli): memoize detectTools, skip on --help/--version, async exec"
```

### Task 6.3: Real `--detach` for the web dashboard

**Files:**
- Modify: `cli/src/dashboard/server.ts:429-442`
- Modify: `cli/src/commands/dashboard.ts`

- [ ] **Step 1:** When `--detach` is passed, the parent process should `child_process.spawn(process.execPath, [...argv, '--detach=run'], { detached: true, stdio: 'ignore' }).unref()` and exit. The child sees `--detach=run` and runs `server.listen` normally.

- [ ] **Step 2:** Write a `.riper/dashboard.pid` so `dashboard stop` can find it later.

- [ ] **Step 3: Test**

```ts
it('dashboard --detach returns immediately and parent exits', async () => {
  const start = Date.now();
  await execCli(tmpRoot, ['dashboard', 'web', '--detach']);
  expect(Date.now() - start).toBeLessThan(2000);
  expect(await fs.pathExists(path.join(tmpRoot, '.riper/dashboard.pid'))).toBe(true);
  await execCli(tmpRoot, ['dashboard', 'stop']);
});
```

- [ ] **Step 4: Build, test, commit.**

```bash
git commit -m "feat(dashboard): real --detach via spawn+unref; pidfile for stop"
```

### Task 6.4: Handle `EADDRINUSE`

**Files:**
- Modify: `cli/src/dashboard/server.ts`

- [ ] **Step 1:** Wrap `server.listen` in a Promise; on `'error'` with `code === 'EADDRINUSE'` print `Dashboard already running on :3456 (or change port via --port)` and exit cleanly with code 1.

- [ ] **Step 2:** Add `--port <n>` option to `dashboard web`.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(dashboard): clean message + non-zero exit on EADDRINUSE; --port flag"
```

### Task 6.5: TUI cleanup

**Files:**
- Modify: `cli/src/commands/dashboard.ts:115-138`

- [ ] **Step 1:** Capture the `setInterval` handle. Install `process.on('SIGINT', () => { clearInterval(handle); process.exit(0); })`. Also clear screen and reset cursor on exit.

- [ ] **Step 2:** Manual smoke: `node dist/index.js dashboard tui` then Ctrl+C — should exit cleanly, single press.

- [ ] **Step 3: Commit.**

```bash
git commit -m "fix(dashboard): clear interval and handle SIGINT in TUI"
```

### Task 6.6: Real `/api/memory`

**Files:**
- Modify: `cli/src/dashboard/server.ts:108-110`

- [ ] **Step 1: Test**

```ts
it('/api/memory returns real file metadata', async () => {
  await ensureMemoryBank(tmpRoot);
  const res = await fetch(`http://localhost:${port}/api/memory`);
  const json = await res.json();
  expect(json.files.find((f: any) => f.name === 'projectbrief.md').exists).toBe(true);
});
```

- [ ] **Step 2: Implement**

```ts
app.get('/api/memory', async (_req, res) => {
  const dir = path.join(projectRoot, 'memory-bank');
  const files = await Promise.all(
    Object.values(MEMORY_FILES).map(async (m) => {
      const f = path.join(dir, m.filename);
      const exists = await fs.pathExists(f);
      const stat = exists ? await fs.stat(f) : null;
      return { name: m.filename, exists, bytes: stat?.size ?? 0, mtime: stat?.mtime ?? null };
    })
  );
  res.json({ files });
});
```

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(dashboard): /api/memory returns real metadata"
```

### Task 6.7: Cache analytics aggregations

**Files:**
- Modify: `cli/src/analytics/storage.ts`

- [ ] **Step 1: Test**

```ts
it('three aggregations from one read of the file', async () => {
  const spy = vi.spyOn(fs, 'readFile');
  const a = new AnalyticsStorage(tmpRoot);
  await a.snapshot();
  a.getStats(); a.getModeHistory(); a.getCommandUsage();
  expect(spy.mock.calls.length).toBe(1);
});
```

- [ ] **Step 2: Implement**

Replace `read(10000)` calls with a `snapshot()` that loads once into memory and exposes the synchronous aggregators. Add `invalidate()` after `append`. Keep the public `read()` for raw access.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "perf(analytics): single-read snapshot for all aggregators"
```

### Task 6.8: Decision on SQLite analytics

**Files:**
- Modify: `cli/src/analytics/database.ts`
- Modify: `cli/src/analytics/storage.ts`

This plan **wires SQLite as a write-through index**, not a replacement (per README). After every JSONL append, write the same row to SQLite under the same lock. SQLite is consulted by `analytics stats`/`weekly`. JSONL stays the canonical log so we can rebuild the DB any time.

- [ ] **Step 1: Test**

```ts
it('JSONL and SQLite stay consistent after 1000 appends', async () => {
  const a = new AnalyticsStorage(tmpRoot, { sqlite: true });
  for (let i = 0; i < 1000; i++) await a.append({ type: 'cmd', ts: i, payload: { i }});
  expect(a.dbCount()).toBe(1000);
  expect((await a.read(2000)).length).toBe(1000);
});
```

- [ ] **Step 2: Implement** the optional SQLite path. If `better-sqlite3` import fails (it's now an optional dep), log a one-time warning and continue with JSONL only.

- [ ] **Step 3:** Add `riperflow analytics migrate` to rebuild the DB from JSONL.

- [ ] **Step 4: Build, test, commit.**

```bash
git commit -m "feat(analytics): SQLite write-through index with graceful fallback to JSONL"
```

### Task 6.9: Phase 6 verification

```bash
cd cli && npm run build && npm test -- --run && git tag phase-6-complete
```

---

## Phase 7 — Command correctness (config setter, MCP, prd, update)

**Covers findings:** #5, #6, #19, #30, #31, #34, #44, #48

### Task 7.1: Typed config setter

**Files:**
- Modify: `cli/src/commands/config.ts:82-90` (`setNestedValue`)

- [ ] **Step 1: Test**

```ts
it.each([
  ['telemetry.enabled', 'false', false],
  ['backup.maxBackups', '7', 7],
  ['memory.format', 'markdown', 'markdown'],
])('config set %s %s coerces correctly', async (key, raw, expected) => {
  await runConfigSet(tmpRoot, key, raw);
  const cfg = await loadConfig(tmpRoot);
  expect(getByPath(cfg, key)).toBe(expected);
});
```

- [ ] **Step 2: Implement**

Look up the schema (zod or hand-rolled) for each leaf. Convert by declared type: bool, number, string. Reject unknown keys. Provide an `--as=json` option to allow raw JSON for arrays/objects.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(config): set coerces to declared type; rejects unknown keys"
```

### Task 7.2: `analytics` subcommands match README

**Files:**
- Modify: `cli/src/commands/analytics.ts`

- [ ] **Step 1: Add subcommands** — `analytics stats`, `analytics weekly`, `analytics export --format json|csv`, `analytics migrate` (rebuilds SQLite from JSONL — wired in 6.8).

- [ ] **Step 2: Make `--format json|csv` actually emit the chosen format** (#31).

- [ ] **Step 3: Update README** if any subcommand was promised but isn't useful. (Don't over-build to match docs — trim docs instead.)

- [ ] **Step 4: Build, test, commit.**

```bash
git commit -m "feat(analytics): real stats/weekly/export/migrate subcommands"
```

### Task 7.3: `prd edit` launches `$EDITOR`

**Files:**
- Modify: `cli/src/commands/prd.ts:179-196`

- [ ] **Step 1: Implement**

```ts
import { spawn } from 'node:child_process';
const editor = process.env.EDITOR || process.env.VISUAL || 'nano';
await new Promise<void>((resolve, reject) => {
  const child = spawn(editor, [prdPath], { stdio: 'inherit' });
  child.on('exit', code => code === 0 ? resolve() : reject(new Error(`editor exited ${code}`)));
});
```

- [ ] **Step 2: Test** — mock `$EDITOR=true` (a no-op shell builtin) and assert no throw.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "feat(prd): edit launches $EDITOR (or nano fallback)"
```

### Task 7.4: MCP merge instead of overwrite

**Files:**
- Modify: `cli/src/mcp/manager.ts:476` (`generateAllMCPConfigs`)

- [ ] **Step 1: Test**

```ts
it('preserves user-defined MCP servers when adding ours', async () => {
  await fs.writeJson(path.join(tmpRoot, '.cursor/mcp.json'), { mcpServers: { custom: { command: 'x' } } });
  await generateAllMCPConfigs(tmpRoot, ['cursor'], ['github']);
  const out = await fs.readJson(path.join(tmpRoot, '.cursor/mcp.json'));
  expect(out.mcpServers.custom).toEqual({ command: 'x' });
  expect(out.mcpServers.github).toBeTruthy();
});
```

- [ ] **Step 2: Implement** — read existing JSON if present, deep-merge our `mcpServers` keys (ours win on collision, document this).

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(mcp): merge mcp.json instead of overwriting user-defined servers"
```

### Task 7.5: Case-insensitive MCP server dedup

**Files:**
- Modify: `cli/src/commands/mcp.ts:80`

- [ ] **Step 1:** Compare via `.toLowerCase()`. Test asserts `mcp add Github` then `mcp add github` results in one entry.

- [ ] **Step 2: Build, test, commit.**

```bash
git commit -m "fix(mcp): case-insensitive server name dedup"
```

### Task 7.6: Non-global MCP install option

**Files:**
- Modify: `cli/src/mcp/manager.ts:193-196`, `servers.ts:267-270`

- [ ] **Step 1:** Default to `npx -y <pkg>` invocation in `mcp.json` instead of `npm install -g` + bin lookup. This avoids sudo on Linux/macOS entirely. Keep `--global` opt-in for users who explicitly want it.

- [ ] **Step 2: Test** — adding a server writes a config that uses `npx`.

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(mcp): default to npx invocation; --global opt-in"
```

### Task 7.7: `update` — implement or remove

**Files:**
- Modify: `cli/src/commands/update.ts`

- [ ] **Decide:** implement a real check (`npm view riperflow version` + compare to `package.json.version`) or remove the command and the README mention.

- [ ] **Implement (recommended):**

```ts
const { stdout } = await execAsync('npm view riperflow version');
const latest = stdout.trim();
const current = require('../../package.json').version;
if (semver.gt(latest, current)) {
  console.log(`Update available: ${current} → ${latest}`);
  console.log(`Run: npm install -g riperflow@${latest}`);
} else {
  console.log(`You are running the latest version (${current}).`);
}
```

- [ ] **Test, build, commit.**

```bash
git commit -m "feat(update): real version check against npm registry"
```

### Task 7.8: Phase 7 verification

```bash
cd cli && npm run build && npm test -- --run && git tag phase-7-complete
```

---

## Phase 8 — Polish, perf, cross-platform

**Covers findings:** #41, #45, #46, #50, #51

### Task 8.1: Cross-platform path handling

**Files:**
- Modify: `cli/src/commands/init.ts:69`
- Sweep: `git grep -nE "split\\('/'\\)|\\.split\\(\"\\/\"\\)" cli/src` — every match should become `path.basename` or `path.sep`-aware code

- [ ] **Step 1:** Replace `process.cwd().split('/')` with `path.basename(process.cwd())`.

- [ ] **Step 2: Test on Windows-style path** (mock `path.win32`):

```ts
it('init derives project name on win32 paths', () => {
  expect(deriveProjectName('C:\\Users\\me\\project')).toBe('project');
});
```

- [ ] **Step 3: Build, test, commit.**

```bash
git commit -m "fix(cross-platform): use path.basename instead of split('/')"
```

### Task 8.2: Remove `Phase N` markers from user output

**Files:**
- Sweep: `git grep -n "Phase [0-9]" cli/src`

- [ ] **Step 1:** Replace any user-visible "Phase 2 feature" / "Phase 5 feature" strings with normal language. After Phases 5 and 7 those are real features now.

- [ ] **Step 2: Commit.**

```bash
git commit -m "chore(cli): remove internal phase markers from user-facing output"
```

### Task 8.3: Memory truncation enforcement

**Files:**
- Modify: `cli/src/memory/manager.ts` (or its replacement after 1.2)
- Modify: `cli/src/commands/sync.ts` (call truncation as part of sync)

- [ ] **Step 1: Test**

```ts
it('truncates memory file beyond maxSize, archives the tail', async () => {
  await fs.writeFile(p, 'a'.repeat(MEMORY_FILES.progress.maxSize * 2));
  await truncateMemoryBank(tmpRoot);
  expect((await fs.stat(p)).size).toBeLessThanOrEqual(MEMORY_FILES.progress.maxSize);
  expect(await fs.pathExists(path.join(tmpRoot, '.riper/archive/progress.md'))).toBe(true);
});
```

- [ ] **Step 2: Implement** — for each `MEMORY_FILES[key]`, if file size > `maxSize`, append the overflow to `.riper/archive/<key>.md` and rewrite the source with the trimmed head + a "(archived earlier sections in .riper/archive/<key>.md)" trailer.

- [ ] **Step 3:** Run truncation at the end of `sync()` and as its own `riperflow memory truncate` command.

- [ ] **Step 4: Build, test, commit.**

```bash
git commit -m "feat(memory): enforce maxSize via archive-and-trim during sync"
```

### Task 8.4: Drop polluted MCP server case dedup, port docs to reality

**Files:**
- Modify: `README.md`
- Modify: `architecture.md` (where it disagrees with what shipped)

- [ ] **Step 1:** Walk the README's command table and confirm every command/option exists. Fix the docs (or open a follow-up plan) where they diverged.

- [ ] **Step 2: Commit.**

```bash
git commit -m "docs: align README/architecture with shipped CLI surface"
```

### Task 8.5: Phase 8 verification

```bash
cd cli && npm run build && npm test -- --run && git tag phase-8-complete
```

---

## Final acceptance checklist

After all 8 phases:

- [ ] `npm install` succeeds on Node 20.x
- [ ] `npm run build` produces clean `dist/`
- [ ] `npm test -- --run` is fully green; no `.skip` or pending
- [ ] `npm run test:coverage -- --run` produces a coverage report
- [ ] `node dist/index.js init` in an empty dir creates rule files for every selected adapter (10 supported)
- [ ] `node dist/index.js setup --dry-run` writes nothing
- [ ] `node dist/index.js sync` regenerates rule files; `--dry-run` writes nothing
- [ ] `node dist/index.js mode research` then attempting a write-bearing command (e.g., `prd new`) is blocked and recorded in `.riper/violations.jsonl`
- [ ] `node dist/index.js gate advance design` is blocked when blockers exist; `gate approve` rejects unauthorized roles
- [ ] `node dist/index.js dashboard web --detach` returns in <2s; `dashboard stop` shuts it down; `EADDRINUSE` produces a friendly message
- [ ] `node dist/index.js dashboard tui` exits cleanly on first SIGINT
- [ ] `node dist/index.js analytics stats` reads the JSONL file once and prints aggregates instantly even at 10k events
- [ ] `node dist/index.js mcp add github` merges into existing `.cursor/mcp.json`; `mcp add Github` does not duplicate
- [ ] `node dist/index.js prd edit` opens `$EDITOR`
- [ ] `node dist/index.js update` queries npm and reports current vs. latest
- [ ] No `[object Object]` strings in any user output
- [ ] No mojibake in any generated rule file
- [ ] Concurrent invocations from two terminals do not corrupt `state.json`, `config.json`, `analytics.jsonl`, `violations.jsonl`
- [ ] `DEFAULT_PROTECTED_PATHS` matches reality — `memory-bank/*`, not `.riper/*`
- [ ] All adapters honor `dryRun`
- [ ] `setup --tools cline` (or any of the 10) actually creates rule files
- [ ] `enforcer.canPerformOperation` is reachable from at least 5 commands; coverage proves it
- [ ] `RuntimeState` covers `currentRole`, `gateStatuses`, etc., with no `as any` casts
- [ ] Single `PROTECTION_LEVELS` registry; single `loadState`/`saveState`; single `ensureMemoryBank`
- [ ] No dead files (`dashboard/cli/index.ts`, unused tier loader, `mcp/client.ts`, `inquirer.d.ts`) remain
- [ ] `better-sqlite3` is either wired or moved to `optionalDependencies` with graceful fallback
- [ ] `detectTools` does not run for `--help`/`--version`
- [ ] No `Phase N feature` text in any user-facing output
- [ ] README command table matches shipped surface

---

## Operational notes for the executor

- **Order matters.** Phases 0–4 strictly precede 5–8. Within a phase, tasks are written in dependency order. If a task depends on a later one, the plan is wrong — flag it instead of working around it.
- **One commit per task at minimum.** That gives you cheap rollback if a step turns out to be wrong.
- **If a test passes before you write the fix**, the bug isn't reproduced. Stop and investigate — don't keep going.
- **If a task seems too big** (more than ~30 minutes of work), split it. Each task should fit in a single subagent dispatch.
- **The audit file paths can drift after refactors.** Always re-`grep` for the symbol you care about before editing.
- **Re-read the audit findings the task references** — file:line and symptom are there in detail; this plan's prose summarizes.

---

Plan complete and saved to `docs/superpowers/plans/2026-04-30-fix-all-issues.md`. Two execution options:

**1. Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach?
