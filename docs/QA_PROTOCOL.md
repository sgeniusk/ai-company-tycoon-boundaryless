# QA Protocol — AI Company Tycoon: Boundaryless

## Purpose

Define the quality assurance process for every milestone to ensure stability, correctness, and data integrity.

---

## QA Layers

### Layer 1: DebugValidator (Automated)

Run after every code or data change.

**Checks:**
- All JSON files parse without errors
- All required fields are present
- No duplicate IDs exist
- All cross-references resolve (e.g., product requires capability that exists)
- Starting game state is playable (positive cash, at least one launchable product)
- No orphaned data (upgrades referencing non-existent capabilities)

**Output:** Pass/Fail with detailed error list.

---

### Layer 2: Functional Testing (Manual/Simulated)

Run after each milestone completion.

**Checks:**
- Game launches without errors
- All UI elements render correctly
- All buttons respond to input
- Month advancement works correctly
- Resource calculations are accurate
- Events trigger and resolve properly
- Save/Load functions correctly

---

### Layer 3: Edge Case Testing

**Scenarios:**
- Start with zero of each resource
- Spend all cash immediately
- Launch all available products at once
- Ignore all upgrades for 10 months
- Max out hype with zero trust
- Trigger game over condition
- Trigger success condition
- Load a corrupted save file
- Load a save from a previous version

---

### Layer 4: Regression Testing

After every fix:
- Re-run DebugValidator
- Re-test the specific system affected
- Verify no new issues introduced

---

## Issue Classification

| Priority | Definition | Action |
|---|---|---|
| P0 | Game crashes or is unplayable | Fix immediately, block milestone |
| P1 | Major feature broken or misleading | Fix before milestone advance |
| P2 | Minor issue, workaround exists | Log in backlog, fix in next milestone |
| P3 | Polish or nice-to-have | Log in backlog, fix when convenient |

---

## QA Report Format

```markdown
# QA Report — Milestone X

## Date: YYYY-MM-DD

## DebugValidator
- Status: Pass / Fail
- Errors: (list)

## Functional Tests
- Game launch: Pass / Fail
- UI rendering: Pass / Fail
- Month advance: Pass / Fail
- Resource calculations: Pass / Fail
- Events: Pass / Fail
- Save/Load: Pass / Fail (if applicable)

## Edge Cases Tested
- (scenario): Pass / Fail

## Issues Found
- P0: (list)
- P1: (list)
- P2: (list)
- P3: (list)

## Resolution
- Fixed: (list)
- Deferred: (list)
```

---

## QA Cadence

- DebugValidator: After every data or code change
- Functional testing: After every milestone
- Edge case testing: After Milestone 2+
- Regression testing: After every bug fix
