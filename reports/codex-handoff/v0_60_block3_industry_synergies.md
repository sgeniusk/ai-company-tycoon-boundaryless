# Codex CLI 인계 — v0.60 블록 #3 (산업 간 시너지 10개)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort medium = fast 모드)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.60-alpha-boundaryless-industry-expansion` (블록 #1·#2 완료, 이번은 **블록 #3만**)

## 한 줄 요약

여러 산업에 동시에 진출했을 때 발동하는 "산업 간 시너지" 10개를 추가한다. 기존 office/deck 시너지 인프라를 그대로 미러링한다 — 새 데이터 파일 + derive 요약 함수 + 월간 효과 합산 지점에 연결.

## 역할 분담

- 블록 #3 구현만. **`git commit` 금지.** Claude Code가 검증·커밋한다.
- **`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md` 편집 금지.** 워킹 트리는 깨끗하다.
- 증거는 `reports/qa/v0_60_block3_run.md`에만.

## 정확한 미러링 대상 (이대로 따라가면 가장 빠르고 안전하다)

1. **데이터** — `data/office_synergies.json` / `data/deck_synergies.json` 구조 참고. 신규 `data/industry_synergies.json` 생성.
   - 권장 스키마 — `{ "id", "title", "description", "required_domains": ["<domainId>", ...], "monthly_effects": { "<resourceId>": n }, "tags": [..] }`
   - 트리거 — `required_domains`에 적힌 도메인들에 **활성 제품을 보유**(또는 해당 도메인 unlock)했을 때 발동. office 시너지가 `required_categories`를 검사하는 방식과 동일한 톤으로.
   - 15개 도메인(foundation_models, developer_tools, semiconductors, robotics, mobility, manufacturing, logistics, energy, creator_tools, education, customer_support, enterprise_automation, personal_productivity, odd_industries, toys)을 가로질러 10개 조합. 물리 산업(robotics/manufacturing/logistics/energy)을 적극 엮어 "경계 없는 확장" 테마를 살린다. 예 — robotics+manufacturing, manufacturing+energy, logistics+mobility, foundation_models+semiconductors, energy+semiconductors 등.
2. **derive 요약 함수** — `src/game/simulation.ts:1592`의 `getOfficeSynergySummary(state)` 를 모델로, 신규 모듈 `src/game/industry-synergies.ts`에 `getIndustrySynergySummary(state)`를 만든다. active 시너지 목록 + `totalMonthlyEffects`를 반환.
3. **월간 효과 연결** — `src/game/simulation.ts` 약 3855행, `officeSynergyEffects = getOfficeSynergySummary(state).totalMonthlyEffects` / `deckSynergyEffects = getDeckSynergyMonthlyEffects(state)` 가 월간 효과 배열에 push 되는 그 지점에 `industrySynergyEffects = getIndustrySynergySummary(state).totalMonthlyEffects` 를 **같은 패턴으로 한 줄 추가**한다. 이게 시뮬레이션 변경의 전부여야 한다 (새 tick 로직을 발명하지 말 것).
4. **데이터 검증** — `scripts/harness/validate-data.mjs`의 office_synergies 검증 블록(필드 존재, monthly_effects 자원 맵, tags 비어있지 않음, required_* 유효성)을 미러링해 industry_synergies 검증을 추가한다. `required_domains`의 각 id가 유효 도메인인지 검사.
5. **UI** — active 산업 시너지를 사용자에게 보여준다. office 시너지가 노출되는 방식(요약/배지)을 가볍게 미러링. 대형 신규 UI는 만들지 말 것.
6. **테스트** — 최소 2개 (목표 421 → 423+). 예 — 특정 도메인 조합에서 시너지가 active가 되는지, `totalMonthlyEffects`가 합산되는지.

## 제약 (fast 모드라 더 엄격히)

- **기존 시너지 메커니즘을 그대로 재사용.** 새 시스템/새 tick 경로 발명 금지.
- `simulation.ts` 변경은 월간 효과 배열에 industry 시너지 효과를 더하는 **최소 연결**에 한정. 그 외 tick 로직 불변.
- 정확히 **시너지 10개**. 고위험 조합(블록 #4)은 하지 않는다.
- 기존 office/deck/workforce 시너지를 건드리지 않는다 (신규 파일/모듈로 격리).
- monthly_effects는 보수적 크기로 (게임 밸런스 폭주 금지). office 시너지 수준 참고.
- 모바일 390×844 유지. `npm run harness:gate` 통과 (43 files / 423+ tests).

## 완료 기준

1. `data/industry_synergies.json`에 10개 시너지, validate-data 통과.
2. `getIndustrySynergySummary`가 active 시너지와 totalMonthlyEffects를 정확히 계산.
3. 월간 효과 합산 지점에 연결돼 실제로 자원에 반영 (office 시너지와 동일 경로).
4. active 시너지가 UI에 노출.
5. 테스트 2개+ 추가, `npm run harness:gate` 통과.
6. `reports/qa/v0_60_block3_run.md`에 증거 — 변경 파일, 시너지 10개 요약, simulation.ts 변경 라인 수와 내용, 최종 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + simulation.ts 변경 요약 + 게이트 결과. 계약 파일 편집 금지.
