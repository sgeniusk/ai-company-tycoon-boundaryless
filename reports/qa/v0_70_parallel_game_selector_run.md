# v0.70 Parallel Game Selector Lane QA - Beta Readiness Route Label

## Scope
- 베타 준비도 selector가 다음 목표 엔딩의 구체적인 시작 루트 라벨을 `nextTargetRouteLabel`로 직접 노출하도록 추가했다.
- 기존 `route_quick_start` / `result_route_start` 체크 detail에만 있던 값을 재사용하는 derive-only 변경이다.
- GameState 필드, 저장 마이그레이션, tick/economy, UI 파일은 건드리지 않았다.

## RED
- `npm test -- src/game/beta-readiness.test.ts < /dev/null`
  - 실패 확인: `nextTargetRouteLabel`이 `undefined`라서 신규 목표 런과 모든 목표 발견 상태의 기대 라벨 assertion 2개가 실패했다.

## GREEN
- `npm test -- src/game/beta-readiness.test.ts < /dev/null`
  - 1 file / 3 tests passed.
- Integrated GREEN: `npm test -- src/ui/layout-contract.test.ts src/game/v068-beta-candidate-script.test.ts src/game/beta-readiness.test.ts src/game/world-events.test.ts --maxWorkers=1 < /dev/null`
  - 4 files / 113 tests passed.
- Gate: `npm run harness:gate < /dev/null`
  - 53 files / 602 tests passed.
  - Data validation, beta readiness 15/15, and production build passed.

## Integration Notes
- 병렬 작업으로 보이는 기존 로컬 변경이 `data/world_events.json`, `scripts/qa/check-v068-beta-candidate.mjs`, `src/components/GameChrome.tsx`, `src/game/v068-beta-candidate-script.test.ts`, `src/game/world-events.test.ts`, `src/ui/layout-contract.test.ts`, `reports/qa/v0_69_parallel_content_run.md`에 남아 있어 건드리지 않았다.
- 이 lane의 변경 파일은 `src/game/beta-readiness.ts`, `src/game/beta-readiness.test.ts`, 이 QA report뿐이다.
- 통합 단계에서 `nextTargetRouteLabel`은 final results의 `EndingReplayReadinessStrip` fallback copy에도 연결했다.
