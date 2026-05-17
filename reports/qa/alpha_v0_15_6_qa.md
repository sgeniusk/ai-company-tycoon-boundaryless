# v0.15.6-alpha QA 보고서 — 시즌 대응 과제

작성일: 2026-05-17

## 검증 범위

- 경쟁사 시즌 대응 과제 계산
- 추천 제품/추천 대응 카드 생성
- 회사 현황 시장 시즌 버튼
- 경쟁 메뉴 대응 과제 렌더링

## 자동 테스트

- `npm test -- src/game/competition-signals.test.ts`
  - 4 tests 통과
- `npm test -- src/game/competition-signals.test.ts src/game/qa-scenarios.test.ts`
  - 27 tests 통과
- `npm run build`
  - 통과
  - Vite chunk size 경고는 기존과 동일한 비차단 경고

## 브라우저 확인

- 로컬 URL: `http://127.0.0.1:5178/?scenario=ten-year-sim&menu=competition`
- 확인 항목:
  - 경쟁 메뉴 진입
  - 경쟁 시즌 브리프 표시
  - 시즌 대응 과제 카드 표시
  - 추천 제품과 추천 대응 카드 표시
- 스크린샷: `/tmp/ai-company-v0156-challenges.png`

## 발견 이슈

- P0 없음.
- P1 없음.
- P2: 중앙 사이드 패널은 10년 압축 시나리오에서 정보가 겹쳐 보인다. v0.16 UI 압축 작업의 최우선 후보로 기록한다.
- P3: 대응 과제는 현재 파생 목표이며, 아직 완료 보상/실패 패널티가 월간 진행에 직접 적용되지는 않는다.

## 판정

`v0.15.6-alpha`는 다음 개발 단계로 진행 가능하다.
