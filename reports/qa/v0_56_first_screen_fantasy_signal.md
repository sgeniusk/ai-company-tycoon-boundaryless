# v0.56 플레이테스트 슬라이스 QA — 첫 화면 판타지 신호

작성일: 2026-05-21

## 범위

- `fresh` QA 시나리오에서 첫 10초 안에 AI 회사 경영 게임으로 읽히는지 보강한다.
- 실제 블라인드 테스트 결과를 대체하지 않고, 첫 화면에 필요한 시각/문구 신호가 존재하는지만 검수한다.

## 변경 요약

- 시작 상태의 가이드 카드에 `opening-fantasy-signal`을 추가했다.
- 신호 문구는 차고 창업지, 사람과 AI 에이전트, 첫 제품 출시, 경쟁사 압박, 10년 성장을 함께 보여준다.
- 1개월차 시작 상태에서만 표시해 진행 중 화면의 정보량을 늘리지 않는다.
- 미나의 첫 튜토리얼 제목과 본문도 `차고 AI 회사`, `사람과 AI 에이전트`, `첫 제품 출시`를 직접 말하도록 정리했다.

## 검증

- `npm test -- src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 요약: 1개 테스트 파일 / 30개 테스트 통과
- `npm test -- src/game/tutorial-guide.test.ts`
  - 결과: 통과
  - 요약: 1개 테스트 파일 / 4개 테스트 통과
- Headless Chrome desktop capture
  - URL: `http://127.0.0.1:5201/?scenario=fresh`
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-first-screen-fantasy.png`, `/tmp/ai-company-v056-first-screen-tutorial.png`
- `npm run harness:gate`
  - 결과: 통과
  - 요약: 41개 테스트 파일 / 310개 테스트 통과, 데이터 검증 통과, production build 통과

## 남은 리스크

- 실제 플레이어가 첫 10초에 이 신호를 읽는지는 블라인드 테스트로 확인해야 한다.
