# Riperflow

Universal RIPER framework for AI coding tools - Works across Cursor, Claude Code, OpenCode and more.

## Overview

Riperflow brings the RIPER (Research, Innovate, Plan, Execute, Review) development methodology to every major AI coding tool. It creates a unified system that works across:

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
npx riperflow init

# Non-interactive (CI, Docker, scripted demos):
npx riperflow init -y
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
npx riperflow init
npx riperflow mode research
npx riperflow sync                  # Regenerate per-tool rule files
npx riperflow dashboard
npx riperflow dashboard web --detach  # Background, then 'dashboard stop'
npx riperflow update                # Check npm registry for newer version
```

### Setup AI Tools
```bash
npx riperflow setup --tools cursor,claude-code,opencode,kilocode
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
npx riperflow mcp add github
npx riperflow mcp add websearch
npx riperflow mcp generate
```

### Dashboard
```bash
# TUI Dashboard
npx riperflow dashboard

# Web Dashboard
npx riperflow dashboard web --detach
```

### Analytics
```bash
riperflow analytics                 # Summary (default 'stats')
riperflow analytics stats           # JSONL-backed aggregates
riperflow analytics weekly          # SQLite-backed weekly summary
riperflow analytics export --format json --output events.json
riperflow analytics export --format csv  # CSV to stdout
riperflow analytics migrate         # Rebuild SQLite index from JSONL
```

### BMAD Commands
```bash
# Roles
riperflow role list
riperflow role set architect

# Quality Gates
riperflow gate list
riperflow gate advance
riperflow gate approve design

# PRD
riperflow prd create "Feature Name"
riperflow prd list
riperflow prd approve <id>

# Code Protection
riperflow protect set src/auth locked
riperflow protect check src/auth
```

## Token Optimization

Riperflow uses a hybrid symbolic notation system:
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
│             Riperflow CLI               │
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
