# v0.56 Alpha Run Roadmap QA

Status: 통과
Date: 2026-05-24

## 변경 요약

- 가이드 카드에 `30분 알파런` 로드맵을 추가했다.
- 로드맵은 `첫 제품 출시 -> 카드 영향 확인 -> 보상과 성장 선택 -> 1년차 심사 -> 2년차 신제품 착수` 흐름을 상태 기반으로 표시한다.
- 각 단계는 완료/활성 상태와 다음 보상 미리보기를 보여준다.
- 좁은 가이드 패널에서는 5단계 세로 압축 리스트로 렌더링해 한글이 세로로 깨지지 않게 했다.
- 각 로드맵 단계를 클릭 가능한 컨트롤로 바꿨다. 클릭하면 해당 단계의 현재 목적지 메뉴 또는 결과/회사 탭으로 이동한다.
- 첫 출시 단계는 상태에 따라 `팀원 고용`, `제품 개발`, `카드/이슈`, `출시 진행`, `출시 확인`으로 액션 라벨과 이동 메뉴가 바뀐다.
- 메인 오피스 화면 안에도 `alpha-run-focus-strip`을 추가해 현재 활성 알파런 단계, 전체 진행률, 다음 보상, 단계 이동 버튼이 가이드 탭 밖에서도 보이게 했다.
- `getActiveAlphaRunRoadmapStep()`을 추가해 가이드 로드맵과 오피스 포커스 스트립이 같은 활성 목표를 바라보게 했다.
- 활성 단계 버튼은 초반 알파런에서 안전한 경우 추천 첫 고용, 첫 제품 개발, 첫 이슈 해결, 첫 출시 진행, 첫 보상/성장 선택, 첫 연간 심사 진행을 바로 실행한다.
- 활성 단계 버튼을 누르면 `alpha-run-feedback`으로 방금 실행한 액션과 다음 보상이 즉시 표시된다.
- 2년차 신제품 단계는 더 이상 단순 메뉴 이동에 그치지 않는다. `지시 선택 -> 엔터프라이즈 연구 -> 에이전트 연구 -> 신제품 개발` 순서로 다음 가능한 액션을 추천하고, 조건이 충분하면 `advanceYearTwoProductRoadmap()`이 기업 업무 에이전트 프로젝트 착수까지 밀어준다.
- 도메인 해금 연구는 “언젠가 여는 연구”가 아니라 바로 다음 레벨에서 `기업 자동화`를 여는 연구를 우선하도록 고정했다.
- 30분 알파런이 100%가 되면 `alpha-run-completion-panel`을 표시해 완주/잠금 상태, 신제품 개발 진행률, 다음 개발 이슈 버튼을 보여준다.
- `?scenario=alpha-run-complete` QA 경로를 추가해 첫 출시, 카드 체감, 성장, 연간 지시, 2년차 신제품 착수까지 누적된 완료 상태를 브라우저에서 바로 검수할 수 있게 했다.
- 완료 패널의 다음 행동을 실제 실행으로 연결했다. `다음 개발 이슈`는 2년차 신제품 이슈를 해결하고, 이슈 해결 후에는 `출시까지 진행`, 출시 후에는 `출시 결과 보기`로 바뀐다.
- 두 번째 출시 보상 대기 상태가 생겨도 첫 보상/성장 로드맵 단계가 다시 미완료로 떨어지지 않게 분리했다.
- `?scenario=alpha-run-issue-complete`와 `?scenario=alpha-run-second-launch` QA 경로를 추가해 완료 패널 후속 이슈/출시 체인을 바로 검수할 수 있게 했다.

## 검증

- `npm test -- src/game/simulation.test.ts src/game/guidance.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`: 4 files / 163 tests 통과
- `npm test -- src/game/qa-scenarios.test.ts src/game/guidance.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`: 3 files / 120 tests 통과
- `npm test -- src/game/simulation.test.ts src/game/guidance.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`: 3 files / 109 tests 통과
- `npm test -- src/game/guidance.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`: 2 files / 68 tests 통과
- `npm test -- src/game/guidance.test.ts src/ui/layout-contract.test.ts --maxWorkers=1`: 2 files / 70 tests 통과
- `npm test -- src/ui/layout-contract.test.ts --maxWorkers=1`: 1 file / 51 tests 통과
- `npm run build`: TypeScript와 Vite production build 통과
- `npm run harness:gate`: 43 files / 405 tests, data validation, production build 통과
- `npm run qa:asset-handoff`: Final art intake `대기`, Send status `AGY 발송 금지`
- `curl -I 'http://127.0.0.1:5201/?scenario=alpha-run-second-launch'`: 200 OK
- `curl -I 'http://127.0.0.1:5201/?scenario=year-two-product-started'`: 200 OK
- Headless Chrome alpha-run second launch capture: `/private/tmp/ai-company-v056-alpha-run-second-launch.png`
- Headless Chrome DevTools DOM check: `?scenario=alpha-run-complete` 가이드 탭에서 `alpha-run-completion-panel` 표시, 목표 힌트 `100%`, overflow 0
- Headless Chrome alpha-run complete capture: `/private/tmp/ai-company-v056-alpha-run-complete-guide-1366.png`
- Headless Chrome desktop capture: `/private/tmp/ai-company-v056-alpha-run-roadmap-fresh.png`
- Headless Chrome clickable roadmap desktop capture: `/private/tmp/ai-company-v056-alpha-run-roadmap-clickable-fresh.png`
- Headless Chrome office focus strip desktop capture: `/private/tmp/ai-company-v056-alpha-run-focus-strip-fresh-desktop-v2.png`
- Headless Chrome office focus strip mobile capture: `/private/tmp/ai-company-v056-alpha-run-focus-strip-fresh-mobile.png`
- Headless Chrome year-two chain fresh capture: `/private/tmp/ai-company-v056-alpha-run-year-two-chain-fresh.png`
- Headless Chrome mobile capture: `/private/tmp/ai-company-v056-alpha-run-roadmap-fresh-mobile.png`

## 판정

첫 화면 가이드 패널과 메인 오피스 화면에서 30분 목표, 다음 보상, 현재 단계 실행/이동 컨트롤이 보인다. 클릭 후 피드백이 남고, 초반 버튼은 실제 상태를 전진시키며, 후반 2년차 버튼은 지시/연구/신제품 착수 체인을 실제 게임 로직으로 이어준다. 알파런 100% 상태에서는 완주 패널이 다음 개발 이슈, 출시 진행, 출시 결과 보기로 이어지는 보상감을 유지한다. 두 번째 출시 보상 대기 중에도 전체 알파런 목표는 100%로 남는다. 모바일 첫 캡처에서는 오피스 포커스 스트립이 첫 화면 상단 오피스 영역 안에 유지되고, 기존 세로 스택 구조상 가이드 상세가 아래로 밀리지만 레이아웃 깨짐이나 가로 넘침은 보이지 않았다.
