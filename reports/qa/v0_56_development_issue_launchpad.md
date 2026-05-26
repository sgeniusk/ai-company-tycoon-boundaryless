# v0.56 플레이테스트 슬라이스 QA — 첫 개발 이슈 카드

작성일: 2026-05-21

## 범위

- `deck` QA 시나리오에서 첫 프로젝트 진행 중 카드와 개발 이슈가 결과를 바꾸는 순간을 보강한다.
- 실제 블라인드 테스트 결과를 대체하지 않고, 첫 15분 목표에 필요한 카드 체감 신호가 존재하는지만 검수한다.

## 변경 요약

- 첫 프로젝트 진행 중 가이드가 덱 메뉴 상단의 첫 개발 이슈 카드로 플레이어를 보낸다.
- `?scenario=deck` 라벨을 `첫 개발 이슈 QA`로 갱신했다.
- 덱 메뉴 상단에 `development-issue-launchpad`를 추가했다.
- 런치패드는 현재 제품, 진행도, 완성도, 추천 이슈, 선택 수, `자동 선택 이슈 해결` 버튼을 보여준다.
- 버튼을 누르면 추천 이슈 타일로 `resolveDevelopmentPuzzle()`를 실행해 진행도와 완성도 변화가 즉시 남는다.

## 검증

- `npm test -- src/game/guidance.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 요약: 3개 테스트 파일 / 80개 테스트 통과
- Headless Chrome desktop capture
  - URL: `http://127.0.0.1:5201/?scenario=deck`
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-development-issue-launchpad.png`
- `npm run harness:gate`
  - 결과: 통과
  - 요약: 41개 테스트 파일 / 314개 테스트 통과, 데이터 검증 통과, production build 통과

## 남은 리스크

- 실제 플레이어가 첫 개발 이슈를 카드 영향 체감으로 이해하는지는 블라인드 테스트로 확인해야 한다.
