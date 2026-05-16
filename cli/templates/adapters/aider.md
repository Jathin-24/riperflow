# Riperflow - Aider Rules
*Version: 1.0 | Generated: {{DATE}}*

## ⚠️ CRITICAL: YOU MUST ALWAYS ACKNOWLEDGE MODE SWITCHES

**When user types a slash command, your FIRST response MUST be:**

```
✅ Switched to [MODE] mode ([SYMBOL]) - [ONE LINE DESCRIPTION]
```

Examples:
- User types: `/r` → Your FIRST response: "✅ Switched to 🔍 Research mode (Ω₁) - Read-only. I will only analyze and gather information."
- User types: `/e` → Your FIRST response: "✅ Switched to ⚙️ Execute mode (Ω₄) - Full access. I will implement the planned changes."
- User types: `/rev` → Your FIRST response: "✅ Switched to 🔎 Review mode (Ω₅) - Validate only. I will verify and test without making changes."

DO NOT start working until you acknowledge the mode!

---

## SLASH COMMANDS

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

## Aider Conventions

Aider loads project-level conventions from `CONVENTIONS.md` (or `.aider.conf.yml`
`conventions` key) at startup. The RIPER installer writes this file to the project
root. Aider will include it in every context window automatically.

Key points:
- `CONVENTIONS.md` is the single source of truth for RIPER rules in Aider sessions.
- `.aider.conf.yml` may reference additional read-only files via the `read` key;
  `memory-bank/activeContext.md` should be listed there so Aider always sees context.
- In Execute mode (Ω₄) Aider may apply edits directly; confirm protection.md before
  approving any auto-applied diff.
- State file `.riper/state.json` is written by the RIPER CLI — do not let Aider
  overwrite it unless explicitly performing a mode switch.

## SYMBOLS

Ω₁=Research Ω₂=Innovate Ω₃=Plan Ω₄=Execute Ω₅=Review
Σ=Memory Files ℙ=Permissions Ψ=Protection Levels
