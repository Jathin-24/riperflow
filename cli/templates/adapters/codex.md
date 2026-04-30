# RIPER-for-All - OpenAI Codex CLI Rules
*Version: 1.0 | Generated: {{DATE}}*

## SLASH COMMANDS (respond immediately)

| Command | Mode | What You Can Do |
|---------|------|-----------------|
| `/r` or `/research` | 🔍 Research | Read-only: analyze, explain |
| `/i` or `/innovate` | 💡 Innovate | Suggest ideas only (NO code) |
| `/p` or `/plan` | 📝 Plan | Create specs only (NO code) |
| `/e` or `/execute` | ⚙️ Execute | Full access: write code |
| `/rev` or `/review` | 🔎 Review | Validate only (NO code) |

## AT START OF EVERY CONVERSATION

1. Read `.riper/state.json` to know current mode
2. Read `memory-bank/activeContext.md` for current task
3. Follow mode permissions below

---

## MODE PERMISSIONS (STRICT)

### 🔍 Research (/r)
- ✅ Read files, analyze, explain
- ❌ CANNOT modify, write, delete
- 💬 Say: "I'm in Research mode. Type /e to switch to Execute mode."

### 💡 Innovate (/i)  
- ✅ Read files, suggest ideas, explore options
- ❌ CANNOT write code or implement
- 💬 Say: "I'm in Innovate mode. Type /e to implement."

### 📝 Plan (/p)
- ✅ Read files, create specifications, plan tasks
- ❌ CANNOT write application code
- 💬 Say: "I'm in Plan mode. Type /e to write code."

### ⚙️ Execute (/e)
- ✅ Read/write any files, implement features
- ⚠️ MUST check memory-bank/protection.md first
- ⚠️ MUST update progress.md when done

### 🔎 Review (/rev)
- ✅ Read files, validate, test, verify
- ❌ CANNOT modify any files
- 💬 Say: "I'm in Review mode. Type /e to make fixes."

---

## FILE LOCATIONS

- `.riper/state.json` - Current mode (read at start)
- `memory-bank/activeContext.md` - Current task (READ FIRST!)
- `memory-bank/protection.md` - Protected files (CHECK BEFORE MODIFYING)
- `memory-bank/progress.md` - Update when tasks complete

## WORKFLOW

1. User types slash command → Acknowledge and switch
2. Read state file and activeContext.md
3. Follow mode permissions strictly
4. Update progress.md when done
5. Check protection.md before any modifications

## Codex AGENT.md Convention

The OpenAI Codex CLI reads `AGENT.md` from the project root (and optionally from
`~/.codex/AGENT.md` for user-level instructions) at the start of every session.
The RIPER installer writes this file for you.

Key points:
- `AGENT.md` is the authoritative source of RIPER rules for Codex sessions.
  Do not duplicate rules in ad-hoc prompts — reference AGENT.md instead.
- Codex operates in a sandboxed shell; file writes go through an approval diff
  UI. Only approve diffs when Ω₄ Execute mode is active.
- The `--approval-mode` flag controls how aggressively Codex auto-applies changes.
  For Ψ₁ PROTECTED files, always use `--approval-mode suggest` regardless of
  the current RIPER mode.
- State is persisted in `.riper/state.json`; Codex does not read it automatically,
  so the session opening message should echo the current mode from that file.

## SYMBOLS

Ω₁=Research Ω₂=Innovate Ω₃=Plan Ω₄=Execute Ω₅=Review
Σ=Memory Files ℙ=Permissions Ψ=Protection Levels
