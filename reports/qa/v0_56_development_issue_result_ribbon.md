# v0.56 플레이테스트 슬라이스 QA — 첫 개발 이슈 결과 리본

작성일: 2026-05-21

## 범위

- `deck-result` QA 시나리오에서 카드 보정이 들어간 첫 개발 이슈 해결 직후의 피드백을 검수한다.
- 실제 블라인드 테스트 결과를 대체하지 않고, 카드가 프로젝트 결과를 바꿨다는 신호가 화면에 남는지만 확인한다.

## 변경 요약

- `?scenario=deck-result`를 추가해 `고객 인터뷰` 카드 보정 후 첫 개발 이슈를 해결한 상태를 고정했다.
- 덱 메뉴 상단에 `development-issue-result-ribbon`을 추가했다.
- 결과 리본은 판정, 점수, 진행도 상승, 완성도 상승, 현재 진행도, 현재 완성도, 카드 영향, 해결 이슈, 다음 목표를 보여준다.
- 다음 목표 문구는 `출시까지 진행`으로 이어져 첫 이슈 해결 후 첫 출시 흐름을 강화한다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 요약: 2개 테스트 파일 / 70개 테스트 통과
- Headless Chrome desktop capture
  - URL: `http://127.0.0.1:5201/?scenario=deck-result`
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-development-issue-result-ribbon.png`

## 남은 리스크

- 실제 플레이어가 이 결과 리본을 카드 영향 체감으로 이해하는지는 블라인드 테스트로 확인해야 한다.
