# QA Report — Alpha v0.4.0 Systems Prototype

Date: 2026-05-15

## Scope

Verified the new playable management loop:

- Hire an AI agent
- Buy an item
- Equip the item
- Start a product development project
- Advance months until release
- Preserve state through serialization

## Automated Checks

- `npm test`: Passed, 16 tests
- `npm run validate:data`: Passed
- `npm run build`: Passed

## Browser Smoke Test

Flow tested at `http://localhost:5173/`:

1. Open Agent menu.
2. Hire 프롬프트 설계가.
3. Open Shop menu.
4. Buy 프롬프트 노트.
5. Return to Agent menu.
6. Equip 프롬프트 노트.
7. Open Product menu.
8. Start AI 글쓰기 비서 development.
9. Advance 3 months.
10. Confirm AI 글쓰기 비서 releases and appears as active product.

Console errors: 0

## Findings

- P0: None.
- P1: None.
- P2: Second-product pacing and recovery path still need balance testing.
- P2: Long mobile/full-page view is dense; final layout should be rechecked after visual asset pass.

## QA Verdict

Pass for pre-graphics alpha prototype. Balance tuning should be the next gate before wider playtesting.
