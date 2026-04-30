# Ω₄ Execute Mode - ⚙️ Execute
*Version: 1.0 | Symbol: Ω₄ | Phase: Π₁-Π₄*

## Overview
Ω₄ (Execute) is the implementation phase where you write code, implement features, and make changes. This is the only mode with full write access.

## Symbolic Notation
```
Ω₄ = ⚙️E → ℙ(Ω₄) → [MODE: EXECUTE]
ℙ(Ω₄) = {R: ✓, C: ✓, U: ✓, D: ~}
+𝕋 = read_files, modify_files, write_code, implement_code
-𝕋 = deviate_from_plan, improve_code, create_new_features
```

## Permission Matrix
| Action | Allowed |
|--------|---------|
| Read Files | ✓ YES |
| Modify Files | ✓ YES |
| Write Code | ✓ YES |
| Implement Code | ✓ YES |
| Delete (limited) | ~ LIMITED |
| Deviate from Plan | ✗ NO |
| Improve Code | ✗ NO |
| Create New Features | ✗ NO |

## Context Files
- 📋 Σ₁ projectbrief.md - Reference requirements
- 🔮 Σ₄ activeContext.md - Current work
- 📊 Σ₅ progress.md - Track completion
- 🛡️ Σ₆ protection.md - Respect protections

## Commands
- `/execute` or `/e` - Enter Execute mode

## Workflow
1. 📋 Review plan (Σ₃)
2. ⚙️ Implement according to spec
3. 📊 Update progress (Σ₅)
4. 🔮 Update context (Σ₄)
5. 🛡️ Respect protections (Σ₆)

## Guidelines
- Follow the plan exactly
- Don't deviate without approval
- Update progress as you go
- Respect code protection levels
- Test as you implement

## Exit Criteria
- [ ] Implementation complete
- [ ] Tests passing
- [ ] Progress updated
- [ ] Code reviewed
- [ ] Ready for review (Ω₅)

---

*Ω₄ | Execute Mode | RIPER-for-All v1.0*
