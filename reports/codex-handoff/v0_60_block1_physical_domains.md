# Codex CLI 인계 — v0.60 블록 #1 (신규 물리 산업 도메인 3개 기반)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상 에이전트: Codex CLI (gpt-5.5, reasoning effort xhigh) — 구현 트랙
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.60-alpha-boundaryless-industry-expansion` (feature_list.json의 current_feature_id로 이미 설정됨)
이번 작업 범위: 위 마일스톤의 **블록 #1만**. 블록 #2-#4는 별도 인계로 진행한다.

## 한 줄 요약

소프트웨어 밖 물리 산업 진출의 기반으로, 신규 물리 산업 도메인 3개(제조 manufacturing, 물류 logistics, 에너지 energy)와 각 산업의 시작 제품 2-3개를 추가하고 제품 UI에 노출한다. 이번 블록은 **additive(데이터+UI 추가)** 가 핵심이며, 요구 조건 배선/시너지/조합은 다음 블록 몫이다.

## 역할 분담 (중요)

- 이 트랙(Codex)은 **블록 #1 코드 구현만** 담당한다.
- **`git commit` 하지 않는다.** Claude Code가 diff 리뷰 + 게이트 독립 검증 후 커밋한다.
- **`AGENTS.md` / `feature_list.json` / `progress.md` / `CLAUDE.md` / `docs/ROADMAP.md` 를 편집하지 않는다.** Claude Code가 이미 v0.60 상태로 세팅했다. 워킹 트리의 미커밋 변경(계약 파일들)을 건드리지 말 것.
- 실행 증거는 `reports/qa/v0_60_block1_run.md`에만 남긴다.

## 작업 시작 전 필독

1. `AGENTS.md` — operating contract, Definition Of Done, One Feature At A Time
2. `feature_list.json` — `v0.60-alpha-boundaryless-industry-expansion`의 definition_of_done (블록 #1 항목)
3. `docs/ROADMAP.md` `### v0.60-alpha — 경계 없는 산업 확장 슬라이스` 절 + `## 5. 지금 하지 않을 것` (특히 "산업군 대량 확장" — 정확히 3개 신규로 제한)
4. `data/domains.json` — 기존 12개 도메인. 신규 3개는 이 스키마를 그대로 따른다
5. `data/products.json` — 기존 30개 제품. 신규 제품은 이 스키마를 그대로 따른다
6. `data/capabilities.json` — 사용 가능한 능력 id (language, code, vision, audio, video, agent, enterprise, safety, optimization, robotics)
7. `scripts/harness/validate-data.mjs` — 도메인/제품 검증 규칙 (domain.unlock_requirements는 유효 capability 참조, product.domain은 존재해야 함, launch_cost는 유효 resource 맵, "게임 시작 시 launchable 제품 0개" 금지)
8. `src/components/MenuPanels.tsx` + `src/game/product-filters.ts` (`getProductDomainFilters`, `getProductsByDomainFilter`) — 제품/도메인 필터 UI 렌더링 지점
9. `src/game/qa-scenarios.ts` — `?scenario=` 등록 패턴 (예: `resource-visibility`, `market-share`)
10. `data/locales/ko.json` + `en.json` — i18n 키

## 데이터 스키마 (이미 확인됨)

### domain (domains.json)
```
{ "id", "name", "description", "unlocked_by_default": bool, "unlock_requirements": { "<capabilityId>": level }, "market_size": "medium|large|huge", "risk_level": "low|medium|high", "icon": "이모지" }
```

### product (products.json)
```
{ "id", "name", "description", "domain": "<domainId>", "required_capabilities": { "<capabilityId>": level },
  "launch_cost": { "cash": n, "compute": n, "data": n }, "base_revenue": n, "base_users_per_month": n,
  "compute_per_1000_users": n, "data_generated_per_month": n, "hype_on_launch": n, "trust_requirement": n,
  "level": 1, "max_level": n, "upgrade_cost_multiplier": n, "tags": [..] }
```

기존 물리 계열 도메인이 이미 있다 (robotics 로봇, mobility 모빌리티, semiconductors 반도체, odd_industries, toys). 신규 3개는 이와 겹치지 않는 **순수 신규**다.

## 작업 내용

### 1. 신규 물리 산업 도메인 3개 (data/domains.json)

추가한다 (이름/아이콘/수치는 합리적 시작값이며 밸런스에 맞게 다듬어도 됨).

- **manufacturing (제조)** — AI가 운영하는 스마트 팩토리/산업 자동화. unlock_requirements는 기존 능력 재사용 (예: `{ "robotics": 1, "optimization": 1 }`)
- **logistics (물류)** — 창고/배송/공급망 자동화. (예: `{ "agent": 2, "optimization": 1 }`)
- **energy (에너지)** — AI 데이터센터 전력/스마트 그리드. compute 테마와 연결. (예: `{ "optimization": 2, "enterprise": 1 }`)

`unlocked_by_default`는 모두 false. 후반부 확장 산업이므로 능력 게이팅을 둔다.

### 2. 각 산업 시작 제품 2-3개 (data/products.json)

각 신규 도메인에 제품 2-3개를 추가한다. 스키마를 정확히 따르고, `required_capabilities`로 후반부에 열리도록 게이팅한다 (게임 시작 시 launchable이 되지 않게 — validate-data가 검사). 물리 산업답게 compute/cash 비용은 소프트웨어 제품보다 높게, 매출도 크게 잡는 것을 권장.

### 3. UI 노출

신규 도메인이 제품 패널의 도메인 필터(`getProductDomainFilters`)와 목록에 자연스럽게 나타나야 한다. 별도 대형 UI는 이번 블록에서 만들지 않는다 — 기존 제품/도메인 렌더링 경로에 신규 도메인이 흘러들어가면 충분하다. 도메인 잠금/해제 표시가 기존 방식대로 동작하는지 확인.

### 4. QA 시나리오 (권장)

`?scenario=physical-industries`를 `qa-scenarios.ts`에 등록한다. 신규 3개 도메인이 unlock된 상태 + 관련 능력 보유 상태로 진입해 제품 패널에서 신규 산업이 보이도록 한다. `resource-visibility` 시나리오 패턴을 미러링.

### 5. i18n + 테스트

- 신규 도메인/제품의 사용자 노출 문자열은 가능한 한 기존 방식(데이터의 name/description 사용)을 따른다. 별도 ui.* 키가 필요하면 ko/en 양쪽에 추가.
- 테스트 최소 1개 추가 (목표 417 → 418+). 예 — 신규 도메인 3개가 domains 데이터에 존재하고 product가 연결됐는지, 또는 `?scenario=physical-industries`가 신규 도메인을 노출하는지 단언.

## 제약

- **Additive only.** 기존 도메인/제품을 바꾸지 않는다. 신규 3개만 추가.
- **정확히 3개 신규 산업.** ROADMAP §5 "산업군 대량 확장" 금지 — 4개 이상 추가하지 않는다.
- 요구 조건 배선(신규 capability 등), 산업 간 시너지, 고위험 조합은 **이번 블록에서 하지 않는다** (각각 블록 #2/#3/#4).
- 가능한 한 `src/game/simulation.ts` tick 로직을 바꾸지 않는다. 신규 도메인/제품이 기존 시뮬레이션 경로로 자연히 처리되면 가장 좋다. 불가피하게 simulation을 건드려야 하면 그 이유를 run 보고서에 명확히 적고 회귀가 없게 한다.
- `validate-data`의 "게임 시작 시 launchable 제품 0개" 금지에 걸리지 않게, 신규 제품은 능력/도메인으로 게이팅한다.
- 모바일 390×844가 깨지지 않아야 한다.
- `npm run harness:gate`가 끝까지 통과해야 한다.

## 완료 기준

1. `data/domains.json`에 manufacturing/logistics/energy 3개가 추가되고 스키마/validate-data를 만족한다.
2. 각 신규 도메인에 시작 제품 2-3개가 있고, 후반부 능력 게이팅으로 시작 시 launchable이 아니다.
3. 신규 도메인이 제품 패널 도메인 필터/목록에 정상 노출된다.
4. (권장) `?scenario=physical-industries`로 신규 산업을 바로 확인할 수 있다.
5. 테스트 1개 이상 추가, `npm run harness:gate` 통과 (43 files / 418+ tests).
6. `reports/qa/v0_60_block1_run.md`에 증거 — 변경 파일, 추가한 도메인/제품 id, unlock 게이팅 근거, 최종 게이트 출력(파일/테스트 수, build).

## 세션 종료 시 (Codex)

1. `npm run harness:gate` 최종 결과를 `reports/qa/v0_60_block1_run.md`에 기록.
2. `git commit` 하지 않는다. 워킹 트리를 그대로 두고 마지막 메시지에 변경 파일 목록 + 게이트 결과 + simulation.ts를 건드렸는지 여부를 요약.
3. 계약 파일(`AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, `docs/ROADMAP.md`)은 편집하지 않는다.

## 관련 문서

- `AGENTS.md`, `feature_list.json` (`v0.60-alpha-boundaryless-industry-expansion`), `progress.md`
- `docs/ROADMAP.md` (`### v0.60-alpha` + `## 5. 지금 하지 않을 것`)
- `data/domains.json`, `data/products.json`, `scripts/harness/validate-data.mjs`
- `src/components/MenuPanels.tsx`, `src/game/product-filters.ts`, `src/game/qa-scenarios.ts`
