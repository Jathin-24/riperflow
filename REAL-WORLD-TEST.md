# Real-World Project Test — Riperflow

**Date:** 2026-05-18
**Test project:** `/home/nitin/voicebox` — a real, multi-stack repo (Bun + Rust + Tauri, app/backend/web/mlx-test subdirs, established CHANGELOG and CONTRIBUTING). Clean `main` branch before the test; all Riperflow changes were made on a throwaway branch `riperflow-test` so they're trivially revertable (`git checkout main && git branch -D riperflow-test`).
**CLI version under test:** `riperflow 1.0.0` (local `npm link`, HEAD `b4a13a6` on `fix-plan`).

## TL;DR

✅ **Riperflow works on a real, complex project.** 22/22 generated files parse. Sync is byte-deterministic across re-runs. The CLAUDE.md generated for voicebox is functional — I could follow it in this very Claude Code session.

⚠️ **Two real bugs the synthetic tmpdir tests missed.** Both surfaced only because a real project lives at a non-tmpdir absolute path and gets committed to git for collaborators. Non-blocking for v1.0.0 launch, but small + worth fixing soon.

## What was tested

| Aspect | Result |
|---|---|
| `riperflow init -y` against an established Bun/Rust project | ✓ clean output, all 6 memory-bank files + .riper/ created |
| `riperflow setup --tools <all 10>` | ✓ "Successful: 10" — all 22 expected files created in the right dirs |
| Every generated file parses (JSON / YAML / Markdown well-formed) | ✓ 22/22 (1 was a false alarm in my YAML checker — Python's PyYAML parses it cleanly) |
| `riperflow sync` is **idempotent** — re-runs produce byte-identical output | ✓ all 22 file hashes stable across 2× sync |
| OpenCode `opencode.json` matches OpenCode's expected schema | ✓ `$schema` set, all 5 RIPER agents present, `instructions: ["AGENTS.md"]` wired |
| Live use of `CLAUDE.md` (I'm running inside Claude Code right now) | ✓ Read it, structure is clear, slash commands documented, protection protocol explicit — would work in a fresh session |

## Providers actually installed locally

(Detected from `npm ls -g` + `~/.config/<tool>/` + `~/.local/share/<tool>/`.)

| Tool | Installed how | Riperflow integration verified |
|---|---|---|
| Claude Code | `@anthropic-ai/claude-code@2.1.119` (npm-global) | ✓ Live (used in this session) |
| Cline | `cline@2.13.0` (npm-global) | ✓ File-generation correct, JSON schemas valid |
| KiloCode CLI | `@kilocode/cli@7.2.10` (npm-global) | ✓ Rules file present and well-formed |
| OpenCode | `~/.config/opencode/`, `~/.local/share/opencode/` exist | ✓ `opencode.json` valid; agents config correct |
| Cursor IDE | `~/.config/Cursor/`, `~/.local/share/cursor-agent/` | ✓ `.cursor/rules/riper.mdc` has correct format |
| Aider | not installed | File-generation correct (see Bug 16 below — absolute path in `.aider.conf.yml`) |
| Codex CLI | not installed | File-generation correct |
| Windsurf | not installed | File-generation correct |
| Roo Code | not installed | File-generation correct |
| VS Code | `code` not on PATH | File-generation correct |

## Per-file results

| Tool | File | Tokens | Parses | Symbolic |
|---|---|---:|:---:|:---:|
| Cursor | `.cursor/rules/riper.mdc` | 1,634 | ✓ | ✓ |
| Claude Code | `CLAUDE.md` | 1,350 | ✓ | ✓ |
| Claude Code | `.claude/rules/riper.md` | 1,339 | ✓ | ✓ |
| OpenCode | `.opencode/AGENTS.md` | 1,401 | ✓ | ✓ |
| OpenCode | `.opencode/opencode.json` | 583 | ✓ | — |
| KiloCode | `.kilocode/rules/riper.md` | 682 | ✓ | ✓ |
| VS Code | `.vscode/.riper.md` | 517 | ✓ | ✓ |
| Roo Code | `.roo/rules/riper.md` | 1,338 | ✓ | ✓ |
| Roo Code | `.roo/settings.json` | 259 | ✓ | — |
| Aider | `CONVENTIONS.md` | 1,561 | ✓ | ✓ |
| Aider | `.aider/riper.md` | 1,561 | ✓ | ✓ |
| Aider | `.aider.conf.yml` | 143 | ✓ (PyYAML) | — |
| Windsurf | `.windsurf/rules/riper.md` | 1,338 | ✓ | ✓ |
| Windsurf | `.windsurf/cascade.md` | 1,760 | ✓ | ✓ |
| Windsurf | `.windsurf/config.json` | 93 | ✓ | — |
| Cline | `.cline/instructions/riper.md` | 1,336 | ✓ | ✓ |
| Cline | `.cline/global_instructions.json` | 106 | ✓ | — |
| Cline | `.cline/settings.json` | 75 | ✓ | — |
| Codex CLI | `AGENT.md` | 1,712 | ✓ | ✓ |
| Codex CLI | `.codex/riper.md` | 1,336 | ✓ | ✓ |
| Codex CLI | `.codex/config.json` | 50 | ✓ | — |
| Codex CLI | `.codex/instructions.md` | 1,712 | ✓ | ✓ |

**22 files. Avg 995 tokens (skewed down by the small JSON configs); the markdown rule files average ~1,350 tokens, matching the README claim.**

## New bugs found (P2 / cosmetic — non-blocking for v1.0.0)

### Bug 16 — `.aider.conf.yml` writes an absolute project path

```yaml
# Aider Configuration for RIPER
conventions: /home/nitin/voicebox/CONVENTIONS.md
```

The `conventions:` value is the **absolute path** of the project on the machine where `riperflow setup` ran. `.aider.conf.yml` is normally committed to the repo (so the team shares Aider settings); when a collaborator clones it, Aider silently fails to load conventions because `/home/nitin/voicebox/...` doesn't exist on their box.

**Why the tmpdir test missed it:** `/tmp/riper-test/CONVENTIONS.md` is also absolute, but the tmpdir test was never the *committed* product — nobody cloned it.

**Fix:** in `cli/src/adapters/aider.ts`, write the path *relative to the project root* (since Aider runs from project root, just `CONVENTIONS.md` works). 1-line change.

### Bug 17 — Four JSON configs spell `"ripper"` instead of `"riper"`

Affected files (all root keys in their respective JSON):

- `.windsurf/config.json` → `"ripper": {...}`
- `.cline/global_instructions.json` → `"ripper": {...}`
- `.cline/settings.json` → `"ripper": {...}`
- `.codex/config.json` → `"ripper": {...}`

Extra `p`. The key is Riperflow's own bookkeeping (no other tool reads it), so it doesn't *break* anything, but it's a visible typo any developer browsing the config will notice and assume is a bug. Bad first impression.

**Fix:** in the four adapter source files (`windsurf.ts`, `cline.ts`, `codex.ts`), rename the key. Trivial sed across `src/adapters/`.

### Bug 18 — Minor: duplicate H1 + duplicate Protection table in `CLAUDE.md`

Generated output:

```markdown
# Riperflow - Claude Code Configuration
*Generated: 2026-05-18*

# Riperflow - Universal Rules        ← second H1
*Version: 1.0 | Generated: 2026-05-18*
```

And the Protection Categories table appears twice (once around line 41-48, again around 67-72). Reads as boilerplate that wasn't deduplicated when adapters were composed.

Cosmetic; the rendered CLAUDE.md still works perfectly. Worth a 10-minute cleanup in `rules-generator.ts` before recording the demo video.

## What was confirmed to still work after all the renames + fixes

- ✓ `init -y` clean output (no SyntaxError mid-run — Bug 11 from earlier remains fixed)
- ✓ `setup --tools` for all 10 (including `cline` and `codex` which were missing from defaults pre-fix — Bug 7)
- ✓ `mcp generate` doesn't crash with `TypeError` (Bug 4 stays fixed)
- ✓ `analytics migrate` doesn't crash (Bug 5 stays fixed)
- ✓ `sync` shows 5 unique lines, no `.opencode/AGENTS.md` duplicate (Bug 9 stays fixed)
- ✓ `update` says "not published yet" (Bug 10 stays fixed)
- ✓ All output now says `Riperflow` / `riperflow`, no stale `RIPER-for-All`

---

## Round 2 — `hr-beaver-agent` (project with existing CLAUDE.md)

**Why this project:** voicebox was a clean greenfield from Riperflow's POV. `hr-beaver-agent` already had a `CLAUDE.md` (660 bytes, real graphify-integration content the user wrote). This tests the **existing-rules-file path** — and uncovered a P1 bug.

### Findings

✅ `riperflow init -y` correctly does **not** touch existing CLAUDE.md (only creates `.riper/` + `memory-bank/`).
✅ Pre-existing `.claude/settings.json` and `.claude/settings.local.json` were not modified — riperflow only added new files in that directory.
✅ All other generated files (22 across 10 tools) parse cleanly and pass the same checks as the voicebox run.

~~❌ **Bug 19 (P1) — `setup --tools claude-code,...` silently clobbers existing `CLAUDE.md` with no prompt, no warning, no backup.** Same risk for `AGENT.md` (Codex) and `CONVENTIONS.md` (Aider).~~ **FIXED in commit `<this commit>`.** New `safeWrite` helper at `cli/src/utils/safe-write.ts` moves any pre-existing user-authored file (no `Riperflow` marker) to `<file>.bak-<ISO-timestamp>` before overwriting. Verified live: re-running setup against hr-beaver-agent produced `CLAUDE.md.bak-2026-05-18T10-16-59-267Z` with md5 identical to the user's original. 4 new regression tests in `dist-smoke.test.ts`.

Original bug evidence (before the fix):

```
md5 before setup: 8ee39dcfe68a23b3797b02648930d699  (660 B  — user's graphify content)
md5 after setup:  271de6957b61287aa55adef2ac461e32  (5 KB   — Riperflow universal rules)
output during setup: ✓ Successful: 10
```

The user's project documentation was destroyed and `setup` cheerfully reported success. A Claude Code user who already has a `CLAUDE.md` (which is most of them — it's the canonical memory file) tries Riperflow once, loses their context file, and never tries it again.

**Fix scope:**
- `cli/src/adapters/claude-code.ts` `createClaudeMdFile()` — line 173: `fs.outputFile()` overwrites unconditionally.
- `cli/src/adapters/codex.ts` for `AGENT.md` (project-root write).
- `cli/src/adapters/aider.ts` line 115 for `CONVENTIONS.md` (project-root write).

**Recommended behavior:**
- If the file exists and doesn't contain a `Riperflow` marker (i.e. it wasn't us last time), move it to `<file>.bak-<ISO-timestamp>` with a clear log line: `📦 Saved existing CLAUDE.md → CLAUDE.md.bak-2026-05-18T15-16-04`, then write fresh.
- Add `--force` flag to skip the backup (for users who do want a clobber).
- Add a regression test in `dist-smoke.test.ts`: seed a `CLAUDE.md` with arbitrary content, run setup, assert the original content lands in `CLAUDE.md.bak-*` and the original isn't lost.

Restored: hr-beaver-agent's `CLAUDE.md` was reverted from a backup at `/tmp/CLAUDE.md.original-hr-beaver` before any further work. Branch `riperflow-test` is on hr-beaver-agent for inspection.

---

---

## Round 3 — Riperflow eating its own dogfood

**Why this project:** the ultimate self-test. If Riperflow can't run cleanly inside the repo that built it, the product story doesn't survive contact with the launch demo.

### Findings

✅ **22/22 generated files pass** (every parse + symbol check, same battery as voicebox).
✅ **Bug 16 fix holds** — zero absolute-path leaks across all 22 files when generated into a deep nested path (`/home/nitin/riper-for-everyone`).
✅ **Bug 17 fix holds** — zero `ripper` typos in any config.
✅ **Bug 18 fix holds** — CLAUDE.md has exactly one H1 and one Protection Categories table.
✅ **Bug 19 fix holds** — no spurious `.bak-*` files (correct: nothing pre-existed at the root, so no backup was needed).
✅ **Idempotency** — running `sync` twice produces byte-identical output for all 22 files.
✅ **Dashboard end-to-end live** — token meta tag injected, every `/api/*` endpoint returns 401 without token and 200 with token, `/api/memory` correctly reports all 6 memory-bank files with real byte counts, `/api/watcher` is actively watching the project.
✅ **BMAD primitives** (`gate list`, `role list`) work and render cleanly.

### Two minor UX paper cuts (P3 — not launch blockers)

#### Bug 20 (P3 UX) — write commands in default Research mode print math-notation errors

Out of the box, `init -y` leaves the project in **Research** mode (read-only). Running BMAD writes like `prd create` or `protect set` immediately after init dumps:

```
❌ Mode research (Ω₁ 🔍) does not allow WRITE operations.
   ℙ(Ω₁)={"read":true,"create":false,"update":false,"delete":false}
   (mode: research, action: create, path: /home/nitin/.../prds/promotion-launch-v10.json)
```

The enforcement is correct — that's the whole point of modes. But the error reads like math homework, and a first-time user has to know to switch with `riperflow p` or `riperflow e`. A friendlier nudge would help:

> ❌ This action requires write permission. You're in 🔍 Research mode (read-only).
> 👉 Switch with `riperflow p` (Plan) or `riperflow e` (Execute), then retry.

Fix scope: thread a one-line "how to fix" hint into the `EnforcementError` message in `cli/src/core/enforce.ts`. ~5 lines.

#### Bug 21 (P3 UX) — `init -y` defaults projectName to literal `"my-project"` even when cwd has a meaningful name

```ts
// cli/src/commands/init.ts:80
const projectName = options.yes ? 'my-project' : await getProjectName();
```

When `--yes` is set and no `package.json` exists, the project gets named `"my-project"` instead of `path.basename(process.cwd())`. In this dogfood run, `/home/nitin/riper-for-everyone` ended up as `projectName: "my-project"`. Cosmetic — the path is correct, the name is just bland — but visible in `riperflow status` output and in the dashboard.

Fix: in the `--yes` branch, fall back to `path.basename(process.cwd())` (the same default `getProjectName` already uses in interactive mode). 1-line change.

### Verdict

**No new bugs of substance.** The two paper cuts above are 6 lines of total work; ship-or-defer is your call. Riperflow successfully ate its own dogfood — every previously-fixed bug stays fixed against the largest, most varied test target tried so far.

Cleanup performed: `riperflow-test` branch deleted, all generated artifacts removed via `rm -rf`, repo back to `fix-plan` HEAD with only `.agents/` + `skills-lock.json` untracked (those were not from this test — left in place).

---

## Round 4 — four-project parallel sweep (after all 21 bugs fixed)

Final confidence check before tag. Same battery run against four real projects simultaneously, each on a throwaway `riperflow-test` branch:

| Project | Type | Bug-19 trigger? |
|---|---|---|
| `ai-team` | greenfield (master, package.json only) | no |
| `hr-beaver-agent` | Python project, user-authored 660-B CLAUDE.md | **yes** |
| `voicebox` | Bun + Rust + Tauri, no rules files | no |
| `riper-for-everyone` | the riperflow repo itself | no |

### Result matrix — every box green

| Project | files | tok-avg | Bug 16 (abs leak) | Bug 17 (ripper) | Bug 18 (H1/tbl) | Bug 19 (.bak) | Idempotency | Bug 21 (name) |
|---|---:|---:|---|---|---|---|---|---|
| ai-team | 22/22 | 989 | 0 | 0 | 1/1 | 0 | byte-stable | ✓ |
| hr-beaver-agent | 22/22 | 989 | 0 | 0 | 1/1 | **1 (correctly)** | byte-stable | ✓ |
| voicebox | 22/22 | 989 | 0 | 0 | 1/1 | 0 | byte-stable | ✓ |
| riper-for-everyone | 22/22 | 989 | 0 | 0 | 1/1 | 0 | byte-stable | ✓ |

### Bug 19 spot-verification (hr-beaver-agent)

```
backup file:  CLAUDE.md.bak-2026-05-18T10-38-06-001Z
backup md5 matches user original: ✓ YES (zero data loss)
```

### Bug 20 spot-verification (all 4 projects)

`prd create` in default Research mode produces the friendly hint in all four:

```
ai-team               ✓ hint shown
hr-beaver-agent       ✓ hint shown
voicebox              ✓ hint shown
riper-for-everyone    ✓ hint shown
```

### Token-size determinism

CLAUDE.md compiles to **exactly 1,275 tokens (5,098 bytes)** in all four projects — confirms the spec is deterministic and project-content-independent.

### Verdict

**21/21 known bugs fixed. Zero new bugs found.** Cleared for `git tag v1.0.0`.

Cleanup: all four `riperflow-test` branches deleted, generated artifacts removed, hr-beaver-agent's user CLAUDE.md restored from `/tmp/CLAUDE.md.original-hr-beaver`.

---

## Cleanup

Two throwaway branches exist:

```bash
# voicebox
cd ~/voicebox && git checkout main && git branch -D riperflow-test
rm -rf .riper memory-bank .cursor .claude .opencode .kilocode .vscode .roo \
       .aider .aider.conf.yml CONVENTIONS.md .windsurf .cline .codex AGENT.md CLAUDE.md

# hr-beaver-agent (CLAUDE.md is the user's original; only the new dirs are riperflow)
cd ~/hr-beaver-agent && git checkout main && git branch -D riperflow-test
rm -rf .riper memory-bank .cursor .opencode .kilocode .vscode .roo \
       .aider .aider.conf.yml CONVENTIONS.md .windsurf .cline .codex AGENT.md
# DO NOT remove .claude/rules/ or CLAUDE.md here — original CLAUDE.md was restored.
```

Voicebox is on branch `riperflow-test`. To revert any time:

```bash
cd ~/voicebox
git checkout main
git branch -D riperflow-test       # wipes the test commit + working changes
rm -rf .riper memory-bank          # tracked-but-untracked files
# Plus any of the per-tool dirs you don't want to keep
```

## Verdict for launch

The two bugs above (16, 17) are not blockers — they're paper cuts that the launch demo won't surface, but they will show up in the first issue someone files. **Strongly recommend fixing both before tagging `v1.0.0`** since they're <30 minutes of total work and any post-publish fix would force a `v1.0.1` patch within days of launch.

Once 16 and 17 are fixed (and ideally 18 cleaned up), Riperflow is genuinely ready for `git tag v1.0.0 && git push --tags` to trigger the publish workflow.
