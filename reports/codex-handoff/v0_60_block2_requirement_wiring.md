# Codex CLI 인계 — v0.60 블록 #2 (로봇/제조/물류 요구 조건 배선)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상 에이전트: Codex CLI (gpt-5.5, reasoning effort xhigh)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.60-alpha-boundaryless-industry-expansion` (블록 #1 완료, 이번은 **블록 #2만**)

## 한 줄 요약

블록 #1이 추가한 물리 산업 도메인(manufacturing/logistics/energy)을 "로봇/제조/물류" 능력 축으로 제대로 게이팅한다. `robotics` 능력은 이미 있으니, 신규 능력 `manufacturing`(제조)·`logistics`(물류) 2개를 추가해 트리오를 완성하고, 신규 도메인/제품을 이 능력들로 잠그고, 연구(능력) UI에 노출한다.

## 역할 분담 (중요)

- 블록 #2 코드 구현만. **`git commit` 금지.** Claude Code가 리뷰·검증·커밋한다.
- **`AGENTS.md` / `feature_list.json` / `progress.md` / `CLAUDE.md` / `docs/ROADMAP.md` 편집 금지.** 워킹 트리는 깨끗한 상태(블록 #1 커밋 완료)이니 그대로 둔다.
- 실행 증거는 `reports/qa/v0_60_block2_run.md`에만 남긴다.

## 작업 시작 전 필독

1. `AGENTS.md`, `feature_list.json`(v0.60 항목의 블록 #2), `progress.md`
2. `data/capabilities.json` — 능력 스키마. 신규 2개는 이 스키마를 그대로 따른다
3. `data/starting_state.json` — `capabilities` 맵에 신규 능력 초기값 0 추가
4. `data/domains.json` + `data/products.json` — 블록 #1이 추가한 manufacturing/logistics/energy 도메인 + 6개 제품
5. `scripts/harness/validate-data.mjs` — 능력 검증(upgrade_costs 자원 맵, unlocks_domains는 유효 도메인 참조), 제품 required_capabilities 검증
6. 연구/능력 UI 렌더링 지점 (`src/components/MenuPanels.tsx`의 ResearchPanel — 능력 배열을 데이터 주도로 렌더)
7. `src/game/boundaryless-expansion.ts` — 블록 #1이 신규 도메인을 연결한 곳 (참고)

## 능력 스키마 (data/capabilities.json)
```
{ "id", "name", "description", "max_level": n, "upgrade_costs": [ { "cash", "data", "talent", "compute"? } ... per level ],
  "unlocks_domains": { "<level>": "<domainId>" }, "effects_per_level"?: { "<resource>": n }, "icon": "이모지" }
```
참고 — `robotics`는 `unlocks_domains: {"1":"robotics","2":"odd_industries"}`, `effects_per_level: {"automation":4}`, 물리 능력이라 upgrade_costs에 compute가 섞여 있다. 신규 2개도 물리 능력답게 비싸게.

## 작업 내용

### 1. 신규 능력 2개 (data/capabilities.json)

- **manufacturing (제조)** — 스마트 팩토리/생산 자동화 능력. `unlocks_domains`로 `manufacturing` 도메인을 연다 (예: `{"1":"manufacturing","3":"energy"}`). `effects_per_level`로 `automation` 등 소폭. upgrade_costs는 robotics 수준으로 비싸게(compute 포함).
- **logistics (물류)** — 공급망/배송 최적화 능력. `unlocks_domains`로 `logistics` 도메인을 연다 (예: `{"1":"logistics"}`). 비용/효과는 합리적 시작값.

이름/레벨/비용/효과는 밸런스에 맞게 다듬어도 된다. `max_level`은 3-4 권장.

### 2. starting_state.json

`capabilities` 맵에 `"manufacturing": 0`, `"logistics": 0` 추가.

### 3. 도메인/제품 재게이팅 (로봇/제조/물류 축 반영)

블록 #1이 기존 능력으로 임시 게이팅한 신규 도메인/제품을 트리오 능력으로 정렬한다.
- manufacturing 도메인/제품 → `manufacturing`(+기존 robotics/optimization 유지 가능)
- logistics 도메인/제품 → `logistics`(+기존 agent/optimization)
- energy 도메인/제품 → 기존 optimization/enterprise 유지하되, 필요하면 manufacturing 일부 연결
기존 제품의 launchable-at-start 금지 규칙은 그대로 유지(validate-data가 검사).

### 4. UI 노출

연구(능력) 패널이 능력 배열을 데이터 주도로 렌더하면 신규 2개가 자동 노출된다. 실제로 노출·업그레이드 가능한지 확인. 도메인 언락이 새 능력 레벨로 일어나는지도 확인.

### 5. i18n + 테스트

- 능력 name/description은 데이터에 한국어로 들어가므로 별도 ui.* 키는 보통 불필요. 영어 빌드가 필요하면 기존 방식 확인.
- 테스트 1개 이상 추가 (목표 420 → 421+). 예 — 신규 능력 2개 존재 + unlocks_domains 유효성, 또는 물리 도메인이 트리오 능력으로 게이팅되는지 단언.

## 제약

- **simulation.ts tick 로직 변경 최소화.** 능력은 데이터 주도다 — 능력 배열/`effects_per_level`/`unlocks_domains`는 기존 경로로 자동 처리되는 게 이상적. 만약 capability id가 TypeScript union 타입이나 하드코딩 리스트로 박혀 있어 신규 능력 추가 시 컴파일/런타임이 막히면, 그 타입/리스트만 최소 수정하고 이유를 run 보고서에 적는다. tsc가 안내해줄 것이다.
- 산업 간 시너지(블록 #3), 고위험 조합(블록 #4)은 **이번에 하지 않는다.**
- 신규 능력은 정확히 2개(manufacturing, logistics). robotics는 이미 존재.
- 기존 능력/도메인/제품의 밸런스를 깨지 않는다 (재게이팅은 신규 물리 항목에 한정).
- 모바일 390×844 유지. `npm run harness:gate` 통과.

## 완료 기준

1. `manufacturing`·`logistics` 능력 2개가 capabilities.json + starting_state.json에 추가되고 validate-data를 만족한다.
2. 신규 물리 도메인/제품이 로봇/제조/물류 능력 축으로 게이팅되고, 능력 레벨업으로 도메인이 열린다.
3. 연구 패널에서 신규 능력 2개가 노출·업그레이드된다.
4. 테스트 1개 이상 추가, `npm run harness:gate` 통과 (43 files / 421+ tests).
5. `reports/qa/v0_60_block2_run.md`에 증거 — 변경 파일, 신규 능력 정의, 재게이팅 매핑, simulation.ts를 건드렸는지 여부와 이유, 최종 게이트 출력.

## 세션 종료 시 (Codex)

1. `npm run harness:gate` 최종 결과를 `reports/qa/v0_60_block2_run.md`에 기록.
2. `git commit` 하지 않는다. 마지막 메시지에 변경 파일 + simulation.ts 변경 여부 + 게이트 결과 요약.
3. 계약 파일 편집 금지.
