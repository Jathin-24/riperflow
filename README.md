# RIPER-for-All

Universal RIPER framework for AI coding tools - Works across Cursor, Claude Code, OpenCode and more.

## Overview

RIPER-for-All brings the RIPER (Research, Innovate, Plan, Execute, Review) development methodology to every major AI coding tool. It creates a unified system that works across:

- Cursor IDE
- Claude Code
- OpenCode
- KiloCode
- VS Code
- Roo Code
- Aider
- Windsurf
- Cline
- Codex CLI

## Features

### Core RIPER Modes
- 🔍 **Research** (Ω₁) - Gather information and document findings
- 💡 **Innovate** (Ω₂) - Explore options and suggest ideas
- 📝 **Plan** (Ω₃) - Create specifications and sequence steps
- ⚙️ **Execute** (Ω₄) - Implement code according to plan
- 🔎 **Review** (Ω₅) - Validate output against requirements

### Memory Bank
- `projectbrief.md` - Requirements and scope
- `systemPatterns.md` - Architecture and components
- `techContext.md` - Tech stack information
- `activeContext.md` - Current focus and changes
- `progress.md` - Milestones and tracking
- `protection.md` - Code protection registry

### BMAD Enterprise Features
- **Role System** - PO, Architect, Developer, QA, DevOps
- **Quality Gates** - Design → Development → Testing → Review → Deploy
- **PRD Management** - Product Requirements Documents
- **Code Protection** - 6 levels from Open to Frozen

### Dashboard
- **TUI Dashboard** - Terminal-based stats
- **Web Dashboard** - Browser interface with real-time updates via WebSocket;
  bound to `127.0.0.1` only and protected by a per-project bearer token
  (`.riper/dashboard.token`, mode 0600)

### Advanced Analytics
- **SQLite Database** - High-performance analytics storage with JSONL fallback
- **Event Tracking** - Session management, mode history, command tracking
- **Weekly Reports** - Activity summaries and violation tracking

### Performance Features
- **File Locking** - Concurrent modification prevention with proper-lockfile across every persistent write path
- **Memory Truncation** - Bank files auto-archived when they exceed their declared maxSize during sync
- **Analytics Snapshot Cache** - Single read serves stats / mode history / command usage aggregations

### MCP Integration
- GitHub
- Web Search (Brave)
- Browser (Playwright)
- Docker

## Installation

```bash
# Interactive (prompts you to pick tools):
npx riper-for-all init

# Non-interactive (CI, Docker, scripted demos):
npx riper-for-all init -y
```

`init` defaults to enabling Cursor, Claude Code, and OpenCode. Add more
later with `setup --tools cline,codex,...` (full list below).

## Usage

**You can use RIPER in two ways:**

### 1. Inside AI Chat (Recommended)

When you're inside Claude Code, Cursor, OpenCode, or KiloCode, just use slash commands:

```
/r         → Switch to Research mode
/i         → Switch to Innovate mode  
/p         → Switch to Plan mode
/e         → Switch to Execute mode
/rev       → Switch to Review mode
```

The AI will automatically:
- Acknowledge the mode switch
- Follow mode permissions (read-only in Research, full access in Execute, etc.)
- Read your current task from `memory-bank/activeContext.md`
- Check `memory-bank/protection.md` before modifying files

### 2. From Terminal

```bash
# CLI commands
npx riper-for-all init
npx riper-for-all mode research
npx riper-for-all sync                  # Regenerate per-tool rule files
npx riper-for-all dashboard
npx riper-for-all dashboard web --detach  # Background, then 'dashboard stop'
npx riper-for-all update                # Check npm registry for newer version
```

### Setup AI Tools
```bash
npx riper-for-all setup --tools cursor,claude-code,opencode,kilocode
```

### Tool Rule Directories

| Tool | Rules Directory |
|------|----------------|
| Claude Code | (project root) `CLAUDE.md` + `.claude/rules/` |
| Cursor | `.cursor/rules/` |
| OpenCode | `.opencode/AGENTS.md` + `.opencode/opencode.json` |
| KiloCode | `.kilocode/rules/` |
| VS Code | `.vscode/.riper.md` |
| Roo Code | `.roo/rules/` |
| Aider | (project root) `CONVENTIONS.md` + `.aider.conf.yml` + `.aider/` |
| Windsurf | `.windsurf/` (rules + `cascade.md`) |
| Cline | `.cline/instructions/` + `global_instructions.json` + `settings.json` |
| Codex CLI | (project root) `AGENT.md` + `.codex/` |

### MCP Services
```bash
npx riper-for-all mcp add github
npx riper-for-all mcp add websearch
npx riper-for-all mcp generate
```

### Dashboard
```bash
# TUI Dashboard
npx riper-for-all dashboard

# Web Dashboard
npx riper-for-all dashboard web --detach
```

### Analytics
```bash
riper-for-all analytics                 # Summary (default 'stats')
riper-for-all analytics stats           # JSONL-backed aggregates
riper-for-all analytics weekly          # SQLite-backed weekly summary
riper-for-all analytics export --format json --output events.json
riper-for-all analytics export --format csv  # CSV to stdout
riper-for-all analytics migrate         # Rebuild SQLite index from JSONL
```

### BMAD Commands
```bash
# Roles
riper-for-all role list
riper-for-all role set architect

# Quality Gates
riper-for-all gate list
riper-for-all gate advance
riper-for-all gate approve design

# PRD
riper-for-all prd create "Feature Name"
riper-for-all prd list
riper-for-all prd approve <id>

# Code Protection
riper-for-all protect set src/auth locked
riper-for-all protect check src/auth
```

## Token Optimization

RIPER-for-All uses a hybrid symbolic notation system:
- **Modes**: Ω₁-Ω₅ (Greek omega)
- **Phases**: Π₁-Π₄ (Greek pi)
- **Memory**: Σ₁-Σ₆ (Greek sigma)
- **Protection**: Ψ₁-Ψ₆ (Greek psi)

The complete RIPER spec rendered for each tool is **≈1.3k–1.7k tokens**
(measured across all 10 adapters). The symbolic encoding is what makes that
fit; an equivalent prose ruleset typically runs an order of magnitude larger.

## Architecture

```
┌─────────────────────────────────────────┐
│         RIPER-for-All CLI               │
└──────────────────┬──────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    ▼              ▼              ▼
┌────────┐   ┌─────────┐   ┌──────────┐
│ Core   │   │ Adapters│   │ Memory   │
│ Modes  │   │ Cursor  │   │ Manager  │
│ BMAD   │   │ Claude  │   │ Sync     │
│ Protect│   │ OpenCode│   │ Backup   │
└────────┘   └─────────┘   └──────────┘
```

## Documentation

- [Architecture](architecture.md)
- [PRD](PRD.md)

## License

MIT
