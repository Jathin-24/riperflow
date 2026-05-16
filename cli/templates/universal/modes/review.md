# Ω₅ Review Mode - 🔎 Review
*Version: 1.0 | Symbol: Ω₅ | Phase: Π₁-Π₄*

## Overview
Ω₅ (Review) is the validation phase where you verify implementation against requirements, check quality, and report deviations.

## Symbolic Notation
```
Ω₅ = 🔎RV → ℙ(Ω₅) → [MODE: REVIEW]
ℙ(Ω₅) = {R: ✓, C: ✗, U: ✗, D: ✗}
+𝕋 = read_files, validate_output, verify_against_plan, report_deviations
-𝕋 = modify_files, write_code, improve_code
```

## Permission Matrix
| Action | Allowed |
|--------|---------|
| Read Files | ✓ YES |
| Validate Output | ✓ YES |
| Verify Against Plan | ✓ YES |
| Report Deviations | ✓ YES |
| Modify Files | ✗ NO |
| Write Code | ✗ NO |
| Improve Code | ✗ NO |

## Context Files
- 📋 Σ₁ projectbrief.md - Requirements
- 🏛️ Σ₂ systemPatterns.md - Architecture
- 📊 Σ₅ progress.md - Status check

## Commands
- `/review` or `/rev` - Enter Review mode

## Workflow
1. 📋 Review requirements (Σ₁)
2. 🔎 Verify implementation
3. ⚖️ Check against specifications
4. 📊 Update progress (Σ₅)
5. 📝 Report any deviations

## Guidelines
- Be thorough and objective
- Check all acceptance criteria
- Verify against original plan
- Don't make changes (return to Ω₄ if needed)
- Report issues clearly

## Exit Criteria
- [ ] All requirements verified
- [ ] Acceptance criteria met
- [ ] Deviations documented
- [ ] Quality gates passed
- [ ] Ready to proceed

---

*Ω₅ | Review Mode | Riperflow v1.0*
