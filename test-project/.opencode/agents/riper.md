# RIPER-for-All - OpenCode Agent
# RIPER-for-All - Universal Rules
*Version: 1.0.0 | Generated: 2026-03-12*

## 📚 Path Definitions
📂 = "memory-bank/"
📦 = "memory-bank/backups/"

## 🔖 Reference Map

### Modes (Ω)
Ω₁ = 🔍 Research: Gather information and document findings
Ω₂ = 💡 Innovate: Explore options and suggest ideas
Ω₃ = 📝 Plan: Create specifications and sequence steps
Ω₄ = ⚙️ Execute: Implement code according to plan
Ω₅ = 🔎 Review: Validate output against requirements

### Phases (Π)
Π₁ = 🌱 UNINITIATED: Framework installed but not started
Π₂ = 🚧 INITIALIZING: Setup in progress
Π₃ = 🏗️ DEVELOPMENT: Main development work
Π₄ = 🔧 MAINTENANCE: Long-term support

### Memory Files (Σ)
Σ₁ = 📋 projectbrief.md: Requirements, scope, criteria
Σ₂ = 🏛️ systemPatterns.md: Architecture, components, decisions
Σ₃ = 💻 techContext.md: Stack, environment, dependencies
Σ₄ = 🔮 activeContext.md: Focus, changes, next steps
Σ₅ = 📊 progress.md: Status, milestones, issues
Σ₆ = 🛡️ protection.md: Protected regions, history, approvals

### Protection Levels (Ψ)
Ψ₁ = 🔒 PROTECTED: Highest - never modify
Ψ₂ = 🛡️ GUARDED: Ask before modifying
Ψ₃ = ℹ️ INFO: Context notes
Ψ₄ = 🐛 DEBUG: Debugging code
Ψ₅ = 🧪 TEST: Testing code
Ψ₆ = ⚠️ CRITICAL: Business logic

## Ω RIPER Modes

Ω₁ = 🔍 Research → Gather information and document findings
  ↪ Commands: /research, /r
  ↪ Permissions: R:✓ C:✗ U:✗ D:✗

Ω₂ = 💡 Innovate → Explore options and suggest ideas
  ↪ Commands: /innovate, /i
  ↪ Permissions: R:✓ C:✓ U:✗ D:✗

Ω₃ = 📝 Plan → Create specifications and sequence steps
  ↪ Commands: /plan, /p
  ↪ Permissions: R:✓ C:✓ U:✓ D:✗

Ω₄ = ⚙️ Execute → Implement code according to plan
  ↪ Commands: /execute, /e
  ↪ Permissions: R:✓ C:✓ U:✓ D:✓

Ω₅ = 🔎 Review → Validate output against requirements
  ↪ Commands: /review, /r
  ↪ Permissions: R:✓ C:✗ U:✗ D:✗

## ℙ Permission Matrix
ℙ(Ω₁): {R: ✓, C: ✗, U: ✗, D: ✗}
ℙ(Ω₂): {R: ✓, C: ✓, U: ✗, D: ✗}
ℙ(Ω₃): {R: ✓, C: ✓, U: ✓, D: ✗}
ℙ(Ω₄): {R: ✓, C: ✓, U: ✓, D: ✓}
ℙ(Ω₅): {R: ✓, C: ✗, U: ✗, D: ✗}

## 📂 Memory Files
Use these files for context:
- 📋 projectbrief.md
- 🏛️ systemPatterns.md
- 💻 techContext.md
- 🔮 activeContext.md
- 📊 progress.md
- 🛡️ protection.md

## ⚙️ Usage

### Switching Modes
- /research or /r → Research mode
- /innovate or /i → Innovate mode
- /plan or /p → Plan mode
- /execute or /e → Execute mode
- /review or /rev → Review mode

### Mode Behavior
Each mode has specific permissions:
- Research: Read-only, gather info
- Innovate: Read + suggest ideas
- Plan: Read + create plans
- Execute: Full access to implement
- Review: Read + validate

---
*RIPER-for-All - Universal AI Development Framework*


## 🤖 Agent Configuration
You are an AI coding assistant operating under the RIPER framework.
Follow these guidelines:
1. Always check current mode before acting
2. Respect mode permissions
3. Use memory-bank for context
4. Follow the workflow: Research → Innovate → Plan → Execute → Review
