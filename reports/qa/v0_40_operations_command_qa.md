# v0.40-alpha QA 보고서 — 운영 의제

작성일: 2026-05-19

## 기능 QA

- 운영 의제 계산: 통과. 현금, 인사 사건, 제품 프로젝트, 사무실 구획, 경쟁사 압박을 카드로 정렬한다.
- 인사 우선순위: 통과. 치명적인 직원 사건이 있으면 `agents` 메뉴 의제가 최우선으로 올라온다.
- 복지 라운지 완충: 통과. 후폭풍은 남지만 체력/충성도/프로젝트 손실이 줄어든다.
- 로봇 고용 베이: 통과. 고급 채용에서 로봇 후보 노출이 강화된다.
- QA 시나리오: 통과. `?scenario=operations`가 회사 메뉴로 열린다.
- 레이아웃 계약: 통과. `operation-command-panel`이 사무실 플레이필드 안에 존재한다.

## 실행한 테스트

- `npm test -- src/game/operations-command.test.ts src/game/staff-career.test.ts src/game/recruitment.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts`
- 결과: 5 files / 99 tests 통과
- `npm run harness:gate`
- 결과: 39 files / 281 tests 통과, 데이터 검증 통과, 프로덕션 빌드 통과

## 브라우저 QA

- URL: `http://127.0.0.1:5201/?scenario=operations`
- 결과: 운영 의제 패널 1개 확인.
- 의제 카드: 3개 생성, 모바일 폭 510px에서는 축약 규칙에 따라 2개 표시.
- QA pill: `v0.40 운영 의제 QA`.
- 위험 상태: `risk-urgent`.
- 콘솔: Vite/React 정보 로그만 있고 런타임 오류 없음.
- 가로 오버플로: 없음.
- 스크린샷: Codex in-app browser의 CDP 캡처 타임아웃으로 저장 실패. DOM/레이아웃 메트릭 검증은 통과.
