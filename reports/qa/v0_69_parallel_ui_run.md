# v0.69/v0.70 Parallel UI Lane QA

날짜: 2026-05-31
담당 범위: UI/UX lane only

## 변경 요약

- 결과 탭 상단에 `EndingReplayReadinessStrip`을 추가해 엔딩 리플레이, 근접 엔딩, 베타 준비도, 다음 목표 런 액션을 한 줄에서 판단하게 했다.
- 새 게임 로직은 추가하지 않았다. 기존 `getBetaReadinessSummary`, `getActiveEndingReplayBrief`, `getEndingNearMisses`, `getNextRunSetupPlan` 결과와 기존 재시작 핸들러만 소비한다.
- 520px 이하에서는 스트립이 단일 열로 접히도록 layout-contract를 고정했다.

## TDD Evidence

RED:

```bash
npm test -- src/ui/layout-contract.test.ts -t "v0.70 keeps the replay and beta-readiness next step visible in final results" < /dev/null
```

결과: 실패 확인. `EndingReplayReadinessStrip` 문자열이 없어서 새 계약이 의도대로 미충족 상태였다.

GREEN:

```bash
npm test -- src/ui/layout-contract.test.ts -t "v0.70 keeps the replay and beta-readiness next step visible in final results" < /dev/null
```

결과: 통과. 1 passed, 94 skipped.

추가 확인:

```bash
npm test -- src/ui/layout-contract.test.ts < /dev/null
npm run build < /dev/null
```

결과: layout-contract 95 passed. production build passed, 123 modules transformed.

## Integration Notes

- 수정 파일은 `src/components/GameChrome.tsx`, `src/App.css`, `src/ui/layout-contract.test.ts`, 이 QA 보고서뿐이다.
- `simulation.ts`, `types.ts`, `App.tsx`, `package.json`, `scripts/qa/*`, root state/docs 파일은 수정하지 않았다.
- 통합 과정에서 중복으로 들어온 `EndingReplayReadinessStrip` 정의/스타일을 하나로 합쳤고, game-selector lane의 `nextTargetRouteLabel`도 스트립 fallback copy에 연결했다.
- `npm test -- src/ui/layout-contract.test.ts src/game/v068-beta-candidate-script.test.ts src/game/beta-readiness.test.ts src/game/world-events.test.ts --maxWorkers=1 < /dev/null` 통과: 4 files / 113 tests.
- `npm run build < /dev/null` 통과.
- 최종 통합 `npm run harness:gate < /dev/null` 통과: 53 files / 602 tests, data validation, beta readiness 15/15, production build.
