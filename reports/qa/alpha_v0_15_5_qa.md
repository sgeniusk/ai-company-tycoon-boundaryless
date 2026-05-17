# v0.15.5-alpha QA 보고서 — 경쟁사 시즌 브리프

작성일: 2026-05-17

## 검증 범위

- 경쟁사 시즌 브리프 계산
- 12개월차 신규 경쟁자 파동 감지
- 다음 예정 경쟁사 예고
- 경쟁 메뉴 렌더링

## 자동 테스트

- `npm test -- src/game/competition-signals.test.ts`
  - 3 tests 통과
- `npm test -- src/game/competition-signals.test.ts src/game/qa-scenarios.test.ts`
  - 26 tests 통과
- `npm run build`
  - 통과
  - Vite chunk size 경고는 기존과 동일한 비차단 경고

## 브라우저 확인

- 로컬 URL: `http://127.0.0.1:5178/?scenario=ten-year-sim&menu=competition`
- 확인 항목:
  - 경쟁 메뉴 진입
  - `10년차 경쟁 시즌` 패널 표시
  - 최대 압박 경쟁사 표시
  - 경쟁사 랭킹/대응 힌트 렌더링
- 스크린샷: `/tmp/ai-company-v0155-season.png`

## 발견 이슈

- P0 없음.
- P1 없음.
- P2: 10년 압축 QA 화면에서 중앙 보조 패널의 정보량이 많아 일부 구간이 답답하게 보인다.
- P3: 신규 경쟁사 등장 순간의 전용 팝업/사운드/보상 연출은 아직 없다.

## 판정

`v0.15.5-alpha`는 다음 개발 단계로 진행 가능하다.
