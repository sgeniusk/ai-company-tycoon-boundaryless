# Alpha v0.4.0 QA — 사무실 시너지

작성일: 2026-05-17

## 검증 명령

- `npm test -- src/game/office.test.ts`
- `npm test -- src/game/office.test.ts src/game/qa-scenarios.test.ts`
- `npm run validate:data`
- `npm run build`
- Headless Chrome screenshot: `http://127.0.0.1:5178/?scenario=office`

## 결과

- 사무실 시너지 단위 테스트: 통과, 7 tests.
- 관련 QA 시나리오 회귀: 통과, 30 tests.
- 데이터 검증: 통과.
- 프로덕션 빌드: 통과.
- 브라우저 렌더링: 통과. 상점 상단의 사무실 요약과 시너지 상태 표시를 확인했다.

## 발견 이슈

- P0: 없음.
- P1: 없음.
- P2: 시너지 후보 진행 라벨의 일부 키가 내부 데이터명으로 표시된다.
- P2: 사무실 시너지 상세 조합표는 아직 아래 패널에 있어, 향후 한 화면 UI 압축 때 별도 토글이 필요하다.

## 판정

0.4 사무실 운영 1차 기능은 다음 개발로 넘어가도 된다.
