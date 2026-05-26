# v0.56 플레이테스트 슬라이스 QA — 첫 출시 다음 행동 리본

작성일: 2026-05-21

## 범위

- `launch-impact` QA 시나리오에서 첫 출시 결과 직후 플레이어가 다음 행동을 알 수 있는지 검수한다.
- 실제 블라인드 테스트 결과를 대체하지 않고, 결과 화면 안에서 보상 카드, 성장 분기, 다음 달 진행의 연결이 보이는지만 확인한다.

## 변경 요약

- 출시 결과 요약 데이터에 `nextActionSteps`를 추가했다.
- 첫 출시 결과 패널에 `launch-next-action-ribbon`을 추가했다.
- 리본은 `보상 카드 선택`, `성장 분기 선택`, `다음 달 진행` 3단계를 고정 순서로 보여준다.
- 각 리본 항목을 버튼으로 만들어 덱 메뉴, 결과 탭, 회사 메뉴로 바로 이동하거나 유지할 수 있게 했다.
- `launch-impact` QA 상태는 주요 튜토리얼을 이미 본 상태로 열어, 결과 패널이 모달에 가려지지 않게 했다.

## 검증

- `npm test -- src/ui/layout-contract.test.ts`
  - 결과: 통과
  - 요약: 1개 테스트 파일 / 33개 테스트 통과
- `npm test -- src/game/release-impact.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/blind-playtest-records.test.ts`
  - 결과: 통과
  - 요약: 4개 테스트 파일 / 76개 테스트 통과
- Headless Chrome desktop capture
  - URL: `http://127.0.0.1:5201/?scenario=launch-impact`
  - 결과: 통과
  - 산출물: `/tmp/ai-company-v056-launch-next-action-ribbon-buttons.png`
- `npm run harness:gate`
  - 결과: 통과
  - 요약: 41개 테스트 파일 / 317개 테스트 통과, 데이터 검증 통과, production build 통과

## 남은 리스크

- 실제 플레이어가 출시 결과를 본 뒤 리본 버튼을 눌러 보상 카드와 성장 분기로 자연스럽게 이동하는지는 블라인드 테스트로 확인해야 한다.
