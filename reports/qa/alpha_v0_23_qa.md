# v0.23-alpha QA 보고서

작성일: 2026-05-17

## 확인 범위

- 출시 체감 패널
- 카드 영향 표시
- `launch-impact` QA 시나리오
- 시즌 과제 밸런스 하네스
- 공유 가능한 하이라이트 카드

## 자동 테스트

- `npm test -- src/game/release-impact.test.ts src/game/shareable-moments.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/run-simulator.test.ts`
- 결과: 통과
- 범위: 5개 파일, 42개 테스트
- `npm run harness:gate`
- 결과: 통과
- 범위: 29개 테스트 파일, 186개 테스트, 데이터 검증 통과, 프로덕션 빌드 통과

## 수동/브라우저 QA

- URL: `http://127.0.0.1:5180/?scenario=launch-impact`
- 스크린샷: `/tmp/ai-company-v023-launch-impact.png`
- 해상도: 1366 x 768
- 확인 결과: 결과 탭에서 출시 점수, 첫 출시 보상, 카드 보상, 카드 영향, 지역 심사 패널이 한 화면 안에서 읽힌다.
- 확인 결과: 출시 체감 패널은 중앙 결과 영역 안에 고정되어 웹페이지처럼 길게 스크롤하지 않아도 핵심 정보가 보인다.
- 남은 확인: 모바일 폭에서는 v0.24에서 보조 패널 접기와 터치 목표 크기를 함께 점검한다.

## 잔여 리스크

- 출시 체감 패널은 현재 최근 덱 상태에서 카드 영향을 계산한다. 장기적으로는 출시 순간의 영향 기록을 별도 저장할 수 있다.
- 하이라이트 카드는 아직 아이콘 없이 텍스트 중심이다. 픽셀 에셋 단계에서 더 강해질 여지가 크다.
