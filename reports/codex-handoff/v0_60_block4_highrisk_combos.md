# Codex CLI 인계 — v0.60 블록 #4 (고위험·대박 조합 10개)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort medium = fast 모드)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.60-alpha-boundaryless-industry-expansion` (블록 #1·#2·#3 완료, 이번은 **블록 #4 = 마지막 블록**)

## 한 줄 요약

여러 산업을 동시에 운영할 때 발동하는 "고위험·대박 조합" 10개를 추가한다. 블록 #3의 산업 시너지(`industry-synergies.ts`)를 거의 그대로 미러링하되, **위험 차원**을 얹는다 — 더 까다로운 요구 조건 + 더 큰 보상 + 효과 안에 명시적 downside 성분(음수 자원) + `risk_label`.

## 역할 분담

- 블록 #4 구현만. **`git commit` 금지.** Claude Code가 검증·커밋·closeout 한다.
- **`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md` 편집 금지.**
- 증거는 `reports/qa/v0_60_block4_run.md`에만.

## 정확한 미러링 대상 (방금 머지된 블록 #3을 복제하면 가장 빠르다)

블록 #3가 만든 다음을 거의 1:1로 따라간다.
1. **데이터** — `data/industry_synergies.json` → 신규 `data/industry_combos.json`.
   - 스키마 — `{ "id", "title", "description", "required_domains": ["<domainId>", ...], "monthly_effects": { "<resourceId>": n }, "risk_label": "한 줄 위험 설명", "tags": [..] }`
   - 시너지와의 차이 — (a) `required_domains` 2~3개로 더 까다롭게(고티어 물리 산업 manufacturing/energy/robotics/logistics를 적극 사용), (b) `monthly_effects`의 **보상은 시너지보다 크게**(예: cash +400~900, users +300~600), (c) 반드시 **downside 성분 1개 이상**을 음수로 포함(예: `trust: -3`, `compute: -25`, `cash` 큰 보상 대신 `automation: -2` 등), (d) `risk_label`로 위험을 한 줄 설명.
   - "대박"이 체감되되 결정론적이어야 한다. **tick에 난수(RNG)를 넣지 말 것** — 위험은 음수 성분과 까다로운 조건으로 표현한다.
   - 10개 조합. 물리 산업 확장 테마를 살린다 (예: manufacturing+energy+logistics "풀스택 물리 제국", robotics+mobility "자율 모빌리티 베팅", semiconductors+energy "수직계열 인프라 베팅" 등).
2. **derive 요약 함수** — `src/game/industry-synergies.ts`의 `getIndustrySynergySummary`를 모델로 신규 `src/game/industry-combos.ts`에 `getIndustryComboSummary(state)`를 만든다. active 조합 + `totalMonthlyEffects` 반환. 발동 조건은 시너지와 동일 톤(required_domains가 모두 active/unlock).
3. **월간 효과 연결** — `src/game/simulation.ts`의 `getMonthlyStrategicEffects`에서 블록 #3가 추가한 `industrySynergyEffects` 바로 옆에 동일 패턴으로 `industryComboEffects = getIndustryComboSummary(state).totalMonthlyEffects` 한 줄 + push 가드 한 줄을 더한다. **그 외 tick 변경 금지.**
4. **데이터 검증** — `scripts/harness/validate-data.mjs`의 industry_synergies 검증 블록을 미러링해 industry_combos 검증 추가. `risk_label`이 비어있지 않은 문자열인지도 검사. `required_domains` 유효성 검사.
5. **UI** — active 조합을 산업 시너지 노출 방식과 동일하게 보여주되 `risk_label`을 함께 노출(위험 강조). 대형 신규 UI 금지.
6. **테스트** — 최소 2개 (목표 425 → 427+).

## 제약 (fast 모드라 더 엄격히)

- 블록 #3의 시너지 구현을 복제하는 게 정답이다. 새 메커니즘/새 tick 경로 발명 금지.
- **§5 준수** — `data/product_ideas.json`의 `compatibility_rules`(제품 아이디어 조합 매트릭스)를 **건드리지 말 것**. 이번 "조합"은 그것과 무관한 신규 산업 조합 개념이다.
- 정확히 **조합 10개**. 기존 시너지/office/deck를 건드리지 않는다 (신규 파일/모듈로 격리).
- tick에 RNG 금지 (결정론 유지 — 하네스 테스트가 결정론에 의존).
- 모바일 390×844 유지. `npm run harness:gate` 통과 (43 files / 427+ tests).

## 완료 기준

1. `data/industry_combos.json`에 10개 조합(보상 큼 + downside 성분 + risk_label), validate-data 통과.
2. `getIndustryComboSummary`가 active 조합과 totalMonthlyEffects를 정확히 계산.
3. `getMonthlyStrategicEffects`에 최소 연결돼 실제 자원에 반영 (시너지와 동일 경로, 추가 라인 2개).
4. active 조합 + risk_label이 UI에 노출.
5. 테스트 2개+ 추가, `npm run harness:gate` 통과.
6. `reports/qa/v0_60_block4_run.md`에 증거 — 변경 파일, 조합 10개 요약(보상/위험), simulation.ts 변경 라인, 최종 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + simulation.ts 변경 요약 + 게이트 결과. 계약 파일 편집 금지.
