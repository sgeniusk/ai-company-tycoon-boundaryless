# v0.89 Office Bustle Motion QA

## Goal

- 턴제 경영 화면에서도 사무실 전경이 작고 코믹하게 움직이는 픽셀 시뮬레이션처럼 읽히게 한다.
- 카이로소프트식 "일하는 사무실" 감각을 강화하되 기존 오피스 애셋, 메뉴, 경제 로직은 건드리지 않는다.

## Changes

- `src/components/GameChrome.tsx`
  - 각 오피스 배우에 `office-actor-bustle-shadow`와 `office-actor-motion-tick` 장식 레이어를 추가했다.
- `src/App.css`
  - 배우 발밑 shadow pulse와 작은 motion tick을 stepped animation으로 추가했다.
  - sprite-sheet 배우와 fallback 배우 모두에 맞는 위치 보정을 넣었다.
  - `prefers-reduced-motion: reduce`에서 새 모션 장식을 정지한다.
- `src/ui/layout-contract.test.ts`
  - v0.89 레이아웃 계약 테스트로 새 장식 레이어, 픽셀 렌더링, 상태별 애니메이션, reduced-motion 안전장치를 고정했다.

## RED / GREEN

- RED: `npm test -- src/ui/layout-contract.test.ts`
  - Expected failure: `office-actor-bustle-shadow` not found.
- GREEN: `npm test -- src/ui/layout-contract.test.ts`
  - PASS: 1 file / 113 tests.

## Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v089-office-bustle.mjs
```

Local URL:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Screenshots:

- `reports/qa/screenshots/v0_89_office_bustle_desktop.png`
- `reports/qa/screenshots/v0_89_office_bustle_mobile.png`

Key metrics:

- Desktop/mobile visible actors: 6 / 6
- Desktop/mobile actor bustle shadows: 6 / 6
- Desktop/mobile actor motion ticks: 6 / 6
- Pixelated shadow/tick count: 6 / 6 on desktop and mobile
- Desktop/mobile off-shell decorations: 0 / 0
- Desktop/mobile off-office decorations: 0 / 0
- Mobile document width overflow: 0
- Desktop visible reaction sprites: 6
- Desktop visible workbeat nodes: 8
- Actor animation includes `pixel-actor-work`
- Workbeat animations all include `office-workbeat-pop`

## Full Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result:

- `npm test -- --maxWorkers=1`: PASS, 53 files / 636 tests
- `npm run validate:data`: PASS
- `npm run qa:beta-readiness:check`: PASS, 15/15 readiness checks
- `npm run build`: PASS

Known warning:

- Vite chunk size warning remains the existing >500 kB production bundle warning.

## Notes

- This is visual/UI-only polish. No save version, campaign simulation, economy, or data balance changes.
- The first smoke attempt correctly caught hidden resting ticks as 0,0 rects; the smoke harness was tightened to ignore `display: none` decorations during boundary checks.
