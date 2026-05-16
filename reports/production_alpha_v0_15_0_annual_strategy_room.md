# Alpha v0.15.0 제작 보고서 — 연간 전략실

작성일: 2026-05-16

## 요약

v0.15.0은 연간 운영 지시를 더 게임다운 의사결정으로 확장한 버전이다. 이제 `신뢰 복리 프로그램` 같은 지시는 월간 보너스와 카드 보상 편향에서 끝나지 않고, 다음 제품 후보, 연구 후보, 경쟁 대응 후보까지 한 화면에서 안내한다.

## 구현 내용

- `annual-strategy-advisor` 순수 모듈 추가.
- 지시 태그를 제품 태그, 도메인 태그, 연구 태그, 경쟁 대응 플랜과 매칭.
- 회사 화면의 연간 심사 패널 안에 `연간 전략실` UI 추가.
- `?scenario=annual-strategy` QA 시나리오 추가.

## 하네스 관점 리뷰

- Executive Producer Agent: v0.15는 단일 UI 장식이 아니라 연간 지시를 다음 행동으로 연결하는 마일스톤이다.
- Game Designer Agent: 플레이어가 내년 운영 방향을 고른 뒤 무엇을 해야 하는지 더 명확해졌다.
- Systems Architect Agent: 추천 계산은 UI에서 분리된 순수 모듈로 유지했다.
- UX Agent: 회사 화면 안에서 제품, 연구, 경쟁 대응 추천이 함께 보인다.
- Deck System Engineer: 카드 보상 편향 태그를 다른 시스템에도 재사용하기 시작했다.
- Solo Dev Scope Agent: 새 데이터 폭증 없이 기존 제품, 연구, 경쟁 대응 데이터를 재조합했다.

## 검증

- `npm test -- src/game/annual-strategy-advisor.test.ts src/game/qa-scenarios.test.ts`: 통과, 23 tests.
- `npm run harness:gate`: 통과, 153 tests, 데이터 검증 통과, 프로덕션 빌드 통과.
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=annual-strategy` 1366x768에서 회사 화면의 `연간 전략실` 표시 확인.

## 다음 액션

1. 전략실 추천을 누르면 제품/연구/경쟁 메뉴로 바로 이동하는 인터랙션을 추가한다.
2. 장기 시뮬레이션에서 지시별 추천과 실제 선택 사이의 괴리를 기록한다.
3. v0.15.x에서 전략실 추천이 너무 정답처럼 보이지 않도록 대안 후보와 리스크 표시를 추가한다.
