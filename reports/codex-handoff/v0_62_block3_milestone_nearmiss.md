# Codex CLI 인계 — v0.62 블록 #3 (마일스톤 팡파레 + 연간 심사 near-miss)

작성일: 2026-05-29
작성자: Claude Code (하네스/계약/플래닝 트랙)
대상: Codex CLI (gpt-5.5, reasoning effort medium = fast 모드)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
현재 feature: `v0.62-alpha-payoff-juice` (블록 #1·#2 완료·커밋, 이번은 **블록 #3 = 마지막 블록**)

## 한 줄 요약

도파민의 "마일스톤 팡파레"와 "긴장-해소" 레버. (A) 주요 마일스톤 달성을 팡파레로 축하하고, (B) 연간 심사를 아슬아슬하게 통과/회복할 때 near-miss로 강조한다. **기존 achievements + annual-review 시스템을 증폭**할 뿐, 새 시스템·새 상태 없음 (§5-safe).

## 역할 분담

- 블록 #3 구현만. **`git commit` 금지.** Claude Code가 검증·커밋·closeout 한다.
- **`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md` 편집 금지.**
- 증거는 `reports/qa/v0_62_block3_run.md`에만.

## 핵심 — 이미 있는 걸 재사용 (새 상태 만들지 말 것)

- **마일스톤 = achievements** → `data/achievements.json` + `src/game/achievements.ts` + `GameState.unlockedAchievements`(string-array, hydrate됨)가 **이미 존재**. 별도 마일스톤 시스템/필드를 새로 만들지 말고 이걸 쓴다.
- **near-miss = annual review** → `src/game/annual-review.ts` + `GameState.annualReviewHistory`가 **이미 존재**. 통과/회복 마진을 derive.
- **셀러브레이션 UI** → 블록 #1/#2 `src/components/PayoffCelebrationModal.tsx`의 톤/큐 재사용.

## 작업 내용

### A. 마일스톤 팡파레
`unlockedAchievements`가 **새로 늘어날 때** 팡파레 모먼트를 띄운다 (업적 제목 + 보상). 신규 해금 감지는 블록 #1처럼 UI에서 이전/현재 비교(React 상태) — **언제 해금되는지(조건/타이밍)는 절대 바꾸지 말 것**, 축하만 한다.
- 필요하면 `data/achievements.json`에 축하감 있는 마일스톤 2-3개 보강 가능 (예: "첫 물리 산업 진출" = 제조/물류/에너지 도메인 제품 출시, "AGI 임계" = 특정 능력 고레벨, "첫 큰 현금"). validate-data(`scripts/harness/validate-data.mjs`)의 achievement 조건 화이트리스트(min_month/min_products/min_users/min_cash/min_capability_upgrades 등)를 지킬 것. 화이트리스트에 없는 조건이 필요하면 추가하지 말고 기존 조건으로 표현.
- 업적 추가는 **밸런스(보상 수치)를 과하게 키우지 않게** — 기존 업적 보상 스케일 참고.

### B. 연간 심사 near-miss 강조
연간 심사 결과에서 **요구치 대비 달성 마진**을 derive해, 아슬아슬 통과(예: 마진 10% 이내)나 회복을 시각적으로 강조한다 (긴장→해소 연출). `annual-review.ts`의 결과/`annualReviewHistory`에서 derive. 새 상태 없이 표시만.

### C. QA 시나리오
`?scenario=milestones`(또는 기존 확장)에서 업적 해금 직전 + near-miss 심사 상태로 진입해 팡파레/near-miss를 바로 확인.

### D. 테스트
- 마일스톤 신규-해금 감지 + near-miss 마진 derive 단위 테스트
- 팡파레/near-miss UI layout-contract 모바일 390×844
- 신규 업적을 추가했다면 validate-data 통과 확인
- 목표 444 → 446+

## 제약 (§5 안전)

- **새 시스템/새 GameState 필드 금지.** achievements(unlockedAchievements) + annual-review(annualReviewHistory)를 재사용. (블록 #2의 discoveredPayoffIds 같은 신규 필드는 이번엔 불필요.)
- **업적 해금 조건/타이밍, 심사 통과 기준을 바꾸지 말 것** (밸런스 불변). 연출/표시만 추가.
- `simulation.ts` tick 로직 불변 (업적이 tick에서 해금되는 기존 경로는 그대로). 변경은 표시 컴포넌트 + (선택) achievements.json 데이터 + 시나리오/테스트.
- `prefers-reduced-motion` + 모바일 390×844 유지.
- 저장 round-trip 유지 (새 필드 안 만들면 영향 없음).
- `npm run harness:gate` 통과.

## 완료 기준

1. 업적 신규 해금 시 팡파레, 연간 심사 아슬아슬 통과 시 near-miss 강조.
2. `?scenario=milestones`로 즉시 확인.
3. 밸런스/tick/저장 불변 (조건·타이밍·기준 무변경).
4. 테스트 추가, `npm run harness:gate` 통과 (44 files / 446+ tests; 신규 테스트 파일 시 파일 수 +).
5. `reports/qa/v0_62_block3_run.md` — 변경 파일, 팡파레/near-miss 방식, achievements.json 추가분(있으면), 밸런스/tick/저장 불변 확인, 게이트 출력.

## 세션 종료 시

`git commit` 금지. 마지막 메시지에 변경 파일 + 밸런스/tick/저장 영향 + 게이트 결과. 계약 파일 편집 금지.
