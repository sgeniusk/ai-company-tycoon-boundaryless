# v0.34.8-alpha 제작 보고서 — 채용 브랜드와 사무실 인재풀 연결

작성일: 2026-05-18

## 목표

채용 방식, 후보 풀, 직원 성장, 사무실 확장은 각각 존재하지만 아직 “좋은 사무실과 좋은 평판이 더 좋은 후보를 끌어온다”는 감각이 약했다. 이번 패스의 목표는 사무실 성장과 지역 이전, 장식 투자, 회사 신뢰가 채용 품질에 바로 영향을 준다는 운영 게임의 이유를 만드는 것이다.

## 이번 구현

- `getRecruitmentBrandProfile()`을 추가했다.
- 채용 브랜드 점수는 사무실 단계, 지역 인재풀, 회사 별 등급, 신뢰, 이용자 규모, 화제성, 장식 배치, 사무실 시너지, 빈 고용 슬롯을 합쳐 계산한다.
- 채용 브랜드가 높으면 채용 후보 풀 크기와 후보 정렬 점수에 보너스를 준다.
- 사무실 정원이 가득 차면 후보 풀 보너스가 0이 되고, 정원 압박 경고가 뜬다.
- 에이전트 도감 상단에 채용 브랜드 등급, 점수 바, 빈자리, 후보 풀 보너스, 상승 요인과 경고를 표시했다.
- 기존 공채/경력/헤드헌터 구조는 유지하면서 사무실 성장의 보상을 채용 화면에서 바로 읽히게 했다.

## 하네스 에이전트 검토

- Executive Producer Agent: P2 해결. 사무실 확장과 채용이 같은 운영 루프로 묶였다.
- Game Designer Agent: P1 해결. 도시 이전, 장식 배치, 신뢰 상승이 후보 풀이라는 즉각적 보상으로 이어진다.
- Systems Architect Agent: P2 양호. 브랜드 계산을 단일 함수로 분리했고 후보 풀/후보 점수/UI는 해당 값을 읽는다.
- QA Agent: P1 해결. 브랜드 점수 상승, 후보 풀 확장, 만석 사무실 경고를 테스트로 고정했다.
- Balance Agent: P2 관찰. 후보 풀 상한은 공채 8명, 경력 7명, 헤드헌터 6명으로 제한해 과도한 후보 폭발을 막았다.
- UX Agent: P2 해결. 도감 상단에서 “왜 후보가 늘었는지”와 “왜 막혔는지”를 읽을 수 있다.
- Retention / LTV Agent: P2 양호. 사무실 확장/장식 투자의 장기 동기가 더 또렷해졌다.
- Solo Dev Scope Agent: P2 양호. 신규 대형 데이터 없이 기존 사무실/지역/아이템 데이터를 재사용했다.

## 남은 작업

- 스카우트 제안, 번아웃, 불만 이벤트를 후보/직원 드라마로 추가.
- 채용 브랜드가 특정 직군 후보 출현 확률에 더 구체적으로 영향을 주게 조정.
- 만석 상태에서 “사무실 확장 바로가기” 같은 UI 액션 추가.
- 20인 페르소나 테스트에서 에이전트 화면의 정보 밀도를 다시 점검.

## 최종 검증 기록

- `npm test -- src/game/recruitment.test.ts` 통과, 1 file / 9 tests
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 25 tests
- `npm test -- src/game/recruitment.test.ts src/game/office.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 71 tests
- `npm run harness:gate` 통과, 38 files / 255 tests
- 데이터 검증 통과
- 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5195/?scenario=staffing&menu=agents`에서 채용 브랜드 패널 1개, 콘솔 오류 0건, 모바일 가로 오버플로 없음 확인
- QA 관찰 텍스트: `지역 채용 브랜드 22`, `빈 자리 1명`, `후보 풀 +0`, `남은 자리가 1명이라 채용 결정 압박이 큽니다.`
- 스크린샷: `/tmp/ai-company-v0348-recruitment-brand-desktop.png`, `/tmp/ai-company-v0348-recruitment-brand-mobile.png`
