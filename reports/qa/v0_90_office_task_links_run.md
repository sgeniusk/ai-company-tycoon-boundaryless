# v0.90 Office Task Links QA

## Goal

- 사무실 배우와 활성 업무 오브젝트가 서로 연결되어 일하는 장면처럼 보이게 한다.
- 턴제 경영 화면의 정지감을 줄이되 플레이필드를 덮는 큰 UI는 추가하지 않는다.
- 게임 로직, 저장, 경제 밸런스, 콘텐츠 데이터는 변경하지 않는다.

## Changes

- `src/components/GameChrome.tsx`
  - `OfficeTaskLinkLayer`를 추가해 배우와 활성 사무실 오브젝트 사이에 deterministic task route를 렌더링한다.
  - `createOfficeTaskLinks`는 현재 배우/오브젝트 좌표만 사용하며 랜덤이나 tick 변경이 없다.
- `src/App.css`
  - `office-task-link-layer`, `office-task-link`, packet dot, tone별 색상을 추가했다.
  - 모바일에서는 5번째 이후 task link를 숨겨 좁은 화면의 시각 밀도를 제한한다.
  - `prefers-reduced-motion: reduce`에서 새 task link animation을 정지한다.
- `src/ui/layout-contract.test.ts`
  - v0.90 레이아웃 계약 테스트로 task link 레이어, pixelated 렌더링, packet animation, 모바일 절감, reduced-motion 안전장치를 고정했다.

## RED / GREEN

- RED: `npm test -- src/ui/layout-contract.test.ts`
  - Expected failure: `OfficeTaskLinkLayer` not found.
- GREEN: `npm test -- src/ui/layout-contract.test.ts`
  - PASS: 1 file / 114 tests.

## Browser Smoke

Command:

```sh
/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node /private/tmp/check-v090-office-task-links.mjs
```

Local URL:

- `http://127.0.0.1:5222/?scenario=office-visuals`

Screenshots:

- `reports/qa/screenshots/v0_90_office_task_links_desktop.png`
- `reports/qa/screenshots/v0_90_office_task_links_mobile.png`

Key metrics:

- Desktop task links: 5 total / 5 visible
- Mobile task links: 5 total / 4 visible
- Link animation: all `office-task-link-pulse`
- Link packet animation: all `office-task-link-packet`
- Link tones include `task-link-compute`, `task-link-team`, and `task-link-launch`
- Desktop/mobile off-shell links: 0 / 0
- Desktop/mobile off-office links: 0 / 0
- Mobile document width overflow: 0
- Desktop visible actors: 6
- Desktop visible office objects: 10
- Desktop visible workbeat nodes: 8
- Actor animation includes `pixel-actor-work`
- Workbeat animations all include `office-workbeat-pop`

## Full Gate

Command:

```sh
npm run harness:gate < /dev/null
```

Result:

- `npm test -- --maxWorkers=1`: PASS, 53 files / 637 tests
- `npm run validate:data`: PASS
- `npm run qa:beta-readiness:check`: PASS, 15/15 readiness checks
- `npm run build`: PASS

Known warning:

- Vite chunk size warning remains the existing >500 kB production bundle warning.

## Notes

- This is visual/UI-only polish. No new persisted field, no save migration, no monthly economy hook, and no data mutation.
- The first smoke run caught missing `compute` tone coverage; task-link tone priority was adjusted so work-object identity remains visible even when an actor is in warning state.
