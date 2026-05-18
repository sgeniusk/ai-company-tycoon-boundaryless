# Changelog — AI Company Tycoon: Boundaryless

이 파일은 최근 주요 변경만 축약해서 남긴다. 세부 검증 기록은 `reports/`의 버전별 보고서를 기준으로 한다.

---

## [0.41-alpha] — 2026-05-19

### 사무실 픽셀 시뮬레이션 1차

**추가:**
- `data/office_scene.json`을 추가해 사무실 배경 오브젝트를 데이터 기반으로 관리한다.
- `getOfficeScenePlan()`을 추가해 현재 사무실 단계, 활성 구획, 프로젝트 배치, 직원 상태를 한 화면용 시각 계획으로 변환한다.
- 사무실 플레이필드에 픽셀 그리드, 구획 오브젝트, 사람/AI/로봇 액터, 작업/휴식/경고 말풍선을 표시한다.
- `office-visuals` QA 시나리오를 추가해 구획, 사람, AI, 로봇이 함께 보이는 상태를 바로 열 수 있게 했다.

**검증:**
- `npm test -- src/game/office-scene.test.ts src/game/qa-scenarios.test.ts src/game/content-expansion.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 64 tests
- `npm run harness:gate` 통과, 40 files / 285 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5201/?scenario=office-visuals`에서 구획 오브젝트 10개, 표시 액터 6명/기, 로봇 1기, 작업 상태 1명, 경고 상태 1명, 운영 의제 카드 3개, 가로 오버플로 없음, 콘솔 오류 0건 확인

---

## [0.40-alpha] — 2026-05-19

### 회사 운영 완성축: 월간 운영 의제와 구획 효과 연결

**추가:**
- `getOperationsCommandPlan()`을 추가해 현금 흐름, 인사 사건, 개발 프로젝트, 다음 사무실 구획, 경쟁사 압박을 월간 운영 의제로 묶었다.
- 사무실 화면 안에 `운영 의제` 패널을 추가했다. 이제 게임 화면에서 바로 이번 달 우선순위 3개와 이동 메뉴를 볼 수 있다.
- `operations` QA 시나리오를 추가해 v0.40 운영 화면을 바로 열 수 있게 했다.
- 복지 라운지가 가동 중이면 미해결 인사 후폭풍의 체력/충성도/프로젝트 손실을 완화한다.
- 로봇 고용 베이가 가동 중이면 경력 채용/헤드헌터 후보 풀에서 로봇 후보가 더 잘 노출된다.

**검증:**
- `npm test -- src/game/operations-command.test.ts src/game/staff-career.test.ts src/game/recruitment.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 5 files / 99 tests
- `npm run harness:gate` 통과, 39 files / 281 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5201/?scenario=operations`에서 운영 의제 패널 1개, 의제 카드 3개, 모바일 폭 510px 기준 표시 카드 2개, 콘솔 오류 0건, 가로 오버플로 없음 확인

---

## [0.35-alpha] — 2026-05-19

### v0.4 회사 운영/공간 성장 구획 시스템

**추가:**
- `data/office_zones.json`을 추가해 사무실 구획을 데이터 기반으로 관리한다.
- 차고형 연구실부터 창업자 지휘 데스크, 연산 베이, 채용 코너, 런칭 무대, 복지 라운지, 로봇 고용 베이, 칩 실험 랩, 경계 없는 쇼룸까지 8개 구획을 준비했다.
- 사무실 단계, 활성 제품 수, 고용 인력, 연구 레벨, 해금 산업, 보유 자원에 따라 구획이 가동되거나 잠긴다.
- 가동 중인 구획의 월간 효과가 실제 월간 경제에 합산된다.
- 회사 화면과 상점/인벤토리 화면에 `사무실 구획` 패널을 추가해 현재 가동 구획과 다음 구획 조건을 보여준다.
- 상단 사무실 HUD에도 가동 구획 수를 노출한다.

**검증:**
- `npm test -- src/game/office.test.ts src/game/content-expansion.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 36 tests

---

## [0.34.14-alpha] — 2026-05-18

### 인사 후폭풍 제품 개발 영향

**추가:**
- 미해결 인사 사건 후폭풍이 이제 현재 배치된 제품 프로젝트의 진행도와 완성도를 직접 깎는다.
- 후폭풍별 프로젝트 손실 수치를 `data/balance.json`으로 분리해 밸런스 하네스에서 조정하기 쉽게 만들었다.
- 월간 보고에 `인사 후폭풍` 행을 추가해 몇 건의 방치가 어떤 프로젝트 손실/자원 손실로 이어졌는지 보여준다.
- 사무실 중앙 경보가 최근 월간 후폭풍 요약을 우선 노출해, 다음 달 버튼을 누른 직후 손실 원인을 놓치지 않게 했다.
- 에이전트 콘솔의 후폭풍 카드에 프로젝트 영향 라벨을 추가했다.

**검증:**
- `npm test -- src/game/staff-career.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 85 tests
- `npm run harness:gate` 통과, 38 files / 275 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5201/?scenario=staff-aftermath&menu=agents`에서 후폭풍 패널 1개, 후폭풍 카드 2개, 프로젝트 영향 라벨, 월간 후폭풍 행, 사무실 운영 경보, 콘솔 오류 0건 확인
- 가로 오버플로 없음 확인, 스크린샷 `/tmp/ai-company-v03414-staff-aftermath-desktop.png`

---

## [0.34.13-alpha] — 2026-05-18

### 인사 사건 미대응 후폭풍

**추가:**
- 인사 사건을 해결하지 않고 다음 달로 넘기면 `미대응 후폭풍` 기록이 남는다.
- 번아웃 방치는 체력/충성도 손실, 스카우트 방치는 충성도 손실과 경쟁사 모멘텀 상승, 계약 불만 방치는 현금/신뢰/충성도 손실로 이어진다.
- 인사 사건 카드에 `방치 시` 후폭풍 미리보기를 추가했다.
- 에이전트 콘솔에 `최근 인사 후폭풍` 패널을 추가해 방치 결과를 대응 기록과 분리해서 보여준다.
- 회사 기록의 공유 순간 카드가 후폭풍을 `스카우트 방어`가 아니라 `스카우트 후폭풍`으로 표시한다.
- 브라우저 QA용 `staff-aftermath` 시나리오를 추가했다.

**검증:**
- `npm test -- src/game/staff-career.test.ts src/game/qa-scenarios.test.ts src/game/shareable-moments.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 89 tests
- `npm run harness:gate` 통과, 38 files / 274 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5200/?scenario=staff-aftermath&menu=agents`에서 후폭풍 패널 1개, 후폭풍 카드 2개, 방치 경고 3개, 콘솔 오류 0건 확인
- 데스크톱 QA: 후폭풍 패널이 첫 확인 영역에 보이고, 가로 오버플로 없음 확인
- 모바일 QA: 390×844에서 후폭풍 패널/카드 DOM 유지, 하단 탭 표시, 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v03413-staff-aftermath-desktop.png`, `/tmp/ai-company-v03413-staff-aftermath-mobile.png`

---

## [0.34.12-alpha] — 2026-05-18

### 경쟁사 스카우트 상세 조건

**추가:**
- 스카우트 인사 사건이 이제 가장 위협적인 경쟁사의 이름, 점유율, 모멘텀, 제안 조건을 표시한다.
- 스카우트 제안 조건은 직원 레벨, 현재 유지비, 경쟁사 점유율/공격성에 따라 연봉 배율과 사이닝 보너스로 계산된다.
- 에이전트 콘솔의 인사 사건 카드에 `staff-incident-source` 블록을 추가해 경쟁사와 제안 조건을 따로 읽을 수 있게 했다.
- 리텐션 보너스나 창업 미션 설득 결과 기록에도 경쟁사 이름과 시장 압박을 남긴다.
- 회사 기록의 인사 사건 하이라이트 카드가 스카우트 방어 시 경쟁사 이름과 점유율을 제목/본문에 포함한다.

**검증:**
- `npm test -- src/game/staff-career.test.ts src/game/shareable-moments.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 84 tests
- `npm run harness:gate` 통과, 38 files / 269 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5199/?scenario=staff-incidents&menu=agents`에서 인사 사건 패널 1개, 스카우트 출처 블록 1개, 대응 버튼 6개, 콘솔 오류 0건 확인
- 해결 QA: 리텐션 보너스 클릭 후 최근 인사 대응 패널 1개, 결과 카드 1개, 경쟁사 이름/점유율 문구 유지, 결과 카드 줄바꿈 깨짐 없음 확인
- 모바일 QA: 390×844에서 스카우트 출처 블록 1개, 하단 탭 표시, 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v03412-poaching-offer-desktop.png`, `/tmp/ai-company-v03412-poaching-resolution-desktop.png`, `/tmp/ai-company-v03412-poaching-mobile.png`

---

## [0.34.11-alpha] — 2026-05-18

### 인사 대응 결과 카드

**추가:**
- 인사 사건 대응 결과를 `recentStaffIncidentResolutions`에 저장한다.
- `getRecentStaffIncidentResolutionLog()`를 추가해 최근 대응 기록을 최신순으로 가져온다.
- 에이전트 콘솔에 `최근 인사 대응` 결과 패널을 추가해 선택 결과와 효과를 바로 보여준다.
- 회사 기록의 공유 가능한 순간 카드에 `staff` 타입을 추가해 인사 사건도 스크린샷감 회사 드라마로 남는다.
- 브라우저 QA용 `staff-resolution` 시나리오를 추가했다.
- 세이브 버전을 11로 올리고, 오래된 저장 데이터는 대응 기록이 없어도 안전하게 복구되도록 했다.

**검증:**
- `npm test -- src/game/staff-career.test.ts src/game/shareable-moments.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 81 tests
- `npm run harness:gate` 통과, 38 files / 266 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5198/?scenario=staff-resolution&menu=agents`에서 최근 인사 대응 패널 1개, 결과 카드 1개, 사건 패널 1개, 콘솔 오류 0건 확인
- 회사 기록 QA: `?scenario=staff-resolution&menu=log`에서 하이라이트 카드 2개와 인사 사건 공유 카드 문구 확인
- 모바일 QA: 390×844에서 결과 카드 1개, 하단 탭 표시, 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v03411-staff-resolution-desktop.png`, `/tmp/ai-company-v03411-staff-resolution-log-desktop.png`, `/tmp/ai-company-v03411-staff-resolution-mobile.png`

---

## [0.34.10-alpha] — 2026-05-18

### 인사 사건 선택형 대응

**추가:**
- 인사 사건마다 2개의 대응 선택지를 계산하는 `getStaffIncidentResolutionOptions()`를 추가했다.
- `resolveStaffIncident()`가 선택지에 따라 비용, 체력, 충성도, 연봉 압박, 자원 보상, 프로젝트 배치, 타임라인을 실제로 갱신한다.
- 번아웃은 `회복일 지정`과 `백업 교대`, 스카우트 제안은 `리텐션 보너스`와 `창업 미션 설득`, 계약 불만은 `조건 재조정`과 `1:1 면담`으로 갈라진다.
- 에이전트 콘솔의 인사 사건 카드가 단일 처리 버튼 대신 2버튼 선택 UI를 표시한다.
- 회복일 지정은 배치 중인 직원을 프로젝트에서 빼고, 리텐션 보너스는 충성도를 올리는 대신 장기 연봉 압박을 키운다.

**검증:**
- `npm test -- src/game/staff-career.test.ts` 통과, 1 file / 20 tests
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 25 tests
- `npm test -- src/game/staff-career.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 75 tests
- `npm run harness:gate` 통과, 38 files / 262 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser QA: `http://127.0.0.1:5197/?scenario=staff-incidents&menu=agents`에서 인사 사건 패널 1개, 사건 카드 3개, 선택 버튼 6개, 콘솔 오류 0건 확인
- 모바일 QA: 390×844에서 선택 버튼 6개, 하단 탭 표시, 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v03410-staff-incident-resolutions-desktop.png`, `/tmp/ai-company-v03410-staff-incident-resolutions-mobile.png`

---

## [0.34.9-alpha] — 2026-05-18

### 직원 사건 드라마

**추가:**
- 직원 상태에서 번아웃, 경쟁사 스카우트 제안, 계약 불만 사건 후보를 계산하는 `getStaffIncidentBriefs()`를 추가했다.
- 체력, 레벨, 충성도, 계약 방식, 연봉 배율을 바탕으로 사건 심각도와 권장 액션을 만든다.
- 에이전트 콘솔 상단에 `인사 사건` 패널을 추가해 위험 직원, 이유, 추천 조치를 바로 볼 수 있게 했다.
- 사건 카드에서 가능한 경우 `휴식` 또는 `연봉 협상`을 바로 실행할 수 있다.
- 브라우저 QA용 `staff-incidents` 시나리오를 추가했다.

**검증:**
- `npm test -- src/game/staff-career.test.ts` 통과, 1 file / 17 tests
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 25 tests
- `npm test -- src/game/qa-scenarios.test.ts` 통과, 1 file / 30 tests
- `npm test -- src/game/staff-career.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 72 tests
- `npm run harness:gate` 통과, 38 files / 259 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5196/?scenario=staff-incidents&menu=agents`에서 인사 사건 패널 1개, 사건 카드 3개, 콘솔 오류 0건, 모바일 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v0349-staff-incidents-desktop.png`, `/tmp/ai-company-v0349-staff-incidents-mobile.png`

---

## [0.34.8-alpha] — 2026-05-18

### 채용 브랜드와 사무실 인재풀 연결

**추가:**
- 사무실 단계, 지역, 장식 배치, 사무실 시너지, 신뢰/이용자 규모, 빈 고용 슬롯을 합쳐 `채용 브랜드` 점수를 계산한다.
- 채용 브랜드가 높으면 공채/경력/헤드헌터 후보 풀 크기와 후보 정렬 점수에 보너스를 준다.
- 사무실 정원이 가득 차면 후보 풀 보너스가 막히고, 에이전트 콘솔에 정원 압박 경고가 표시된다.
- 에이전트 도감 상단에 채용 브랜드 점수, 빈자리, 후보 풀 보너스, 주요 상승 요인/경고를 표시했다.

**검증:**
- `npm test -- src/game/recruitment.test.ts` 통과, 1 file / 9 tests
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 25 tests
- `npm test -- src/game/recruitment.test.ts src/game/office.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 71 tests
- `npm run harness:gate` 통과, 38 files / 255 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5195/?scenario=staffing&menu=agents`에서 채용 브랜드 패널 1개, 콘솔 오류 0건, 모바일 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v0348-recruitment-brand-desktop.png`, `/tmp/ai-company-v0348-recruitment-brand-mobile.png`

---

## [0.34.7-alpha] — 2026-05-18

### 직원 장기 성장 전문화

**추가:**
- Lv.3부터 직원이 성장 방향 2개 중 하나를 전문화로 선택할 수 있다.
- 전문화 후보는 각 직원의 기본 능력치 상위 2개에서 자동 생성된다.
- 전문화를 선택하면 해당 능력치에 집중 보너스가 붙고, 선택한 달과 전문화 방향이 직원 데이터에 저장된다.
- 이미 선택한 전문화는 바꿀 수 없도록 막아 장기 육성 선택의 무게를 만들었다.
- 에이전트 카드에 전문화 패널과 선택 버튼을 추가했다.

**검증:**
- `npm test -- src/game/staff-career.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 39 tests
- `npm test -- src/game/staff-career.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 68 tests
- `npm run harness:gate` 통과, 38 files / 253 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5194/?scenario=staffing&menu=agents`에서 전문화 패널 2개, 콘솔 오류 0건, 모바일 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v0347-staff-specialization-desktop.png`, `/tmp/ai-company-v0347-staff-specialization-mobile.png`

---

## [0.34.6-alpha] — 2026-05-18

### 직원 성격과 선호 장비 보너스

**추가:**
- 에이전트 카드에 성격 특성, 성장 방향, 선호 장비 목록을 표시했다.
- 기존 `preferred_items` 데이터를 실제 규칙으로 연결해 선호 장비를 장착하면 주 성장 능력치 2개에 보너스가 붙는다.
- 선호 장비를 쓰는 직원은 월간 충성도도 소폭 더 안정된다.
- 선호 장비 매칭 여부를 카드 안에서 녹색 배지로 표시해 어떤 장비를 누구에게 줘야 하는지 읽기 쉽게 했다.

**검증:**
- `npm test -- src/game/staff-career.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 36 tests
- `npm test -- src/game/staff-career.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 65 tests
- `npm run harness:gate` 통과, 38 files / 250 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5193/?scenario=staffing&menu=agents`에서 성격/선호 장비 패널 2개씩, 콘솔 오류 0건, 모바일 가로 오버플로 없음 확인
- 스크린샷: `/tmp/ai-company-v0346-staff-personality-desktop.png`, `/tmp/ai-company-v0346-staff-personality-mobile.png`

---

## [0.34.5-alpha] — 2026-05-18

### 직원 케어 액션과 실제 퇴사 리스크

**추가:**
- 직원 카드에 `휴식`, `연봉 협상` 액션을 추가했다.
- 휴식은 즉시 비용을 쓰고 에너지와 충성도를 회복한다. 단, 프로젝트 투입 중인 직원은 쉴 수 없다.
- 연봉 협상은 큰 비용을 쓰고 충성도를 회복하지만, 다음 달부터 월 유지비와 연봉 배율이 오른다.
- 충성도가 0까지 떨어진 직원은 월 넘김 때 실제로 퇴사하며, 프로젝트 배치에서도 자동 제거된다.
- 월말 제품 개발 로그가 인사 사건을 덮어쓰던 문제를 고쳐 퇴사/인사 경고가 타임라인에 남도록 했다.

**검증:**
- `npm test -- src/game/staff-career.test.ts` 통과, 1 file / 8 tests
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 25 tests
- `npm test -- src/game/staff-career.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 33 tests
- `npm test -- src/game/staff-career.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 62 tests
- `npm run harness:gate` 통과, 38 files / 247 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5192/?scenario=staffing&menu=agents`에서 케어 액션 2세트, 경험치 바 2개, 충성도 배지 2개, 콘솔 오류 0건 확인
- 스크린샷: `/tmp/ai-company-v0345-staff-care-desktop.png`, `/tmp/ai-company-v0345-staff-care-mobile.png`

---

## [0.34.4-alpha] — 2026-05-18

### 직원 성장과 충성도 경고

**추가:**
- 고용 인력에 `경험치`, `충성도`, `근속 개월`을 추가했다.
- 매월 배치된 인력은 프로젝트 경험치를 더 많이 얻고 에너지가 줄어든다.
- 경험치가 기준치를 넘으면 레벨업하며, 레벨 보너스가 실제 유효 능력치에 반영된다.
- 계약 압박, 현금 부족, 과로 상태에 따라 충성도가 흔들리고 이직 위험 경고가 표시된다.
- 에이전트 카드에 경험치 바, 충성도, 성장 보너스, 유지비/계약 배지를 함께 표시한다.

**검증:**
- `npm test -- src/game/staff-career.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 28 tests
- `npm test -- src/game/staff-career.test.ts src/game/simulation.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 57 tests
- `npm run harness:gate` 통과, 38 files / 242 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5191/`에서 고용 후 경험치 바 1개, 충성도 배지 1개, 콘솔 오류 0건 확인
- 스크린샷: `/tmp/ai-company-v0344-staff-career-desktop.png`, `/tmp/ai-company-v0344-staff-career-mobile.png`

---

## [0.34.3-alpha] — 2026-05-17

### 월간 채용 후보 풀

**추가:**
- 채용 방식별로 이번 달 후보 풀이 제한되어 보이도록 했다.
- 후보 풀은 월, 지역, 회사 등급, 채용 방식, 에이전트 종류/희귀도/능력치/해금 조건을 바탕으로 결정된다.
- 공채는 지역 사람 직원과 초반 인재를, 경력 채용은 실무형 후보를, 헤드헌터는 고급 후보를 우선한다.
- 이미 고용한 인력은 다음 후보 풀에서 제외된다.
- 에이전트 콘솔에 `후보 수`, `지역 인재풀`, `다음 후보 갱신 월`을 표시한다.

**검증:**
- `npm test -- src/game/recruitment.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 32 tests
- `npm run harness:gate` 통과, 37 files / 239 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5190/`에서 공채 5명, 경력 채용 4명, 헤드헌터 3명 후보 풀 표시, 콘솔 오류 0건 확인
- 스크린샷: `/tmp/ai-company-v0343-candidate-pool-desktop.png`, `/tmp/ai-company-v0343-candidate-pool-mobile.png`

---

## [0.34.2-alpha] — 2026-05-17

### 채용 방식과 연봉 계약

**추가:**
- 에이전트 도감에 `공채`, `경력 채용`, `헤드헌터` 채용 방식을 추가했다.
- 공채는 현재 지역의 사람 직원 채용 할인과 낮은 유지비를 살리고, 경력 채용과 헤드헌터는 더 높은 채용비/연봉 대신 능력치 보정을 제공한다.
- 고용된 직원/에이전트는 채용 경로, 계약 품질, 리스크 라벨, 월 유지비를 보존한다.
- 월간 비용 계산이 추상 인재 수만 보지 않고 실제 계약 유지비를 반영한다.
- 우측 에이전트 콘솔을 1열 리스트로 조정해 좁은 게임 화면 안에서 한글 카드가 세로로 말리지 않게 했다.

**검증:**
- `npm test -- src/game/recruitment.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 29 tests
- `npm run harness:gate` 통과, 37 files / 236 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome QA: `http://127.0.0.1:5189/`에서 에이전트 메뉴 진입, 채용 방식 3종 표시, 헤드헌터 선택, 계약 배지 표시, 콘솔 오류 0건 확인
- 스크린샷: `/tmp/ai-company-v0342-recruitment-desktop.png`, `/tmp/ai-company-v0342-recruitment-mobile.png`

---

## [0.34.1-alpha] — 2026-05-17

### 게임 화면 조작 레이어

**추가:**
- 우측 메뉴 레일을 핵심 4개 메뉴와 보조 4개 메뉴로 나눠 시각 위계를 강화했다.
- 모바일에서는 `회사`, `제품`, `덱`, `에이전트`, `더보기` 5탭 구조로 전환한다.
- 사무실 플레이필드 안에 `고용`, `개발`, `전략`, `꾸미기` 액션 슬롯을 추가했다.
- 경쟁사 모멘텀이나 현재 경쟁 이벤트를 사무실 안 `경쟁 속보` 배너로 표시한다.
- 레이아웃 계약 테스트에 v0.34.1 UI 조작 레이어 게이트를 추가했다.

**검증:**
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 24 tests
- `npm run harness:gate` 통과, 36 files / 231 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser CDP QA: `http://127.0.0.1:5188/?scenario=campaign-shock&menu=company`에서 데스크톱 핵심/보조 메뉴 4+4, 사무실 액션 슬롯 4개, 경쟁 속보 배너 확인
- 모바일 QA: 5탭, 더보기 보조 메뉴 4개, 액션 슬롯 4개, 목표/경쟁/자원/명령 겹침 없음, 가로 오버플로 없음 확인
- Headless Chrome screenshot QA: 데스크톱 `/tmp/ai-company-v0341-navigation-desktop.png`, 모바일 `/tmp/ai-company-v0341-navigation-mobile.png`

---

## [0.34-alpha] — 2026-05-17

### 그래픽 전 UI 셸 전환 1차

**추가:**
- Claude 디자인 외주 분석 결과를 v0.34 UI 게이트로 반영했다.
- `1366×768` 데스크톱 셸과 `390×844` 모바일 셸 기준 변수를 추가했다.
- 상단 상태바 아래에 TOP3 경쟁사 HUD를 추가해 시장 압박을 첫 화면에서 볼 수 있게 했다.
- 사무실 안에 `이번 달 목표` 스트립을 추가해 다음 행동을 게임 화면 내부에 고정했다.
- 하단 명령줄에 전략 손패, 덱/버림 수, 카드 비용을 항상 표시한다.
- 자원 HUD에 전월 변화량과 위험 자원 강조를 추가했다.
- 브라우저 기본 파비콘 404를 없애기 위해 데이터 URI 파비콘을 추가했다.

**검증:**
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 22 tests
- `npm run harness:gate` 통과, 36 files / 229 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser CDP QA: `http://127.0.0.1:5187/?scenario=campaign-shock&menu=company`에서 v0.34 셸, 목표 스트립, 하단 손패, 경쟁사 HUD, 자원 변화량, 데스크톱/모바일 가로 오버플로 없음 확인
- Headless Chrome screenshot QA: 데스크톱 `/tmp/ai-company-v034-ui-shell-desktop.png`, 모바일 `/tmp/ai-company-v034-ui-shell-mobile.png`

---

## [0.33-alpha] — 2026-05-17

### 10년 캠페인 시장 충격

**추가:**
- `data/campaign_shocks.json`을 추가해 3년차, 6년차, 9년차 시장 충격을 데이터화했다.
- `applyDueCampaignShocks()`와 `getCampaignShockForecast()`를 추가해 캠페인 진행 중 충격 적용, 예보, 완료 이력을 계산한다.
- 3년차 `파운데이션 모델 전쟁`, 6년차 `연산 공급 대란`, 9년차 `경계 없는 산업 붐`이 자원, 신뢰, 경쟁사 모멘텀, 추천 제품/연구 방향에 영향을 준다.
- 회사 메뉴 상단에 `시장 충격 예보` 패널을 추가해 다음 충격, 적용 완료 여부, 대응 제품/연구/경쟁 메뉴 이동을 보여준다.
- 10년 시뮬레이션 하네스가 시장 충격 마일스톤 3개를 기록하고, 세이브 복구/상태 무결성/데이터 검증도 충격 이력을 검사한다.
- `campaign-shock` QA 시나리오를 추가해 3년차 충격 적용 직후 화면을 바로 열 수 있다.

**검증:**
- `npm test -- src/game/campaign-shocks.test.ts src/game/run-simulator.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 60 tests
- `npm run harness:gate` 통과, 36 files / 227 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser DOM QA: `http://127.0.0.1:5185/?scenario=campaign-shock&menu=company`에서 시장 충격 패널, 적용 완료 상태, 추천 대응, 콘솔 오류 0건 확인
- Headless Chrome screenshot QA: 데스크톱 `/tmp/ai-company-v033-campaign-shock-desktop.png`, 모바일 `/tmp/ai-company-v033-campaign-shock-mobile.png`

---

## [0.32-alpha] — 2026-05-17

### 로그라이트 재시작 설계실

**추가:**
- `getNextRunSetupPlan()`을 추가해 종료 직전 런을 다음 런 추천 해금, 시작 덱, 빠른 시작 선택으로 변환한다.
- 현금 흐름 붕괴, 신뢰도 위험, 자동화 부족, 첫 출시 지연, 경쟁사 모멘텀 과열을 재시작 경고로 표시한다.
- 메타 해금 후보를 `품질/신뢰`, `성장/리텐션`, `운영 자동화`, `경쟁/기업`, `하드웨어/연구`, `경계 확장` 카테고리로 정리한다.
- 덱 메뉴 상단에 `다음 런 설계실`을 추가해 안전 재시작, 추천 해금, 현재 덱 유지 중 하나를 바로 선택할 수 있게 했다.
- `restart-setup` QA 시나리오를 추가해 새 런을 수락하기 전의 재시작 설계 화면을 바로 열 수 있다.
- 도우미 캐릭터 `미나`가 10개월 이후 처음 덱 메뉴에 들어오면 다음 런 설계실을 안내한다.

**검증:**
- `npm test -- src/game/meta-progression.test.ts src/game/qa-scenarios.test.ts src/game/tutorial-guide.test.ts src/ui/layout-contract.test.ts` 통과, 4 files / 53 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- `npm run harness:gate` 통과, 35 files / 221 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Browser DOM QA: `http://127.0.0.1:5184/?scenario=restart-setup&menu=deck`에서 다음 런 설계실, 빠른 시작, 추천 해금, 콘솔 오류 0건 확인
- Headless Chrome screenshot QA: 데스크톱 `/tmp/ai-company-v032-restart-setup-desktop.png`, 모바일 `/tmp/ai-company-v032-restart-setup-mobile.png`

---

## [0.31-alpha] — 2026-05-17

### 덱 시너지와 빌드 보너스

**추가:**
- `data/deck_synergies.json`을 추가해 덱 시너지 5종을 데이터화했다.
- 카드 태그가 조건을 채우면 `런칭 머신`, `신뢰 하네스`, `자동화 복리`, `연구 플라이휠`, `라이벌 대응 셀`이 활성화된다.
- 활성 덱 시너지는 월간 전략 효과에 합산되고, 관련 태그 카드의 긍정 효과를 소폭 강화한다.
- 덱 메뉴에 활성 시너지, 월간 효과, 카드 보너스 배율, 다음 후보 진행률, 부족 태그를 표시한다.
- `deck-synergy` QA 시나리오를 추가해 브라우저에서 활성 빌드 상태를 바로 열 수 있게 했다.

**검증:**
- `npm test -- src/game/qa-scenarios.test.ts src/game/deckbuilding.test.ts src/ui/layout-contract.test.ts` 통과, 3 files / 63 tests
- `npm run harness:gate` 통과, 34 files / 216 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5183/?scenario=deck-synergy&menu=deck` 데스크톱/모바일 렌더링 확인

---

## [0.30-alpha] — 2026-05-17

### 도우미 캐릭터 튜토리얼

**추가:**
- 도우미 캐릭터 `미나`가 첫 시작, 첫 고용, 제품 조합실, 개발 프로젝트, 카드 보상, 사무실 성장, 경쟁사 압박을 순차적으로 안내한다.
- 튜토리얼 안내는 `seenTutorials`로 저장되어 한 번 읽은 안내가 반복 노출되지 않는다.
- 안내 액션 버튼은 관련 메뉴로 이동하면서 해당 튜토리얼을 읽음 처리한다.
- 로그라이트 새 런을 시작해도 이미 본 튜토리얼은 유지되어 반복 플레이를 방해하지 않는다.
- 고정 게임 화면 안에 픽셀풍 도우미 말풍선을 추가해 새 기능을 웹페이지 설명문이 아니라 게임 내 안내로 전달한다.

**검증:**
- `npm test -- src/game/tutorial-guide.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 20 tests
- 전체 하네스와 브라우저 QA 결과는 `reports/qa/alpha_v0_30_qa.md`에 기록한다.

---

## [0.29-alpha] — 2026-05-17

### 사무실 성장 플래너와 공간 선택 강화

**추가:**
- `getOfficeGrowthPlan()`을 추가해 현재 사무실, 다음 확장, 다음 지역 이전, 활성/다음 장식 시너지를 한 번에 계산한다.
- 사무실 성장 플래너가 팀 수용 한도, 장식 슬롯, 다음 시너지에 따라 우선 행동을 추천한다.
- 다음 장식 시너지를 완성할 구매/배치 후보를 점수화하고 상점 콘솔에서 바로 실행할 수 있게 했다.
- 상점의 사무실 패널에 `사무실 확장 vs 지역 이전` 비교 카드를 추가했다.
- 배치된 장식이 활성 시너지에 어떻게 연결되는지 추적할 수 있는 기반 데이터를 추가했다.

**검증:**
- `npm test -- src/game/office-growth.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 18 tests
- `npm run harness:gate` 통과, 33 files / 208 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5181/?scenario=office&menu=shop` 데스크톱/모바일 렌더링 확인

---

## [0.28-alpha] — 2026-05-17

### 조합형 제품과 리뉴얼의 실제 개발 루프 연결

**추가:**
- 아이디어 조합실 결과를 실제 `ProductDefinition`으로 변환해 개발 프로젝트를 시작할 수 있게 했다.
- 조합형 제품은 출시 전에는 개발 프로젝트로만 존재하고, 완성 후 정식 활성 제품/리뷰/카드 보상/월간 경제에 포함된다.
- 출시한 기존 제품은 `메이저 업데이트`, `리뉴얼 출시`, `파생 제품` 후보 중 하나를 골라 리뉴얼 개발 프로젝트로 진행할 수 있다.
- 리뉴얼 프로젝트는 즉시 레벨업이 아니라 개발 기간을 거친 뒤 `AI 글쓰기 비서 v2` 같은 출시명으로 시장 반응을 만든다.
- 생성 제품 저장/불러오기 호환을 위해 세이브 버전을 8로 올리고 `generatedProducts`를 정식 상태에 추가했다.
- 제품 메뉴, 사무실 HUD, 덱 퍼즐, 런 요약, 출시 충격 패널이 생성 제품을 정식 제품처럼 읽도록 연결했다.

**검증:**
- `npm test -- src/game/product-concept-projects.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 18 tests
- `npm run validate:data` 통과
- `npm run harness:gate` 통과, 32 files / 205 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://172.20.10.3:5180/?scenario=launch-impact&menu=products` 데스크톱/모바일 렌더링 확인

---

## [0.27-alpha] — 2026-05-17

### 제품 아이디어 조합실과 리뉴얼 출시 기반

**추가:**
- `data/product_ideas.json`을 추가해 소재/산업 24개, 제품 타입 12개, 파격 옵션 18개, 특수 궁합 규칙 36개를 데이터화했다.
- `createProductConcept()` 조합 엔진을 추가해 모든 소재 × 타입 × 옵션 조합이 제목, 피치, 궁합 점수, 비용, 필요 역량, 강점/위험을 생성한다.
- 기존 제품을 `메이저 업데이트`, `리뉴얼 출시`, `파생 제품`으로 다시 출시할 수 있는 후보 모델을 추가했다.
- 제품 메뉴 상단에 `아이디어 조합실`과 `기존 제품 리뉴얼 후보` 패널을 추가했다.
- 데이터 검증 하네스가 제품 아이디어 데이터의 도메인, 역량, 조합 수, 궁합 규칙 수를 검사한다.

**검증:**
- `npm test -- src/game/product-ideas.test.ts src/ui/layout-contract.test.ts` 통과, 2 files / 19 tests
- `npm run validate:data` 통과
- `npm run harness:gate` 통과, 31 files / 202 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact&menu=products` 데스크톱/모바일 렌더링 확인

---

## [0.26-alpha] — 2026-05-17

### 게임 화면 프레임 2차 압축

**변경:**
- 전체 기준 폭을 1366px 게임 화면 프레임으로 조정하고 우측 상시 콘솔 폭을 줄였다.
- 중앙 사무실 영역을 더 넓히고, 사무실 안에 월/운영/사무실/프로젝트 상태 HUD를 직접 얹었다.
- 사무실 하단에 현재 운영 알림 스트립을 추가해 다음 행동과 이슈가 화면 안에서 보이게 했다.
- 우측 메뉴를 웹페이지형 패널이 아니라 어두운 관리 콘솔 프레임으로 재정리했다.
- 모바일 폭에서 상단 상태바를 4개 핵심 값으로 압축해 사무실 장면이 보이도록 했다.

**검증:**
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 14 tests
- `npm run harness:gate` 통과, 30 files / 197 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact` 데스크톱/모바일 렌더링 확인

---

## [0.25-alpha] — 2026-05-17

### 콘텐츠 가속과 엔딩 커버리지

**추가:**
- `evaluateEndToEndCampaignCoverage()`를 추가해 10년 엔딩, 카드 보상 선택, 사무실 성장 커버리지를 함께 검증한다.
- 전략 카드 풀을 19장으로 확장했다.
- 로그라이트 메타 해금을 8개로 확장했다.
- 시작 덱을 7개로 확장했다.
- 사무실 확장 단계를 6단계로 확장했다.
- 사무실 장식 시너지를 8개로 확장했다.
- 아이템 풀을 45개로 확장했다.

**검증:**
- `npm test -- src/game/run-simulator.test.ts src/game/content-expansion.test.ts` 통과, 2 files / 9 tests
- `npm run validate:data` 통과
- `npm run harness:gate` 통과, 30 files / 193 tests, 데이터 검증 통과, 프로덕션 빌드 통과

---

## [0.24-alpha] — 2026-05-17

### 게임 화면형 레이아웃 압축

**변경:**
- 왼쪽 세로 자원판을 하단 자원 HUD로 옮겼다.
- 명령 버튼을 하단 고정 컨트롤 스트립으로 압축했다.
- 데스크톱 그리드를 `상단 HUD / 중앙 사무실 / 우측 메뉴 / 하단 HUD` 구조로 재배치했다.
- 태블릿/모바일 폭에서도 페이지 전체 스크롤이 아니라 내부 패널 스크롤을 우선하도록 조정했다.
- 좁은 화면 가로 잘림을 막기 위해 주요 그리드 자식의 `min-width` 계약을 추가했다.

**검증:**
- `npm test -- src/ui/layout-contract.test.ts` 통과, 1 file / 10 tests
- `npm run harness:gate` 통과, 29 files / 190 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact` 데스크톱/모바일 렌더링 확인

---

## [0.23-alpha] — 2026-05-17

### 출시 체감과 공유 가능한 사건

**추가:**
- `v0.22` 출시 체감 패널을 추가했다.
- 출시 결과에 첫 5분 보상, 카드 보상, 카드 영향 배지를 표시한다.
- 최근 사용 카드가 개발 진행/완성도/신뢰 등에 준 영향을 출시 결과에서 보여준다.
- `?scenario=launch-impact` QA 시나리오를 추가했다.
- `evaluateSeasonChallengeBalance`로 시즌 과제 보상/압박 가드레일을 점검한다.
- `v0.23` 회사 기록 메뉴에 공유 가능한 하이라이트 카드를 추가했다.

**검증:**
- `npm test -- src/game/release-impact.test.ts src/game/shareable-moments.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/game/run-simulator.test.ts` 통과, 5 files / 42 tests
- `npm run harness:gate` 통과, 29 files / 186 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5180/?scenario=launch-impact` 렌더링 확인, `/tmp/ai-company-v023-launch-impact.png`

---

## [0.21-alpha] — 2026-05-17

### 20인 검증과 보조 패널 압축

**추가:**
- 20인 페르소나 데이터를 남성 10명, 여성 10명 구성으로 확장했다.
- 각 페르소나에 벤치마크와 우려점을 추가했다.
- `runPersonaPlaytestReview` 하네스를 추가해 평가 점수, 판정, 우선순위, 페르소나별 메모를 생성한다.
- `?scenario=persona20` QA 시나리오를 추가했다.
- 우측 보조 패널을 `목표 / 회사 / 월간 / 결과` 탭으로 압축했다.
- Vite `manualChunks`로 `react-vendor`, `game-data` 청크 분리를 시작했다.

**검증:**
- `npm test -- src/game/content.test.ts src/game/persona-playtest.test.ts src/game/qa-scenarios.test.ts src/ui/layout-contract.test.ts src/ui/build-config.test.ts` 통과, 5 files / 39 tests
- `npm run harness:gate` 통과, 27 files / 178 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5179/?scenario=persona20` 렌더링 확인

---

## [0.20-alpha] — 2026-05-17

### 플레이테스트 후보 슬라이스

**추가:**
- `v0.15.7` 시즌 과제 보상/압박을 월간 진행에 연결했다.
- `v0.16.0` 중앙 보조 패널 카드에 높이 제한과 내부 스크롤을 추가했다.
- `v0.17.0` 10년 엔딩 랭크/엔딩명/생존 연수를 런 기록에 저장한다.
- `v0.18.0` 제품 메뉴에 `경계 확장 목표`를 추가했다.
- `v0.19.0` `evaluateAlphaReadiness` 통합 준비도 하네스를 추가했다.
- `v0.20` `?scenario=readiness` 브라우저 QA 시나리오를 추가했다.

**검증:**
- `npm run harness:gate` 통과, 25 files / 173 tests
- 데이터 검증 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=readiness` 렌더링 확인

---

## [0.15.6-alpha] — 2026-05-17

### 시즌 대응 과제

**추가:**
- 경쟁사 시즌을 행동 목표로 바꾸는 `getCompetitionSeasonChallenges`를 추가했다.
- 최대 압박 경쟁사 대응 과제와 신규 경쟁자 파동 대응 과제를 생성한다.
- 각 과제에 보상 예상, 방치 위험, 추천 제품, 추천 대응 카드를 표시한다.
- 회사 현황의 시장 시즌 패널에서 첫 대응 과제로 이동할 수 있다.
- 경쟁 메뉴 상단에 시즌 대응 과제 목록을 추가했다.

**검증:**
- `npm test -- src/game/competition-signals.test.ts` 통과, 4 tests
- `npm test -- src/game/competition-signals.test.ts src/game/qa-scenarios.test.ts` 통과, 27 tests
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=ten-year-sim&menu=competition` 렌더링 확인

---

## [0.15.5-alpha] — 2026-05-17

### 경쟁사 시즌 브리프

**추가:**
- 현재 연차의 경쟁 상황을 요약하는 `getCompetitionSeasonBrief`를 추가했다.
- 올해 등장한 신규 경쟁사, 다음 예정 경쟁사, 최대 압박 경쟁사를 계산한다.
- 회사 현황 메뉴에 `시장 시즌` 패널을 추가했다.
- 경쟁 메뉴 상단에 `경쟁 시즌` 요약과 최대 압박 경쟁사를 표시한다.

**검증:**
- `npm test -- src/game/competition-signals.test.ts` 통과, 3 tests
- `npm test -- src/game/competition-signals.test.ts src/game/qa-scenarios.test.ts` 통과, 26 tests
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=ten-year-sim&menu=competition` 렌더링 확인

---

## [0.15.4-alpha] — 2026-05-17

### 회사 승급 트랙

**추가:**
- 현재 회사 단계와 다음 단계 조건을 계산하는 `getCompanyStageProgress`를 추가했다.
- 메인 사무실 옆 회사 단계 카드에 `다음 승급` 미니 체크리스트를 표시한다.
- 회사 현황 메뉴에 `회사 승급 트랙` 패널을 추가했다.
- 다음 별 등급까지 필요한 출시 제품, 이용자, 신뢰, 자동화, 해금 분야 등을 읽기 쉬운 값으로 표시한다.

**검증:**
- `npm test -- src/game/campaign.test.ts` 통과, 5 tests
- `npm test -- src/game/campaign.test.ts src/ui/layout-contract.test.ts` 통과, 7 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=growth` 렌더링 확인

---

## [0.4.2-alpha] — 2026-05-17

### 사무실 확장 월간 효과

**추가:**
- 사무실 확장 단계별 `monthly_effects`를 추가했다.
- 현재 사무실 단계의 월간 효과를 계산하는 `getOfficeMonthlyEffects`를 추가했다.
- 월간 진행 시 사무실 효과가 `strategyEffects`에 합산된다.
- 상점/인벤토리 패널에서 현재 사무실과 다음 확장의 월간 효과를 표시한다.

**검증:**
- `npm test -- src/game/office.test.ts src/game/qa-scenarios.test.ts` 통과, 31 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=office` 렌더링 확인

---

## [0.4.1-alpha] — 2026-05-17

### 사람/AI/로봇 인력 조합 시너지

**추가:**
- 인력 조합 시너지 데이터 `data/workforce_synergies.json`를 추가했다.
- 사람 직원, AI 에이전트, 로봇 인력 조합에 따라 프로젝트 진행/완성도 보너스를 계산한다.
- 제품 개발 예측과 실제 월간 개발 진행에 인력 조합 보너스를 반영했다.
- 에이전트 화면에 `팀 조합` 패널과 다음 후보를 표시했다.

**검증:**
- `npm test -- src/game/simulation.test.ts` 통과, 28 tests
- `npm test -- src/game/simulation.test.ts src/game/content-foundation.test.ts src/game/qa-scenarios.test.ts` 통과, 56 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=staffing&menu=agents` 렌더링 확인

---

## [0.4.0-alpha] — 2026-05-17

### 사무실 장식 조합 시너지

**추가:**
- 사무실 시너지 데이터 `data/office_synergies.json`를 추가했다.
- 배치된 장식 기준으로 활성 시너지와 다음 후보를 계산하는 `getOfficeSynergySummary`를 추가했다.
- 활성 사무실 시너지의 월간 효과가 운영 진행에 반영된다.
- 상점 상단과 인벤토리/투자 패널에 사무실 시너지 상태를 표시했다.

**검증:**
- `npm test -- src/game/office.test.ts` 통과, 7 tests
- `npm test -- src/game/office.test.ts src/game/qa-scenarios.test.ts` 통과, 30 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=office` 렌더링 확인

---

## [0.3-alpha completion] — 2026-05-17

### 덱빌딩과 로그라이트 깊이

**추가:**
- 덱 아키타입 데이터 `data/deck_archetypes.json`를 추가했다.
- 시작 덱 데이터 `data/starter_decks.json`를 추가했다.
- 현재 덱을 `신뢰 하네스`, `런칭 과열`, `자동화 운영`, `라이벌 카운터`, `연구 복리` 빌드로 평가하는 아키타입 요약을 추가했다.
- 메타 해금에 따라 다음 런의 시작 덱을 선택할 수 있게 했다.
- 덱 화면에 현재 빌드 패널과 다음 런 시작 덱 선택 영역을 추가했다.

**검증:**
- `npm test -- src/game/deckbuilding.test.ts` 통과, 16 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=deck` 렌더링 확인

---

## [0.15.3-playtest] — 2026-05-17

### 20인 페르소나 실제 실행 플레이테스트

**추가:**
- `reports/playtests/alpha_v0_15_3_persona20_playtest.md`에 실제 브라우저 렌더링 기반 20인 페르소나 플레이테스트 보고서를 추가했다.
- 첫 진입, 연간 전략 제품 메뉴, 10년 압축 캠페인 엔딩 상태를 각각 확인했다.
- 다음 개발 우선순위를 첫 30초 안내, 직원/에이전트 배치감, 출시 보상 연출, 우측 UI 압축, 덱 아키타입 표시로 정리했다.

**검증:**
- `npm run harness:gate` 통과, 158 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA 3종 통과: 첫 진입, 연간 전략 제품 메뉴, 10년 캠페인 엔딩

---

## [0.15.3-alpha] — 2026-05-17

### 10년 캠페인 압축 플레이 하네스

**추가:**
- `runTenYearCampaignSimulation` 장기 캠페인 하네스를 추가했다.
- 120개월 진행 결과, 연간 스냅샷, 연간 심사 통과 수, 운영 지시 선택 수, 주요 마일스톤을 기록한다.
- `?scenario=ten-year-sim` 브라우저 QA 시나리오를 추가했다.

**검증:**
- `npm test -- src/game/run-simulator.test.ts src/game/qa-scenarios.test.ts` 통과, 27 tests
- `npm run harness:gate` 통과, 158 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=ten-year-sim` 1366x768 렌더링 확인, 10년차 엔딩 화면 표시 확인

---

## [0.15.2-alpha] — 2026-05-17

### 전략실 추천 실행감

**추가:**
- 제품, 연구, 경쟁 메뉴에 `전략실 추천` 상단 포커스 스트립을 추가했다.
- 추천 대상 제품/연구/경쟁사 카드에 강조 스타일을 적용했다.
- QA URL에서 `menu` 파라미터로 초기 메뉴를 덮어쓸 수 있게 했다.

**검증:**
- `npm test -- src/game/annual-strategy-advisor.test.ts src/game/qa-scenarios.test.ts` 통과, 26 tests
- `npm run harness:gate` 통과, 156 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=annual-strategy&menu=products` 1366x768 렌더링 확인, 제품 메뉴 전략실 포커스 표시 확인

---

## [0.15.1-alpha] — 2026-05-16

### 연간 전략실 액션화와 문서 정리

**추가:**
- 연간 전략실 추천에 `제품 후보 보기`, `연구 후보 보기`, `경쟁 대응 보기` 액션을 추가했다.
- 회사 화면의 전략실 액션 버튼이 해당 메뉴로 이동한다.

**문서:**
- 로드맵을 현재 상태와 앞으로의 계획 중심으로 재작성했다.
- 변경 기록은 최근 주요 버전 중심으로 축약했다.

**검증:**
- `npm test -- src/game/annual-strategy-advisor.test.ts src/game/qa-scenarios.test.ts` 통과, 23 tests
- `npm run harness:gate` 통과, 153 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA: `http://127.0.0.1:5178/?scenario=annual-strategy` 1366x768 렌더링 확인, 전략실 액션 버튼 3종 표시 확인

---

## [0.15.0-alpha] — 2026-05-16

### 연간 전략실

활성 연간 운영 지시를 제품, 연구, 경쟁 대응 추천으로 확장했다. `?scenario=annual-strategy` QA 시나리오에서 회사 화면의 `연간 전략실`을 바로 확인할 수 있다.

**검증:**
- `npm run harness:gate` 통과, 153 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA 통과

---

## [0.14.9-alpha] — 2026-05-16

### 보상 카드 지시 보너스 배지

보상 카드별로 현재 연간 지시와 일치하는 태그를 보여 주는 `지시 보너스` 배지를 추가했다.

**검증:**
- `npm run harness:gate` 통과, 150 tests, 데이터 검증 통과, 프로덕션 빌드 통과
- Headless Chrome screenshot QA 통과

---

## [0.14.x-alpha] — 2026-05-16

### 연간 심사와 운영 지시 기반

10년 캠페인용 연간 심사, 통과/미달 보상, 다음 해 운영 지시, 연간 지시 3택1, 카드 보상 편향을 추가했다.

세부 기록:

- `reports/production_alpha_v0_14_3_annual_reviews.md`
- `reports/production_alpha_v0_14_4_annual_directives.md`
- `reports/production_alpha_v0_14_5_annual_directive_choices.md`
- `reports/production_alpha_v0_14_6_directive_card_rewards.md`
- `reports/production_alpha_v0_14_7_reward_bias_visibility.md`
- `reports/production_alpha_v0_14_8_reward_bias_qa.md`

---

## 이전 기록

`v0.13.x` 이전의 상세 로그는 `reports/`, `reports/qa/`, `reports/balance/`, `reports/playtests/` 폴더를 기준 기록으로 둔다.
