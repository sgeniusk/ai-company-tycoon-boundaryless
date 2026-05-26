# v0.56 2년차 신제품 개발 착수/출시 QA

작성일: 2026-05-24

## 목적

연구 완료가 제품 후보 안내에서 끝나지 않고, 부족 연구 완료 후 실제 2년차 신제품 프로젝트 착수, 다음 덱 이슈 행동, 출시 결과까지 이어지는지 검증한다.

## 변경 요약

- `?scenario=year-two-product-ready`를 추가해 에이전트 Lv.2, 엔터프라이즈 Lv.1, 팀/자원/신뢰가 준비된 상태를 고정했다.
- `?scenario=year-two-product-started`를 추가해 `기업 업무 에이전트` 프로젝트가 시작된 상태를 고정했다.
- `?scenario=year-two-product-issue-result`를 추가해 2년차 신제품의 첫 개발 이슈가 해결된 뒤 진행도와 완성도가 상승한 상태를 고정했다.
- `?scenario=year-two-product-launch-impact`를 추가해 `기업 업무 에이전트`가 출시되고 활성 제품/출시 보상으로 이어진 상태를 고정했다.
- 제품 메뉴에 `research-product-started-ribbon`을 추가해 `신제품 개발 시작`, 개발 진행, 완성도/신뢰 기준, 투입 팀, `다음 개발 이슈`, `덱 열기`를 보여준다.
- `?scenario=year-two-product-started&menu=deck`에서는 덱 상단 이슈 카드가 `신제품 개발 이슈`로 표시되어 2년차 제품 착수 후의 다음 행동으로 읽힌다.

## 검증

- `npm test -- src/game/qa-scenarios.test.ts`: 통과, 1 file / 49 tests
- `npm test -- src/ui/layout-contract.test.ts`: 통과, 1 file / 50 tests
- `npm test -- src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/blind-playtest-records.test.ts src/game/blind-playtest-rehearsal.test.ts`: 통과, 4 files / 128 tests
- `npm run qa:blind-rehearsal`: 통과, 자동 리허설 리포트 재생성
- `npm run harness:gate`: 통과, 43 files / 385 tests, 데이터 검증, production build
- `npm run qa:asset-handoff`: 통과, final art intake `대기`, Send status `AGY 발송 금지`
- `npm run build`: 통과, TypeScript와 Vite production build 성공
- `curl -I 'http://127.0.0.1:5201/?scenario=year-two-product-started'`: 200 OK
- `curl -I 'http://127.0.0.1:5201/?scenario=year-two-product-started&menu=deck'`: 200 OK
- `curl -I 'http://127.0.0.1:5201/?scenario=year-two-product-issue-result'`: 200 OK
- `curl -I 'http://127.0.0.1:5201/?scenario=year-two-product-launch-impact'`: 200 OK
- Headless Chrome desktop: `/private/tmp/ai-company-v056-year-two-product-started.png`
- Headless Chrome mobile: `/private/tmp/ai-company-v056-year-two-product-started-mobile.png`

## 판정

코드/QA 기준으로 2년차 제품 후보 흐름은 `제품 후보 확인 -> 필요 연구 -> 개발 가능 -> 신제품 프로젝트 착수 -> 덱 이슈 이동 -> 첫 이슈 결과 -> 신제품 출시 결과`까지 이어진다. 실제 5명 블라인드 테스트는 아직 0/5이므로 최종 그래픽 에셋 투입은 계속 대기다.
