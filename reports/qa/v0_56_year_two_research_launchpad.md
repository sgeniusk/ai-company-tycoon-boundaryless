# v0.56 Year-Two Research Launchpad QA

작성일: 2026-05-21

## 목적

2년차 운영 시작 후 추천 메뉴가 연구일 때, 플레이어가 연간 지시가 추천하는 연구를 바로 다음 행동으로 이해하는지 검증한다.

## 대상

- URL: `http://127.0.0.1:5201/?scenario=year-two-research`
- 주요 UI: `annual-research-launchpad`
- 상태: 2년차 1월, `신뢰 복리 프로그램` 지시 적용 중, 연구 메뉴 열림

## 기대 동작

- 연구 패널 상단에 `연간 지시 추천 연구` 카드가 보인다.
- 카드는 추천 연구명과 추천 이유를 보여준다.
- `바로 연구` 버튼이 추천 연구를 즉시 실행하는 행동으로 보인다.
- 실행 이후 상태는 `reports/qa/v0_56_year_two_research_completion.md`의 `research-completion-ribbon`에서 검증한다.
- 기존 연구 목록에서도 추천 대상이 `strategy-focus`로 먼저 보인다.
- 모바일에서는 연구 패널 시작부에 런치패드가 잘리지 않고 나타난다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 출력: 2 test files / 81 tests passed
- `npm test -- src/game/blind-playtest-records.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 출력: 3 test files / 83 tests passed
- `npm run harness:gate`
  - 결과: 통과
  - 출력: 41 test files / 328 tests passed, data validation passed, production build passed
- Headless Chrome desktop capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-year-two-research-launchpad.png`
- Headless Chrome mobile capture
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-year-two-research-launchpad-mobile.png`

## 남은 리스크

- `바로 연구` 버튼이 실제 플레이어에게 충분히 강한 다음 행동으로 읽히는지는 블라인드 테스트 전이다.
- 모바일 기본 높이에서는 연구 카드 하단이 일부 접힐 수 있으므로, 실제 터치 스크롤에서 버튼 클릭까지 확인해야 한다.
