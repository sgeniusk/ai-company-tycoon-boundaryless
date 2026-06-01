# Codex CLI 인계 — v0.97 #1 데스크톱 자원 HUD 픽셀 재설계

작성일: 2026-06-02
작성자: Claude Code (기획·하네스·검증·커밋 트랙 / 편집장)
대상: Codex CLI — reasoning effort **medium** (visual-only CSS)
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon` (세션 cwd, AGENTS.md authoritative)
선행 상태: `main` @ `54f520a` (v0.96 closed + state 갱신). 게이트 기준선 53 files / 643 tests.
상위 계획: `reports/v0_96_plus_commercial_polish_roadmap.md` §"v0.97 — Pixel-Art Consistency Sweep"

> **중요 — Codex 는 브라우저 스모크/ dev server 를 돌리지 마라.** Codex 샌드박스는 localhost Chromium 을 차단(`ERR_ACCESS_DENIED`)하고 dev server 에 매달려 행에 걸린다. **너는 CSS + 단위 테스트(`npm test`)까지만** 한다. 브라우저 스모크·스크린샷·게이트 최종 확인은 편집장(Claude)이 실서버에서 직접 한다.

---

## 한 줄 요약

v0.96 이 데스크톱에서도 픽셀 자원 아이콘(`.resource-icon`)·증감 델타(`.resource-delta`)를 `display:none` 으로 숨겼다(좁은 타일에서 값이 넘쳐서). 이번 블록은 **데스크톱(>1100px)에서 픽셀 아이콘과 델타를 다시 보이게 하되, 타일을 콤팩트하게 맞춰 오버플로 0 을 유지**한다. 사용자 지시 — "v0.97 에서 HUD 재설계로 픽셀 아이콘/델타 복원".

visual-only. 시뮬·세이브·데이터·tick 불변.

---

## 절대 원칙

1. **Visual-only** — `src/game/simulation.ts`, `src/game/types.ts`, 세이브, `data/**` diff 비어야 한다. `ResourceStrip` 마크업(`src/components/GameChrome.tsx`)도 가능하면 손대지 말고 CSS 로 해결한다(필요하면 className 추가 정도만, 로직/데이터 변경 금지).
2. **오버플로 0 유지** — 편집장 스모크 `check-v096-first-screen.mjs` 의 `surfaceTextOverflowCount` 가 desktop/mobile 모두 **0** 이어야 한다(이게 핵심 게이트). 즉 모든 텍스트가 타일 안에 실제로 들어가야 한다(ellipsis 만으로는 부족 — scrollWidth ≤ clientWidth).
3. **모바일 불변** — ≤1100px 콤팩션(값 위주)은 그대로 둔다. 모바일 자원 스트립 렌더는 바뀌면 안 된다.
4. **결정론·reduced-motion** — 새 모션 없음(정적 재배치). 계약 파일/`git commit` 금지(편집장이 커밋).

---

## 현재 구조 (이미 확인됨 — 다시 파보지 말 것)

`ResourceStrip` (`src/components/GameChrome.tsx:503`) — `.resource-strip` 안에 8개 `.resource-tile`. 각 타일
- `.resource-icon` (CommercialUiIcon 픽셀 아이콘) — `grid-row: 1`
- `span` (자원명, 예 "현금") — `grid-column: 2`, font 0.58rem
- `strong` (값, 예 ₩87,000) — `grid-column: 1 / -1`, **font 0.76rem** ← 데스크톱 오버플로 주범
- `small.resource-delta` (예 "+12,000" / "변동 없음") — `grid-column: 1 / -1`, font 0.56rem

데스크톱 `.resource-strip` (`App.css:620`) — `grid-template-columns: repeat(8, minmax(0, 1fr))`. 즉 8타일이 grid-area `resources`(하단 좌측 컬럼 ≈ 477px)를 8등분 → 타일당 ≈ 55-59px. 그래서 0.76rem 값이 넘친다.

v0.96 콤팩션(`App.css:150-182`, `.first-screen-composition` scope)이 데스크톱 포함 모든 폭에서 icon/span/delta 를 `display:none` 하고 값만 0.58rem 로 보여준다. **이 콤팩션을 ≤1100px 로 한정하고, 데스크톱용 콤팩트 타일을 새로 얹는 게 이번 작업이다.**

---

## 작업 (TDD)

### Task 1 — RED: v0.97 데스크톱 자원 HUD 계약

**파일** `src/ui/layout-contract.test.ts` — v0.96 블록 뒤에 추가.

```ts
  it("v0.97 keeps desktop resource-HUD pixel icons and deltas visible", () => {
    // 자원 아이콘/델타 숨김은 좁은 뷰포트(≤1100px)로 한정된다 — 데스크톱은 픽셀 아이콘+델타 유지.
    expect(appCss).toMatch(
      /@media\s*\(max-width:\s*1100px\)[\s\S]*?\.first-screen-composition\b[\s\S]*?\.resource-icon[\s\S]*?display:\s*none/s,
    );
    // 데스크톱(>1100px) 자원 타일을 아이콘+값+델타가 들어가도록 콤팩트 재배치하는 규칙이 존재한다.
    expect(appCss).toMatch(
      /@media\s*\(min-width:\s*1101px\)[\s\S]*?\.first-screen-composition\b[\s\S]*?\.resource-tile/s,
    );
  });
```

- [ ] Step 1.1 추가 후 `npm test -- src/ui/layout-contract.test.ts` → **FAIL**(아직 min-width:1101 데스크톱 규칙 없음, 숨김이 max-width 안에 없음). 실패를 기록.
- [ ] (Codex 는 실제 구현 selector 에 맞춰 정규식을 더 구체화해도 좋되 의미 유지.)

### Task 2 — GREEN: 콤팩션을 ≤1100px 로 한정 + 데스크톱 콤팩트 타일

**파일** `src/App.css` (그리고 필요 시 `GameChrome.tsx` 에 className 한 개 추가 정도).

- [ ] **Step 2.1** v0.96 콤팩션 블록(`App.css:150-182`, `display:none` + resource-tile/strong + command-row/action 재배치)을 `@media (max-width: 1100px) { ... }` 로 감싼다. 단, **자원 관련 부분만** 데스크톱에서 풀면 된다(command-row/command-action 콤팩션은 그대로 모든 폭 유지해도 됨 — 이번 블록은 자원 HUD 집중). 즉 최소한 `.resource-tile span`, `.resource-icon`, `.resource-delta` 의 `display:none` 과 `.resource-tile`/`.resource-tile strong` 재배치를 ≤1100px 로 한정.
- [ ] **Step 2.2** 데스크톱(`@media (min-width: 1101px)`)용 콤팩트 자원 타일 규칙을 `.first-screen-composition` scope 로 추가. **목표 — 아이콘+값+델타가 ≈55-59px 타일에 오버플로 없이 들어간다.** 권장 접근
  - `.resource-icon` 작게(예 14-16px, 기존 아이콘 크기보다 축소) + 표시 유지.
  - `.resource-tile span`(자원명)은 데스크톱에서 **숨겨도 된다**(아이콘이 정체성 전달; 이름은 `title`/aria 로 충분). 이름까지 넣으려다 오버플로 내지 말 것.
  - `.resource-tile strong`(값) 폰트를 0.76rem → **약 0.56-0.6rem** 로(v0.96 에서 0.58rem 이 들어맞음 확인). `font-variant-numeric: tabular-nums` 권장.
  - `.resource-delta` 표시 유지하되 **콤팩트**하게 — 폰트 ~0.5rem, 0 일 때 "변동 없음" 대신 짧은 글리프(예 `·` 또는 `—`). 숫자가 길면 타일을 넘기지 않게 보장(필요 시 천 단위 약식, 예 +12k). 색은 기존 positive/negative/neutral 유지.
  - 타일 그리드를 아이콘행 + 값행 + 델타행(또는 아이콘 옆 값, 아래 델타)으로, 각 텍스트가 타일 폭 안에 실제로 들어가게.
- [ ] **Step 2.3** `npm test -- src/ui/layout-contract.test.ts` → **PASS**.

### Task 3 — 단위 테스트만 (브라우저 X)

- [ ] `npm test -- --maxWorkers=1` 전체 통과 확인(스냅샷/계약 회귀 없음). **브라우저 스모크·dev server 는 실행하지 마라** — 편집장이 한다.
- [ ] visual-only 증명 — `git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/` 비어 있음.

---

## 완료 기준 (Codex)

1. v0.97 계약 블록 RED→GREEN.
2. 자원 콤팩션이 ≤1100px 로 한정되고, 데스크톱 콤팩트 자원 타일 규칙이 추가됨.
3. `npm test` 전체 통과(643+ tests).
4. visual-only diff 비어 있음.
5. `git commit` 안 함. 마지막 메시지에 변경 파일 + RED→GREEN + 단위테스트 결과 + visual-only diff 보고.

## 편집장 검증 (Codex 아님 — Claude 가 실서버에서)

- dev server `:5222` 띄우고 `check-v096-first-screen.mjs` 실행 → **desktop/mobile surfaceTextOverflowCount 0, exit 0** 확인.
- desktop 렌더에서 `.resource-icon`·`.resource-delta` 가 실제로 보이는지(renderable) + 스크린샷 육안 확인.
- `npm run harness:gate < /dev/null` PASS.
- 통과 시 Lore protocol 로 커밋(제목 in-world 명령형, 본문 8필드, `Co-Authored-By: OpenAI Codex` + `Co-Authored-By: Claude Opus 4.8 (1M context)`) + push.
