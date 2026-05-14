# Synthetic Playtest Harness

## Purpose

Synthetic playtesting is a repeatable early-development evaluation loop. It does not replace real players. It catches obvious design, clarity, pacing, theme, and balance problems before real user testing.

## When To Run

Run after every playable milestone and before any public prototype push.

Required inputs:

- Current PRD.
- Current build or playable description.
- Latest data files.
- Current milestone acceptance criteria.
- Known risks.

Required output:

- Report in `reports/playtests/`.
- P0/P1 issues added to the milestone fix list.
- P2/P3 issues added to backlog or risk register.

## Tester Panel

Use 12 archetypal testers: 6 male-coded, 6 female-coded. Do not imitate living creators. Use professional lenses instead of celebrity mimicry.

### Creative Lens Testers

1. Male web-novel strategist: judges compulsion, cliffhangers, growth fantasy, and unlock pacing.
2. Female web-novel strategist: judges emotional reward, readable stakes, and session-to-session curiosity.
3. Male literary novelist lens: judges theme, world coherence, and whether the AI company premise says something interesting.
4. Female literary novelist lens: judges human cost, ethical tension, and whether choices feel meaningful.
5. Male commercial comics creator lens: judges visual readability, punchy beats, and panel-like dashboard flow.
6. Female commercial comics creator lens: judges character of the company, contrast, progression clarity, and memorable moments.
7. Male children's author lens: judges simplicity, onboarding, and whether the premise is understandable without jargon.
8. Female children's author lens: judges warmth, clarity, motivation, and whether the player can explain the game after one run.

### Game Lens Testers

9. Tycoon fan: judges optimization, progression, and replayability.
10. Min-max player: looks for dominant strategies, exploits, and dead ends.
11. Casual Steam player: judges first 5 minutes, wishlist appeal, and friction.
12. Accessibility tester: judges readability, controls, contrast, and cognitive load.

## Evaluation Axes

Each tester scores 1-5:

- First-minute clarity.
- Core fantasy expression.
- Decision tension.
- Progression satisfaction.
- Uniqueness.
- Readability.
- Replay curiosity.
- Friction.

Each tester must provide:

- One thing that works.
- One thing that fails or feels weak.
- One benchmark, comparable, or reference point.
- One concrete improvement.

## Evaluation Lead Agent

After the 12 testers report, the evaluation lead synthesizes:

- Shared praise.
- Repeated confusion.
- P0/P1/P2/P3 issues.
- Top 5 fixes.
- Design risks.
- Suggested next milestone changes.

The lead must resolve contradictions. If creative testers want more narrative but game testers want less reading, the lead should propose a UI or pacing solution rather than simply listing both.

## Report Template

```markdown
# Synthetic Playtest Report - Milestone X

## Build Context
- Date:
- Milestone:
- Build/source:
- Tested scope:

## Executive Summary
- Overall verdict:
- Strongest hook:
- Biggest risk:
- Must-fix before next milestone:

## Tester Findings
### Tester 1 - Web-Novel Strategist
- Scores:
- Works:
- Weakness:
- Benchmark/reference:
- Recommendation:

...

## Evaluation Lead Synthesis
- Repeated positives:
- Repeated problems:
- Contradictions:
- Priority fixes:

## Issues
- P0:
- P1:
- P2:
- P3:

## Actions
- Fix now:
- Backlog:
- Risk register updates:
```

## Pass Criteria

A milestone passes synthetic playtest only if:

- No P0 issues remain.
- No P1 issues remain unaddressed.
- At least 8 of 12 testers understand the core fantasy.
- At least 8 of 12 testers identify a meaningful decision.
- Min-max tester finds no trivial dominant strategy.
- Accessibility tester passes first-screen readability.
