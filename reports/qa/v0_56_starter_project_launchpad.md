# v0.56 플레이테스트 슬라이스 QA — 첫 제품 개발 진입

작성일: 2026-05-21

## 범위

- `staffing` QA 시나리오에서 고용 직후 첫 제품 개발로 넘어가는 흐름을 보강한다.
- 실제 블라인드 테스트 결과를 대체하지 않고, 첫 3분 목표에 필요한 안내/버튼 신호가 존재하는지만 검수한다.

## 변경 요약

- 고용 직후 가이드는 제품 메뉴 상단의 추천 첫 제품 카드로 이동하라고 말한다.
- 제품 메뉴 상단에 `first-project-launchpad`를 추가했다.
- 추천 첫 제품 카드는 제품명, 예상 개발 기간, 예상 리뷰, 예상 완성도, 자동 팀, `첫 제품 개발 시작` 버튼을 보여준다.
- 첫 프로젝트 시작 전에는 아이디어 조합실 튜토리얼과 경쟁사 튜토리얼이 끼어들지 않게 늦췄다.
- `staffing` QA 시나리오는 튜토리얼 모달 없이 추천 첫 제품 카드가 보이도록 `welcome_garage`, `agent_hired`를 본 상태로 연다.

## 검증

- `npm test -- src/game/guidance.test.ts src/game/tutorial-guide.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 요약: 4개 테스트 파일 / 85개 테스트 통과
- Headless Chrome desktop capture
  - URL: `http://127.0.0.1:5201/?scenario=staffing`
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-starter-project-launchpad.png`
- `npm run harness:gate`
  - 결과: 통과
  - 요약: 41개 테스트 파일 / 313개 테스트 통과, 데이터 검증 통과, production build 통과

## 남은 리스크

- 실제 플레이어가 이 카드를 눌러 첫 프로젝트를 시작하는지는 블라인드 테스트로 확인해야 한다.
