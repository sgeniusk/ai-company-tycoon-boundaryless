# Codex CLI 인계 — v0.64 #2 연중 이벤트 콘텐츠 확장 (세계관별 테마 이벤트)

작성일: 2026-05-29
작성자: Claude Code (기획/하네스/계약 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort **medium / fast** — 순수 데이터 + 테스트 단언 1곳 갱신, tick·세이브·선택 로직 불변)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행: v0.63 #3(world-events 시스템) + v0.64 #1(콘텐츠 깊이 — 신규 세계관 7종) 커밋 완료 후. 데이터 전용.

## 한 줄 요약

연중 세계 이벤트 풀을 12 → 26개로 늘려 **신규 세계관마다 테마 이벤트 스트림**을 만든다. 블록 #3 선택기는 `world_lore_tags`가 세계 태그와 매치되면 -500M 편향으로 그 이벤트를 강하게 뽑으므로 — chip_war 세계는 컴퓨트 위기 이벤트가, ai_winter_redux는 자금 빙하 이벤트가 더 자주 뜬다. **선택 로직 코드 변경 0** (이미 world_lore_tags 편향 지원). 순수 데이터 추가 + 검증 + 테스트 단언 갱신.

## 확인된 사실 (블록 #3 구현)

- `src/game/world-events.ts` `getRunWorldEventSchedule` — 연도 2~10마다 가장 낮은 점수 이벤트 1개 선택. 점수 = `hashSeed(seed:world:world-event:year:id)` 에서 `world_lore_tags`가 세계 태그(worldLoreId + 그 world_lore의 tags)와 하나라도 매치하면 **-500,000,000** 편향. 결정론(RNG 없음).
- 스키마 `WorldEventDefinition` — `id, title, description, trigger, year_range:[min,max], resource_effects:ResourceMap, world_lore_tags?:string[]`.
- 연 1슬롯 × 9년(2~10) = 런당 최대 9개 발동. 풀이 26개면 런마다 다른 9개를 뽑아 **변주 폭이 커진다**.
- **블록 #3 테스트 단언** `src/game/world-events.test.ts` line ~18-19 — `worldEvents.length` 를 `>=10 && <=12` 로 고정. 확장하면 **이 상한을 반드시 올려야** 한다(예: `<=28`). 또 per-resource 효과 크기 단언(cash ≤5000, users ≤900, compute ≤45, data ≤60, talent ≤1, trust ≤4, hype ≤5, automation ≤3) — 새 이벤트도 이 범위 안.

## 추가할 이벤트 14개 (신규 세계 태그에 매치 — 수치는 보수적, 범위 내 조정 가능)

v0.64 #1이 추가한 세계관 태그에 맞춘다. 각 이벤트 `world_lore_tags`가 그 세계의 태그와 매치되어야 편향이 작동한다.

### agi_overhang (tags: research_fast, safety_scrutiny)
1. `agi_takeoff_debate` "AGI 임박 논쟁" — 연구 가속·감시 강화. year_range [3,6]. effects `{ data: 40, hype: 4, trust: -2 }`. world_lore_tags [research_fast, safety_scrutiny]
2. `alignment_scramble` "정렬 연구 비상" — 안전 수요 급증. [5,8]. `{ trust: 4, cash: -2200, hype: -2 }`. [safety_scrutiny]

### data_drought (tags: data_scarce, synthetic_premium)
3. `public_data_lockdown` "공개 데이터 봉쇄" — 저작권 단속. [2,5]. `{ data: -40, cash: -1500 }`. [data_scarce]
4. `synthetic_data_rush` "합성 데이터 골드러시" — 합성 프리미엄. [4,7]. `{ data: 35, cash: -2000 }`. [synthetic_premium]

### chip_war (tags: export_controls, compute_regional)
5. `export_control_tightening` "수출통제 강화" — 컴퓨트 경색. [2,5]. `{ compute: -32, cash: -1800 }`. [export_controls]
6. `regional_chip_consortium` "지역 칩 컨소시엄" — 지역 조달. [5,8]. `{ compute: 30, trust: -2 }`. [compute_regional]

### privacy_fortress (tags: privacy_strict, consent_economy)
7. `privacy_crackdown` "개인정보 단속" — 데이터 제약·신뢰 상승. [3,6]. `{ data: -28, trust: 4 }`. [privacy_strict]
8. `consent_data_market` "동의 기반 데이터 시장" — 동의 경제. [5,9]. `{ data: 30, cash: -1600, trust: 2 }`. [consent_economy]

### bigtech_monopoly (tags: distribution_locked, platform_tax)
9. `platform_fee_hike` "플랫폼 수수료 인상" — 플랫폼세. [2,6]. `{ cash: -2600, users: -200 }`. [platform_tax]
10. `distribution_blockade` "유통 채널 봉쇄" — 유통 장악. [4,8]. `{ users: -420, hype: -3 }`. [distribution_locked]

### ai_winter_redux (tags: funding_drought_world, skeptic_market)
11. `funding_ice_age` "투자 빙하기" — 자금 경색. [2,5]. `{ cash: -3600, hype: -4 }`. [funding_drought_world, skeptic_market]
12. `skeptic_headlines` "회의론 헤드라인" — 회의 보도. [4,7]. `{ hype: -3, trust: -2, users: -260 }`. [skeptic_market]

### robotics_boom (tags: embodied_demand, hardware_capital)
13. `embodied_demand_spike` "체화 AI 수요 폭발" — 물리 수요(v0.60 연계). [3,7]. `{ users: 720, compute: 22 }`. [embodied_demand]
14. `hardware_capital_inflow` "하드웨어 자본 유입" — 설비 투자. [5,9]. `{ cash: 4000, compute: 30, trust: -1 }`. [hardware_capital]

> 모든 효과는 블록 #3 테스트 크기 범위 안. year_range는 2~10과 겹치게(연 1슬롯 스케줄이 2년차부터라 1년 단독은 안 뜸).

## 파일 소유권
- 편집 가능 — `data/world_events.json`(이벤트 14개 추가), `scripts/harness/validate-data.mjs`(world_events 검증이 있으면 개수/태그 확인 보강), `src/game/world-events.test.ts`(풀 크기 상한 단언 갱신 + 신규 세계 편향 테스트 추가).
- 편집 금지 — `src/game/world-events.ts`(선택 로직 불변 — 편향 이미 지원), `simulation.ts`, `types.ts`, 세이브, `data/run_modifiers.json`, UI. 계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`).

## 절대 제약
- 선택 로직·tick·세이브 **불변**. 순수 데이터 + 테스트.
- 표준 런 10년 완주 불변(보수적 효과, 범위 내). run-simulator 게이트 유지.
- 결정론 유지(이벤트는 시드 파생 선택, 데이터만 늘어남).
- `git commit` 금지.

## 완료 기준
1. `world_events.json` 26개(기존 12 + 신규 14), id 유니크, 신규 세계 태그에 매치되는 world_lore_tags.
2. `world-events.test.ts` 풀 크기 단언 갱신(상한 ↑) + 신규 세계관(예 chip_war/ai_winter_redux)에서 매치 이벤트가 스케줄에 더 자주 들어오는지 테스트.
3. 신규 이벤트 효과가 기존 크기 범위 내(테스트 통과).
4. `npm run harness:gate` 통과, 표준 런 10년 완주 유지.
5. `reports/qa/v0_64_block2_run.md` — 추가 이벤트 목록, 세계별 편향 확인, 게이트 출력.

## 세션 종료 시
`git commit` 금지. 마지막 메시지에 변경 파일 + 추가 이벤트 개수 + 세계별 편향 확인 + 표준 런 완주 + 게이트. 계약 파일 편집 금지.
