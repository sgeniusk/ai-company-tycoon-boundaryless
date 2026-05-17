# v0.23-alpha 제작 보고서 — 공유 가능한 회사 사건

작성일: 2026-05-17

## 목표

게임이 점점 복잡해지면서 플레이어가 “방금 일어난 중요한 사건”을 놓치기 쉬워졌다. v0.23은 회사 기록 메뉴를 단순 로그가 아니라 스크린샷으로 설명되는 사건 모음으로 바꾸는 첫 단계다.

## 구현

- `getShareableMoments()`를 추가했다.
- 출시, 경쟁사 압박, 10년 엔딩, 카드 보상 대기를 하이라이트 카드로 요약한다.
- 회사 기록 메뉴 상단에 `highlight-moment-grid`를 추가했다.
- 각 하이라이트는 제목, 배지, 한 줄 설명, 톤을 가진다.

## 기대 효과

- 출시 직후 “이 제품이 몇 점이었는지”가 기록 메뉴에서도 바로 보인다.
- 강한 경쟁사가 시장을 압박할 때 기록 메뉴가 경고처럼 읽힌다.
- 10년 엔딩은 랭크와 함께 남아 재시작 동기를 만든다.
- 스트리밍이나 스크린샷에서 회사의 이야기가 더 쉽게 전달된다.

## 다음 작업

- 하이라이트 카드에 아이콘 또는 픽셀 배지를 붙인다.
- 경쟁사 선점, 파산 직전 회복, 대박 제품 출시를 더 강한 연출로 분리한다.
- 장기적으로는 런 종료 화면과 하이라이트 앨범을 연결한다.

## 검증

- `npm test -- src/game/shareable-moments.test.ts src/ui/layout-contract.test.ts` 통과
- `npm test -- src/game/release-impact.test.ts src/game/shareable-moments.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/run-simulator.test.ts` 통과
- `npm run harness:gate` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact` 렌더링 확인
