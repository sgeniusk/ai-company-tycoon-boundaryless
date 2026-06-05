# v1.0 RC Polish Cleanup Report

작성일: 2026-06-04

## 범위

가상 베타 P1 반영 후 RC polish 변경 파일을 대상으로 ai-slop-cleaner 패스를 수행했다. 기존 QA 스크린샷 PNG diff는 의도적으로 보존했고, 프로덕션 승격/최종 아트/실사용자 플레이테스트는 사용자 게이트로 남겼다.

## 정리 결과

- 중복 숫자 포맷 헬퍼 제거: `GameChrome.tsx`의 로컬 compact decimal helper를 없애고 `src/ui/formatters.ts`의 `formatCompactDecimal`을 재사용했다.
- 숫자 포맷 경계 정리: 효과 텍스트, 월간 델타, 경쟁 모멘텀 알림, 스카우트 이해관계 라벨에서 raw float 꼬리가 노출되지 않도록 테스트로 고정했다.
- 오피스 지속 마커 정리: 6개 state-derived 신호 중 하나가 조용히 잘리는 5개 cap을 제거했다.
- 긴 계약 테스트 안정화: 무거운 URL 시나리오 생성, integrated readiness, 20-person persona, roguelike/end-to-end simulator sweep, blind-playtest triage, 4-tier 10-year simulator 압박 검증에만 20s timeout을 명시했다. 단언은 완화하지 않았다.
- fallback-like 신호 점검: 검색된 fallback 표현은 기존 save migration, actor sprite, ending scenario 등 명시적 호환/QA 경로였고, 이번 변경을 가리는 새 masking fallback은 발견하지 않았다.
- 새 의존성 없음. 새 게임 시스템 없음. 변경은 UI/포맷/테스트 안정화 중심이다.

## 검증

- `npm test -- src/ui/formatters.test.ts --maxWorkers=1`: 1/1 passed.
- `npm test -- src/ui/layout-contract.test.ts -t "v1.0 rc" --maxWorkers=1`: 5 targeted tests passed.
- `npm test -- src/game/qa-scenarios.test.ts -t "creates scenarios from URL search params for browser QA" --maxWorkers=1`: passed.
- `npm test -- src/game/qa-scenarios.test.ts -t "creates a v0.20 alpha readiness scenario from the integrated harness" --maxWorkers=1`: passed.
- `npm test -- src/game/run-simulator.test.ts -t "keeps challenge tier pressure non-inverted" --maxWorkers=1`: passed.
- `npm test -- src/game/staff-career.test.ts -t "links poaching incidents to a concrete competitor offer" --maxWorkers=1`: passed.
- `npx tsc --noEmit --pretty false`: passed.
- Browser mobile smoke 390x844: 7 routes `longDecimals: []`, overflow 0; `reward-picked` growth decision layer y=622 and in viewport.
- `npm run harness:gate`: passed — 54 files / 663 tests, data validation passed, beta readiness 15/15, route coverage 40/40, production build passed.

## 남은 리스크

- 스크린샷 artifact refresh는 별도 의도 작업이다.
- RC deploy, final source art, real-human playtest, v1.0 release tag는 사용자 승인/실행 게이트다.
