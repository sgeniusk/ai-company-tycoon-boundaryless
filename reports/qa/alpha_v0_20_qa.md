# v0.20-alpha QA 보고서

작성일: 2026-05-17

## 검증 범위

- 시즌 과제 보상/압박 월간 적용
- stage-side 카드 내부 스크롤 UI 계약
- 10년 엔딩 런 기록 저장
- 경계 확장 목표 계산과 제품 메뉴 표시
- 알파 준비도 통합 하네스
- `?scenario=readiness` 브라우저 QA

## 자동 테스트

- `npm run harness:gate`
  - 25개 테스트 파일 통과
  - 173 tests 통과
  - 데이터 검증 통과
  - 프로덕션 빌드 통과
- `npm test -- src/game/simulation.test.ts src/game/competition-signals.test.ts`
  - 시즌 과제 압박/경쟁사 신호 통과
- `npm test -- src/ui/layout-contract.test.ts`
  - 한 화면 카드 스크롤 계약 통과
- `npm test -- src/game/run-summary.test.ts src/game/deckbuilding.test.ts`
  - 10년 엔딩 런 기록과 메타런 회귀 통과
- `npm test -- src/game/boundaryless-expansion.test.ts`
  - 경계 확장 목표 통과
- `npm test -- src/game/run-simulator.test.ts src/game/qa-scenarios.test.ts`
  - 알파 준비도 하네스와 QA 시나리오 통과

## 브라우저 확인

- URL: `http://127.0.0.1:5178/?scenario=readiness`
- 스크린샷: `/tmp/ai-company-v020-readiness.png`
- 확인:
  - v0.20 알파 준비도 QA 라벨 표시
  - 10년 엔딩 상태 렌더링
  - 회사 현황, 연간 심사, 런 결과 카드가 한 화면 안에 표시

## 알려진 이슈

- P0 없음.
- P1 없음.
- P2: Vite chunk size 경고가 계속 발생한다. 기능 문제는 아니지만 v0.21 이후 코드 스플리팅 후보로 둔다.
- P2: 우측 회사 메뉴의 정보량이 많다. 탭/접기 UI로 더 줄일 필요가 있다.
- P3: 시즌 과제 완료 보상은 현재 단순 자원 보상이며, 카드 보상 선택지까지는 아직 직접 생성하지 않는다.

## 판정

`v0.20-alpha`는 플레이테스트 후보로 사용할 수 있다.
