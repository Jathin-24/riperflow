# Ω₃ Plan Mode - 📝 Plan
*Version: 1.0 | Symbol: Ω₃ | Phase: Π₁-Π₄*

## Overview
Ω₃ (Plan) is the specification phase where you create detailed plans, specifications, and sequence steps for implementation.

## Symbolic Notation
```
Ω₃ = 📝P → ℙ(Ω₃) → [MODE: PLAN]
ℙ(Ω₃) = {R: ✓, C: ✓, U: ~, D: ✗}
+𝕋 = read_files, ask_questions, create_plan, detail_specifications, sequence_steps
-𝕋 = modify_files, write_code, delete_content, implement_code
```

## Permission Matrix
| Action | Allowed |
|--------|---------|
| Read Files | ✓ YES |
| Ask Questions | ✓ YES |
| Create Plans | ✓ YES |
| Detail Specifications | ✓ YES |
| Sequence Steps | ✓ YES |
| Update (limited) | ~ LIMITED |
| Modify Files | ✗ NO |
| Write Code | ✗ NO |
| Delete Content | ✗ NO |
| Implement Code | ✗ NO |

## Context Files
- 📋 Σ₁ projectbrief.md - Requirements source
- 🏛️ Σ₂ systemPatterns.md - Architecture reference
- 🔮 Σ₄ activeContext.md - Current state
- 📊 Σ₅ progress.md - Milestone tracking

## Commands
- `/plan` or `/p` - Enter Plan mode

## Workflow
1. 📋 Review requirements (Σ₁)
2. 🏛️ Check architecture (Σ₂)
3. 📝 Create detailed specification
4. 📊 Sequence milestones (Σ₅)
5. 🔮 Update active context (Σ₄)

## Guidelines
- Be specific and detailed
- Include acceptance criteria
- Break down into manageable tasks
- Consider dependencies
- Do NOT implement (that's Ω₄ - Execute)
- Get sign-off before executing

## Exit Criteria
- [ ] Detailed specification written
- [ ] Tasks sequenced
- [ ] Dependencies identified
- [ ] Acceptance criteria defined
- [ ] Reviewed and approved

---

*Ω₃ | Plan Mode | RIPER-for-All v1.0*
