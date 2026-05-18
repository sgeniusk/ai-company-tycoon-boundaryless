# v0.43-alpha QA 보고서 — 그래픽 자산 포함 게임 화면

작성일: 2026-05-19

## 자동 검증

- `npm test -- src/ui/layout-contract.test.ts src/game/qa-scenarios.test.ts`
  - 결과: 통과
  - 범위: 2 files / 60 tests
- `npm test -- src/game/office-scene.test.ts src/game/asset-manifest.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 범위: 4 files / 68 tests
- `npm run build`
  - 결과: 통과
- `npm run harness:gate`
  - 결과: 통과
  - 범위: 40 files / 286 tests, 데이터 검증 통과, 프로덕션 빌드 통과

## 브라우저 QA

URL:

- `http://127.0.0.1:5201/?scenario=office-visuals`

확인 결과:

- 그래픽 자산 벽: 1개
- 자산 타일: 56개
- 배치 장식 프롭: 10개
- 라이벌 HUD 로고: 3개
- 사무실 액터: 6개
- 액터 포커스 패널: 1개
- QA 라벨: `v0.43 그래픽 자산/사무실 액터 QA`
- 가로 오버플로: 없음

## 판정

P0/P1 없음. v0.43 그래픽 자산 포함 게임 화면은 다음 작업으로 넘길 수 있다.

## 남은 리스크

- 자산은 CSS 픽셀 프롭 기반이므로 최종 픽셀아트 파일 교체 작업은 별도 단계가 필요하다.
- 출시/카드/경쟁사 사건의 순간 연출은 아직 화면 자산과 완전히 연결되지 않았다.
