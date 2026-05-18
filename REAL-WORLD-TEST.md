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
