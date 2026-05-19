# v0.48-alpha QA 보고서 — 시트 기반 액터 프레임 애니메이션

작성일: 2026-05-19

## 자동 검증

- `npm test -- src/game/asset-manifest.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 범위: 2 files / 35 tests
- `npm run harness:gate`
  - 결과: 통과
  - 범위: 40 files / 291 tests, 데이터 검증 통과, 프로덕션 빌드 통과

## 검증 범위

- `asset_manifest.json` 버전이 `0.48-alpha`로 올라갔다.
- 모든 priority agent sprite의 idle/work 애니메이션에 `duration_ms`가 있다.
- work 애니메이션 duration은 idle보다 짧아 작업 중 상태가 더 빠르게 움직인다.
- `GameChrome`에 `getAnimatedSpriteSheetFrameStyle`이 있고, actor sprite에 `sprite-sheet-animated`가 붙는다.
- CSS에 `@keyframes sprite-sheet-frame-cycle`과 `steps()` 기반 atlas animation 경로가 있다.
- reduced-motion 규칙은 기존 `.staff-sprite.pixel-actor` animation off 경로를 계속 적용한다.

## 남은 리스크

- 현재는 deterministic draft sheet라 프레임별 실루엣 변화가 제한적이다.
- 실제 AI 생성 시트 교체 후에는 세 프레임의 bottom-center anchor, 얼굴 흔들림, prop 위치 drift를 다시 검수해야 한다.
