# Riperflow - Comprehensive Architecture Document

**Version:** 1.0.0  
**Status:** Draft  
**Last Updated:** March 2026

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Goals & Objectives](#goals--objectives)
4. [Architecture Overview](#architecture-overview)
5. [Technology Stack](#technology-stack)
6. [Directory Structure](#directory-structure)
7. [Core Components](#core-components)
8. [Features](#features)
9. [Supported Tools](#supported-tools)
10. [CLI Commands](#cli-commands)
11. [Dashboard](#dashboard)
12. [MCP Integrations](#mcp-integrations)
13. [Token Optimization](#token-optimization)
14. [Data Flow](#data-flow)
15. [State Management](#state-management)
16. [Configuration](#configuration)
17. [Implementation Phases](#implementation-phases)
18. [Future Considerations](#future-considerations)
19. [Risk Mitigation](#risk-mitigation)

---

## 1. Executive Summary

**Riperflow** is a universal framework that brings the RIPER (Research, Innovate, Plan, Execute, Review) methodology to every major AI coding tool. Built on the foundation of CursorRIPER and RIPER.sigma, this project creates a unified system that works across Cursor IDE, Claude Code, OpenCode, KiloCode, VS Code, and more.

The framework provides:
- **Universal compatibility** across all major AI coding tools
- **Token-efficient** symbolic notation (inspired by RIPER.sigma)
- **Persistent memory** that works across sessions and tools
- **Enterprise-grade** features including BMAD methodology
- **Visual dashboard** for workflow tracking and analytics

---

## 2. Project Overview

### 2.1 What is Riperflow?

Riperflow is a CLI tool that installs and manages the RIPER development methodology across multiple AI coding environments. It serves as a universal adapter that translates the same core rules and workflows into each tool's specific format.

### 2.2 Why Riperflow?

Current AI coding tools each have their own rule system:
- Cursor uses `.mdc` files in `.cursor/rules/`
- Claude Code uses `CLAUDE.md` in project root + `.claude/rules/`
- OpenCode uses `AGENTS.md` in project root + `opencode.json` config

Riperflow creates a **universal layer** that:
1. Provides a single source of truth for your development workflow
2. Automatically adapts to whatever tool you're using
3. Syncs memory and state across all tools
4. Reduces token usage through symbolic notation

### 2.3 Core Philosophy

- **Tool-Agnostic Core**: The workflow and rules are universal
- **Tool-Specific Adapters**: Each tool receives rules in its native format
- **Unified Memory**: One memory bank that all tools share
- **Token Efficiency**: Symbolic notation for minimal token usage

---

## 3. Goals & Objectives

### 3.1 Primary Goals

1. **Universal Compatibility**: Support all major AI coding tools with minimal setup
2. **Token Efficiency**: Achieve <2K tokens for full framework (vs ~15K original)
3. **Persistent Context**: Maintain workflow state across sessions and tools
4. **Enterprise Readiness**: Include BMAD features for teams
5. **Developer Experience**: Simple CLI and visual dashboard

### 3.2 Secondary Goals

1. **Extensibility**: Plugin system for community contributions
2. **Analytics**: Track workflow effectiveness
3. **Migration**: Import existing RIPER setups
4. **Backup/Restore**: Prevent data loss

---

## 4. Architecture Overview

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           Riperflow CLI                              │
│                    (Universal Development Framework)                     │
└─────────────────────────────────────────────────────────────────────────┘
                                      │
      ┌───────────────────────────────┼───────────────────────────────┐
      │                               │                               │
      ▼                               ▼                               ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   Universal     │       │    Tool         │       │   Memory        │
│   Core          │       │    Adapters     │       │   Manager       │
│                 │       │                 │       │                 │
│ • Mode Defs     │◄─────►│ • Cursor        │◄─────►│ • Sync          │
│ • Workflow      │       │ • Claude Code   │       │ • Migrate       │
│ • BMAD          │       │ • OpenCode      │       │ • Backup        │
│ • Symbols       │       │ • KiloCode      │       │ • Restore       │
│                 │       │ • VS Code       │       │ • Analytics     │
└─────────────────┘       │ • Roo Code      │       └─────────────────┘
                          │ • Aider         │
                          │ • Windsurf      │
                          └─────────────────┘
                                      │
      ┌───────────────────────────────┼───────────────────────────────┐
      │                               │                               │
      ▼                               ▼                               ▼
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  .cursor/       │       │  .claude/       │       │  .opencode/     │
│  rules/         │       │  rules/         │       │  agents/        │
│  memory-bank/   │       │  memory-bank/   │       │  memory-bank/   │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

### 4.2 Component Interactions

```
User Command (e.g., /research)
           │
           ▼
┌─────────────────────────────┐
│     CLI Command Handler     │
└─────────────┬───────────────┘
              │
              ▼
┌─────────────────────────────┐
│    Universal Core Engine    │
│  • Parse command            │
│  • Load mode definitions    │
│  • Check permissions        │
└─────────────┬───────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
┌────────────┐   ┌────────────┐
│  Tool      │   │  Memory    │
│  Adapter   │   │  Manager   │
│            │   │            │
│ - Detect   │   │ - Load     │
│ - Convert  │   │ - Update   │
│ - Inject   │   │ - Sync     │
└────────────┘   └────────────┘
```

---

## 5. Technology Stack

### 5.1 Core Technologies

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | LTS (24+) |
| **Language** | TypeScript | 5.x |
| **Package Manager** | npm | 11.x |
| **Distribution** | npx | Via npm |

### 5.2 Key Libraries

| Purpose | Library | Purpose |
|---------|---------|---------|
| **CLI** | Commander.js | CLI argument parsing |
| **CLI** | Chalk | Terminal styling |
| **TUI Dashboard** | Ink | React-based CLI UI |
| **TUI Dashboard** | Blessed | Terminal UI components |
| **Web Dashboard** | Express | Local web server |
| **Web Dashboard** | React | Frontend UI |
| **Web Dashboard** | Vite | Frontend build |
| **State** | better-sqlite3 | SQLite for analytics |
| **Config** | conf | JSON config management |
| **MCP** | @modelcontextprotocol/sdk | MCP client |
| **Telemetry** | Analytics | Usage tracking |
| **Logging** | Pino | Structured logging |

---

## 6. Directory Structure

```
riperflow/
├── cli/                           # Main CLI application
│   ├── src/
│   │   ├── index.ts              # Entry point
│   │   ├── commands/             # CLI commands
│   │   │   ├── init.ts          # Initialize project
│   │   │   ├── setup.ts         # Setup specific tools
│   │   │   ├── mode.ts          # Mode switching
│   │   │   ├── sync.ts          # Memory sync
│   │   │   ├── backup.ts        # Backup memory
│   │   │   ├── restore.ts       # Restore memory
│   │   │   ├── mcp.ts           # MCP management
│   │   │   ├── status.ts        # Show status
│   │   │   ├── dashboard.ts     # Dashboard control
│   │   │   └── update.ts        # Update framework
│   │   ├── core/                 # Universal core
│   │   │   ├── engine.ts         # Core processing
│   │   │   ├── modes.ts          # Mode definitions
│   │   │   ├── workflow.ts       # Workflow logic
│   │   │   ├── symbols.ts        # Symbol system
│   │   │   ├── hybrid-symbols.ts # Hybrid symbol engine
│   │   │   ├── permissions.ts    # Permission matrix
│   │   │   └── bmad/             # BMAD system
│   │   │       ├── roles.ts
│   │   │       ├── prd.ts
│   │   │       ├── gates.ts
│   │   │       └── enterprise.ts
│   │   ├── adapters/             # Tool adapters
│   │   │   ├── base.ts           # Base adapter
│   │   │   ├── cursor.ts         # Cursor adapter
│   │   │   ├── claude-code.ts   # Claude Code adapter
│   │   │   ├── opencode.ts      # OpenCode adapter
│   │   │   ├── kilocode.ts      # KiloCode adapter
│   │   │   ├── vscode.ts        # VS Code adapter
│   │   │   ├── roo.ts           # Roo Code adapter
│   │   │   ├── aider.ts         # Aider adapter
│   │   │   ├── windsurf.ts      # Windsurf adapter
│   │   │   └── hotpatch.ts      # Adapter hot-patcher
│   │   ├── memory/               # Memory management
│   │   │   ├── manager.ts       # Memory operations
│   │   │   ├── sync.ts          # Cross-tool sync
│   │   │   ├── migrate.ts       # Migration tools
│   │   │   ├── backup.ts        # Backup/restore
│   │   │   ├── loader.ts       # Smart loading
│   │   │   ├── lock.ts         # File locking (concurrency)
│   │   │   └── context.ts      # Token budget management
│   │   ├── mcp/                 # MCP integration
│   │   │   ├── client.ts        # MCP client
│   │   │   ├── servers.ts       # Server configs
│   │   │   ├── manager.ts       # MCP management
│   │   │   └── notifier.ts     # MCP lifecycle notifier
│   │   ├── analytics/            # Telemetry
│   │   │   ├── tracker.ts        # Event tracking
│   │   │   ├── storage.ts       # SQLite storage
│   │   │   └── reporter.ts      # Report generation
│   │   ├── dashboard/           # Dashboard
│   │   │   ├── cli/             # TUI dashboard
│   │   │   │   ├── index.ts
│   │   │   │   ├── components/
│   │   │   │   └── screens/
│   │   │   └── web/             # Web dashboard
│   │   │       ├── server.ts
│   │   │       ├── api/
│   │   │       └── client/
│   │   ├── config/              # Configuration
│   │   │   ├── loader.ts
│   │   │   ├── schema.ts
│   │   │   └── defaults.ts
│   │   └── utils/               # Utilities
│   │       ├── logger.ts
│   │       ├── files.ts
│   │       └── detection.ts
│   │
│   ├── templates/                # Universal templates
│   │   ├── universal/
│   │   │   ├── modes/
│   │   │   │   ├── research.md
│   │   │   │   ├── innovate.md
│   │   │   │   ├── plan.md
│   │   │   │   ├── execute.md
│   │   │   │   └── review.md
│   │   │   ├── memory/
│   │   │   │   ├── projectbrief.md
│   │   │   │   ├── systemPatterns.md
│   │   │   │   ├── techContext.md
│   │   │   │   ├── activeContext.md
│   │   │   │   ├── progress.md
│   │   │   │   └── protection.md
│   │   │   ├── bmad/
│   │   │   │   ├── roles.md
│   │   │   │   ├── prd.md
│   │   │   │   └── gates.md
│   │   │   └── symbols.md
│   │   │
│   │   └── adapters/            # Tool-specific templates
│   │       ├── cursor.mdc
│   │       ├── claude.md
│   │       ├── opencode.md
│   │       ├── kilocode.md
│   │       └── vscode.md
│   │
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── dashboard/                    # Web dashboard (standalone)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── App.tsx
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── docs/                         # Documentation
│   ├── getting-started.md
│   ├── supported-tools.md
│   ├── migration-guide.md
│   ├── symbol-reference.md
│   ├── bmad-guide.md
│   ├── dashboard-guide.md
│   ├── mcp-setup.md
│   └── troubleshooting.md
│
└── README.md
```

---

## 7. Core Components

### 7.1 Universal Core Engine

The core engine processes commands and manages workflow state regardless of which AI tool is being used.

**Responsibilities:**
- Parse and validate commands
- Load and apply mode definitions
- Enforce permission matrix
- Route operations through appropriate adapters

### 7.10 Tool Adapters

Each adapter translates universal rules into tool-specific formats.

**Adapter Interface:**
```typescript
interface ToolAdapter {
  name: string;
  configLocation: string;
  ruleExtension: string;
  
  convertRules(rules: UniversalRules): ToolSpecificRules;
  isAvailable(): Promise<boolean>;
  install(rules: ToolSpecificRules): Promise<void>;
  uninstall(): Promise<void>;
  getMcpConfigPath(): string;
}
```

### 7.11 Adapter Hot-Patcher

Enables updating adapters without core updates.

**Responsibilities:**
- Check for adapter updates
- Apply hot-patches to adapters
- Version compatibility checking
- Community-driven fixes

### 7.3 Memory Manager

Manages the unified memory bank across all tools.

**Responsibilities:**
- Create/read/update memory files
- Sync memory across tool-specific locations
- Migrate from existing RIPER setups
- Backup and restore functionality
- Smart loading (load only what's needed)

### 7.4 Lock Manager (Concurrency Handling)

Handles concurrent file access to prevent race conditions.

**Responsibilities:**
- File locking using `proper-lockfile`
- Detect conflicting access
- Queue write operations
- Backup before modifications
- (Future: Daemon for robust handling)

### 7.5 Context Manager (Token Budget)

Manages token budget and tiered context loading.

**Responsibilities:**
- Monitor memory file sizes
- Enforce truncation rules
- Load tiered context (Tier 1/2/3)
- Prevent token budget overflow

### 7.6 Hybrid Symbol Engine

Ensures symbolic notation is understood by all LLMs.

**Responsibilities:**
- Generate hybrid rules (symbols + inline explanations)
- Test LLM symbol comprehension
- Fallback to plain text if needed
- Per-model configuration

### 7.7 MCP Manager

Handles MCP service integrations.

**Responsibilities:**
- Detect installed MCP servers
- Configure MCP for each tool
- Install/remove MCP servers
- Manage MCP server credentials

### 7.8 MCP Notifier

Manages user communication around MCP lifecycle.

**Responsibilities:**
- Prompt user after MCP config changes
- Detect running IDEs
- Provide restart instructions
- Document MCP requirements

### 7.9 Analytics Engine

Tracks usage and workflow effectiveness.

**Responsibilities:**
- Track mode transitions
- Record command usage
- Measure workflow completion
- Generate insights
- Store in local SQLite database

### 7.6 Dashboard Server

Provides visual interface for the framework.

**TUI Mode (Embedded):**
- Quick stats in terminal
- Mode status
- Progress indicators

**Web Mode (Server):**
- Full analytics dashboard
- Memory visualization
- Workflow history
- Settings management

---

## 8. Features

### 8.1 Core RIPER Features

| Feature | Description |
|---------|-------------|
| **5 Modes** | Research, Innovate, Plan, Execute, Review |
| **Mode Commands** | `/r`, `/i`, `/p`, `/e`, `/rev` (and full names) |
| **Phase Tracking** | UNINITIATED → INITIALIZING → DEVELOPMENT → MAINTENANCE |
| **Memory Bank** | 6 files: projectbrief, systemPatterns, techContext, activeContext, progress, protection |
| **Code Protection** | 6 levels: PROTECTED, GUARDED, INFO, DEBUG, TEST, CRITICAL |
| **Permission Matrix** | CRUD operations per mode |

### 8.2 BMAD Enterprise Features

| Feature | Description |
|---------|-------------|
| **Role System** | Product Owner, Architect, Developer, QA, DevOps |
| **PRD Management** | Product Requirements Document workflow |
| **Quality Gates** | Sequential approval: PRD → Design → Code → QA → Deploy |
| **Enterprise Docs** | Auto-generated documentation |
| **Version Management** | Semantic versioning, changelog |
| **Compliance Tracking** | Audit trails and compliance scores |

### 8.3 Universal Features

| Feature | Description |
|---------|-------------|
| **Tool Auto-Detection** | Automatically detect installed AI tools |
| **Cross-Tool Sync** | Keep memory synchronized across all tools |
| **Migration** | Import from existing RIPER/CursorRIPER setups |
| **Backup/Restore** | Manual and automatic backups |
| **Template System** | Pre-built templates for common project types |
| **Plugin System** | Community extensions |
| **Conflict Resolution** | Handle multiple tool configurations |

### 8.4 Dashboard Features

| Feature | Description |
|---------|-------------|
| **TUI Dashboard** | Terminal-based quick stats |
| **Web Dashboard** | Full-featured browser interface |
| **Mode Visualization** | Current mode and phase |
| **Progress Tracking** | Visual progress indicators |
| **Memory Browser** | View/edit memory files |
| **Analytics** | Usage patterns and insights |
| **Settings** | Configuration management |

### 8.5 Token Optimization

| Feature | Description |
|---------|-------------|
| **Symbolic Notation** | Greek letters and emojis (~800 tokens for core) |
| **Smart Loading** | Load only current mode requirements |
| **Context Optimization** | Minimal context per operation |
| **Total Efficiency** | Target: <2K tokens vs 15K original |

### 8.6 Telemetry Features

| Feature | Description |
|---------|-------------|
| **Mode Usage** | Track which modes are used most |
| **Command Tracking** | Record command frequency |
| **Workflow Completion** | Measure end-to-end workflows |
| **Performance Metrics** | Response times, token usage |
| **Anonymized Reports** | No personal data collected |

---

## 9. Supported Tools

### 9.1 Priority Matrix

| Tool | Rules Format | Config Location | MCP Support | Priority |
|------|-------------|----------------|-------------|----------|
| **Cursor** | .mdc | .cursor/rules/ | Native | P0 |
| **Claude Code** | .md | (project root) CLAUDE.md + .claude/rules/ | Via config | P0 |
| **OpenCode** | .md | (project root) AGENTS.md + opencode.json | Native | P0 |
| **KiloCode** | .md | .kilocode/rules/ | Via config | P0 |
| **VS Code** | .md | .vscode/ or settings | Limited | P1 |
| **Roo Code** | .md | custom modes | Via config | P1 |
| **Aider** | --system-prompt | CLI flag | Limited | P1 |
| **Windsurf** | .md | .windsurf/ | Via config | P2 |
| **Cline** | .md | .cline/ | Via config | P2 |
| **Codex** | .md | .codex/ | Via config | P2 |

### 9.2 Tool Detection

Each tool is detected by:
1. Checking for tool-specific config directories
2. Checking for tool-specific executables in PATH
3. Checking for tool-specific config files

---

## 10. CLI Commands

### 10.1 Core Commands

```bash
# Initialize RIPER in current project
npx riperflow init

# Setup for specific tools
npx riperflow setup --tools cursor,claude,opencode

# Switch mode
npx riperflow mode research     # or: /research
npx riperflow mode innovate     # or: /innovate
npx riperflow mode plan         # or: /plan
npx riperflow mode execute      # or: /execute
npx riperflow mode review       # or: /review

# Check current mode
npx riperflow mode              # shows current mode
```

### 10.2 Memory Commands

```bash
# Sync memory across all tools
npx riperflow sync

# Backup memory
npx riperflow backup

# Restore from backup
npx riperflow restore --backup <name>

# List backups
npx riperflow backup list

# Migrate from existing RIPER
npx riperflow migrate --source <path>
```

### 10.3 MCP Commands

```bash
# Add MCP service
npx riperflow mcp add github
npx riperflow mcp add websearch
npx riperflow mcp add browser
npx riperflow mcp add docker

# List MCP services
npx riperflow mcp list

# Remove MCP service
npx riperflow mcp remove <name>

# Configure MCP
npx riperflow mcp config <name>
```

### 10.4 Dashboard Commands

```bash
# Start TUI dashboard
npx riperflow dashboard

# Start web dashboard (interactive mode)
npx riperflow dashboard web

# Start web dashboard (detached mode)
npx riperflow dashboard web --detach

# Stop detached dashboard
npx riperflow dashboard stop
```

### 10.5 Utility Commands

```bash
# Check status
npx riperflow status

# Update framework
npx riperflow update

# Show analytics
npx riperflow analytics

# Export analytics
npx riperflow analytics export --format json

# Configuration
npx riperflow config set <key> <value>
npx riperflow config get <key>
npx riperflow config reset
```

### 10.6 Dry-Run and Safe File Operations

All file-modifying commands support `--dry-run` to preview changes without applying them:

```bash
# Dry run - shows what would happen
npx riperflow setup --tools cursor --dry-run

# View diff before applying
npx riperflow sync --dry-run

# Force mode - skip prompts (for CI/CD)
npx riperflow setup --tools cursor --force
```

**Safe File Merging Strategy:**

| Scenario | Action |
|----------|--------|
| New file | Create normally |
| Existing RIPER file | Overwrite with warning |
| User's manual file | **Smart merge** - combine sections, preserve custom parts |
| Unknown file | Prompt user before modification |

**User Experience Example:**
```
⚠ This will MODIFY the following files:
   - .cursor/rules/riper.mdc (OVERWRITE)
   - memory-bank/projectbrief.md (CREATE)
   
View diff? [y/N]
```

---

## 11. Dashboard

### 11.1 TUI Dashboard

**Purpose:** Quick stats and status in terminal

**Launch:** `npx riperflow dashboard`

**Features:**
- Current mode and phase
- Recent mode transitions
- Quick progress bar
- Memory file status
- Navigation with arrow keys

### 11.2 Web Dashboard

**Purpose:** Full visualization and management

**Launch:** `npx riperflow dashboard web --detach`

**Features:**
- Mode visualization with workflow diagram
- Memory file editor
- Analytics dashboards
- MCP service management
- Settings configuration
- Workflow history timeline
- Team collaboration (future)

### 11.3 Real-Time File Sync (Chokidar)

The dashboard uses **chokidar** to watch memory files and automatically update when AI tools modify them.

**Implementation:**

```
┌─────────────────────────────────────────────────────────┐
│                  Dashboard Server                        │
│                                                          │
│   ┌────────────────┐      ┌──────────────────┐         │
│   │  Express      │      │  Chokidar        │         │
│   │  Server       │◄─────│  File Watcher    │         │
│   │               │      │                  │         │
│   │  - API       │      │  Watch:          │         │
│   │  - WebSocket │      │  - memory-bank/* │         │
│   │  - UI        │      │  - .riper/state  │         │
│   └────────────────┘      └──────────────────┘         │
│          │                          │                  │
│          │  File Change Event       │                  │
│          ├──────────────────────────┤                  │
│          ▼                          ▼                  │
│   ┌────────────────┐      ┌──────────────────┐       │
│   │  Web UI       │      │  TUI              │       │
│   │  (re-render)  │      │  (update)         │       │
│   └────────────────┘      └──────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

**Watched Files:**
- `memory-bank/*.md` - All memory files
- `.riper/state.json` - Runtime state
- `.riper/config.json` - Configuration

**Why Chokidar?**
- Uses native OS file events (inotify/FSEvents)
- Very lightweight (~300KB)
- Minimal CPU impact
- Instant updates when files change

**Alternative (v1):** If chokidar adds too much complexity, use simple polling (every 5 seconds) instead.

---

## 12. MCP Integrations

### 12.1 Supported MCP Services

| Service | Symbol | Priority | Description |
|---------|--------|----------|-------------|
| **GitHub** | Θ | P0 | Repository, PRs, issues, branches |
| **Web Search** | Λ | P0 | Brave Search API for research |
| **Browser** | Υ | P0 | Puppeteer/Playwright automation |
| **Docker** | Ξ | P0 | Container management |
| **Notion** | - | P1 | Documentation |
| **Slack** | - | P1 | Team notifications |
| **Database** | - | P1 | Database tools |
| **AWS** | - | P2 | Cloud services |
| **GCP** | - | P2 | Cloud services |
| **Azure** | - | P2 | Cloud services |

### 12.2 MCP Configuration

Each tool receives MCP configuration in its native format:

```json
// Cursor (.cursor/mcp.json)
{
  "mcpServers": {
    "github": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-github"] },
    "websearch": { "command": "npx", "args": ["-y", "@modelcontextprotocol/server-brave-search"] }
  }
}
```

---

## 13. Token Optimization

### 13.1 Symbolic Notation System

Inspired by RIPER.sigma, using Greek letters and emojis:

```
Modes (Ω):
  Ω₁ = 🔍R = Research
  Ω₂ = 💡I = Innovate  
  Ω₃ = 📝P = Plan
  Ω₄ = ⚙️E = Execute
  Ω₅ = 🔎RV = Review

Phases (Π):
  Π₁ = 🌱UNINITIATED
  Π₂ = 🚧INITIALIZING
  Π₃ = 🏗️DEVELOPMENT
  Π₄ = 🔧MAINTENANCE

Memory Files (Σ):
  Σ₁ = 📋projectbrief.md
  Σ₂ = 🏛️systemPatterns.md
  Σ₃ = 💻techContext.md
  Σ₄ = 🔮activeContext.md
  Σ₅ = 📊progress.md
  Σ₆ = 🛡️protection.md
```

### 13.2 Smart Context Loading

```
Token Budget Allocation:
┌─────────────────────────────────────────┐
│ Core Rules (symbolic):     ~800 tokens  │
│ Current Mode Rules:        ~300 tokens  │
│ Active Memory Files:      ~400 tokens  │
│ ────────────────────────────────────── │
│ Total:                    ~1,500 tokens │
└─────────────────────────────────────────┘

vs Original RIPER: ~15,000 tokens (95% reduction)
```

### 13.3 Hybrid Symbol Approach

Based on research of RIPER.sigma, this framework uses a **hybrid approach** that combines symbolic notation with inline explanations for maximum compatibility across different LLMs.

#### Key Principles:

1. **Symbol + Plain English Hybrid**: Each mode definition includes both symbolic notation and plain English explanation
   ```markdown
   Ω₁ = 🔍R ⟶ ℙ(Ω₁) ⟶ [MODE: RESEARCH]+findings
   // Mode 1 = Research → Permission check → Plain English explanation
   ```

2. **Reference Map at Top**: All symbols are defined with meanings in the rule file header
   ```markdown
   ℙ = {C: create, R: read, U: update, D: delete}
   ℙ(Ω₁) = {R: ✓, C: ✗, U: ✗, D: ✗} // Research: Read only
   ```

3. **Inline Explanations**: Each symbolic element has a brief inline explanation
   - `⟶` = "triggers" or "leads to"
   - `+𝕋[0:3]` = allowed operations (read, ask, observe, document)
   - `-𝕋[4:15]` = forbidden operations

4. **Emoji Cues**: Visual quick-reference for human and AI parsing
   - 🔍 = Research
   - 💡 = Innovate
   - 📝 = Plan
   - ⚙️ = Execute
   - 🔎 = Review

5. **Testing Protocol**: Phase 1 includes validation tests to verify each LLM understands symbols:
   - Test sigma rules with major LLMs (Claude, GPT, etc.)
   - Fallback to plain text mode if symbols not understood
   - Per-model configuration option

#### Why Hybrid Works:

| Approach | Pros | Cons |
|----------|------|------|
| Symbols Only | Very compact | Some LLMs may not understand |
| Plain Text Only | Universal understanding | Uses more tokens |
| **Hybrid** | Compact + universal | Slightly more tokens (~100) |

**Target**: Hybrid approach achieves ~1,500 tokens while remaining universally understandable.

### 13.4 Tiered Context Loading

To prevent memory file growth from breaking token budgets, implement tiered loading:

| Tier | Content | When Loaded | Tokens |
|------|---------|-------------|--------|
| **Tier 1** | Core symbols + current mode rules | Always | ~500 |
| **Tier 2** | Minimal activeContext | On request | +200 |
| **Tier 3** | Full memory files | Explicit request | +800 |

#### Truncation Rules:

| File | Max Size | Action When Exceeded |
|------|----------|---------------------|
| projectbrief.md | 2KB | Archive old versions |
| systemPatterns.md | 4KB | Summarize older patterns |
| techContext.md | 3KB | Keep latest 5 entries |
| activeContext.md | 2KB | Rolling 10 items |
| progress.md | 3KB | Keep last 20 milestones |
| protection.md | 2KB | Archive resolved |

---

## 14. Data Flow

### 14.1 Initialization Flow

```
npx riperflow init
        │
        ▼
┌───────────────────┐
│  Detect Tools     │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Ask User Config  │
└────────┬──────────┘
         │
    ┌────┴────┐
    ▼         ▼
┌───────┐ ┌───────┐
│ New   │ │Exist │
│Project│ │Project│
└───┬───┘ └───┬───┘
    │         │
    ▼         ▼
┌───────────────┐
│ Create Memory │
│    Bank       │
└───────┬───────┘
        │
        ▼
┌───────────────────┐
│ Install Adapters  │
│   for Each Tool   │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│   Generate CLI    │
│   Aliases/Help    │
└───────────────────┘
```

### 14.2 Mode Switching Flow

```
User types: /research (or npx riperflow mode research)
        │
        ▼
┌───────────────────┐
│  CLI Receives    │
│    Command        │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Universal Core  │
│  Validates Mode  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Check Permissions│
│   (ℙ Matrix)     │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Load Mode Rules  │
│ (symbolic format) │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Update Memory    │
│  (activeContext)  │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Sync Across All  │
│      Tools        │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│  Record Analytics │
│   (mode change)   │
└───────────────────┘
```

---

## 15. State Management

### 15.1 Configuration (JSON)

**Location:** `.riper/config.json` (project) or `~/.config/riperflow/config.json` (global)

```json
{
  "version": "1.0.0",
  "project": {
    "name": "my-project",
    "path": "/path/to/project"
  },
  "tools": {
    "cursor": { "enabled": true, "path": ".cursor" },
    "claudeCode": { "enabled": true, "path": ".claude" },
    "opencode": { "enabled": false, "path": ".opencode" }
  },
  "memory": {
    "location": "memory-bank",
    "format": "markdown"
  },
  "mcp": {
    "enabled": true,
    "servers": ["github", "websearch", "docker", "  "telemetry": {
    "enabled": true,
browser"]
  },
    "anonymous": true
  },
  "dashboard": {
    "port": 3456,
    "detach": false
  },
  "backup": {
    "auto": true,
    "interval": "daily",
    "maxBackups": 10
  }
}
```

### 15.2 Runtime State (JSON)

**Location:** `.riper/state.json`

```json
{
  "currentMode": "execute",
  "currentPhase": "development",
  "lastModeChange": "2026-03-11T10:30:00Z",
  "session": {
    "startTime": "2026-03-11T09:00:00Z",
    "modeHistory": [
      { "mode": "research", "timestamp": "2026-03-11T09:00:00Z" },
      { "mode": "innovate", "timestamp": "2026-03-11T09:15:00Z" },
      { "mode": "plan", "timestamp": "2026-03-11T09:45:00Z" },
      { "mode": "execute", "timestamp": "2026-03-11T10:00:00Z" }
    ]
  }
}
```

### 15.3 Analytics (JSONL)

**Location:** `.riper/metrics.jsonl`

For v1, we use **JSONL** (JSON Lines) instead of SQLite for faster development and simpler implementation.

**Format:**
```json
{"type": "mode_change", "from": "research", "to": "innovate", "timestamp": "2026-03-11T10:30:00Z", "tool": "cursor"}
{"type": "command", "command": "mode research", "duration_ms": 45, "timestamp": "2026-03-11T10:30:00Z"}
{"type": "workflow", "started_at": "2026-03-11T09:00:00Z", "completed_at": "2026-03-11T11:00:00Z", "mode_sequence": "r,i,p,e,rev", "completed": true}
```

**Event Types:**
| Type | Fields |
|------|--------|
| mode_change | from, to, timestamp, tool |
| command | command, duration_ms, timestamp |
| workflow | started_at, completed_at, mode_sequence, completed |
| tokens | session_id, mode, estimated_tokens, timestamp |

**Future Enhancement:** SQLite can be added in Phase 6 for advanced analytics with complex queries.
);
```

---

## 16. Implementation Phases

### Phase 1: Core Foundation (Week 1)

**Goals:**
- [ ] CLI tool basic structure
- [ ] Universal core engine
- [ ] Basic memory management
- [ ] Tool detection

**Deliverables:**
- Working CLI with init command
- Mode switching (/r, /i, /p, /e, /rev)
- Memory bank creation

**Tools:** Cursor, Claude Code, OpenCode

### Phase 2: Adapter System (Week 2)

**Goals:**
- [ ] Core tool adapters implemented
- [ ] Cross-tool sync working
- [ ] MCP integration basics
- [ ] Dry-run functionality

**Deliverables:**
- 3 Primary Adapters:
  - Cursor (.mdc rules) - GUI-based
  - Claude Code (.md rules) - CLI-based
  - OpenCode (.md agents) - Modern CLI
- Memory sync between tools
- GitHub, Web Search, Browser, Docker MCP
- `--dry-run` flag for all destructive commands
- Safe file merging strategy

**Note:** These 3 adapters cover 3 distinct paradigms. Additional adapters (VS Code, Roo Code, Aider, Windsurf, Cline) can be added in Phase 3+.

### Phase 3: Dashboard & Analytics (Week 3)

**Goals:**
- [ ] TUI dashboard
- [ ] Web dashboard with chokidar file watcher
- [ ] Analytics tracking (JSONL)

**Deliverables:**
- Working TUI with stats
- Web dashboard (detached mode)
- Chokidar file watcher for real-time sync
- JSONL-based analytics storage (.riper/metrics.jsonl)

### Phase 4: BMAD & Enterprise (Week 4)

**Goals:**
- [ ] Role system
- [ ] PRD management
- [ ] Quality gates

**Deliverables:**
- Full BMAD implementation
- Enterprise features working

### Phase 5: Polish & Release (Week 5)

**Goals:**
- [ ] Testing
- [ ] Documentation
- [ ] NPM release

**Deliverables:**
- Full test suite
- Complete documentation
- Published npm package

### Phase 6: Extended Adapters & Packaging (Post-v1)

**Goals:**
- [ ] Additional tool adapters (VS Code, Roo Code, Aider, Windsurf, Cline)
- [ ] Standalone binary packaging (no Node.js dependency)
- [ ] SQLite analytics (optional upgrade from JSONL)

**Deliverables:**
- 10 tool adapters supported
- Standalone binaries (Homebrew, curl install)
- Advanced analytics with SQLite

---

## 17. Future Considerations

### 17.1 Planned Features

- **Team Collaboration**: Shared memory across team members
- **Cloud Sync**: Optional cloud backup and sync
- **AI Suggestions**: AI-powered workflow suggestions
- **More MCP Services**: GitLab, Jira, AWS, GCP, Azure
- **Plugin System**: Community-built plugins
- **Theme Support**: Custom dashboard themes

### 17.2 Extensibility Points

- **Custom Modes**: Allow adding custom modes beyond RIPER
- **Custom Adapters**: Plugin system for new tools
- **Custom Memory**: Extend memory bank with custom files
- **Custom Analytics**: Add custom metrics

### 17.3 Research Areas

- **LLM Optimization**: Further token reduction techniques
- **Workflow AI**: AI-assisted planning and execution
- **Cross-Platform**: Mobile companion app
- **Integration**: More IDE integrations

### 17.4 Future Enhancements (Post-v1)

The following are planned for future versions after v1.0:

#### 17.4.1 Lightweight State Daemon

For robust file locking and concurrency handling, a future version may include a lightweight background daemon:

```
┌─────────────────────────────────────────┐
│         Riperflow Daemon           │
│                                         │
│  • File lock management                 │
│  • Real-time sync across tools          │
│  • Event-based updates                  │
│  • Conflict resolution                   │
└─────────────────────────────────────────┘
```

- Runs in background on localhost
- Communicates via REST API
- Handles concurrent file access
- Queues operations to prevent race conditions

#### 17.4.2 Vector Search for Memory

Future enhancement for semantic retrieval from memory:

- Embed memory content as vectors
- Semantic search across memory files
- RAG-style context retrieval
- Relevant context injection based on query

#### 17.4.3 Cloud Sync

Optional cloud backup and sync:

- Encrypted cloud storage
- Cross-device sync
- Team sharing (enterprise)
- Backup versioning

---

## 18. Risk Mitigation

This section addresses key architectural challenges and their mitigation strategies.

### 18.1 Concurrency and File Locking

**Risk:** Race conditions when multiple AI tools access memory files simultaneously (e.g., Cursor open + Claude Code in terminal).

**Impact:** Data corruption, overwritten data, corrupted JSON.

**Mitigation Strategy:**

| Layer | Strategy | Implementation |
|-------|----------|----------------|
| **v1** | File Locking | Use `proper-lockfile` library |
| **v1** | Conflict Detection | Warn user when conflicts detected |
| **v1** | Backup Before Write | Always backup before modifications |
| **Future** | Daemon | Lightweight background process |

**Implementation (v1):**
```typescript
async function safeWrite(file: string, content: string) {
  await lock(file);
  await backup(file);
  await write(file, content);
  await unlock(file);
}
```

### 18.2 Memory File Growth (Token Budget Reality)

**Risk:** Over time, memory files grow and exceed the 2K token budget.

**Impact:** Token overage, slower AI responses, potential context loss.

**Mitigation Strategy:**

| Layer | Strategy |
|-------|----------|
| **v1** | Tiered Context Loading (Section 13.4) |
| **v1** | Truncation Rules per File |
| **v1** | Archive Old Content |
| **Future** | Vector Search |
| **Future** | Auto-Summarization |

**Truncation Rules:**
- projectbrief.md: Archive old versions
- systemPatterns.md: Summarize older patterns
- techContext.md: Keep latest 5 entries
- activeContext.md: Rolling 10 items
- progress.md: Keep last 20 milestones

### 18.3 LLM Symbol Understanding

**Risk:** LLMs may not implicitly understand symbolic notation (Ψ₆ = CRITICAL) without the reference legend.

**Impact:** Rules not followed correctly, code protection failures.

**Mitigation Strategy:**

| Layer | Strategy |
|-------|----------|
| **v1** | Hybrid Mode (Section 13.3) - symbols + inline explanations |
| **v1** | Reference Map at top of rules |
| **v1** | Phase 1 Testing - Validate symbol comprehension |
| **v1** | Fallback - Plain text mode toggle |

**Testing Protocol:**
1. Test with Claude 3.5/4 Sonnet
2. Test with GPT-4/4o
3. Test with other major LLMs
4. If failures > threshold, enable plain text fallback

### 18.4 Tool Configuration Volatility

**Risk:** AI IDEs (Cursor, Windsurf) change config formats without notice (e.g., .mdc handling, @ mentions).

**Impact:** Adapters break, rules not loaded.

**Mitigation Strategy:**

| Layer | Strategy |
|-------|----------|
| **v1** | Decoupled Adapter Updates |
| **v1** | Version Detection per Adapter |
| **v1** | Adapter Health Check |
| **v1** | Community Issue Template |

**Command:**
```bash
# Update adapters without core
npx riperflow update-adapters
```

### 18.5 MCP Lifecycle Management

**Risk:** MCP config changes require IDE restart for activation.

**Impact:** User confusion, MCP not working after config.

**Mitigation Strategy:**

| Layer | Strategy |
|-------|----------|
| **v1** | Clear Prompts After MCP Changes |
| **v1** | Documentation |
| **v1** | Detection of Running IDEs |

**User Experience:**
```
✓ MCP config updated
⚠ Please restart Cursor to apply changes
```

---

## Appendix A: Symbol Reference

| Symbol | Name | Meaning |
|--------|------|---------|
| Ω | Omega | Mode |
| Π | Pi | Phase |
| Σ | Sigma | Memory file |
| ℙ | Script P | Permission |
| Γ | Gamma | Context reference |
| Ψ | Psi | Protection level |
| Θ | Theta | GitHub MCP |
| Λ | Lambda | Web Search MCP |
| Υ | Upsilon | Browser MCP |
| Ξ | Xi | Docker MCP |
| Β | Beta | BMAD Roles |
| Ρ | Rho | PRD System |
| Κ | Kappa | Quality Gates |
| Ε | Epsilon | Enterprise |

---

## Appendix B: Command Reference

| Short | Full | Mode |
|-------|------|------|
| `/r` | `/research` | Research |
| `/i` | `/innovate` | Innovate |
| `/p` | `/plan` | Plan |
| `/e` | `/execute` | Execute |
| `/rev` | `/review` | Review |
| `/s` | `/start` | Initialize project |
| `/mode` | - | Show current mode |

---

## Appendix C: Protection Levels

| Level | Symbol | Description |
|-------|--------|-------------|
| PROTECTED | Ψ₁ | Highest - never modify |
| GUARDED | Ψ₂ | Ask before modifying |
| INFO | Ψ₃ | Context notes |
| DEBUG | Ψ₄ | Debugging code |
| TEST | Ψ₅ | Testing code |
| CRITICAL | Ψ₆ | Business logic |

---

## Appendix D: Permission Matrix

| Mode | Read | Create | Update | Delete |
|------|------|--------|--------|--------|
| Research | ✓ | ✗ | ✗ | ✗ |
| Innovate | ✓ | ~ | ✗ | ✗ |
| Plan | ✓ | ✓ | ~ | ✗ |
| Execute | ✓ | ✓ | ✓ | ~ |
| Review | ✓ | ✗ | ✗ | ✗ |

*Legend: ✓ = Allowed, ✗ = Forbidden, ~ = Limited*

---

**Document Version:** 1.0.0  
**Last Updated:** March 2026  
**Status:** Ready for Implementation
