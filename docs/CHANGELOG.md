# Changelog — AI Company Tycoon: Boundaryless

All notable changes to this project will be documented in this file.

---

## [0.12.1-alpha] — 2026-05-15

### 카드와 퍼즐의 직접 조작

**추가:**
- 개발 퍼즐 칸을 직접 선택하고 해결하는 UI.
- 퍼즐 선택 제한 검증과 해결 가능 여부 안내.
- 카드가 다음 퍼즐의 점수, 난이도, 선택 가능 칸 수를 바꾸는 보정 시스템.
- 퍼즐 결과에 적용된 카드 보정 이름 표시.
- 카드-퍼즐 상호작용 테스트.

**변경:**
- `GPU 버스트`, `고객 인터뷰`, `세이프티 리뷰` 등 전략 카드에 퍼즐 보정 효과를 추가.
- `덱` 메뉴의 퍼즐 버튼을 `상위 이슈 해결`에서 `선택 이슈 해결`로 변경.
- 저장 상태에 활성 퍼즐 보정 목록을 포함하고, 오래된 저장은 빈 목록으로 복구.
- 데이터 검증기가 퍼즐 관련 카드 효과를 허용하고 검증.

**검증:**
- `npm test` 통과, 80 tests
- `npm run validate:data` 통과
- `npm run build` 통과
- `npm run harness:gate` 통과

---

## [0.12.0-alpha] — 2026-05-15

### 로그라이트 덱빌딩 전환 기반

**추가:**
- 시작 덱, 손패, 드로우 더미, 버림 더미를 포함한 전략 덱 시스템.
- `data/strategy_cards.json`과 `data/meta_unlocks.json` 데이터 파일.
- 전략 카드 사용으로 자원, 개발 진행도, 완성도를 바꾸는 게임 로직.
- 3x3 개발 퍼즐 프로토타입과 프로젝트 진행/완성도 반영.
- 창업 통찰, 메타 해금, 새 런 시작 기능.
- 덱/퍼즐/메타 해금을 다루는 새 `덱` 메뉴.
- `?scenario=deck` 브라우저 QA 시나리오.
- 로그라이트 덱빌딩 전환 설계 문서와 제작 에이전트 조직도.

**변경:**
- 현재 장르 방향을 “카이로소프트식 AI 회사 경영 + 로그라이트 덱빌딩 + 개발 퍼즐”로 재정의.
- 상단 상태 영역에 런 번호와 창업 통찰을 표시.
- 저장 버전을 `3`으로 올리고 기존 저장에는 기본 로그라이트 상태를 보강.
- 데이터 검증기가 전략 카드와 메타 해금 참조를 검증.

**검증:**
- `npm test` 통과, 78 tests
- `npm run validate:data` 통과
- `npm run build` 통과

---

## [0.11.0-alpha] — 2026-05-15

### Commercial Readiness Systems Before Final Graphics

**Added:**
- Data-driven run achievements with one-time rewards and company-panel progress.
- Growth-path monthly strategy effects and monthly report/timeline surfacing.
- Run summary grading with rank, strengths, verdict, and next recommendation.
- Safe save hydration and `validateGameStateIntegrity` diagnostics.
- Scripted commercial balance simulator covering all growth paths.
- Product level upgrades for active products with level-scaled revenue, users, data, and compute pressure.
- `?scenario=commercial` browser QA scenario for final-summary and long-run checks.

**Updated:**
- Productivity growth path now gives enough early cash support to branch into a second product.
- Run summary scoring now penalizes heavy negative cash instead of over-rewarding growth alone.
- QA scenario docs include commercial readiness checks.

**Verification:**
- `npm test` passed, 72 tests
- `npm run validate:data` passed
- `npm run build` passed
- Chrome visual QA passed at `http://127.0.0.1:5178/?scenario=commercial`

---

## [0.10.1-alpha] — 2026-05-15

### Strategy And Arc QA Scenarios

**Added:**
- `?scenario=strategy` for chosen-path competition signal QA
- `?scenario=arc` for 10-month MVP arc and follow-up objective QA
- Tests for the new scenario IDs and URL parsing

**Updated:**
- QA scenario documentation now includes strategy and arc URLs/checklists

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.10.0-alpha] — 2026-05-15

### Ten-Month MVP Arc

**Added:**
- 10-month MVP arc with five milestone checkpoints
- Progress percentage and milestone details in the company panel
- Tests for initial arc state and release/strategy progress

**Updated:**
- Company overview now shows both long-arc progress and chosen-strategy objectives

**Verification:**
- `npm test` passed, 52 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.9-alpha] — 2026-05-15

### Release Headlines And Market Reaction

**Added:**
- Release headline generation based on product and review score
- Market reaction copy for consumer, developer, and enterprise launches
- Release spotlight display for headline and reaction text
- Save hydration backfill for older release moments

**Updated:**
- Release moment tests now verify headline and market reaction presence

**Verification:**
- `npm test` passed, 50 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.8-alpha] — 2026-05-15

### Growth Path Follow-Up Objectives

**Added:**
- Three follow-up objectives for each chosen growth path
- `growth-objectives` module for evaluating objective completion from real game state
- Company panel strategy objective checklist
- Validation and tests for objective references and completion rules

**Updated:**
- Growth path data now includes `followup_objectives`
- Data validator checks objective product, capability, item, upgrade, resource, and menu references

**Verification:**
- `npm test` passed, 50 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.7-alpha] — 2026-05-15

### Competition Strategy Signals

**Added:**
- Growth-path competition signal calculator for rival overlap, watch states, and claimed-space conflicts
- Competition ranking and rival cards now show `전략 충돌`, `선점 충돌`, `관찰 필요`, or `간접 경쟁`
- Tests for chosen-strategy overlap and claim escalation

**Updated:**
- Competition panel copy now reflects the chosen growth strategy when one exists
- Rival cards visually distinguish strategic and contested pressure

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.6-alpha] — 2026-05-15

### Commit To Growth Path

**Added:**
- One-time post-release growth path commitment action
- `chosenGrowthPath` runtime/save state with path id, title, chosen month, bonus description, and applied effects
- Data-driven `commitment_effects` and `bonus_description` for each growth path
- Selected growth path display in the company stage card
- Tests for selection gating, persistence, duplicate prevention, and guidance completion

**Updated:**
- Growth path cards now choose the path on first click, then route to their target menu
- The opening objective `다음 성장 선택` now completes after committing to a growth path
- Data validator now checks growth path commitment effects

**Verification:**
- `npm test` passed, 46 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.5-alpha] — 2026-05-15

### Post-Release Growth Forks

**Added:**
- Data-driven `growth_paths.json` with three post-release routes: 생산성 제품 라인, 신뢰 기반 엔터프라이즈, 코드/비전 연구소
- Release moments now carry actionable growth path cards with target menu, action label, payoff, and recommended references
- Release spotlight UI now shows the three next-growth choices as clickable cards
- Data validation and tests for growth path references

**Updated:**
- Post-release guidance now points the player toward choosing a growth path instead of only buying an item
- QA release scenario now verifies that growth paths appear after first release
- Old saves with a release moment are hydrated with derived growth paths

**Verification:**
- `npm test` passed, 43 tests
- `npm run validate:data` passed
- `npm run build` passed
- Vite dev server started at `http://127.0.0.1:5173/`; Computer Use browser inspection timed out and `curl` could not connect from this environment

---

## [0.9.4-alpha] — 2026-05-15

### Opening Competitor Pacing

**Added:**
- Early rival foreshadowing during months 2-3 before any product-space claims happen
- Timeline entries for rival preparation, using `경쟁사 ... 예고` wording
- Simulation tests that lock the opening learning window and post-window rival claims

**Updated:**
- Rival product-space claims now begin from month 4 instead of appearing during the first three months
- Early contested-domain copy now reads as observation before it becomes direct pressure
- v0.9.1 10-expert P2 competitor pacing feedback is recorded as addressed for this slice

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.3-alpha] — 2026-05-15

### Browser QA Scenarios And Screen Polish

**Added:**
- `qa-scenarios` module for stable first-screen, project, release, and shop QA states
- URL query scenario loading via `?scenario=fresh`, `?scenario=project`, `?scenario=release`, and `?scenario=shop`
- QA scenario status pill in the top bar
- `docs/QA_SCENARIOS.md` with scenario URLs and visual QA checklist
- Tests for QA scenario generation and URL parsing

**Updated:**
- Top status pills now wrap to reduce overflow risk
- Release spotlight has a small reduced-motion-safe emphasis animation
- Office scene hides extra decorative objects on narrow screens
- Mobile guidance card/objective strip layout is tighter

**Verification:**
- `npm test` passed, 41 tests
- `npm run build` passed
- Static server and Computer Use browser checks were attempted, but local browser access timed out or could not connect from the Codex environment; this is recorded in the QA report

---

## [0.9.2-alpha] — 2026-05-15

### Game Dev Harness Skill Draft

**Added:**
- Draft `ai-game-dev-harness` skill under `docs/skills/ai-game-dev-harness/SKILL.md`
- Versioned production workflow for each game improvement
- Question card protocol for direction choices
- Retention/LTV, shareability, and solo-dev scope gates
- Report and commit requirements for future milestones

**Updated:**
- `AGENTS.md` now includes Retention/LTV Agent, Shareability Agent, and Solo Dev Scope Agent
- Production communication list now references the game development harness skill draft

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.1-alpha] — 2026-05-15

### Tester-Driven Office And Release Polish

**Added:**
- Player guidance system for the first 60 seconds: hire agent → start product → advance month → buy first item
- Opening objective strip with completion states for the first-session path
- Release moment state for the latest product launch, including product name, month, grade, score, and review quote
- Boundaryless expansion hint after product release
- Release spotlight card in the office stage
- Manifest-driven office object placeholders placed directly on the office floor
- Tests for guidance steps and latest release spotlight state

**Updated:**
- `AI 글쓰기 비서` monthly revenue increased from `₩800` to `₩1,600` based on the 10-expert direction playtest P1 economy finding
- Game stage now has an actionable "다음 목표" card informed by synthetic playtest feedback
- Product project releases now preserve the latest release moment through save/load
- Office scene now uses the v0.9 asset manifest beyond metadata-only planning

**Verification:**
- `npm test` passed, 35 tests
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.9.0-alpha] — 2026-05-15

### Pixel Asset Manifest Scaffold

**Added:**
- `data/asset_manifest.json` for sprite grid, priority agent sprites, competitor logos, office objects, and first item icons
- TypeScript asset manifest types and loader export
- Vitest coverage for v0.9 pixel asset manifest requirements
- Data validator checks for asset references, sprite grid sizes, placeholder status, animation rows, and hex palettes

**Updated:**
- Agent portraits now consume manifest palettes and body classes
- Competitor profile cards now show placeholder logo identities
- Shop item cards now show placeholder item icons for the first asset batch
- Pixel asset plan now records the scaffolded manifest gate

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.8.1-alpha] — 2026-05-15

### UI Structure Prep For Pixel Assets

**Added:**
- Dedicated `components/GameChrome.tsx` for top bar, resources, office scene, events, command row, and menu nav
- Dedicated `components/MenuPanels.tsx` for company, product, agent, research, shop, competition, and log panels
- Shared `ui/formatters.ts` and `ui/menu.ts`

**Updated:**
- Reduced `src/App.tsx` from a large all-in-one UI file to a compact state orchestration shell
- Preserved existing gameplay behavior while making v0.9 pixel asset work safer

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.8.0-alpha] — 2026-05-15

### Competition And I18n Foundation

**Added:**
- 5 fictional AI competitors: 챗지오디, 클로이, 제미있니, 노바런, 오토마루
- Competition menu with market ranking, rival profiles, market share, research level, and claimed product spaces
- Monthly rival growth and deterministic product-space claiming
- Rival events with player choices and competitor score/momentum effects
- Save/load support for competitor state and rival event history
- Korean/English locale dictionaries and `t()` translation helper for new competitor/event content
- Data validation for competitors, rival events, and locale keys

**Updated:**
- Top status now shows player market share
- Product cards show when competitors have claimed the same product space
- Product review scoring now takes competitor product claims into account
- Menu structure now includes 경쟁

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed

---

## [0.4.0-alpha] — 2026-05-15

### Prototype Systems Before Graphics Assets

**Added:**
- Agent hiring flow with data-driven hire costs, duplicate prevention, and talent growth
- Owned item flow with shop purchases and agent equipment slots
- Product development projects that assign available agents, advance monthly, generate quality, and release with review grades
- Effective agent stats from base archetype plus equipped items
- Save/load coverage for hired agents, owned items, and active development projects
- 10-month prototype regression test

**Updated:**
- Product menu now starts development projects instead of instant-launching from the UI
- Agent menu now includes hired team management, equipment display, and equip actions
- Shop menu now has purchase buttons and locked/owned states for items

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser flow verified: hire agent, buy item, equip item, start product project, advance 2 months, release product, console errors 0

---

## [0.3.1-alpha] — 2026-05-15

### Content And Menu Structure

**Added:**
- 10 AI agent archetypes with Korean names, roles, stats, upkeep, preferred items, quirks, and pixel-art appearance notes
- 20 shop items across office, equipment, research, safety, and marketing categories
- Menu structure: 회사, 제품, 에이전트, 연구, 상점, 기록
- Agent compendium screen with stat grid and appearance hooks
- Item shop screen with costs, effects, rarity, and flavor text
- Content validation tests for agent and item data

**Updated:**
- Data validator now checks agent stats, appearance palettes, preferred item references, item costs, and item effect keys
- The alpha UI now uses a menu panel instead of showing every system at once

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser checked: menu navigation, agent screen, shop screen, console errors 0

---

## [0.3.0-alpha] — 2026-05-15

### Alpha: Game-Like Playable Screen

**Added:**
- Game-like office/lab screen with staff sprites, server rack, launch board, and compact tycoon UI frame
- Product release review score, grade, and quote
- Monthly event surfacing and event choice resolution
- Upgrade purchase flow with requirement and cost checks
- Automation purchase flow with compounding automation gains
- Save/load through serialized runtime state and local storage buttons
- Alpha simulation tests for release reviews, events, upgrades, automation, and save/load
- Alpha production, QA, and synthetic playtest reports

**Updated:**
- First event and visible upgrade/automation labels are Korean-first
- Simulation state now tracks product reviews, current events, event history, purchased upgrades, and purchased automations
- Data validator already covers product/event/upgrade references and remains part of the gate

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser flow verified: launch product, advance month, view event, resolve event, save run

---

## [0.2.0] — 2026-05-14

### Web Restart Milestone 1: Playable Dashboard Shell

**Added:**
- Korean-first playable dashboard shell
- Company stage display based on `data/company_stages.json`
- Monthly report summary after advancing time
- Vitest test harness for core simulation expectations
- Web-specific production, QA, and synthetic playtest reports

**Updated:**
- Runtime direction is now Vite + React + TypeScript
- UI text, resources, products, domains, capabilities, and company stages use Korean player-facing names
- Agent review and acceptance criteria include Game Dev Story-style compact management loop checks

**Verification:**
- `npm test` passed
- `npm run validate:data` passed
- `npm run build` passed
- Browser flow verified: launch AI 글쓰기 비서, advance to next month, monthly report appears

---

## [0.1.0] — 2026-05-14

### Milestone 1: Empty Playable Shell

**Added:**
- data/resources.json — 8 resource definitions with initial values
- data/balance.json — monthly cost parameters and game thresholds
- scripts/core/EventBus.gd — global signal bus singleton
- scripts/core/DataLoader.gd — JSON loading and validation utility
- scripts/core/GameState.gd — central game state singleton
- scripts/systems/ResourceSystem.gd — resource mutation and clamping
- scripts/systems/MonthSystem.gd — monthly advancement and cost application
- scripts/ui/MainScreen.gd — main UI controller
- scripts/ui/ResourcePanel.gd — dynamic resource display
- scenes/main.tscn — main game scene with three-panel layout
- Autoload configuration in project.godot

**Updated:**
- scripts/debug/debug_validator.gd — full validation for M1 data files
- project.godot — autoload singletons and main scene configured

**Functionality:**
- Game loads and displays 8 resources from JSON
- Next Month button advances time and applies costs
- Monthly salary, compute, and base costs deducted
- Hype decays monthly; trust recovers if below threshold
- All values clamped to configured min/max
- Game over and win conditions checked each month
- Event log provides feedback on monthly changes
- DebugValidator runs at startup and reports issues

---

## [0.0.1] — 2026-05-14

### Milestone 0: Harness Setup

**Added:**
- Project folder structure (docs/, reports/, data/, scenes/, scripts/, tests/)
- AGENTS.md with all agent role definitions
- 10 documentation files in docs/
- reports/ folder structure
- Godot project configuration
- DebugValidator skeleton script
- README.md

**Status:** Complete.
