# 세션 핸드오프 — AI Company Tycoon: Boundaryless

작성일: 2026-05-19

## 한 줄 요약

현재 빌드는 `v0.42-alpha`다. **카이로소프트식 AI 회사 경영 + 로그라이트 덱빌딩 + 10년 캠페인 + 경계 없는 산업 확장**을 목표로 하며, 그래픽 최종 에셋 전 단계에서 “한 화면 게임처럼 보이는 알파”를 만드는 중이다.

## 현재 작업 위치

- 로컬 폴더: `/Users/taewookkim/Downloads/ai-company-tycoon`
- GitHub: `https://github.com/sgeniusk/ai-company-tycoon-boundaryless`
- 현재 브랜치: `main`
- 최신 커밋: `06c0068 Add v0.42 office actor interaction`
- 로컬 실행 주소: `http://127.0.0.1:5201/`
- 현재 QA 진입 주소: `http://127.0.0.1:5201/?scenario=office-visuals`

## 실행과 검증

```bash
npm run dev -- --port 5201
npm run harness:gate
```

최근 전체 검증 결과:

- `npm run harness:gate` 통과
- 40개 테스트 파일 / 285개 테스트 통과
- 데이터 검증 통과
- 프로덕션 빌드 통과
- Browser QA: `?scenario=office-visuals`에서 액터 버튼 6개, 포커스 패널 1개, 작업 액터 제품 메뉴 이동, 가로 오버플로 없음, 콘솔 오류 없음

## 핵심 플레이 루프

1. 한국 시골 차고에서 작은 AI 회사를 시작한다.
2. 사람 직원과 AI 에이전트를 고용한다.
3. 소재/산업, 제품 타입, 파격 옵션을 조합해 제품 아이디어를 만든다.
4. 직원을 제품에 배치해 AI 모델/서비스를 개발한다.
5. 기존 제품은 메이저 업데이트, 리뉴얼, 파생 라인으로 다시 출시할 수 있다.
6. 카드와 개발 이슈 대응으로 완성도와 출시 결과를 올린다.
7. 경쟁사, 시장 충격, 연간 심사, 직원 사건이 회사를 흔든다.
8. 10년차 최종 평가까지 가거나 실패 후 통찰과 해금을 들고 새 런을 시작한다.

## 최근 완성된 버전

### v0.42-alpha

- 사무실 사람/AI/로봇 액터를 클릭 가능한 버튼으로 전환.
- 선택한 액터의 상태, 작업, 체력/충성도, 추천 액션을 보여주는 `OfficeActorFocusPanel` 추가.
- 작업 중 액터는 제품 메뉴로, 케어/휴식/대기 액터는 에이전트 메뉴로 이동.
- 프로젝트 정보 카드가 액터 클릭을 막지 않도록 `pointer-events: none` 처리.

### v0.41-alpha

- `data/office_scene.json` 추가.
- `getOfficeScenePlan()` 추가.
- 사무실 화면에 데이터 기반 구획 오브젝트, 사람/AI/로봇 액터, 작업/휴식/경고 상태를 표시.
- `office-visuals` QA 시나리오 추가.

### v0.40-alpha

- `getOperationsCommandPlan()` 추가.
- 월간 운영 의제 패널 추가.
- 사무실 구획 효과가 인사 후폭풍 완화, 로봇 후보 풀 노출 같은 실제 운영 효과에 연결됨.

## 주요 문서

- PRD: `docs/PRD.md`
- 로드맵: `docs/ROADMAP.md`
- 최근 변경 로그: `docs/CHANGELOG.md`
- QA 진입점: `docs/QA_SCENARIOS.md`
- 인수 기준: `docs/ACCEPTANCE_CRITERIA.md`
- 하네스/에이전트 역할: `AGENTS.md`
- 제작 보고서: `reports/production_alpha_v0_42_office_actor_interaction.md`
- QA 보고서: `reports/qa/v0_42_office_actor_interaction_qa.md`

## 중요한 코드 위치

- 메인 게임 크롬: `src/components/GameChrome.tsx`
- 사무실/운영 시뮬레이션: `src/game/simulation.ts`
- 타입: `src/game/types.ts`
- 데이터 로딩: `src/game/data.ts`
- 사무실 시각 데이터: `data/office_scene.json`
- 사무실 구획 데이터: `data/office_zones.json`
- QA 시나리오: `src/game/qa-scenarios.ts`
- 레이아웃/픽셀 CSS: `src/App.css`
- 사무실 시뮬레이션 테스트: `src/game/office-scene.test.ts`
- 레이아웃 계약 테스트: `src/ui/layout-contract.test.ts`

## 현재 좋은 점

- 한 판은 120개월 10년 엔딩까지 시뮬레이션으로 돈다.
- 제품 조합은 5,184개 기본 조합을 만든다.
- 기존 제품 리뉴얼/파생 출시 루프가 있다.
- 로그라이트 새 런, 통찰, 메타 해금, 시작 덱이 있다.
- 사무실 확장, 구획, 장식, 채용 브랜드, 직원 사건, 후폭풍, 운영 의제가 있다.
- UI는 웹페이지형 스크롤보다 고정 게임 화면 쪽으로 많이 압축됐다.
- 사무실에 픽셀풍 오브젝트와 액터가 보이고, 액터 클릭으로 메뉴 이동까지 된다.

## 아직 부족한 점

- 포커스 패널에서 휴식, 연봉 협상, 배치 변경 같은 실제 액션을 직접 실행하지는 않는다.
- 카드 사용, 제품 출시, 경쟁사 사건의 사무실 내 연출이 아직 약하다.
- 최종 픽셀아트, 음악, 사운드가 없다.
- 시스템이 많아졌기 때문에 메뉴 요약/접힘/튜토리얼 재정리가 필요하다.
- 20인 페르소나 재검증을 v0.42 이후 상태로 다시 돌려야 한다.

## 다음 추천 작업

1. `v0.43-alpha`: 액터 포커스 패널에서 직원 케어 직접 실행
   - 휴식 실행
   - 연봉 협상 실행
   - 제품 배치/배치 해제 진입
   - 액션 후 사무실 타임라인/말풍선 갱신

2. `v0.44-alpha`: 사무실 사건 연출
   - 카드 사용 순간 사무실 위 짧은 플래시
   - 제품 출시 순간 런칭 무대 연출
   - 경쟁사 속보/스카우트 사건을 액터 주변 경보로 표시

3. `v0.45-alpha`: 실제 게임 화면 압축 2차
   - 우측 메뉴 요약/접힘
   - 사무실과 메뉴가 서로 덮지 않도록 모바일/데스크톱 레이아웃 조정
   - 20인 페르소나 플레이테스트 재실행

4. `v0.50-alpha`: v0.5 큰 버전 후보
   - 큰 UI 안정화 후 Vercel 배포
   - 플레이어가 10년 엔딩까지 평가 가능한 알파 후보

## 주의사항

- 사용자는 보고서를 한국어로 읽고 싶어 한다.
- 작은 작업마다 Vercel 배포하지 않는다. 큰 버전업 때만 배포한다.
- 현재 Vercel은 이전에 무료 배포 한도 오류가 났다.
- 기존 변경을 되돌리지 말고, 작업 후 `npm run harness:gate`를 통과시킨다.
- 파일 수정은 되도록 `apply_patch`를 쓴다.
- 브라우저 QA는 `http://127.0.0.1:5201/?scenario=office-visuals`를 우선 사용한다.

## 새 세션 시작 프롬프트

아래 프롬프트를 새 Codex 세션에 붙여넣으면 된다.

```text
프로젝트는 `/Users/taewookkim/Downloads/ai-company-tycoon`의 AI Company Tycoon: Boundaryless야.

현재 버전은 v0.42-alpha이고, 최신 커밋은 `06c0068 Add v0.42 office actor interaction`이야. GitHub는 `https://github.com/sgeniusk/ai-company-tycoon-boundaryless`, 브랜치는 `main`.

게임 방향은 카이로소프트식 AI 회사 경영 + 로그라이트 덱빌딩 + 10년 캠페인 + 경계 없는 산업 확장이야. 한국 시골 차고에서 시작해서 사람 직원, AI 에이전트, 나중에는 로봇까지 고용하고, AI 모델/서비스를 만들다가 반도체, 로봇, 자동차, 커피 프랜차이즈, 장난감 같은 엉뚱한 산업으로 확장하는 타이쿤 게임을 만들고 있어.

반드시 한국어로 보고해줘. 작업 후에는 `npm run harness:gate`를 돌려서 전체 테스트, 데이터 검증, 빌드를 통과시켜줘. 큰 버전업이 아니면 Vercel 배포는 하지 말고, 필요한 경우 GitHub에는 커밋/푸시해줘.

먼저 `docs/SESSION_HANDOFF.md`, `docs/ROADMAP.md`, `docs/CHANGELOG.md`, `docs/QA_SCENARIOS.md`, `AGENTS.md`를 읽고 이어서 개발해줘.

현재 로컬 실행은 `npm run dev -- --port 5201`, 브라우저 QA는 `http://127.0.0.1:5201/?scenario=office-visuals`로 보면 돼.

최근 구현:
- v0.40: 월간 운영 의제와 사무실 구획 효과 연결
- v0.41: 사무실 픽셀 시뮬레이션 1차, `office_scene.json`, `getOfficeScenePlan()`, 사람/AI/로봇 액터 표시
- v0.42: 사무실 액터 클릭, `OfficeActorFocusPanel`, 체력/충성도 미터, 작업 액터는 제품 메뉴, 케어 액터는 에이전트 메뉴로 이동

다음 추천 목표는 v0.43-alpha야. 사무실 액터 포커스 패널에서 실제 직원 케어 액션을 실행하게 만들어줘:
1. 경고/휴식 필요 액터를 선택하면 휴식 또는 케어 액션을 바로 실행할 수 있게 하기
2. 연봉 협상이나 케어 액션이 가능한 경우 버튼을 노출하기
3. 작업 중 액터는 프로젝트/배치 상태로 이어지게 하기
4. 액션 결과가 타임라인, 직원 상태, 사무실 포커스 패널에 즉시 반영되게 하기
5. 모바일 390px 폭에서 가로 오버플로 없이 보이게 하기
6. 테스트와 QA 문서를 갱신하기

중요 코드 위치:
- `src/components/GameChrome.tsx`
- `src/game/simulation.ts`
- `src/game/types.ts`
- `src/game/qa-scenarios.ts`
- `src/App.css`
- `src/game/office-scene.test.ts`
- `src/ui/layout-contract.test.ts`

완료 후 한국어로 변경점, 검증 결과, 다음 추천 작업을 짧게 보고해줘.
```
