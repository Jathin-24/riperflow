# Getting Started with Riperflow

## Quick Start

### 1. Initialize Your Project

```bash
cd your-project
npx riperflow init
```

This creates:
- `.riper/` - Configuration and state
- `memory-bank/` - 6 memory files

### 2. Setup AI Tools

```bash
# Select which tools to configure
npx riperflow setup --tools cursor,claude-code,opencode,kilocode
```

### Tool Rule Locations

Each AI tool stores rules in a specific directory:

| Tool | Rules Directory | Example File |
|------|-----------------|--------------|
| Claude Code | (project root) + `.claude/rules/` | `CLAUDE.md` |
| Cursor | `.cursor/rules/` | `riper.mdc` |
| OpenCode | (project root) | `AGENTS.md` |
| KiloCode | `.kilocode/rules/` | `riper.md` |
| VS Code | `.vscode/` | - |

> **Note:** KiloCode uses `.kilocode/rules/` directory (not `.kilocode/agents/)
> **Note:** OpenCode automatically creates `opencode.json` to configure rule loading
> **Note:** Claude Code creates `CLAUDE.md` in project root (highest priority)

### 3. Use Modes (Two Ways)

#### Option A: Inside AI Chat (No need to leave!)

When you're in Claude Code, Cursor, OpenCode, or KiloCode, just type:

```
/r         → Research mode (read only)
/i         → Innovate mode (suggest ideas)
/p         → Plan mode (create specs)
/e         → Execute mode (full access)
/rev       → Review mode (validate only)
```

The AI will automatically:
- Acknowledge the mode switch
- Follow mode permissions
- Read your current task from activeContext.md

#### Option B: From Terminal

```bash
npx riperflow mode research
npx riperflow mode execute
# etc.
```

## Daily Workflow

### Starting Your Day

**Inside AI Chat:**
Just tell the AI what you want to do - it already knows the mode from the rules!

**Or check mode manually:**
```bash
npx riperflow mode
```

**Open dashboard:**
```bash
npx riperflow dashboard
```

### Working in Modes

Each mode has specific permissions:

| Mode | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| Research | ✓ | ✗ | ✗ | ✗ |
| Innovate | ✓ | ~ | ✗ | ✗ |
| Plan | ✓ | ✓ | ~ | ✗ |
| Execute | ✓ | ✓ | ✓ | ~ |
| Review | ✓ | ✗ | ✗ | ✗ |

### Memory Bank

Always keep these files updated:
- `projectbrief.md` - What we're building
- `systemPatterns.md` - How it's structured
- `techContext.md` - Tech stack details
- `activeContext.md` - Current focus
- `progress.md` - What's done
- `protection.md` - Protected files

## Enterprise Workflow (BMAD)

### Roles

Assign roles to team members:
```bash
npx riperflow role set architect
```

### Quality Gates

Progress through gates:
```bash
npx riperflow gate advance
npx riperflow gate approve design
```

### PRD Management

Create requirements documents:
```bash
npx riperflow prd create "User Authentication"
npx riperflow prd approve user-authentication
```

## MCP Integration

### Adding MCP Services

```bash
# Add GitHub MCP
npx riperflow mcp add github

# Add Web Search MCP
npx riperflow mcp add websearch

# Generate config files for all tools
npx riperflow mcp generate
```

### Environment Variables

Set required credentials:
```bash
# GitHub
export GITHUB_TOKEN=your-token

# Brave Search
export BRAVE_API_KEY=your-key
```

## Dashboard

### TUI Dashboard

```bash
npx riperflow dashboard
```

Shows:
- Current mode/phase
- Session stats
- Memory bank status
- Mode distribution

### Web Dashboard

```bash
# Start in background
npx riperflow dashboard web --detach

# Or interactive
npx riperflow dashboard web
```

Features:
- Real-time updates
- Mode visualization
- Analytics charts
- Memory file browser

## Tips

### Mode Switching
- Always switch to appropriate mode before working
- Research before making changes
- Plan before executing
- Review after executing

### Memory Management
- Update activeContext.md frequently
- Log completed tasks in progress.md
- Check protection.md before modifying

### Token Efficiency
- Use symbolic notation (Ω₁, Σ₁, etc.)
- Keep memory files concise
- Use tiered context loading

## Troubleshooting

### Reset Project
```bash
rm -rf .riper memory-bank
npx riperflow init
```

### Check Status
```bash
npx riperflow status
npx riperflow analytics
```

### View Logs
```bash
cat .riper/analytics.jsonl
```
