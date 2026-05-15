# Alpha v0.12.2 QA 보고서

작성일: 2026-05-15

## 검증 범위

- 명시적 직원 배치.
- 완성도 중심 출시 산식.
- 제품 카드 예상 결과 UI.
- 인벤토리 패널.
- 사무실 직원/프로젝트 표시.
- 신규 `staffing` QA 시나리오.

## 자동 테스트

- `npm run harness:gate`: 통과, 84 tests, 데이터 검증 통과, 빌드 통과
- `npm test -- src/game/simulation.test.ts`: 통과, 27 tests
- `npm test -- src/game/qa-scenarios.test.ts`: 통과, 10 tests
- `npm test -- src/game/simulation.test.ts src/game/deckbuilding.test.ts`: 통과, 34 tests
- `npm run build`: 통과

## 브라우저 QA

확인 URL:

- `http://localhost:5173/?scenario=staffing`
- `http://localhost:5173/?scenario=shop`
- `http://localhost:5173/?scenario=deck`
- `http://localhost:5173/?scenario=project`

확인 결과:

- `staffing`: 직원 배치 QA 라벨, 프롬프트 설계가, 데이터 큐레이터, 선택 팀, 예상 리뷰/완성도 표시 확인.
- `shop`: 인벤토리와 투자, 보유/장착 대기/사무실 효과 카운트 확인.
- `deck`: 전략 덱, 개발 퍼즐, 카드, 3x3 이슈 보드 표시 확인.
- `project`: 사무실 직원 스프라이트와 프로젝트 보드 표시 확인.

## 이슈

- P0 없음.
- P1 없음.
- P2: 제품 카드가 길어져 좁은 화면에서는 카드 접기 UI가 필요하다.
- P2: 인벤토리는 아직 정렬/필터가 없다.

## 판정

v0.12.2는 다음 단계로 진행 가능하다.
