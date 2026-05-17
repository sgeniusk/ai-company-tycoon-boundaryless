# v0.15.4-alpha QA 보고서 — 회사 승급 트랙

작성일: 2026-05-17

## 검증 범위

- 회사 단계 진행도 계산
- 다음 승급 조건 표시
- 회사 현황 메뉴 렌더링
- 기존 10년 캠페인/지역 이전 테스트 회귀 확인

## 자동 테스트

- `npm test -- src/game/campaign.test.ts`
  - 5 tests 통과
- `npm test -- src/game/campaign.test.ts src/ui/layout-contract.test.ts`
  - 7 tests 통과
- `npm run validate:data`
  - 통과
- `npm run build`
  - 통과
  - Vite chunk size 경고는 기존과 동일한 비차단 경고

## 브라우저 확인

- 로컬 URL: `http://127.0.0.1:5178/?scenario=growth`
- 확인 항목:
  - 앱 첫 화면 렌더링
  - 회사 단계 카드에 다음 승급 조건 표시
  - 회사 현황 패널에 승급 관련 정보 표시
- 스크린샷: `/tmp/ai-company-v043-promotion.png`

## 발견 이슈

- P0 없음.
- P1 없음.
- P2: 회사 현황 메뉴 오른쪽 패널의 정보량이 계속 늘고 있어 v0.16에서 패널 접기/상세 보기 정리가 필요하다.
- P3: 승급 완료 순간의 보상 연출은 아직 없다.

## 판정

`v0.15.4-alpha`는 다음 개발 단계로 진행 가능하다.
