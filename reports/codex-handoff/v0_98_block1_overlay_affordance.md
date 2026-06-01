# Codex CLI 인계 — v0.98 #1 오버레이 어포던스 + 디스미스 신뢰성

작성일: 2026-06-02
작성자: Claude Code (기획·하네스·검증·커밋 트랙 / 편집장)
대상: Codex CLI — reasoning effort **medium**
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행 상태: `main` @ `620c8ee` (v0.97 closed). 게이트 기준선 53 files / 645 tests.
상위 계획: `reports/v0_96_plus_commercial_polish_roadmap.md` §"v0.98 — Interaction Finish Pass"

> **Codex 는 dev server / 브라우저 스모크를 돌리지 마라**(샌드박스가 막혀 행). **CSS/TSX + 단위 테스트(`npm test`)까지만.** 브라우저 스모크·스크린샷·게이트는 편집장(Claude)이 실서버에서 한다.

---

## 한 줄 요약

민감 오버레이(world-reveal / payoff-celebration / big-event)의 디스미스 버튼에 **일관된 hover/active/focus-visible 어포던스**를 주고, **각 오버레이가 깔끔히 닫히는지 보장하는 포커스드 스모크**를 추가한다. 감사 결과 세 모달의 디스미스 로직은 정상(상태를 비우고 null 반환)이라 버그 수정이 아니라 **마감(affordance + 회귀 가드)**이다.

additive/visual. 시뮬·세이브·데이터·tick 불변(기존 디스미스 핸들러 재사용, 새 게임 로직 없음).

## 감사 결과 (이미 확인)

- 세 모달 모두 `GameChrome.tsx:2870-2872` 에 마운트, 각자 디스미스 버튼으로 상태를 비우고 닫힘(`BigEventModal`→`dismissChallengerEntry`, `PayoffCelebrationModal`→`queue.slice(1)`, `WorldRevealModal`→`dismissedSeeds.add(seed)`). 스턱 버그 없음.
- 어포던스 갭 — `.big-event-dismiss:hover` 만 존재. `world-reveal-dismiss`/`payoff-celebration-dismiss` 는 hover/active/focus 없음. **셋 다 `:focus-visible` 없음**(키보드 접근성 갭).
- 오버레이 트리거 시나리오 — `?scenario=payoff-juice`(PayoffCelebration), `?scenario=milestones`(achievement), `?scenario=big-event`(BigEvent). (`isPayoffJuiceScenario`/`isMilestonesScenario`/qa-scenarios 참고.)

## 작업 (TDD)

### Task 1 — RED: v0.98 어포던스 계약
`src/ui/layout-contract.test.ts` — 마지막 v0.97 블록 뒤에 추가.
```ts
  it("v0.98 gives overlay dismiss buttons hover/active/focus affordance", () => {
    for (const cls of ["world-reveal-dismiss", "payoff-celebration-dismiss", "big-event-dismiss"]) {
      expect(appCss).toMatch(new RegExp(`\\.${cls}:focus-visible`));
      expect(appCss).toMatch(new RegExp(`\\.${cls}:active`));
    }
  });
```
- [ ] Step 1.1 추가 후 `npm test -- src/ui/layout-contract.test.ts` → **FAIL**(focus-visible/active 없음).

### Task 2 — GREEN: 어포던스 CSS
`src/App.css`.
- [ ] **Step 2.1** 세 디스미스 버튼(`.world-reveal-dismiss`, `.payoff-celebration-dismiss`, `.big-event-dismiss`)에 일관된 `:hover`(살짝 밝아짐/들림), `:active`(눌림 — translateY 또는 shadow 축소), `:focus-visible`(뚜렷한 픽셀 아웃라인, 예 `outline: 3px solid` 또는 box-shadow ring) 추가. 기존 `.big-event-dismiss:hover` 와 톤 맞춤. `--pixel-radius`/`--pixel-steps` 토큰 사용. 색은 기존 팔레트 변수.
- [ ] **Step 2.2** (선택) `.primary-action`, `.secondary-action`(공용 버튼)에도 `:focus-visible` 링을 일관 적용(이미 hover/active 있으면 focus-visible 만 보강).
- [ ] **Step 2.3** 모션은 `@media (prefers-reduced-motion: reduce)` 에서 transform 무효화(기존 패턴 재사용). hover/active 의 transform 이 있으면 reduced-motion 가드.
- [ ] **Step 2.4** `npm test -- src/ui/layout-contract.test.ts` → **PASS**.

### Task 3 — 포커스드 오버레이 스모크 (Codex 작성, Claude 실행)
`scripts/qa/check-v098-overlays.mjs` (신규). v0.95/v0.96 스모크 구조 재사용(`createRequire` + `PW_NODE_MODULES` 기본값, `fileURLToPath` 로 screenshotDir = `reports/qa/screenshots/`). 각 시나리오마다
- 페이지 로드 → 해당 오버레이 셀렉터가 **존재**하는지 확인 → 디스미스 버튼 클릭 → 잠시 대기 → 오버레이가 **사라졌는지**(`document.querySelector(overlaySel)` null 또는 비표시) + 잔여 차단 오버레이 없음 확인.
- 대상 `{ scenario: "payoff-juice", overlay: ".payoff-celebration-overlay", dismiss: ".payoff-celebration-dismiss" }`, `{ "milestones", ".payoff-celebration-overlay", ".payoff-celebration-dismiss" }`, `{ "big-event", ".big-event-overlay", ".big-event-dismiss" }`.
- 데스크톱(1366×768)만으로 충분. 스크린샷 `reports/qa/screenshots/v0_98_overlay_<scenario>.png`.
- exit 코드 — 오버레이 미출현/디스미스 후 잔존/콘솔 에러 시 nonzero.
- [ ] Codex 는 스크립트만 작성(실행 금지). Claude 가 실행해 검증.
- [ ] (선택) `package.json` 에 `"qa:v098-overlays": "node scripts/qa/check-v098-overlays.mjs"`.

### Task 4 — 단위 테스트만
- [ ] `npm test -- --maxWorkers=1` 전체 통과.
- [ ] visual/additive — `git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/` 비어 있음(기존 디스미스 핸들러 재사용, 새 게임 로직 없음).

## 완료 기준 (Codex)
1. v0.98 어포던스 계약 RED→GREEN.
2. 세 디스미스 버튼 hover/active/focus-visible + (선택) 공용 버튼 focus-visible, reduced-motion 가드.
3. `check-v098-overlays.mjs` 작성(Claude 실행 대상).
4. `npm test` 전체 통과. visual/additive diff(simulation/types/data 비어 있음).
5. `git commit` 안 함. 마지막 메시지에 변경 파일 + RED→GREEN + 테스트 결과 + diff 확인 보고.

## 편집장 검증 (Claude, 실서버)
- `check-v098-overlays.mjs` 실행 → 3개 오버레이 출현+디스미스 후 닫힘, 잔여 차단 없음.
- payoff-juice / big-event 스크린샷 육안(어포던스 + 닫힘).
- 기존 `check-v096-first-screen.mjs` 회귀 없음.
- `npm run harness:gate < /dev/null` PASS.
- 통과 시 Lore protocol 커밋(`Co-Authored-By: OpenAI Codex` + `Co-Authored-By: Claude Opus 4.8 (1M context)`) + push.

## 후속(이 블록 아님)
- v0.98 #2 — ESC-to-dismiss + 초기 포커스/포커스 복원(모달 React 훅, additive). 이번엔 CSS focus-visible 까지만.
