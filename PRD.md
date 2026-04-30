# RIPER-for-All - Product Requirements Document (PRD)

**Version:** 1.0  
**Status:** Draft  
**Date:** March 2026

---

## 1. Executive Summary

**RIPER-for-All** is a universal CLI framework that brings the RIPER (Research, Innovate, Plan, Execute, Review) development methodology to every major AI coding tool. Built on the foundation of CursorRIPER and RIPER.sigma, this project creates a unified system that works across Cursor IDE, Claude Code, OpenCode, and more—eliminating the need to configure separate rules for each tool.

The framework addresses critical gaps in AI-assisted development:
- **Context Preservation**: Persistent memory across sessions and tools
- **Token Efficiency**: ~1,500 tokens vs ~15,000 (95% reduction)
- **Universal Compatibility**: One setup works across all major AI coding tools
- **Enterprise Readiness**: BMAD methodology for teams

---

## 2. Problem Statement

### 2.1 The Current Landscape

AI coding assistants have exploded in popularity, but each tool has its own rule system:

| Tool | Rule Format | Location |
|------|-------------|----------|
| Cursor | `.mdc` | `.cursor/rules/` |
| Claude Code | `.md` | (project root) `CLAUDE.md` + `.claude/rules/` |
| OpenCode | `.md` | (project root) `AGENTS.md` + `opencode.json` |
| VS Code | `.md` | `.vscode/` |

This fragmentation creates three major problems:

### 2.2 Core Problems

**Problem 1: Context Loss Between Sessions**
- AI forgets project context between sessions
- Developers repeat project explanations daily
- Wasted time on context reset

**Problem 2: Multi-Tool Inefficiency**
- Setting up RIPER for Cursor doesn't work in Claude Code
- Maintaining separate configurations for each tool is error-prone
- No synchronization between tools

**Problem 3: Token Waste**
- Original RIPER uses ~15,000 tokens
- Many AI tools have strict token limits
- Verbose rules consume budget for actual code

---

## 3. Goals & Objectives

### 3.1 Primary Goals

| Goal | Metric | Target |
|------|--------|--------|
| **Universal Compatibility** | Number of supported tools | 3 tools (v1), 10 tools (v2) |
| **Token Efficiency** | Token usage | <2,000 tokens |
| **Persistent Context** | Memory retention | Across sessions & tools |
| **Developer Experience** | Setup time | <5 minutes |
| **Enterprise Readiness** | BMAD features | Full implementation |

### 3.2 Secondary Goals

- Open source adoption
- Community contributions
- Plugin ecosystem
- Cross-platform support

---

## 4. Target Users

### 4.1 Primary Users

| User Type | Use Case | Pain Points |
|-----------|----------|-------------|
| **Solo Developers** | Personal projects | Context loss, token limits |
| **AI Power Users** | Multi-tool workflows | Setup time, sync issues |
| **Development Teams** | Enterprise projects | No enterprise features |

### 4.2 User Personas

**Persona 1: The Solo Developer**
- Uses Cursor + Claude Code daily
- Works on side projects
- Wants persistent context
- Doesn't want token waste

**Persona 2: The AI Power User**
- Uses 3+ AI coding tools
- Switches between tools frequently
- Needs cross-tool sync
- Values efficiency

**Persona 3: Enterprise Teams**
- 5+ developers
- Needs role-based workflows
- Requires compliance tracking
- Wants quality gates

---

## 5. Scope

### 5.1 MVP Scope (v1.0)

**In Scope:**
- 3 Primary Adapters (Cursor, Claude Code, OpenCode)
- 5 RIPER Modes
- 6 Memory Bank Files
- TUI + Web Dashboard
- JSONL Analytics
- MCP Integration (GitHub, Web Search, Browser, Docker)
- Dry-run functionality
- Safe file merging

**Out of Scope:**
- Additional adapters (VS Code, Roo, Aider, Windsurf, Cline)
- Standalone binaries
- SQLite analytics
- Cloud sync

### 5.2 Future Scope (v1.1+)

- Extended tool adapters
- Standalone binary packaging
- SQLite analytics
- Cloud backup
- Team collaboration

---

## 6. Key Features

### 6.1 Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **RIPER Modes** | 5-mode workflow (Research, Innovate, Plan, Execute, Review) | P0 |
| **Mode Commands** | `/r`, `/i`, `/p`, `/e`, `/rev` | P0 |
| **Memory Bank** | 6 markdown files for persistent context | P0 |
| **Tool Adapters** | Convert rules to tool-specific formats | P0 |
| **Cross-Tool Sync** | Keep memory synchronized across tools | P0 |
| **Token Optimization** | Hybrid symbolic + plain text (~1.5K tokens) | P0 |

### 6.2 BMAD Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Role System** | PO, Architect, Dev, QA, DevOps | P1 |
| **PRD Management** | Requirements document workflow | P1 |
| **Quality Gates** | Sequential approvals | P1 |
| **Code Protection** | 6 protection levels | P1 |
| **Permission Matrix** | CRUD per mode | P1 |

### 6.3 Dashboard Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **TUI Dashboard** | Terminal-based stats | P0 |
| **Web Dashboard** | Full browser interface | P0 |
| **Real-time Sync** | Chokidar file watcher | P1 |
| **Analytics** | JSONL-based tracking | P1 |

### 6.4 Safety Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Dry-run Mode** | Preview before applying | P0 |
| **Safe File Merge** | Preserve user content | P0 |
| **Backup Before Write** | Auto-backup | P0 |
| **File Locking** | Prevent race conditions | P1 |

---

## 7. User Experience

### 7.1 Installation

```bash
# Quick install
npx riper-for-all init

# Or with specific tools
npx riper-for-all setup --tools cursor,claude,opencode
```

### 7.2 Daily Workflow

```bash
# Switch modes
npx riper-for-all mode research    # or /research
npx riper-for-all mode plan        # or /plan
npx riper-for-all mode execute     # or /execute

# View dashboard
npx riper-for-all dashboard        # TUI
npx riper-for-all dashboard web    # Web
```

### 7.3 Safe Operations

```bash
# Preview changes without applying
npx riper-for-all sync --dry-run

# Force mode (CI/CD)
npx riper-for-all setup --force
```

---

## 8. Technical Specification

### 8.1 Technology Stack

| Component | Technology | Version |
|-----------|------------|---------|
| Runtime | Node.js | LTS 24+ |
| Language | TypeScript | 5.x |
| Package Manager | npm | 11.x |
| CLI | Commander.js | Latest |
| TUI | Ink / Blessed | Latest |
| Web | Express + React | Latest |
| File Watcher | Chokidar | Latest |
| File Locking | proper-lockfile | Latest |
| Analytics | JSONL | - |

### 8.2 Project Structure

```
riper-for-all/
├── cli/                    # Main CLI
│   ├── src/
│   │   ├── commands/       # CLI commands
│   │   ├── core/           # Universal core
│   │   ├── adapters/       # Tool adapters
│   │   ├── memory/         # Memory management
│   │   ├── mcp/           # MCP integration
│   │   ├── analytics/      # Telemetry
│   │   └── dashboard/     # Dashboard
│   └── templates/          # Universal templates
├── dashboard/              # Web dashboard
├── docs/                  # Documentation
└── package.json
```

### 8.3 Data Storage

| Data | Location | Format |
|------|----------|--------|
| Config | `.riper/config.json` | JSON |
| State | `.riper/state.json` | JSON |
| Memory | `memory-bank/*.md` | Markdown |
| Analytics | `.riper/metrics.jsonl` | JSONL |
| Backups | `.riper/backups/` | - |

---

## 9. Implementation Plan

### Phase 1: Core Foundation (Week 1)

| Task | Deliverable |
|------|-------------|
| CLI structure | Working `npx riper-for-all init` |
| Core engine | Mode parsing, permission enforcement |
| Memory management | CRUD for memory bank files |
| Tool detection | Auto-detect installed tools |

### Phase 2: Adapter System (Week 2)

| Task | Deliverable |
|------|-------------|
| Cursor adapter | .mdc rules |
| Claude Code adapter | .md rules |
| OpenCode adapter | .md agents |
| MCP setup | GitHub, Web Search, Browser, Docker |
| Dry-run | `--dry-run` flag |

### Phase 3: Dashboard & Analytics (Week 3)

| Task | Deliverable |
|------|-------------|
| TUI dashboard | Terminal stats |
| Web dashboard | Browser interface |
| File watcher | Chokidar integration |
| Analytics | JSONL tracking |

### Phase 4: BMAD & Enterprise (Week 4)

| Task | Deliverable |
|------|-------------|
| Role system | 5 roles |
| PRD workflow | Requirements management |
| Quality gates | Sequential approvals |
| Code protection | 6 levels |

### Phase 5: Polish & Release (Week 5)

| Task | Deliverable |
|------|-------------|
| Testing | Full test suite |
| Documentation | Complete docs |
| Release | NPM package |

---

## 10. Success Metrics

### 10.1 Technical Metrics

| Metric | Target |
|--------|--------|
| Token usage | <2,000 tokens |
| Setup time | <5 minutes |
| Mode switch latency | <100ms |
| Dashboard load time | <2 seconds |

### 10.2 Adoption Metrics

| Metric | Target (6 months) |
|--------|-------------------|
| GitHub Stars | 500+ |
| NPM Downloads | 10,000+ |
| Contributors | 20+ |
| Community Issues | <50 open |

### 10.3 User Satisfaction

| Metric | Target |
|--------|--------|
| Setup success rate | >95% |
| Feature adoption | >70% use modes |
| Dashboard usage | >50% use dashboard |
| Bug report rate | <5% of users |

---

## 11. Risks & Mitigation

### 11.1 Technical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Tool config changes** | Adapters break | Hot-patch system, version detection |
| **Memory file growth** | Token overflow | Tiered loading, truncation rules |
| **Concurrent access** | Data corruption | File locking, backups |
| **LLM symbol comprehension** | Rules ignored | Hybrid mode, testing |

### 11.2 Operational Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Complex Phase 2** | Delays | Scope to 3 adapters |
| **Privacy concerns** | User drop-off | JSONL opt-in, anonymous |
| **Maintenance burden** | Burnout | Community contributions |

---

## 12. Competition & Differentiation

### 12.1 Alternatives

| Tool | What They Do | Our Differentiation |
|------|--------------|---------------------|
| CursorRIPER | RIPER for Cursor only | Universal across tools |
| Roo Code | AI workflow modes | Token efficiency, BMAD |
| Aider | Git-integrated AI | Visual dashboard, memory |
| Claude Code | Base CLI | Structured methodology |

### 12.2 Competitive Advantages

1. **Universal**: Works across all major AI coding tools
2. **Efficient**: <2K tokens vs 15K original
3. **Complete**: Memory + Dashboard + Analytics + BMAD
4. **Safe**: Dry-run, file locking, backups
5. **Open Source**: Community-driven

---

## 13. Open Source Strategy

### 13.1 License

MIT License for maximum adoption

### 13.2 Community Model

- **GitHub Discussions**: Q&A, feature requests
- **Issues**: Bug reports, contributions
- **Discord**: Real-time community
- **Contributing**: Clear contribution guide

### 13.3 Revenue (Future)

- Free for individual use
- Paid tier for enterprise (BMAD teams, cloud sync)
- Sponsorships

---

## 14. Approval

| Role | Name | Date |
|------|------|------|
| Product Owner | | |
| Technical Lead | | |
| Stakeholder | | |

---

**Document Version:** 1.0  
**Last Updated:** March 2026  
**Status:** Ready for Implementation
