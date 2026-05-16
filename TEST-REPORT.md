# RIPER-for-All — Pre-Promotion Test Report

**Tester:** Claude (promotion-grade dogfood, option 3)
**Date:** 2026-05-16
**Version tested:** `1.0.0` (local build, branch `fix-plan`, head `4acc95d`)
**Method:** Fresh `tmpdir` install via `npm link`, walked every README CLI command, hit every dashboard endpoint, validated all 10 tool integrations, measured token claim.
**Unit-test baseline:** `npm test` → 28 files / **204 / 204 pass**.

## TL;DR — Verdict

**ORIGINAL VERDICT (before fixes):** DO NOT PROMOTE — three P0 launch blockers, one P0 security bug.

**POST-FIX VERDICT (2026-05-16):** ✅ Code is **promotion-ready** after one remaining external step: `npm publish` from `cli/`. Every other P0 and most P1s are landed in five atomic commits on `fix-plan`:

| Commit | Bugs closed |
|--------|-------------|
| `ac869b2` fix: fs-extra ESM imports | 4, 5 |
| `5049950` fix(security): require token on all /api/* and /ws | 6, 12 |
| `299641e` fix(build): chmod +x + files allowlist | 2 |
| `757e428` fix(init): non-TTY fallback + suppress mid-write warnings | 3, 7, 11 |
| `c166a7b` fix: README accuracy + sync duplicate + update messaging | 8, 9, 10, 13, 15 |

Test suite now **215/215 pass** (added 11 new regression tests — the existing 204 missed every P0). Fresh-tmpdir dogfood verified end-to-end.

The only thing left between the repo and a Show HN launch is **`npm publish`** (Bug 1). That's a user action — needs your npm account + namespace claim — I can't do it for you.

## Severity legend

- **P0** — Promotion-blocker. Public demo fails.
- **P1** — Will hurt conversion / trust.
- **P2** — Polish; fix before screenshotting.

---

## Bug list

### P0 — Launch blockers

#### Bug 1 — Package not published to npm
- `npm view riper-for-all version` → **404 Not Found**.
- Every README install line is `npx riper-for-all init`. Today, that 404s for every visitor.
- **Fix:** `npm publish` from `cli/`. (Make sure `bin/` is in `files`, and that `prepare` script publishes built `dist/`.)

#### Bug 2 — `dist/index.js` ships without executable bit
- `stat` shows `-rw-rw-r--` on the bin entry. After `npm link`, running `riper-for-all` returns `permission denied`.
- npm install from registry chmods automatically, so end-users *might* not hit it — but it breaks `npm link`, local dev, and any tarball install. Demo-time risk.
- **Fix:** in `cli/package.json` `scripts.build`, append `&& chmod +x dist/index.js`.

#### Bug 3 — `riper-for-all init` crashes when stdin is not a TTY
- Pipe / CI / Docker / scripted demo recording → `Error [ERR_USE_AFTER_CLOSE]: readline was closed`. Zero files created.
- Inquirer is invoked unconditionally; the `-y / --yes` flag exists but is **not documented** in the README.
- **Fix:** detect non-TTY in `commands/init.ts`, fall back to `--yes` defaults; document `-y` in README.

#### Bug 4 — `mcp generate` broken for every tool
```
✗ claude-code: Failed to write config: TypeError: fs.writeJson is not a function
✗ opencode: Failed to write config: TypeError: fs.writeJson is not a function
✗ kilocode: Failed to write config: TypeError: fs.writeJson is not a function
✗ vscode: Failed to write config: TypeError: fs.writeJson is not a function
```
- Root cause: `cli/src/mcp/manager.ts:4` uses `import * as fs from 'fs-extra'`. fs-extra v11 in ESM only exposes named methods on the *default* export.
- Result: MCP integration — a flagship README feature — is **completely non-functional**.
- **Fix:** change to `import fs from 'fs-extra'`. One line.

#### Bug 5 — `analytics migrate` crashes
```
TypeError: fs.readFile is not a function
  at AnalyticsDatabase.migrateFromJSONL (.../analytics/database.js:310:34)
```
- Same root cause as Bug 4. `cli/src/analytics/database.ts:1`.
- **Fix:** change `import * as fs from 'fs-extra'` → `import fs from 'fs-extra'`. Also check `cli/src/core/violations.ts` (uses same `fs.readFile` pattern, likely broken on first violation event).
- **Test gap:** vitest's TS transformer hides this; the compiled ESM dist exposes it. Add a smoke test that runs `dist/` directly.

#### Bug 6 — Dashboard token enforcement is a no-op for read endpoints
- `cli/src/dashboard/server.ts:91` defines `requireToken` middleware with proper `crypto.timingSafeEqual` check (correct).
- **But:** `requireToken` is only called from mutating routes. Every GET (`/api/status`, `/api/analytics`, `/api/memory`) returns 200 with no token, bad token, or empty token.
- Localhost bind limits blast radius to local processes; on a shared box any user can `curl 127.0.0.1:3456/api/memory` and read another user's project state.
- The recent commit `5a8b0ba` "fix(security): harden dashboard server (localhost bind + token + enforce)" claims to add enforcement; enforcement isn't actually wired to read endpoints.
- **Fix:** apply `requireToken` to the `/api/*` router globally (`app.use('/api', requireToken)`).

### P1 — Will hurt the launch

#### Bug 7 — README's tool list overstates by 2 (Cline, Codex CLI)
- README lists 10 tools; default config in `commands/init.ts` only enables 8. Cline + Codex CLI are missing from the `tools` map.
- Setup *can* generate them via `setup --tools cline,codex` (verified — works), but `init`'s defaults don't include them.
- **Fix:** add cline + codex to default config tools map; OR clarify in README that init defaults are `cursor, claude-code, opencode` only.

#### Bug 8 — README's OpenCode path is wrong
- README: `(project root) AGENTS.md + opencode.json`
- Reality: `.opencode/AGENTS.md + .opencode/opencode.json`
- **Fix:** update the table in README.md line 114.

#### Bug 9 — `riper-for-all sync` logs `.opencode/AGENTS.md` twice
- Sync output prints the same line twice in a row. Either a double-write or double-log.
- Cosmetic, but creates "is this thing broken?" doubt during a recording.
- **Fix:** trace `sync` in `commands/sync.ts` — likely two adapters writing the same file.

#### Bug 10 — `update` command misreports "offline" when package is unpublished
- Output: `⚠ Could not reach the npm registry (offline or network error).`
- Actual cause: `npm view riper-for-all` returns 404 (Bug 1). Misleading message blames the user's network.
- **Fix:** distinguish 404 from network error in `commands/update.ts`.

### P2 — Polish

#### Bug 11 — `init` prints SyntaxError stack trace mid-run
- `cleanupOldBackups` reads `.riper/config.json` *before* the first save completes → JSON parse fails → full Node stack printed.
- `init` still completes with `✓ Config saved` after the trace, but a user sees a stack and assumes broken.
- **Fix:** in `commands/backup.ts:_doBackupCopy`, skip cleanup when config doesn't exist yet (or skip cleanup during `init`).

#### Bug 12 — Dashboard frontend calls `/api/violations`, server returns 404
- HTML JS references the route; the route isn't implemented. Browser console will show errors.
- **Fix:** implement `/api/violations` (returns recent violation log) or remove the call from the dashboard HTML.

#### Bug 13 — README claims "real-time updates"; no WebSocket on server
- `ws` is in `dependencies` but the dashboard server never upgrades; WS handshake → 400.
- Either the dashboard polls (verify and document) or the realtime feature was planned and not built. Don't put "real-time" in the README until WS is wired.

#### Bug 14 — "Detected tools" line is inconsistent and misleading
- Sometimes prints 5 tools, sometimes 7, depending on which command was last run. On a fresh `tmpdir` it lists tools that aren't even configured (rules-dirs auto-detected from filesystem residue).
- **Fix:** either drop the line or only show *configured* tools.

#### Bug 15 — Token-reduction marketing claim half-substantiated
- README: "reduces token usage from ~15,000 to ~1,500 (90% reduction)."
- Measured: generated CLAUDE.md = **1,355 tokens**, all adapters in 1,355–1,714 range. ✅ The "after" number is real and worth citing.
- The "before" 15k number has no baseline file in the repo. Two options:
  - (recommended) Ship a `templates/verbose-baseline.md` so the comparison is reproducible.
  - Soften the README claim to "compact ~1.5k token spec across all 10 tools" — still strong, no asterisk needed.

---

## What works (and is safe to demo)

| Area | Status | Notes |
|------|--------|-------|
| `init` (with `-y`) | ✓ | Creates memory bank + `.riper/` correctly |
| `mode` + r/i/p/e/rev shortcuts | ✓ | Switching is fast, persists |
| `sync` | ✓ | Writes to `.cursor/`, `.claude/`, `CLAUDE.md`, `.opencode/` (+10 if `setup` ran) |
| `setup --tools` (all 10) | ✓ | Every tool got files in correct dir, summary clean |
| `status` | ✓ | Clean output, mode + phase + tools + memory bank |
| `role list / set` | ✓ | 5 BMAD roles, switching works |
| `gate list` | ✓ | All 4 gates listed with required roles |
| `prd create / list` | ✓ | Writes JSON to `.riper/prds/` |
| `protect set / check` | ✓ | Levels enforced correctly |
| `analytics stats / weekly` | ✓ | Real numbers, sensible aggregations |
| `analytics export json/csv` | ✓ | Path-traversal protection working (rejects abs paths outside project) |
| Dashboard HTML loads | ✓ | 21KB self-contained HTML, CSP set, security headers present |
| Dashboard `/api/status`, `/api/analytics`, `/api/memory` | ✓ | Return correct data (but see Bug 6 — open without auth) |
| Localhost bind | ✓ | `127.0.0.1:3456`, not exposed to network |
| Test suite | ✓ | 204/204 pass |
| Token-reduction "after" number | ✓ | 1.3k–1.7k tokens, real |

## What is broken (do not demo)

- `npx riper-for-all init` (Bug 1: 404 from npm)
- `mcp add ... && mcp generate` (Bug 4: every tool fails)
- `analytics migrate` (Bug 5: TypeError)
- `update` (Bug 10: misleading message)
- "Real-time updates" claim (Bug 13: no WS)

---

## Promotion-readiness checklist

- [x] **Fix `import * as fs from 'fs-extra'`** in `mcp/manager.ts`, `analytics/database.ts`. Smoke test added at `test/dist-smoke.test.ts`.
- [x] **Apply `requireToken` to all `/api` routes** + authenticate the `/ws` upgrade with constant-time compare.
- [x] **`chmod +x dist/index.js`** in `npm run build`, plus `files: ["dist"]` so publish stays lean.
- [x] **Detect non-TTY in `init`** and auto-fallback to `--yes` defaults; clean output (no SyntaxError mid-run).
- [x] **README**: `-y` documented, OpenCode path corrected, dashboard security model explained, token claim rephrased to the measured 1.3k–1.7k figure.
- [x] **Real-time updates**: WS exists, now also token-gated — claim stands.
- [x] **Stub `/api/violations`**: wired to the existing `ViolationLogger.getStats()` so the frontend stops 404'ing.
- [x] **Sync duplicate `.opencode/AGENTS.md`** in output — fixed.
- [x] **`update` 404 vs network**: distinguished; clearer message either way.
- [ ] **`npm publish` from `cli/`** — your action; needs your npm credentials + namespace claim.

## What's still on the books (intentionally deferred)

- **Bug 14** (`Detected tools:` line inconsistent) — pure cosmetic. Doesn't block any demo path; safe to clean up post-launch.
- **A verbose-baseline reference file for the token claim** — the README is now honest about the measured number; shipping a baseline is a "nice to have" for a future blog post, not a launch gate.
- **`prepublishOnly` script that copies the root README into `cli/`** — npmjs.com will show no README otherwise. Worth adding before the first publish; pasted snippet:
  ```json
  "prepublishOnly": "node -e \"require('fs-extra').copySync('../README.md','README.md'); require('fs-extra').copySync('../PRD.md','PRD.md')\""
  ```

## Next launch step

When you're ready: from `cli/`,
1. `npm publish --access public`
2. `npx riper-for-all@latest init` in a *fresh* tmpdir to verify the registry-installed copy works exactly like the local build did today.
3. Then return to the original promotion plan — the **#4 demo video + #1 Show HN** sprint is now safe to execute.

## Marketing assets — captured today

Already-clean terminal outputs that can become tweet/screenshot fodder once the above is fixed:

- `riper-for-all init --yes` end-state: 6 memory bank files + config. Clean ✓ output.
- `riper-for-all setup --tools cursor,claude-code,opencode,kilocode,vscode,roo,aider,windsurf,cline,codex` → "Successful: 10". This is the **money screenshot** for the "works across 10 AI coding tools" hero claim.
- `riper-for-all status` output is well-designed and self-explanatory.
- `riper-for-all gate list` and `role list` outputs render cleanly.
- Generated `CLAUDE.md` token count: **1,355 tokens** — quotable.

**Recommended demo video shot list** (60 seconds, after fixes land):
1. (5s) Title card: "One workflow. Ten AI tools. 1.5k tokens."
2. (10s) `mkdir demo && cd demo && npx riper-for-all init` → memory bank appears.
3. (10s) `npx riper-for-all setup --tools cursor,claude-code,opencode,kilocode,vscode,roo,aider,windsurf,cline,codex` → ✓×10 summary.
4. (10s) `tree -L 2` → show the 10 tool dirs side-by-side.
5. (10s) `riper-for-all p` → mode switches to Plan, then `e` → Execute. Status updates.
6. (10s) Open dashboard in browser → mode/analytics tiles. Switch mode in another terminal → tile updates.
7. (5s) End card: "github.com/.../riper-for-all · MIT".

Step 6 needs the WS/realtime claim resolved first; otherwise drop it for "Open dashboard, see analytics."
