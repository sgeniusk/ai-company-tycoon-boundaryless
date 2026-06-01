# Codex CLI 인계 — v0.96 첫 화면 구성 패스 (First-Screen Composition Pass)

작성일: 2026-06-01
작성자: Claude Code (기획·하네스·검증·커밋 트랙 / 편집장)
대상: Codex CLI — reasoning effort **medium** (visual-only, tick·세이브·밸런스 비관여라 xhigh 불필요. 사용자 지시 "xhigh만 쓸 필요 없다")
작업 디렉토리: `/Users/taewookkim/dev/ai-company-tycoon` (AGENTS.md 기준 authoritative working dir, 세션 cwd. Downloads worktree 와 같은 origin remote, 같은 커밋)
선행 상태: `main` @ `beffc91` (v0.95 sightline rail + 로드맵 핸드오프 직후). 게이트 기준선 53 test files / 642 tests, build PASS, 알려진 Vite >500 kB chunk 경고 1건.
상위 계획: `reports/v0_96_plus_commercial_polish_roadmap.md` §"v0.96 — First-Screen Composition Pass"

> 주의 — 이 리포의 `progress.md` / `feature_list.json` / `session-handoff.md` 는 v0.58~v0.66 기준으로 **stale** 하다(실제는 v0.95 출시 완료). current_feature_id 가 `v0.67-alpha-multi-ending` 로 남아 있지만 **무시**한다. 이번 작업은 **v0.96 visual-only** 다. 신뢰 기준은 이 핸드오프 + `reports/v0_96_plus_commercial_polish_roadmap.md` 뿐이다.

---

## 한 줄 요약

첫 뷰포트가 **UI가 아니라 게임 장면처럼** 읽히게 만든다. 새 시스템을 짓는 게 아니라 **이미 좋은 구성을 계약으로 잠그고, 첫 화면 기준으로 측정하고, 남은 패널 혼잡을 제거**하는 패스다. 오피스 플레이필드를 최우선으로 보호한다.

이 블록은 순수 시각 작업이다. 시뮬레이션·틱·세이브·데이터·경제 로직은 한 줄도 건드리지 않는다.

---

## 절대 원칙 (스코프 가드)

1. **Visual-only**. `src/game/simulation.ts`, `src/game/types.ts`, 세이브 경로(`serializeGameState`/`hydrateGameState`/`SAVE_VERSION`), `data/**` JSON 은 **diff 비어 있어야** 한다. 검증 시 `git diff --exit-code` 로 증명한다.
2. **오피스 플레이필드 보호**. `.office-scene.pixel-office-theater` 와 그 안의 `.staff-sprite.pixel-actor` 코믹 모션은 첫 화면에서 가려지거나 줄어들면 안 된다. 데스크톱·모바일 모두.
3. **결정론 유지**. RNG 추가 금지. 모든 연출은 CSS 파생 또는 기존 상태에서 파생.
4. **계약 파일 편집 금지** (Codex). `AGENTS.md`, `feature_list.json`, `progress.md`, `CLAUDE.md`, `docs/ROADMAP.md` 는 손대지 않는다. 이 파일들은 편집장(Claude)이 마일스톤 종료 시 갱신한다.
5. **`git commit` 금지** (Codex). 구현만 하고 워크트리를 dirty 상태로 남긴다. 게이트 검증·커밋·푸시는 편집장(Claude)이 한다. Lore 커밋의 `Co-Authored-By: OpenAI Codex` 가 Codex 구현을 크레딧한다.
6. **모바일·reduced-motion 안전**. 새 모션을 넣으면 반드시 `@media (prefers-reduced-motion: reduce)` 로 덮는다. 모바일(≤700px, ≤430px) 레이아웃을 깨지 않는다.
7. **additive / derive-only CSS**. 기존 셸 클래스 구조를 재작성하지 않는다. 새 마커 클래스 + scoped 규칙을 얹는다.

---

## 현재 첫 화면 구성 (Codex가 다시 파악하지 않도록 — 이미 확인된 사실)

`src/App.tsx` 의 `<main className="app-shell v034-game-shell">` 아래 6개 표면이 렌더된다.

| 순서 | 컴포넌트 | 마커 클래스 | grid-area (데스크톱) |
|------|----------|-------------|----------------------|
| 1 | `TopBar` (브랜드/상태) | `.top-bar`, `.top-brand-panel` | `top` |
| 2 | `ResourceStrip` (경제 HUD) | `.resource-strip` | `resources` |
| 3 | `GameStage` (오피스) | `.office-scene.pixel-office-theater` | `stage` |
| 4 | 이벤트 레일 | `.event-stack.playfield-event-rail.office-sightline-event-rail` | `stage` (오버레이) |
| 5 | `CommandRow` (턴 콘솔) | `.command-row.pixel-command-console` | `commands` |
| 6 | 메뉴 캐비닛 | `.menu-layout.pixel-menu-cabinet` + `.menu-panel.pixel-menu-screen` | `menu` |

**데스크톱 `.app-shell` 그리드** (`src/App.css:63-82`)
```css
grid-template-areas:
  "top top top"
  "stage stage menu"
  "resources commands menu";
grid-template-columns: minmax(0, 0.94fr) minmax(0, 1fr) clamp(330px, 28vw, 390px);
grid-template-rows: minmax(54px, auto) minmax(0, 1fr) minmax(58px, auto);
height: 100dvh; overflow: hidden;
```

**핵심 — 이벤트 레일은 오피스를 오버레이한다.** `.game-stage`(office)와 `.event-stack` 둘 다 `grid-area: stage` 다(`App.css:589`, `App.css:4073`). 이벤트 레일은 `align-self: end` + `z-index: 6` + `pointer-events: none` 라서 오피스 하단에 떠 있고 **행을 빼앗지 않는다**(`App.css:4069-4112`). 이 트릭이 "턴제지만 사무실이 살아있는" 카이로소프트식 구성의 핵심이다 — **절대 깨지 말 것**.

**모바일 ≤700px** (`App.css:12121`) — 단일 컬럼 5행 `auto minmax(0,1fr) auto auto minmax(180px,34dvh)`, 오피스=2행, 메뉴=5행. `.game-stage` 는 `minmax(180px,1fr) minmax(140px,0.78fr)`. 이벤트 레일은 여전히 `grid-area: stage` 오버레이(`App.css:12168`).

**모바일 ≤430px 계열** (`App.css:12294`) — `minmax(78px,auto) minmax(250px,1fr) auto minmax(74px,auto) minmax(150px,24dvh)`.

결론 — 구성은 이미 양호하다. v0.96 은 **이 구성을 계약으로 고정 + 첫 뷰포트 측정 스모크 + 잔여 혼잡 제거**다. 재설계가 아니다.

---

## 작업 (TDD 블록, 순서대로)

### Task 1 — RED: 첫 화면 구성 레이아웃 계약 추가

**파일** — `src/ui/layout-contract.test.ts` (수정). 이 파일은 `App.tsx`/`App.css`/`GameChrome.tsx` 소스를 `readFileSync` 로 읽어 문자열·정규식으로 검사하는 **정적 소스 계약**이다(`appSource`, `appCss`, `gameChrome` 헬퍼는 파일 상단 1-20행에 이미 정의됨). 렌더 테스트 아님.

v0.95 계약 블록(`it("v0.95 keeps incident panels...")`, line 419 근처) **바로 뒤에** 아래 블록을 추가한다.

```ts
  it("v0.96 composes the first screen as a protected game scene", () => {
    // 마커: 셸이 첫 화면 구성 패스를 opt-in 한다.
    expect(appSource).toContain("first-screen-composition");

    // 구성 규칙이 존재하고 게임 셸에 scoped 되어 있다.
    expect(appCss).toMatch(/\.app-shell\.v034-game-shell\.first-screen-composition\b/);

    // 데스크톱에서 오피스 스테이지가 지배적 중앙 영역으로 유지된다
    // (named grid area 보존, 오피스 행이 유연한 1fr, 메뉴는 사이드 컬럼).
    expect(appCss).toMatch(
      /\.app-shell\s*\{[\s\S]*?grid-template-areas:[\s\S]*?"stage stage menu"[\s\S]*?"resources commands menu"/s,
    );
    expect(appCss).toMatch(
      /\.app-shell\s*\{[\s\S]*?grid-template-rows:\s*minmax\(54px,\s*auto\)\s+minmax\(0,\s*1fr\)\s+minmax\(58px,\s*auto\)/s,
    );

    // 이벤트 레일이 오피스를 오버레이(stage 영역 공유)한다 — 오피스 행을 빼앗지 않는다.
    expect(appCss).toMatch(/\.event-stack\s*\{[^}]*grid-area:\s*stage/s);

    // 첫 화면 혼잡 가드: 4개 크롬 표면(resource/command/event/menu)의 텍스트가
    // 첫 화면에서 넘치지 않도록 clip/wrap 한다. (Codex가 실제 구현한 selector·속성으로 확정.)
    expect(appCss).toMatch(
      /\.app-shell\.v034-game-shell\.first-screen-composition\b[\s\S]*?(min-width:\s*0|overflow:\s*hidden|overflow:\s*auto|text-overflow:\s*ellipsis|overflow-wrap)/s,
    );
  });
```

- [ ] **Step 1.1** 위 블록을 v0.95 블록 뒤에 추가한다.
- [ ] **Step 1.2** RED 확인 — `npm test -- src/ui/layout-contract.test.ts`. 기대 결과 **FAIL** (이유: `first-screen-composition` 마커와 scoped 규칙이 아직 없음). 이 실패를 QA 리포트에 기록한다.

> 비고 — assertion 3·4·5(grid-area/rows/overlay)는 현재 좋은 구성을 **잠그는** 회귀 가드라 지금도 통과한다(편집장이 현재 App.css 에 대해 정규식 매칭 검증 완료). RED 를 유발하는 건 assertion 1·2(마커)와 6(혼잡 가드)다. Codex 는 실제 구현 CSS 에 맞춰 assertion 을 더 구체화해도 좋되, **의미를 유지**한다(vacuous assertion 금지).

### Task 2 — GREEN: 마커 + 구성 CSS 구현

**파일** — `src/App.tsx` (수정, 1줄), `src/App.css` (수정, 추가 블록).

- [ ] **Step 2.1** `src/App.tsx:119` 의 셸 className 에 마커 추가.
  ```tsx
  // 변경 전
  <main className="app-shell v034-game-shell">
  // 변경 후
  <main className="app-shell v034-game-shell first-screen-composition">
  ```

- [ ] **Step 2.2** `src/App.css` 에 `.app-shell.v034-game-shell.first-screen-composition` scoped 규칙 블록을 추가한다(기존 `.app-shell` 규칙 근처, 또는 셸 관련 섹션 끝). **요구 효과**(정확한 px·값은 Codex 가 측정 기반으로 확정)
  1. **오피스 우선** — 오피스 스테이지가 첫 화면의 지배적 영역이 되도록 보장. 기존 `minmax(0, 1fr)` 스테이지 행 우선순위를 유지·강화하되 메뉴/리소스/커맨드가 오피스를 밀어내지 않게 한다. (기존 area 정의를 재작성하지 말고, 필요하면 scoped 규칙으로 보강.)
  2. **혼잡 가드** — 4개 크롬 표면의 텍스트가 첫 화면에서 가로로 넘치지 않게 clip/wrap. 최소한 `.first-screen-composition .resource-strip`, `.first-screen-composition .command-row`, `.first-screen-composition .menu-panel`, 이벤트 레일에 `min-width: 0` + `overflow: hidden|auto` + 긴 라벨 `overflow-wrap: anywhere` 또는 `text-overflow: ellipsis` 적용.
  3. **5표면 시각 구분 유지** — topbar/resource/office/event/command/menu 각자의 픽셀 보더·배경 토큰이 살아있게(이미 `App.css:99-108` 등에서 보더/섀도 적용 중 — 약화하지 말 것).
  4. **새 모션을 넣었다면** 반드시 `@media (prefers-reduced-motion: reduce)` 로 무효화(파일에 이미 10개 reduced-motion 블록 존재 — 패턴 재사용).

- [ ] **Step 2.3** GREEN 확인 — `npm test -- src/ui/layout-contract.test.ts`. 기대 **PASS**.

### Task 3 — 브라우저 스모크: 첫 뷰포트 측정

**파일** — `scripts/qa/check-v096-first-screen.mjs` (신규). v0.95 스모크(`scripts/qa/check-v095-event-sightline.mjs`)와 달리 **fullPage 가 아니라 첫 뷰포트**(스크롤 없이 보이는 화면)를 측정한다. 데스크톱 1366×768, 모바일 390×844. 스크린샷 경로는 하드코딩 절대경로 대신 **스크립트 위치 기준 상대경로**로 도출해 클론 이식성을 확보한다(v0.99 재현성 목표 선반영).

아래를 참조 구현으로 사용한다(필요 시 미세 조정 가능, 측정 의미 유지).

```js
import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

// Codex 런타임 기본 경로 유지 + 이식성 위해 env 오버라이드 허용 (playwright 는 repo dep 아님).
const runtimeModules =
  process.env.PW_NODE_MODULES ??
  "/Users/taewookkim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/";
const require = createRequire(runtimeModules);
const { chromium } = require("playwright");

const baseUrl = process.argv[2] ?? "http://127.0.0.1:5222/?scenario=office-visuals";
const screenshotPrefix = process.argv[3] ?? "v0_96_first_screen";
// 스크립트 위치(scripts/qa/) 기준 → <repo>/reports/qa/screenshots/  (클론 무관 이식성).
const screenshotDir = fileURLToPath(new URL("../../reports/qa/screenshots/", import.meta.url));
mkdirSync(screenshotDir, { recursive: true });

const errors = [];

async function dismissBlockingSurfaces(page) {
  const selectors = [
    ".payoff-celebration-dismiss",
    ".world-reveal-dismiss",
    ".big-event-dismiss",
    ".offline-modal button",
  ];
  for (let attempt = 0; attempt < 5; attempt += 1) {
    let clicked = false;
    for (const selector of selectors) {
      const button = page.locator(selector).first();
      if (await button.isVisible().catch(() => false)) {
        await button.click({ timeout: 3000 });
        await page.waitForTimeout(250);
        clicked = true;
      }
    }
    if (!clicked) break;
  }
}

async function smoke(browser, viewport, screenshotName) {
  const page = await browser.newPage({ viewport });
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto(baseUrl, { waitUntil: "networkidle" });
  await dismissBlockingSurfaces(page);
  await page.waitForTimeout(1200);
  // 첫 뷰포트만 캡처 (fullPage: false = 플레이어가 로드 시 보는 화면).
  await page.screenshot({ path: `${screenshotDir}/${screenshotName}`, fullPage: false });

  const metrics = await page.evaluate(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const viewportArea = vw * vh;

    const isRenderable = (node) => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
    };
    // 사각형을 첫 뷰포트로 클리핑한 가시 넓이/높이.
    const clip = (rect) => {
      if (!rect) return { area: 0, height: 0, visible: false };
      const left = Math.max(0, rect.left);
      const top = Math.max(0, rect.top);
      const right = Math.min(vw, rect.right);
      const bottom = Math.min(vh, rect.bottom);
      const w = Math.max(0, right - left);
      const h = Math.max(0, bottom - top);
      return { area: w * h, height: Math.round(h), visible: w > 0 && h > 0 };
    };
    const inRect = (rect, x, y) =>
      !!rect && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;

    const office = document.querySelector(".office-scene.pixel-office-theater");
    const officeRect = office?.getBoundingClientRect();
    const officeClip = clip(officeRect);

    const actors = [...document.querySelectorAll(".staff-sprite.pixel-actor")].filter(isRenderable);

    // 4개 크롬 표면의 가로 텍스트 오버플로 합산.
    const surfaceSelectors = [
      ".resource-strip",
      ".command-row",
      ".event-stack.office-sightline-event-rail",
      ".menu-layout .menu-panel",
      ".menu-layout .main-menu",
    ];
    let surfaceTextOverflowCount = 0;
    for (const sel of surfaceSelectors) {
      for (const container of document.querySelectorAll(sel)) {
        const nodes = container.querySelectorAll("button, span, strong, small, p, h1, h2, h3, li, em, code");
        for (const node of nodes) {
          if (node.scrollWidth > node.clientWidth + 1) surfaceTextOverflowCount += 1;
        }
      }
    }

    // 오피스 중심이 첫 뷰포트 안에서 사이드/하단 크롬에 가려지지 않는지.
    const occluders = [
      document.querySelector(".resource-strip"),
      document.querySelector(".command-row"),
      document.querySelector(".menu-layout"),
    ].map((n) => n?.getBoundingClientRect());
    const cx = officeRect ? (Math.max(0, officeRect.left) + Math.min(vw, officeRect.right)) / 2 : 0;
    const cy = officeRect ? (Math.max(0, officeRect.top) + Math.min(vh, officeRect.bottom)) / 2 : 0;
    const officeCenterOccluded = officeRect ? occluders.some((r) => inRect(r, cx, cy)) : true;

    return {
      actorCount: actors.length,
      documentWidthOverflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      officeCenterOccluded,
      officeVisibleFraction: viewportArea ? Number((officeClip.area / viewportArea).toFixed(3)) : 0,
      officeVisibleHeight: officeClip.height,
      officeVisible: officeClip.visible,
      surfaceTextOverflowCount,
      viewport: { vw, vh },
    };
  });

  await page.close();
  return metrics;
}

const browser = await chromium.launch({ headless: true });
const desktop = await smoke(browser, { width: 1366, height: 768 }, `${screenshotPrefix}_desktop.png`);
const mobile = await smoke(browser, { width: 390, height: 844, isMobile: true }, `${screenshotPrefix}_mobile.png`);
await browser.close();

const result = { baseUrl, desktop, errors, mobile };
console.log(JSON.stringify(result, null, 2));

// 게이트 — 임계값은 GREEN 빌드에서 측정 후 관측치보다 10~15% 낮게 보정해 확정한다(아래 Step 3.3).
if (errors.length) process.exit(1);
if (!desktop.officeVisible || !mobile.officeVisible) process.exit(2);
if (desktop.actorCount < 6 || mobile.actorCount < 6) process.exit(3);
if (desktop.officeVisibleFraction < 0.22) process.exit(4);
if (mobile.officeVisibleFraction < 0.16) process.exit(5);
if (desktop.surfaceTextOverflowCount > 0 || mobile.surfaceTextOverflowCount > 0) process.exit(6);
if (desktop.officeCenterOccluded || mobile.officeCenterOccluded) process.exit(7);
if (desktop.documentWidthOverflow !== 0 || mobile.documentWidthOverflow !== 0) process.exit(8);
```

- [ ] **Step 3.1** dev 서버를 띄운다 — `npm run dev -- --port 5222`(백그라운드). v0.95 와 동일 포트 관례.
- [ ] **Step 3.2** 스모크 실행 — `node scripts/qa/check-v096-first-screen.mjs http://127.0.0.1:5222/?scenario=office-visuals`. (Codex 런타임 node 사용. 필요 시 `PW_NODE_MODULES` 로 playwright 경로 지정.)
- [ ] **Step 3.3** **임계값 보정** — 첫 통과 출력의 `officeVisibleFraction`(desktop/mobile)을 보고, exit 4·5 임계값을 관측치보다 약 10~15% 낮게 설정한다(예 desktop 관측 0.30 → 0.25, mobile 관측 0.22 → 0.18). 과도하게 빡빡한 게이트로 flaky 해지지 않게 한다. 보정 근거를 QA 리포트에 적는다.
- [ ] **Step 3.4** 스모크가 exit 0 으로 통과하는지 확인. 스크린샷 2장이 `reports/qa/screenshots/v0_96_first_screen_{desktop,mobile}.png` 에 생성됐는지 확인.

### Task 4 — (선택, 비차단) npm 스크립트로 재현성 확보

**파일** — `package.json` (수정). 계약 파일 아님 — 추가 허용. v0.99 로드맵 목표("스모크가 tracked repo 파일에서 재현 가능")를 앞당긴다.

- [ ] **Step 4.1** `scripts` 에 추가
  ```json
  "qa:v096-first-screen": "node scripts/qa/check-v096-first-screen.mjs"
  ```
  넣지 않아도 블록은 통과한다. 넣으면 `npm run qa:v096-first-screen -- http://127.0.0.1:5222/?scenario=office-visuals` 로 호출.

### Task 5 — QA 리포트 작성

**파일** — `reports/qa/v0_96_first_screen_run.md` (신규). v0.95 리포트(`reports/qa/v0_95_event_sightline_run.md`) 형식을 따른다. 포함

- Scope — 무엇을 했고 무엇을 안 건드렸는지(visual-only 선언).
- TDD Evidence — RED(마커 부재로 실패) / GREEN(통과) 실제 출력.
- Browser Smoke — 명령, 시나리오, 데스크톱·모바일 메트릭(officeVisibleFraction, officeVisibleHeight, actorCount, surfaceTextOverflowCount, officeCenterOccluded, documentWidthOverflow), **임계값 보정 근거**.
- Screenshots — 2장 경로.
- Gate — `npm run harness:gate < /dev/null` 결과.
- Visual-only 증거 — `git diff --exit-code` 가 `simulation.ts`/`types.ts`/세이브/`data/**` 에서 비어 있음.

---

## 완료 기준 (Definition of Done)

1. v0.96 레이아웃 계약 블록 추가, RED→GREEN 입증.
2. `src/App.tsx` 마커 1줄 + `src/App.css` scoped 구성 규칙.
3. `scripts/qa/check-v096-first-screen.mjs` 신규, 첫 뷰포트 데스크톱·모바일 통과(exit 0), 스크린샷 2장.
4. 첫 화면 수용 기준(로드맵) — 오피스 장면이 데스크톱·모바일 첫 뷰포트에서 보이고 nonblank, 4개 표면 텍스트 오버플로 0, 오피스 중심 비가림.
5. `npm run harness:gate < /dev/null` PASS (기준선 53 files / 642 tests 이상, 신규 계약 테스트 포함).
6. **Visual-only 증거** — `git diff --exit-code -- src/game/simulation.ts src/game/types.ts data/` 비어 있음(세이브·틱·데이터 불변).
7. `reports/qa/v0_96_first_screen_run.md` 작성.

---

## 검증 명령 (정확)

```bash
# 좁은 테스트 (개발 중)
npm test -- src/ui/layout-contract.test.ts

# 첫 뷰포트 스모크
npm run dev -- --port 5222            # 백그라운드
node scripts/qa/check-v096-first-screen.mjs http://127.0.0.1:5222/?scenario=office-visuals

# visual-only 증명
git --no-pager diff --stat -- src/game/simulation.ts src/game/types.ts data/

# 전체 게이트 (완료 선언 전)
npm run harness:gate < /dev/null
```

`harness:gate` = `npm test -- --maxWorkers=1 && npm run validate:data && npm run qa:beta-readiness:check && npm run build`.

---

## 세션 종료 시 (Codex)

`git commit` 하지 않는다. 마지막 메시지에 다음을 보고한다.
- 변경 파일 목록.
- RED→GREEN 증거(실패 사유 + 통과).
- 스모크 메트릭(데스크톱·모바일) + 임계값 보정 근거.
- Visual-only 증거(빈 `simulation.ts`/`types.ts`/세이브/`data` diff).
- 게이트 결과(파일 수 / 테스트 수).

계약 파일(`AGENTS.md`/`feature_list.json`/`progress.md`/`CLAUDE.md`/`docs/ROADMAP.md`)은 편집하지 않는다.

---

## 커밋·푸시 (편집장 Claude 가 검증 후 수행 — Lore protocol)

Codex 구현이 게이트를 통과하면 편집장이 아래 형식으로 커밋한다. 제목은 버전 프리픽스 없는 in-world 명령형, 본문은 8개 필드 고정.

```text
Stage the first screen as a pixel game scene

Constraint: Commercial polish needs the first viewport to read as a living office scene before any UI chrome, without touching simulation, save, or tick behavior.

Rejected: Rebuilding the app-shell grid | the existing stage-priority composition with the event rail overlaying the office already works, so a scoped first-screen-composition pass adds the lock and crowding guard without moving core layout.

Confidence: high

Scope-risk: narrow

Directive: Keep the office stage dominant, the five chrome surfaces distinct and overflow-safe, and all new first-screen motion reduced-motion guarded.

Tested: npm test -- src/ui/layout-contract.test.ts; node scripts/qa/check-v096-first-screen.mjs; npm run harness:gate < /dev/null.

Not-tested: Physical-device first-paint feel on a real phone.

Co-Authored-By: OpenAI Codex <codex@openai.com>
```

푸시 — `git push origin main`.

---

## 편집장 후속 (이 블록 종료 후, Codex 아님)

마일스톤 종료 시 편집장이 계약 파일을 갱신한다(현재 stale 상태 — 별도 처리).
- `feature_list.json` `current_feature_id` 는 아직 `v0.67-alpha-multi-ending` 로 stale. v0.96 진입 시 갱신.
- `progress.md` / `session-handoff.md` / `docs/SESSION_HANDOFF.md` 는 v0.58~v0.66 기준으로 stale — v0.95/v0.96 현재 상태로 갱신 필요.
- `reports/v0_96_plus_commercial_polish_roadmap.md` 에 v0.96 종료 표기 + v0.97 다음 블록.
