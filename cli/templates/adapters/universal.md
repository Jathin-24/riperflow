# Riperflow - Universal Rules
*Version: 1.0 | Generated: {{DATE}}*

## Quick Reference

📂 = memory-bank/ | 📦 = memory-bank/backups/

### Modes (Ω) & Permissions (ℙ)

| Mode | Name | Permissions (R/C/U/D) | Description |
|------|------|----------------------|-------------|
| Ω₁ 🔍 | **Research** | R:✓ C:✗ U:✗ D:✗ | Read-only analysis and information gathering |
| Ω₂ 💡 | **Innovate** | R:✓ C:~ U:✗ D:✗ | Exploratory suggestions, no implementation |
| Ω₃ 📝 | **Plan** | R:✓ C:✓ U:~ D:✗ | Specification and planning, no app code |
| Ω₄ ⚙️ | **Execute** | R:✓ C:✓ U:✓ D:~ | Full read/write access to implement changes |
| Ω₅ 🔎 | **Review** | R:✓ C:✗ U:✗ D:✗ | Validate, test, and verify without modifying |

### Memory Files (Σ)

| ID | Name | File | Purpose |
|----|------|------|---------|
| Σ₁ 📋 | **Project Brief** | `memory-bank/projectbrief.md` | Project goals and scope |
| Σ₂ 🏛️ | **System Patterns** | `memory-bank/systemPatterns.md` | Architecture decisions |
| Σ₃ 💻 | **Tech Context** | `memory-bank/techContext.md` | Technology stack details |
| Σ₄ 🔮 | **Active Context** | `memory-bank/activeContext.md` | Current task — READ FIRST |
| Σ₅ 📊 | **Progress** | `memory-bank/progress.md` | Task completion tracking |
| Σ₆ 🛡️ | **Protection** | `memory-bank/protection.md` | Protected file registry |

### Phases (Π) & Protection (Ψ)

| Phase | Symbol | Description |
|-------|--------|-------------|
| **UNINITIATED** | Π₁ 🌱 | Framework installed but not started |
| **INITIALIZING** | Π₂ 🚧 | Setup in progress |
| **DEVELOPMENT** | Π₃ 🏗️ | Main development work |
| **MAINTENANCE** | Π₄ 🔧 | Long-term support |

| Category | Symbol | Description |
|----------|--------|-------------|
| PROTECTED | Ψ₁ 🔒 | NEVER modify without explicit approval |
| GUARDED | Ψ₂ 🛡️ | Ask before modifying |
| INFO | Ψ₃ ℹ️ | Context notes |
| DEBUG | Ψ₄ 🐛 | Debugging code |
| TEST | Ψ₅ 🧪 | Testing code |
| CRITICAL | Ψ₆ ⚠️ | Business logic — extra care |

## Commands

- **/r** or **/research** - Switch to Ω₁ Research
- **/i** or **/innovate** - Switch to Ω₂ Innovate
- **/p** or **/plan** - Switch to Ω₃ Plan
- **/e** or **/execute** - Switch to Ω₄ Execute
- **/rev** or **/review** - Switch to Ω₅ Review

## Protection Enforcement

**CRITICAL**: Before ANY file modification:
1. Check current mode permissions (ℙ)
2. Verify protection category (Ψ) in protection.md (see table above)
3. Confirm gate stage allows modifications
4. Log intended changes to activeContext.md

## Files

State: `.riper/state.json` | Memory: 📂*.md | Backups: 📦*/

---
*Riperflow - Universal AI Development Framework*
