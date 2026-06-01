# Codex CLI 인계 — v0.97 #2 픽셀 토큰 통일 (반경 + stepped 모션)

작성일: 2026-06-02
작성자: Claude Code (기획·하네스·검증·커밋 트랙 / 편집장)
대상: Codex CLI — reasoning effort **medium** (visual-only CSS)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon`
선행 상태: `main` @ `4d0978b` (v0.97 #1 데스크톱 HUD). 게이트 기준선 53 files / 644 tests.
상위 계획: `reports/v0_96_plus_commercial_polish_roadmap.md` §"v0.97 — Pixel-Art Consistency Sweep"

> **Codex 는 dev server / 브라우저 스모크를 돌리지 마라**(샌드박스가 막혀 행에 걸린다). **CSS + 단위 테스트(`npm test`)까지만.** 브라우저 스모크·스크린샷·게이트는 편집장(Claude)이 실서버에서 한다.

---

## 한 줄 요약

문제는 "둥근 모서리 자체"가 아니라 **반경 값이 제각각**(4/5/6/8/9/10/12px 혼재)이고 **모션 타이밍이 제각각**(smooth ease 28개 vs stepped 31개)인 **비일관성**이다. 이번 블록은 **단일 토큰으로 통일**한다 — `--pixel-radius` 하나로 사각 패널/버튼/카드 반경을 통일하고, 게임 표면의 transform 모션을 stepped 로 통일한다. 0 으로 날카롭게 미는 게 아니라 **일관성**이 목표(과한 재작업·하시 룩 방지).

visual-only. 시뮬·세이브·데이터·tick 불변.

## 감사 결과 (이미 확인 — 다시 파지 말 것)

- 6대 셸(`.top-bar`/`.resource-strip`/`.office-scene`/`.event-stack`/`.command-row`/`.menu-layout`)은 **반경 없음**(이미 날카로움, 3px 보더 + 하드 섀도). 건드릴 필요 없음.
- 둥근 반경은 **내부 프리미티브**(버튼, 카드, 배지, 모달, 서브패널)에 ~30곳. 값 분포 — 8px×14, 6px×12, 4px×5, 5px, 10px×3, 12px 등.
- box-shadow 125개 전부 하드 픽셀(`0 Npx 0`, blur 0) — **soft shadow 작업 불필요**.
- transition 8 + animation; `steps()` 31개 vs `ease/cubic-bezier` 28개.

## 보존 (PRESERVE — 절대 바꾸지 말 것)

- `border-radius: 50%` (아바타/원형 아이콘).
- **비대칭 다중값 반경**(말풍선 — `5px 5px 2px 5px`, `12px 12px 4px 4px`, `9px 9px 4px 9px`, `2px 2px 8px 8px` 등). 의도된 도형.
- `border-radius: 999px` (배지 pill) — 그대로 둔다.
- 단순 opacity-only fade transition (페이드는 stepped 로 바꾸면 깜빡여서 어색). 짧은 색/투명도 전환은 smooth 유지 허용.
- `@media (prefers-reduced-motion: reduce)` 블록들 — 그대로 유지(모션 무효화).

---

## 작업 (TDD)

### Task 1 — RED: v0.97 #2 픽셀 토큰 계약

`src/ui/layout-contract.test.ts` — v0.97 블록 뒤에 추가.

```ts
  it("v0.97 unifies pixel radius and stepped motion tokens", () => {
    // 단일 반경 토큰이 정의된다.
    expect(appCss).toMatch(/--pixel-radius:\s*\d/);
    // UI 프리미티브가 토큰을 쓴다(예 버튼/패널). 최소 몇 곳 이상.
    expect((appCss.match(/border-radius:\s*var\(--pixel-radius\)/g) ?? []).length).toBeGreaterThanOrEqual(8);
    // stepped 모션 토큰/타이밍이 정의·사용된다.
    expect(appCss).toMatch(/--pixel-steps?:\s*steps\(/);
  });
```

- [ ] Step 1.1 추가 후 `npm test -- src/ui/layout-contract.test.ts` → **FAIL**. (Codex 는 실제 구현에 맞춰 토큰명/개수 임계값을 조정해도 좋되 의미 유지 — 토큰 정의 + 실제 사용을 검증해야 함.)

### Task 2 — GREEN A: 반경 토큰 통일

`src/App.css`.
- [ ] **Step 2.1** `:root`(또는 기존 토큰 블록)에 `--pixel-radius: 3px;` 추가(3px = 기존 3px 보더와 일치하는 보수적 값).
- [ ] **Step 2.2** **단일값** 사각 반경(`border-radius: 4px|5px|6px|8px|9px|10px|12px`)을 `border-radius: var(--pixel-radius)` 로 교체. **보존 목록(50% / 비대칭 다중값 / 999px)은 건드리지 말 것.** 약 25-30곳.
- [ ] **Step 2.3** `npm test -- src/ui/layout-contract.test.ts` 진행 확인(토큰 사용 ≥8 충족).

### Task 3 — GREEN B: stepped 모션 통일

`src/App.css`.
- [ ] **Step 3.1** stepped 타이밍 토큰 추가(예 `--pixel-steps: steps(6);` 또는 용도별 `steps(4)/steps(8)`).
- [ ] **Step 3.2** **게임 표면의 transform/이동/크기** 계열 transition·animation 의 smooth `ease`/`cubic-bezier` 타이밍을 stepped 로 교체(토큰 사용). 보존 목록(단순 opacity fade, reduced-motion)은 유지. 모션이 어색하면 그 항목은 smooth 유지(선택적, 일관성 우선).
- [ ] **Step 3.3** `npm test -- src/ui/layout-contract.test.ts` → **PASS**.

### Task 4 — 단위 테스트만
- [ ] `npm test -- --maxWorkers=1` 전체 통과(스냅샷/계약 회귀 없음).
- [ ] visual-only — `git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/` 비어 있음.

---

## 완료 기준 (Codex)
1. v0.97 #2 계약 RED→GREEN.
2. `--pixel-radius` 토큰 + 단일값 사각 반경 통일(보존 목록 유지).
3. stepped 모션 토큰 + 게임 표면 transform 모션 통일(fade/reduced-motion 유지).
4. `npm test` 전체 통과. visual-only diff 비어 있음.
5. `git commit` 안 함. 마지막 메시지에 변경 파일 + RED→GREEN + 테스트 결과 + 보존 목록을 안 건드렸다는 확인 + visual-only diff 보고.

## 편집장 검증 (Claude, 실서버)
- 스모크 `check-v096-first-screen.mjs` desktop/mobile exit 0(overflow 0, office 0.26/0.246, actors 6) — 회귀 없음.
- 데스크톱·모바일 스크린샷 육안 — 반경이 일관되게 정리됐고 말풍선/원형/배지 도형은 보존, 깨짐 없음.
- `npm run harness:gate < /dev/null` PASS.
- 통과 시 Lore protocol 커밋(`Co-Authored-By: OpenAI Codex` + `Co-Authored-By: Claude Opus 4.8 (1M context)`) + push. 모션은 정지 스크린샷으로 완전 검증 불가 → 본문 Not-tested 에 "물리 기기 모션 체감" 명시.
