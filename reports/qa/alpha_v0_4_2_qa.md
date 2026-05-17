# Alpha v0.4.2 QA — 사무실 확장 월간 효과

작성일: 2026-05-17

## 검증 명령

- `npm test -- src/game/office.test.ts src/game/qa-scenarios.test.ts`
- `npm run validate:data`
- `npm run build`
- Headless Chrome screenshot: `http://127.0.0.1:5178/?scenario=office`

## 결과

- 관련 테스트: 통과, 31 tests.
- 데이터 검증: 통과.
- 프로덕션 빌드: 통과.
- 브라우저 렌더링: 통과. 상점 화면과 사무실 확장 QA 상태가 정상 표시됐다.

## 발견 이슈

- P0: 없음.
- P1: 없음.
- P2: 사무실 월간 효과 상세는 우측 패널 아래쪽에 있어 한 화면에서 즉시 보이지 않을 수 있다.
- P2: 빌드 chunk size 경고가 계속 발생한다. 0.7 UI/성능 정리 때 코드 스플리팅을 검토한다.

## 판정

0.4 사무실 확장 월간 효과 기능은 다음 개발로 넘어가도 된다.
