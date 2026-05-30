import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { menus } from "./menu";

const appCss = readFileSync(new URL("../App.css", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const gameChrome = readFileSync(new URL("../components/GameChrome.tsx", import.meta.url), "utf8");
const guidanceSource = readFileSync(new URL("../game/guidance.ts", import.meta.url), "utf8");
const menuPanels = readFileSync(new URL("../components/MenuPanels.tsx", import.meta.url), "utf8");
const campaignShockPanel = readFileSync(new URL("../components/CampaignShockPanel.tsx", import.meta.url), "utf8");
const playtestObserver = readFileSync(new URL("../game/blind-playtest-observer.ts", import.meta.url), "utf8");
const marketSharePanel = readFileSync(new URL("../components/MarketSharePanel.tsx", import.meta.url), "utf8");
const rivalArchetypePanel = readFileSync(new URL("../components/RivalArchetypePanel.tsx", import.meta.url), "utf8");
const bigEventModal = readFileSync(new URL("../components/BigEventModal.tsx", import.meta.url), "utf8");
const payoffCelebrationModal = readFileSync(new URL("../components/PayoffCelebrationModal.tsx", import.meta.url), "utf8");
const worldRevealModal = readFileSync(new URL("../components/WorldRevealModal.tsx", import.meta.url), "utf8");
const qaScenarios = readFileSync(new URL("../game/qa-scenarios.ts", import.meta.url), "utf8");

describe("v0.13.3 compact game shell layout", () => {
  it("keeps desktop play inside a fixed HUD, stage, and menu grid", () => {
    expect(appCss).toContain("grid-template-areas:");
    expect(appCss).toContain("\"top top top\"");
    expect(appCss).toContain("\"stage stage menu\"");
    expect(appCss).toContain("\"resources commands menu\"");
    expect(appCss).toContain("height: 100dvh");
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*overflow:\s*hidden/s);
    expect(appCss).toMatch(/\.menu-panel\s*{[^}]*overflow:\s*auto/s);
  });

  it("adopts the v0.34 external UX review as a fixed game-shell contract", () => {
    expect(appCss).toContain("--shell-width: 1366px");
    expect(appCss).toContain("--shell-height: 768px");
    expect(appCss).toContain("--mobile-shell-width: 390px");
    expect(appCss).toContain("--mobile-shell-height: 844px");
    expect(appSource).toContain("v034-game-shell");
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*max-height:\s*var\(--shell-height\)/s);
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*max-width:\s*var\(--shell-width\)/s);
  });

  it("surfaces the v0.34 first-screen priorities in the playable chrome", () => {
    expect(gameChrome).toContain("TurnGoalStrip");
    expect(gameChrome).toContain("CompetitorHudStrip");
    expect(gameChrome).toContain("StrategyHand");
    expect(gameChrome).toContain("resource-delta");
    expect(appCss).toMatch(/\.turn-goal-strip\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.competitor-hud-strip\s*{[^}]*display:\s*flex/s);
    expect(appCss).toMatch(/\.strategy-hand\s*{[^}]*display:\s*flex/s);
    expect(appCss).toMatch(/\.resource-tile\.priority\s*{/s);
    expect(appCss).toMatch(/\.resource-tile\.critical\s*{/s);
  });

  it("makes the first 10 seconds read as a garage AI company game", () => {
    expect(gameChrome).toContain("OpeningFantasySignal");
    expect(gameChrome).toContain("opening-fantasy-signal");
    expect(gameChrome).toContain("사람과 AI 에이전트");
    expect(gameChrome).toContain("첫 제품 출시");
    expect(gameChrome).toContain("경쟁사 압박");
    expect(gameChrome).toContain("10년 성장");
    expect(appCss).toMatch(/\.opening-fantasy-signal\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.opening-fantasy-signal ul\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.opening-fantasy-signal li\s*{[^}]*white-space:\s*nowrap/s);
  });

  it("shows a 30 minute alpha-run roadmap before final art intake", () => {
    expect(gameChrome).toContain("getAlphaRunRoadmap");
    expect(gameChrome).toContain("getAlphaRunRoadmapProgress");
    expect(gameChrome).toContain("getAlphaRunCompletionSummary");
    expect(gameChrome).toContain("getAlphaRunActionFeedback");
    expect(gameChrome).toContain("getActiveAlphaRunRoadmapStep");
    expect(gameChrome).toContain("getYearTwoProductIssueRecommendation");
    expect(gameChrome).toContain("activeAlphaRunStep");
    expect(gameChrome).toContain("alphaRunFeedback");
    expect(gameChrome).toContain("setAlphaRunFeedback(getAlphaRunActionFeedback(step))");
    expect(gameChrome).toContain("handleAlphaRunRoadmapStep");
    expect(gameChrome).toContain("handleAlphaRunCompletionAction");
    expect(gameChrome).toContain("runAlphaRunRoadmapAction");
    expect(gameChrome).toContain("if (runAlphaRunRoadmapAction(step)) return");
    expect(gameChrome).toContain("handleFastFirstHire()");
    expect(gameChrome).toContain("handleFastFirstProject()");
    expect(gameChrome).toContain("handleFastFirstIssue()");
    expect(gameChrome).toContain("handleFastFirstReward()");
    expect(gameChrome).toContain("handleFastFirstGrowth()");
    expect(gameChrome).toContain("setActiveMenu(step.menu)");
    expect(gameChrome).toContain("setActiveStageTab(\"results\")");
    expect(gameChrome).toContain("AlphaRunFocusStrip");
    expect(gameChrome).toContain("alpha-run-focus-strip");
    expect(gameChrome).toContain("alpha-run-feedback");
    expect(gameChrome).toContain("alpha-run-focus-action");
    expect(gameChrome).toContain("AlphaRunRoadmap");
    expect(gameChrome).toContain("AlphaRunCompletionPanel");
    expect(gameChrome).toContain("AlphaRunDebriefPanel");
    expect(gameChrome).toContain("getAlphaRunDebriefSummary");
    expect(gameChrome).toContain("const alphaRunDebrief = getAlphaRunDebriefSummary(gameState)");
    expect(gameChrome).toContain("{alphaRunDebrief && <AlphaRunDebriefPanel summary={alphaRunDebrief} />}");
    expect(gameChrome).toContain("alpha-run-debrief-panel");
    expect(gameChrome).toContain("alpha-run-debrief-timeline");
    expect(gameChrome).toContain("알파런 핵심 장면");
    expect(gameChrome).toContain("알파런 디브리프");
    expect(gameChrome).toContain("completion.nextActionId === \"resolve_issue\"");
    expect(gameChrome).toContain("completion.nextActionId === \"launch_product\"");
    expect(gameChrome).toContain("completion.nextActionId === \"choose_reward\"");
    expect(gameChrome).toContain("alpha-run-roadmap");
    expect(gameChrome).toContain("alpha-run-completion-panel");
    expect(gameChrome).toContain("roadmap-step-button");
    expect(gameChrome).toContain("step.actionLabel");
    expect(gameChrome).toContain("30분 알파런");
    expect(gameChrome).toContain("다음 보상");
    expect(guidanceSource).toContain("2년차 신제품 착수");
    expect(guidanceSource).toContain("30분 알파런 완주");
    expect(appCss).toMatch(/\.alpha-run-roadmap\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.alpha-run-completion-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.alpha-run-completion-panel button\s*{[^}]*background:\s*var\(--green\)/s);
    expect(appCss).toMatch(/\.alpha-run-debrief-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.alpha-run-debrief-grid\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.alpha-run-debrief-timeline\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.alpha-run-debrief-timeline li\s*{[^}]*grid-template-columns:\s*42px minmax\(0,\s*1fr\)/s);
    expect(appCss).toMatch(/\.alpha-run-debrief-checklist\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.alpha-run-focus-strip\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.alpha-run-focus-strip\s*{[^}]*grid-template-columns:\s*auto minmax\(0,\s*1fr\) auto/s);
    expect(appCss).toMatch(/\.alpha-run-feedback\s*{[^}]*grid-column:\s*1\s*\/\s*-1/s);
    expect(appCss).toMatch(/\.alpha-run-focus-action\s*{[^}]*background:\s*var\(--blue\)/s);
    expect(appCss).toMatch(/\.alpha-run-roadmap ol\s*{[^}]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.alpha-run-roadmap button\s*{[^}]*background:\s*transparent/s);
    expect(appCss).toMatch(/\.alpha-run-action\s*{[^}]*background:\s*var\(--blue\)/s);
    expect(appCss).toMatch(/\.alpha-run-roadmap li\.active\s*{[^}]*border-color:\s*var\(--yellow-dark\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.alpha-run-focus-strip\s*{[^}]*left:\s*130px/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.alpha-run-roadmap ol\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.alpha-run-debrief-grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.alpha-run-roadmap ol\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("lets a new player fast-hire the recommended first teammate from the guide", () => {
    expect(gameChrome).toContain("getFirstHireRecommendation");
    expect(gameChrome).toContain("hireAgentViaChannel");
    expect(gameChrome).toContain("FirstHireFastStart");
    expect(gameChrome).toContain("first-hire-fast-start");
    expect(gameChrome).toContain("추천 첫 팀원");
    expect(gameChrome).toContain("첫 팀원 바로 고용");
    expect(gameChrome).toContain("setActiveMenu(\"products\")");
    expect(appCss).toMatch(/\.first-hire-fast-start\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.first-hire-fast-start\s+button\s*{[^}]*background:\s*var\(--green\)/s);
  });

  it("lets a staffed new player start the recommended first product from the guide", () => {
    expect(gameChrome).toContain("getFirstProjectRecommendation");
    expect(gameChrome).toContain("startProductProject");
    expect(gameChrome).toContain("FirstProjectFastStart");
    expect(gameChrome).toContain("first-project-fast-start");
    expect(gameChrome).toContain("추천 첫 제품");
    expect(gameChrome).toContain("첫 제품 바로 개발");
    expect(gameChrome).toContain("setActiveMenu(\"deck\")");
    expect(appCss).toMatch(/\.first-project-fast-start\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.first-project-fast-start\s+button\s*{[^}]*background:\s*var\(--green\)/s);
  });

  it("lets an active first project resolve the first card issue from the guide", () => {
    expect(gameChrome).toContain("getFirstDevelopmentIssueRecommendation");
    expect(gameChrome).toContain("playStrategyCard");
    expect(gameChrome).toContain("resolveDevelopmentPuzzle");
    expect(gameChrome).toContain("FirstIssueFastStart");
    expect(gameChrome).toContain("first-issue-fast-start");
    expect(gameChrome).toContain("추천 첫 개발 이슈");
    expect(gameChrome).toContain("첫 이슈 바로 해결");
    expect(gameChrome).toContain("firstIssueRecommendation");
    expect(appCss).toMatch(/\.first-issue-fast-start\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.first-issue-fast-start\s+button\s*{[^}]*background:\s*var\(--green\)/s);
  });

  it("makes the launch guidance button advance to the first release milestone", () => {
    expect(gameChrome).toContain("advanceToFirstLaunch");
    expect(gameChrome).toContain("advanceToFirstAnnualReview");
    expect(gameChrome).toContain("guidance.id === \"advance_project\"");
    expect(gameChrome).toContain("setGameState((current) => advanceToFirstLaunch(current))");
    expect(gameChrome).toContain("guidance.id === \"advance_annual_review\"");
    expect(gameChrome).toContain("setGameState((current) => advanceToFirstAnnualReview(current))");
    expect(gameChrome).toContain("setActiveMenu(\"company\")");
  });

  it("lets the guide pick the first launch reward and growth branch without menu hunting", () => {
    expect(gameChrome).toContain("getFirstRewardRecommendation");
    expect(gameChrome).toContain("getFirstGrowthRecommendation");
    expect(gameChrome).toContain("chooseCardReward");
    expect(gameChrome).toContain("FirstRewardFastStart");
    expect(gameChrome).toContain("FirstGrowthFastStart");
    expect(gameChrome).toContain("first-reward-fast-start");
    expect(gameChrome).toContain("first-growth-fast-start");
    expect(gameChrome).toContain("첫 보상 바로 선택");
    expect(gameChrome).toContain("성장 분기 바로 선택");
    expect(appCss).toMatch(/\.first-reward-fast-start\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.first-growth-fast-start\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.first-reward-fast-start\s+button\s*{[^}]*background:\s*var\(--green\)/s);
    expect(appCss).toMatch(/\.first-growth-fast-start\s+button\s*{[^}]*background:\s*var\(--green\)/s);
  });

  it("shows the human, AI, and robot workforce mix before final art is imported", () => {
    expect(gameChrome).toContain("WorkforceMixPanel");
    expect(gameChrome).toContain("workforce-mix-panel");
    expect(gameChrome).toContain("인력 조합");
    expect(gameChrome).toContain("사람 직원");
    expect(gameChrome).toContain("AI 에이전트");
    expect(gameChrome).toContain("로봇 인력");
    expect(gameChrome).toContain("workforce-mix-row-heading");
    expect(gameChrome).toContain("workforce-mix-badge");
    expect(gameChrome).toContain("workforce-mix-metric");
    expect(gameChrome).toContain("getWorkforceMixSummary");
    expect(gameChrome).toContain("ROBOT");
    expect(appCss).toMatch(/\.office-wall\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.workforce-mix-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.workforce-mix-grid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.workforce-mix-badge\s*{[^}]*border-radius:\s*4px/s);
    expect(appCss).toMatch(/\.workforce-mix-metric\s*{[^}]*white-space:\s*nowrap/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.workforce-mix-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.workforce-mix-row\s*{[^}]*grid-template-columns:\s*minmax\(72px,\s*0\.78fr\)\s+minmax\(0,\s*1fr\)/s);
  });

  it("adds an in-game v0.56 blind playtest observer before final asset intake", () => {
    expect(appSource).toContain("BlindPlaytestObserverPanel");
    expect(appSource).toContain("createBlindPlaytestObserverSummary");
    expect(appSource).toContain("?playtest=v056");
    expect(playtestObserver).toContain("reports/playtests/v0_56_blind_playtest_session_");
    expect(appSource).toContain("블라인드 테스트 관찰");
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*position:\s*relative/s);
    expect(appCss).toMatch(/\.playtest-observer-panel\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.playtest-checkpoint-grid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.playtest-checkpoint-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("adds the v0.34.1 game navigation layer from the design review backlog", () => {
    expect(gameChrome).toContain("primaryMenuIds");
    expect(gameChrome).toContain("secondaryMenuIds");
    expect(gameChrome).toContain("primary-menu-cluster");
    expect(gameChrome).toContain("secondary-menu-cluster");
    expect(gameChrome).toContain("mobile-tab-bar");
    expect(gameChrome).toContain("mobile-more-menu");
    expect(appCss).toMatch(/\.mobile-tab-bar\s*{[^}]*display:\s*none/s);
    expect(appCss).toMatch(/\.primary-menu-cluster\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.mobile-tab-bar\s*{[^}]*display:\s*grid/s);
  });

  it("turns the office playfield into a clickable game surface", () => {
    expect(gameChrome).toContain("OfficeActionSlots");
    expect(gameChrome).toContain("RivalIncidentBanner");
    expect(gameChrome).toContain("office-action-slot-grid");
    expect(gameChrome).toContain("rival-incident-banner");
    expect(appCss).toMatch(/\.office-action-slot-grid\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.office-action-slot\s*{[^}]*image-rendering:\s*pixelated/s);
    expect(appCss).toMatch(/\.rival-incident-banner\s*{[^}]*position:\s*absolute/s);
  });

  it("surfaces v0.56 rival and staff incidents as readable screen moments", () => {
    expect(gameChrome).toContain("incident-screen-moment");
    expect(gameChrome).toContain("staff-event-panel");
    expect(gameChrome).toContain("getStaffIncidentBriefs");
    expect(gameChrome).toContain("getStaffIncidentResolutionOptions");
    expect(gameChrome).toContain("resolveStaffIncident");
    expect(appCss).toMatch(/\.incident-screen-moment\s*{[^}]*border-width:\s*3px/s);
    expect(appCss).toMatch(/\.staff-event-panel\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.event-moment-meta\s*{[^}]*display:\s*block/s);
  });

  it("moves resources into a compact bottom HUD instead of a tall web sidebar", () => {
    expect(appCss).toMatch(/\.resource-strip\s*{[^}]*grid-template-columns:\s*repeat\(8,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.resource-strip\s*{[^}]*overflow:\s*hidden/s);
    expect(appCss).toMatch(/\.resource-tile\s*{[^}]*min-height:\s*42px/s);
  });

  it("treats the command row as a fixed bottom control strip", () => {
    expect(appCss).toMatch(/\.command-row\s*{[^}]*grid-area:\s*commands/s);
    expect(appCss).toMatch(/\.command-row\s*{[^}]*overflow:\s*hidden/s);
    expect(appCss).toMatch(/\.command-row\s+p\s*{[^}]*white-space:\s*nowrap/s);
  });

  it("fits the mobile strategy hand inside the screenshot viewport", () => {
    expect(appCss).toMatch(
      /@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.strategy-hand\s*{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(58px,\s*0\.72fr\)\s+repeat\(3,\s*minmax\(0,\s*1fr\)\)[^}]*overflow:\s*hidden/s,
    );
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.strategy-hand-card\s*{[^}]*min-width:\s*0/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.hand-count\s*{[^}]*min-width:\s*0/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.strategy-hand-card:nth-of-type\(n \+ 5\)\s*{[^}]*display:\s*none/s);
  });

  it("keeps tablet and mobile layouts in a fixed game viewport with internal scrolling", () => {
    expect(appCss).toMatch(/@media\s*\(max-width:\s*1100px\)\s*{[\s\S]*body\s*{[^}]*overflow:\s*hidden/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*1100px\)\s*{[\s\S]*\.app-shell\s*{[^}]*height:\s*100dvh/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*1100px\)\s*{[\s\S]*\.menu-panel\s*{[^}]*overflow:\s*auto/s);
  });

  it("prevents narrow screens from creating horizontal page overflow", () => {
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*width:\s*min\(100%,\s*1366px\)/s);
    expect(appCss).toMatch(/\.game-stage,\s*\.menu-layout,\s*\.resource-strip,\s*\.command-row\s*{[^}]*min-width:\s*0/s);
    expect(appCss).toMatch(/\.resource-tile,\s*\.office-scene,\s*\.stage-side,\s*\.menu-panel,\s*\.panel\s*{[^}]*min-width:\s*0/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*1100px\)\s*{[\s\S]*\.app-shell\s*{[^}]*width:\s*100vw/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.app-shell\s*{[^}]*width:\s*min\(100vw,\s*390px\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.app-shell\s*{[^}]*margin:\s*0/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*body\s*{[^}]*place-items:\s*start/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.app-shell\s*{[^}]*justify-self:\s*start/s);
  });

  it("groups menu buttons into compact rail sections", () => {
    expect(menus.map((menu) => `${menu.group}:${menu.id}`)).toEqual([
      "core:company",
      "core:products",
      "core:deck",
      "operations:agents",
      "operations:research",
      "operations:shop",
      "meta:competition",
      "meta:log",
    ]);
  });

  it("caps stage-side cards so long campaign summaries scroll instead of overlapping", () => {
    expect(appCss).toMatch(/\.stage-side\s*>\s*article\s*{[^}]*max-height:/s);
    expect(appCss).toMatch(/\.stage-side\s*>\s*article\s*{[^}]*overflow:\s*auto/s);
    expect(appCss).toMatch(/\.stage-side\s*>\s*article\s*{[^}]*scrollbar-width:\s*thin/s);
  });

  it("compresses the right-side stage information into a tabbed game panel", () => {
    expect(appCss).toMatch(/\.stage-side-tabs\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.stage-side-panel\s*{[^}]*overflow:\s*auto/s);
    expect(appCss).toMatch(/\.stage-side-panel\s*>\s*article/s);
  });

  it("gives launch impact feedback a distinct reward panel inside the results tab", () => {
    expect(appCss).toMatch(/\.launch-impact-panel\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.launch-impact-badges\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(gameChrome).toContain("launch-reaction-grid");
    expect(appCss).toMatch(/\.launch-reaction-grid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.launch-reaction-card\s*{[^}]*min-width:\s*0/s);
    expect(gameChrome).toContain("launch-review-stack");
    expect(appCss).toMatch(/\.launch-review-stack\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.card-impact-list\s*{[^}]*gap:/s);
    expect(gameChrome).toContain("launch-next-action-ribbon");
    expect(gameChrome).toContain("보상 카드 선택");
    expect(gameChrome).toContain("성장 분기 선택");
    expect(gameChrome).toContain("다음 달 진행");
    expect(gameChrome).toContain("<LaunchImpactPanel summary={releaseImpact} onOpenNextAction={handleLaunchNextAction} />");
    expect(gameChrome).toContain('type="button"');
    expect(gameChrome).toContain("if (menu === \"results\")");
    expect(gameChrome).toContain("onOpenNextAction(step.menu)");
    expect(appCss).toMatch(/\.launch-next-action-ribbon\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.launch-next-action-ribbon\s+button\s*{[^}]*background:\s*#fffdf7/s);
  });

  it("makes the first post-launch card reward feel like an explicit choice moment", () => {
    expect(menuPanels).toContain("first-reward-spotlight");
    expect(menuPanels).toContain("첫 출시 보상 도착");
    expect(menuPanels).toContain("3장 중 1장");
    expect(menuPanels).toContain("보상 선택 후 성장 분기");
    expect(appCss).toMatch(/\.first-reward-spotlight\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.first-reward-spotlight\s+ol\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.first-reward-spotlight ol[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("confirms the chosen first reward and points back to growth selection", () => {
    expect(menuPanels).toContain("reward-choice-confirmation");
    expect(menuPanels).toContain("보상 선택 완료");
    expect(menuPanels).toContain("덱에 들어갔습니다");
    expect(menuPanels).toContain("다음은 성장 분기");
    expect(appCss).toMatch(/\.reward-choice-confirmation\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.reward-choice-confirmation\s+ol\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.reward-choice-confirmation ol[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("previews each reward card's effects with the launch-impact arrow flow", () => {
    expect(menuPanels).toContain("reward-effects-preview");
    expect(menuPanels).toContain("reward-effects-arrow");
    expect(menuPanels).toContain("reward-effects-list");
    expect(menuPanels).toContain("효과 미리보기");
    expect(menuPanels).toContain("이 카드");
    expect(appCss).toMatch(/\.reward-effects-preview\s*{[^}]*grid-template-columns:\s*auto auto minmax\(0,\s*1fr\)/s);
    expect(appCss).toMatch(/\.reward-effects-arrow\s*{[^}]*animation:\s*card-impact-arrow-pulse/s);
    expect(appCss).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.reward-effects-arrow[\s\S]*animation:\s*none/);
  });

  it("differentiates reward card rarity tiers with badges and glow", () => {
    expect(appCss).toMatch(/\.reward-choice\.rarity-rare\s*{[^}]*box-shadow:/s);
    expect(appCss).toMatch(/\.reward-choice\.rarity-rare::after\s*{[^}]*content:\s*"희귀"/s);
    expect(appCss).toMatch(/\.reward-choice\.rarity-epic\s*{[^}]*animation:\s*reward-rarity-epic-pulse/s);
    expect(appCss).toMatch(/\.reward-choice\.rarity-epic::after\s*{[^}]*content:\s*"특수"/s);
    expect(appCss).toMatch(/@keyframes reward-rarity-epic-pulse/);
    expect(appCss).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.reward-choice\.rarity-epic[\s\S]*animation:\s*none/);
  });

  it("confirms the selected growth branch as the next monthly plan", () => {
    expect(gameChrome).toContain("growth-choice-confirmation");
    expect(gameChrome).toContain("성장 분기 선택 완료");
    expect(gameChrome).toContain("다음 달부터 월간 보너스");
    expect(gameChrome).toContain("연간 심사까지");
    expect(appCss).toMatch(/\.growth-choice-confirmation\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.growth-choice-confirmation\s+ol\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.growth-choice-confirmation ol[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("confirms annual directive selection as a year-two operating plan", () => {
    expect(menuPanels).toContain("annual-directive-confirmation");
    expect(menuPanels).toContain("다음 해 지시 선택 완료");
    expect(menuPanels).toContain("월간 보너스");
    expect(menuPanels).toContain("추천 메뉴");
    expect(menuPanels).toContain("annual-directive-actions");
    expect(menuPanels).toContain("추천 메뉴 열기");
    expect(menuPanels).toContain("2년차 시작");
    expect(menuPanels).toContain("advanceMonth(current)");
    expect(appCss).toMatch(/\.annual-directive-confirmation\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.annual-directive-actions\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.annual-directive-confirmation\s+ol\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.annual-directive-actions button\s*{[^}]*min-height:/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.annual-directive-confirmation ol[\s\S]*grid-template-columns:\s*1fr/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.annual-directive-actions[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("shows a year-two kickoff panel after annual directive bonuses start", () => {
    expect(menuPanels).toContain("year-two-kickoff");
    expect(menuPanels).toContain("2년차 운영 시작");
    expect(menuPanels).toContain("이번 달 보너스");
    expect(menuPanels).toContain("연간 지시 효과");
    expect(menuPanels).toContain("한 달 더 운영");
    expect(appCss).toMatch(/\.year-two-kickoff\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.year-two-kickoff-grid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.year-two-kickoff-grid[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("animates the year-two kickoff entry and previews the next 30 minute flow", () => {
    expect(menuPanels).toContain("year-two-next-flow");
    expect(menuPanels).toContain("year-two-flow-arrow");
    expect(menuPanels).toContain("2년차 다음 30분 흐름");
    expect(menuPanels).toContain("추천 연구");
    expect(menuPanels).toContain("신제품 후보");
    expect(menuPanels).toContain("두 번째 출시 보상");
    expect(appCss).toMatch(/\.year-two-kickoff\s*{[^}]*animation:\s*year-two-kickoff-enter/s);
    expect(appCss).toMatch(/@keyframes year-two-kickoff-enter/);
    expect(appCss).toMatch(/\.year-two-next-flow\s*{[^}]*display:\s*flex/s);
    expect(appCss).toMatch(/\.year-two-next-flow li\.year-two-flow-arrow\s*{[^}]*animation:\s*card-impact-arrow-pulse/s);
    expect(appCss).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.year-two-kickoff[\s\S]*animation:\s*none/);
  });

  it("surfaces annual directive research as a direct launchpad", () => {
    expect(menuPanels).toContain("annual-research-launchpad");
    expect(menuPanels).toContain("연간 지시 추천 연구");
    expect(menuPanels).toContain("바로 연구");
    expect(menuPanels).toContain("strategyFocus?.targetId === capability.id");
    expect(appCss).toMatch(/\.annual-research-launchpad\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.annual-research-launchpad button\s*{[^}]*min-height:/s);
  });

  it("confirms annual directive research after the focused upgrade is completed", () => {
    expect(menuPanels).toContain("research-completion-ribbon");
    expect(menuPanels).toContain("연구 완료");
    expect(menuPanels).toContain("해금 시장");
    expect(menuPanels).toContain("제품 후보");
    expect(menuPanels).toContain("lastCapabilityUpgrade");
    expect(appCss).toMatch(/\.research-completion-ribbon\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.research-completion-grid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.research-completion-grid[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("surfaces derive-only AI resource visibility inside the research panel", () => {
    expect(menuPanels).toContain("getAiResourceVisibilityMetrics");
    expect(menuPanels).toContain("ai-resource-visibility-panel");
    expect(menuPanels).toContain("ui.resourceVisibility.monthlyComputeLoad");
    expect(menuPanels).toContain("ui.resourceVisibility.monthlyDataGenerated");
    expect(menuPanels).toContain("ui.resourceVisibility.nextLaunchComputeNeeded");
    expect(appCss).toMatch(/\.ai-resource-visibility-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ai-resource-visibility-grid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.ai-resource-visibility-grid[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("shows shareable timeline moments as a compact highlight grid", () => {
    expect(appCss).toMatch(/\.highlight-moment-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.highlight-moment-card\s*{[^}]*min-height:/s);
    expect(appCss).toMatch(/\.highlight-moment-card\.tone-positive/s);
  });

  it("frames the right management surface as an in-game console", () => {
    expect(appCss).toMatch(/\.menu-layout\s*{[^}]*background:\s*#20342d/s);
    expect(appCss).toMatch(/\.menu-layout\s*{[^}]*border:\s*3px solid var\(--line\)/s);
    expect(appCss).toMatch(/\.menu-panel\s*{[^}]*background:\s*#fff7df/s);
    expect(appCss).toMatch(/\.menu-panel\s*{[^}]*border:\s*2px solid var\(--line\)/s);
    expect(appCss).toMatch(/\.main-menu button span\s*{[^}]*display:\s*none/s);
  });

  it("puts quick state overlays inside the office playfield", () => {
    expect(gameChrome).toContain('className="office-hud"');
    expect(gameChrome).toContain('className="office-alert-strip"');
    expect(gameChrome).toContain("qaScenarioLabel && <OfficeSpriteSheetInspector");
    expect(appCss).toMatch(/\.office-hud\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.office-hud\s*{[^}]*z-index:\s*5/s);
    expect(appCss).toMatch(/\.office-alert-strip\s*{[^}]*position:\s*absolute/s);
  });

  it("loads the full graphic asset manifest into the first-screen game surface", () => {
    expect(gameChrome).toContain("OfficeGraphicAssetWall");
    expect(gameChrome).toContain("OfficeDecorAssetLayer");
    expect(gameChrome).toContain("OfficeIsometricBackdrop");
    expect(gameChrome).toContain("OfficeSpriteSheetInspector");
    expect(gameChrome).toContain("getAssetSheet");
    expect(gameChrome).toContain("getDepthStyle");
    expect(gameChrome).toContain("getAnimatedSpriteSheetFrameStyle");
    expect(gameChrome).toContain("getAgentSpriteFrameStyle");
    expect(gameChrome).toContain("getOfficeObjectSpriteFrameStyle");
    expect(gameChrome).toContain("getSpriteSheetPreviewFrames");
    expect(gameChrome).toContain("source_frame_width");
    expect(gameChrome).toContain("getCompetitorIdentity");
    expect(gameChrome).toContain("getItemIcon");
    expect(gameChrome).toContain("assetManifest.office_objects");
    expect(gameChrome).toContain("assetManifest.item_icons");
    expect(gameChrome).toContain("assetManifest.competitor_identities");
    expect(gameChrome).toContain("assetManifest.agent_sprites");
    expect(gameChrome).toContain("agents_v053_final_art_import");
    expect(gameChrome).toContain("source_origin");
    expect(gameChrome).toContain("office_objects_v054_final_art_import");
    expect(gameChrome).toContain("office_isometric_v054_final_art_import");
    expect(gameChrome).toContain("getAnimatedSpriteSheetFrameStyle(sheet, animation, 76, 76)");
    expect(gameChrome).toContain("getAgentSpriteFrameStyle(agentSprite, actor)");
    expect(gameChrome).toContain("actor-pose-");
    expect(gameChrome).toContain("sprite-sheet-animated");
    expect(gameChrome).toContain("competitor-hud-logo");
    expect(appCss).toMatch(/\.office-graphic-asset-wall\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.office-asset-row\s*{[^}]*display:\s*flex/s);
    expect(appCss).toMatch(/\.office-asset-mini\s*{[^}]*image-rendering:\s*pixelated/s);
    expect(appCss).toMatch(/\.decor-asset-prop\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.office-isometric-backdrop\s*{[^}]*image-rendering:\s*pixelated/s);
    expect(appCss).toMatch(/\.sprite-sheet-inspector\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.sprite-sheet-preview-frame\s*{[^}]*image-rendering:\s*pixelated/s);
    expect(appCss).toMatch(/\.sprite-sheet-frame\s*{[^}]*background-repeat:\s*no-repeat/s);
    expect(appCss).toMatch(/@keyframes\s+sprite-sheet-frame-cycle/s);
    expect(appCss).toMatch(/\.staff-sprite\.pixel-actor\.sprite-sheet-frame\.sprite-sheet-animated\s*{[^}]*sprite-sheet-frame-cycle/s);
    expect(appCss).toMatch(/\.staff-sprite\.pixel-actor\.sprite-sheet-frame\s*{[^}]*border:\s*0/s);
    expect(appCss).toMatch(/\.competitor-hud-logo\s*{[^}]*image-rendering:\s*pixelated/s);
  });

  it("renders v0.49 office event reactions without covering the playfield", () => {
    expect(gameChrome).toContain("OfficeEventReactionLayer");
    expect(gameChrome).toContain("officeScenePlan.eventReactions");
    expect(gameChrome).toContain("office-event-reaction-layer");
    expect(gameChrome).toContain("office-event-reaction");
    expect(appCss).toMatch(/\.office-event-reaction-layer\s*{[^}]*pointer-events:\s*none/s);
    expect(appCss).toMatch(/\.office-event-reaction\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/@keyframes\s+office-reaction-pop/s);
  });

  it("protects the playfield by narrowing the persistent console column", () => {
    expect(appCss).toMatch(/\.app-shell\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*0\.94fr\)\s+minmax\(0,\s*1fr\)\s+clamp\(330px,\s*28vw,\s*390px\)/s);
    expect(appCss).toMatch(/\.game-stage\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.72fr\)\s+minmax\(230px,\s*0\.48fr\)/s);
  });

  it("keeps mobile chrome compact enough for the office scene to remain visible", () => {
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.top-bar\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.status-cluster\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.status-cluster \.status-pill:nth-of-type\(n \+ 5\)\s*{[^}]*display:\s*none/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.office-wall\s*{[^}]*min-height:\s*0/s);
  });

  it("surfaces product idea combinations and renewal release paths in the products menu", () => {
    expect(menuPanels).toContain("idea-composer-panel");
    expect(menuPanels).toContain("renewal-option-grid");
    expect(menuPanels).toContain("createProductConcept");
    expect(menuPanels).toContain("getProductConceptProjectCheck");
    expect(menuPanels).toContain("startProductConceptProject");
    expect(menuPanels).toContain("getProductRenewalProjectCheck");
    expect(menuPanels).toContain("startProductRenewalProject");
    expect(appCss).toMatch(/\.idea-composer-panel\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.idea-result-card\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.renewal-option-grid\s*{[^}]*grid-template-columns:/s);
  });

  it("gives staffed fresh runs a product-menu starter project launchpad", () => {
    expect(menuPanels).toContain("first-project-launchpad");
    expect(menuPanels).toContain("추천 첫 제품");
    expect(menuPanels).toContain("첫 제품 개발 시작");
    expect(menuPanels).toContain("자동 팀");
    expect(menuPanels).toContain("startProductProject(starterProduct");
    expect(appCss).toMatch(/\.first-project-launchpad\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.first-project-launchpad\s+button\s*{[^}]*background:\s*var\(--green\)/s);
  });

  it("turns completed research into a product-candidate launchpad", () => {
    expect(menuPanels).toContain("research-product-launchpad");
    expect(menuPanels).toContain("연구가 연 제품 후보");
    expect(menuPanels).toContain("해금 시장");
    expect(menuPanels).toContain("다음 제품 후보");
    expect(menuPanels).toContain("필요 연구 보기");
    expect(menuPanels).toContain("lastCapabilityUpgrade");
    expect(menuPanels).toContain("setActiveMenu?.(\"research\")");
    expect(appCss).toMatch(/\.research-product-launchpad\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.research-product-grid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.research-product-grid[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("confirms started year-two research products before moving into development issues", () => {
    expect(menuPanels).toContain("research-product-started-ribbon");
    expect(menuPanels).toContain("신제품 개발 시작");
    expect(menuPanels).toContain("투입 팀");
    expect(menuPanels).toContain("다음 개발 이슈");
    expect(menuPanels).toContain("덱 열기");
    expect(menuPanels).toContain("getResearchProductStartedCandidate");
    expect(menuPanels).toContain("setActiveMenu?.(\"deck\")");
    expect(appCss).toMatch(/\.research-product-started-ribbon\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.research-product-started-grid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.research-product-started-ribbon\s+button\s*{[^}]*background:\s*var\(--green\)/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.research-product-started-grid[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("routes locked product candidates back to the exact needed research", () => {
    expect(menuPanels).toContain("product-candidate-requirement-launchpad");
    expect(menuPanels).toContain("제품 후보 필요 연구");
    expect(menuPanels).toContain("필요 Lv.");
    expect(menuPanels).toContain("바로 연구");
    expect(menuPanels).toContain("upgradeCapability(productCandidateRequirement.requiredCapability");
    expect(appCss).toMatch(/\.product-candidate-requirement-launchpad\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.product-candidate-requirement-launchpad\s+button\s*{[^}]*min-height:/s);
    expect(appCss).toMatch(/@media \(max-width:\s*520px\)[\s\S]*\.product-candidate-requirement-launchpad[\s\S]*grid-template-columns:\s*1fr/s);
  });

  it("gives active first projects a deck-menu development issue launchpad", () => {
    expect(menuPanels).toContain("development-issue-launchpad");
    expect(menuPanels).toContain("첫 개발 이슈");
    expect(menuPanels).toContain("developmentIssueTitle");
    expect(menuPanels).toContain("신제품 개발 이슈");
    expect(menuPanels).toContain("activeProject.startedMonth > 1");
    expect(menuPanels).toContain("추천 이슈");
    expect(menuPanels).toContain("카드가 결과를 바꾸는 첫 순간");
    expect(menuPanels).toContain("자동 선택 이슈 해결");
    expect(menuPanels).toContain("resolveDevelopmentPuzzle(activeProject.id, recommendedPuzzleTileIds");
    expect(appCss).toMatch(/\.development-issue-launchpad\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.development-issue-launchpad\s+button\s*{[^}]*background:\s*var\(--green\)/s);
  });

  it("shows a first development issue result ribbon after cards change the project", () => {
    expect(menuPanels).toContain("development-issue-result-ribbon");
    expect(menuPanels).toContain("이슈 해결 결과");
    expect(menuPanels).toContain("카드 영향");
    expect(menuPanels).toContain("다음 목표");
    expect(menuPanels).toContain("출시까지 진행");
    expect(appCss).toMatch(/\.development-issue-result-ribbon\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.development-issue-result-ribbon\s+\.impact-chip\s*{[^}]*background:\s*#fffdf5/s);
  });

  it("visualizes the release progress meter inside the issue result ribbon", () => {
    expect(menuPanels).toContain("release-progress-meter");
    expect(menuPanels).toContain("release-progress-bar");
    expect(menuPanels).toContain("출시까지 진행도");
    expect(menuPanels).toContain('role="progressbar"');
    expect(appCss).toMatch(/\.release-progress-meter\s*{[^}]*grid-template-columns:\s*auto minmax\(0,\s*1fr\)\s+auto/s);
    expect(appCss).toMatch(/\.release-progress-bar\s*{[^}]*border-radius:\s*999px/s);
    expect(appCss).toMatch(/\.release-progress-bar i\s*{[^}]*animation:\s*release-progress-fill/s);
    expect(appCss).toMatch(/@keyframes release-progress-fill/);
    expect(appCss).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.release-progress-bar i[\s\S]*animation:\s*none/);
  });

  it("surfaces a compact office growth planner inside the shop console", () => {
    expect(menuPanels).toContain("getOfficeGrowthPlan");
    expect(menuPanels).toContain("office-growth-planner");
    expect(menuPanels).toContain("office-choice-grid");
    expect(menuPanels).toContain("office-recommendation-list");
    expect(appCss).toMatch(/\.office-growth-planner\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.office-choice-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.office-recommendation-list\s*{[^}]*display:\s*grid/s);
  });

  it("anchors the helper character tutorial inside the fixed game viewport", () => {
    const app = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");

    expect(app).toContain("getTutorialGuide");
    expect(app).toContain("dismissTutorialGuide");
    expect(app).toContain("helper-tutorial");
    expect(app).toContain("helper-portrait");
    expect(appCss).toMatch(/\.helper-tutorial\s*{[^}]*position:\s*fixed/s);
    expect(appCss).toMatch(/\.helper-tutorial\s*{[^}]*z-index:\s*30/s);
    expect(appCss).toMatch(/\.helper-actions\s*{[^}]*display:\s*flex/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)\s*{[\s\S]*\.helper-tutorial\s*{[^}]*bottom:\s*72px/s);
  });

  it("surfaces active deck synergies as a compact build panel", () => {
    expect(menuPanels).toContain("getDeckSynergySummary");
    expect(menuPanels).toContain("deck-synergy-panel");
    expect(menuPanels).toContain("deck-synergy-grid");
    expect(appCss).toMatch(/\.deck-synergy-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.deck-synergy-grid\s*{[^}]*grid-template-columns:/s);
  });

  it("surfaces boundaryless industry synergies in the products console", () => {
    expect(menuPanels).toContain("getIndustrySynergySummary");
    expect(menuPanels).toContain("industry-synergy-panel");
    expect(menuPanels).toContain("industry-synergy-grid");
    expect(appCss).toMatch(/\.industry-synergy-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.industry-synergy-grid\s*{[^}]*grid-template-columns:/s);
  });

  it("surfaces high-risk industry combos with risk labels in the products console", () => {
    expect(menuPanels).toContain("getIndustryComboSummary");
    expect(menuPanels).toContain("industry-combo-panel");
    expect(menuPanels).toContain("risk_label");
    expect(appCss).toMatch(/\.industry-combo-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.industry-combo-grid\s*{[^}]*grid-template-columns:/s);
  });

  it("keeps the physical-industries product console inside the 390px mobile viewport", () => {
    expect(qaScenarios).toContain("\"physical-industries\"");
    expect(qaScenarios).toContain("activeMenu: \"products\"");
    expect(menuPanels).toContain("boundaryless-goal-panel");
    expect(menuPanels).toContain("domain-filter");
    expect(menuPanels).toContain("industry-synergy-panel");
    expect(menuPanels).toContain("industry-combo-panel");
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.app-shell\s*{[^}]*width:\s*min\(100vw,\s*390px\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.menu-panel\s*{[^}]*overflow:\s*auto/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.domain-filter\s*{[^}]*grid-template-columns:\s*1fr/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.boundaryless-goal-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.industry-synergy-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.industry-combo-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("prevents v0.60 industry synergy and combo cards from forcing horizontal overflow", () => {
    expect(appCss).toMatch(
      /\.industry-synergy-panel,\s*\.industry-combo-panel,\s*\.industry-synergy-grid,\s*\.industry-combo-grid\s*{[^}]*min-width:\s*0/s,
    );
    expect(appCss).toMatch(/\.industry-synergy-grid article,\s*\.industry-combo-grid article\s*{[^}]*min-width:\s*0/s);
    expect(appCss).toMatch(/\.industry-synergy-panel strong,\s*\.industry-combo-panel strong\s*{[^}]*overflow-wrap:\s*anywhere/s);
    expect(appCss).toMatch(/\.industry-synergy-panel span,\s*\.industry-combo-panel span,\s*\.industry-combo-panel small\s*{[^}]*overflow-wrap:\s*anywhere/s);
  });

  it("adds a next-run command room for roguelite restart decisions", () => {
    expect(menuPanels).toContain("getNextRunSetupPlan");
    expect(menuPanels).toContain("next-run-command-panel");
    expect(menuPanels).toContain("next-run-quick-start-grid");
    expect(menuPanels).toContain("meta-category-badge");
    expect(appCss).toMatch(/\.next-run-command-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.next-run-quick-start-grid\s*{[^}]*grid-template-columns:/s);
  });

  it("wires challenge tier choice into the next-run setup and world reveal", () => {
    expect(menuPanels).toContain("difficultyTiers");
    expect(menuPanels).toContain("selectedChallengeTierId");
    expect(menuPanels).toContain("createEphemeralRunModifierSelection(`menu-quick-${quickStart.id}`, selectedChallengeTierId)");
    expect(menuPanels).toContain("challenge-tier-choice-grid");
    expect(gameChrome).toContain("challengeTierId: \"standard\"");
    expect(worldRevealModal).toContain("도전 티어");
    expect(worldRevealModal).toContain("reward_multiplier");
    expect(appCss).toMatch(/\.challenge-tier-choice-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.world-reveal-tier\s*{[^}]*display:\s*grid/s);
  });

  it("v0.66 #2 shows newly discovered archetypes in world reveal and an archetype collection grid", () => {
    expect(worldRevealModal).toContain("getNewlyDiscoveredArchetypes");
    expect(worldRevealModal).toContain("archetype-discovery-panel");
    expect(worldRevealModal).toContain("신규 아키타입 발견");
    expect(menuPanels).toContain("getArchetypeCollectionEntries");
    expect(menuPanels).toContain("archetype-collection-panel");
    expect(menuPanels).toContain("discoveredArchetypeIds");
    expect(qaScenarios).toContain("archetype-collection");
    expect(appCss).toMatch(/\.archetype-discovery-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.archetype-discovery-grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.archetype-collection-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.archetype-collection-grid article\s*{[^}]*min-width:\s*0/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.archetype-collection-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.67 #2 shows ending discovery as a roguelite collection", () => {
    expect(menuPanels).toContain("getEndingCollectionEntries");
    expect(menuPanels).toContain("getEndingCollectionSummary");
    expect(menuPanels).toContain("ending-collection-panel");
    expect(menuPanels).toContain("ending-collection-summary");
    expect(menuPanels).toContain("discoveredEndingIds");
    expect(menuPanels).toContain("엔딩 도감");
    expect(menuPanels).toContain("남은 목표");
    expect(menuPanels).toContain("다음 추천 목표");
    expect(menuPanels).toContain("endingCollectionSummary.nextReplayPlan");
    expect(menuPanels).toContain("모든 목표 엔딩 발견");
    expect(menuPanels).toContain("endingCollectionSummary.lockedReplayableCount");
    expect(menuPanels).toContain("endingCollectionSummary.finalOnlyLockedCount");
    expect(menuPanels).toContain("결과 전용 잠김");
    expect(menuPanels).toContain("entry.condition.fallback === true");
    expect(menuPanels).toContain("결과 전용 엔딩");
    expect(menuPanels).toContain("캠페인 결과에서만 공개되는 엔딩입니다.");
    expect(qaScenarios).toContain("ending-replay-complete");
    expect(qaScenarios).toContain("ending-fallback-final");
    expect(qaScenarios).toContain("ending-nearmiss-final");
    expect(menuPanels).toContain("entry.targetLabels");
    expect(menuPanels).toContain("entry.selection");
    expect(menuPanels).toContain("도감 목표 런");
    expect(menuPanels).toContain("activeEndingReplayBrief?.id === entry.id");
    expect(menuPanels).toContain("현재 목표 런");
    expect(appCss).toMatch(/\.ending-collection-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-collection-summary\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.ending-collection-summary button\s*{[^}]*text-align:\s*left/s);
    expect(appCss).toMatch(/\.ending-collection-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.ending-collection-run-button\s*{[^}]*align-self:\s*end/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.ending-collection-summary\s*{[^}]*grid-template-columns:\s*1fr/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.ending-collection-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.67 #24 filters the expanded ending codex", () => {
    expect(menuPanels).toContain("endingCollectionFilter");
    expect(menuPanels).toContain("filteredEndingCollectionEntries");
    expect(menuPanels).toContain("ending-collection-filter");
    expect(menuPanels).toContain("미발견");
    expect(menuPanels).toContain("발견 완료");
    expect(menuPanels).toContain("setEndingCollectionFilter");
    expect(appCss).toMatch(/\.ending-collection-filter\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.ending-collection-filter button\.active\s*{[^}]*background:/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.ending-collection-filter\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.67 #26 annotates the ending codex with current-run progress", () => {
    expect(menuPanels).toContain("getEndingCollectionProgressEntries");
    expect(menuPanels).toContain("ending-collection-progress");
    expect(menuPanels).toContain("entry.nextRequirementLabel");
    expect(menuPanels).toContain("현재 런");
    expect(appCss).toMatch(/\.ending-collection-progress\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-collection-progress strong\s*{[^}]*overflow-wrap:\s*anywhere/s);
  });

  it("v0.67 #27 sorts the ending codex by route priority, current progress, or reward", () => {
    expect(menuPanels).toContain("endingCollectionSort");
    expect(menuPanels).toContain("sortedEndingCollectionEntries");
    expect(menuPanels).toContain("ending-collection-sort");
    expect(menuPanels).toContain("가까운 순");
    expect(menuPanels).toContain("보상 순");
    expect(appCss).toMatch(/\.ending-collection-sort\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.ending-collection-sort button\.active\s*{[^}]*background:/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.ending-collection-sort\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.67 #28 lets the active codex target jump to the company checklist", () => {
    expect(menuPanels).toContain('{isActiveTargetRun ? "현재 목표 확인" : "도감 목표 런"}');
    expect(menuPanels).toContain("setActiveMenu?.(\"company\")");
    expect(menuPanels).toContain("disabled={isActiveTargetRun && !setActiveMenu}");
    expect(menuPanels).toContain("if (isActiveTargetRun)");
  });

  it("v0.67 #30 shows ending codex reward totals", () => {
    expect(menuPanels).toContain("endingCollectionSummary.discoveredRewardBonus");
    expect(menuPanels).toContain("endingCollectionSummary.totalRewardBonus");
    expect(menuPanels).toContain("통찰 보상");
    expect(menuPanels).toContain("남은 보상");
    expect(appCss).toMatch(/\.ending-collection-summary\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  });

  it("v0.67 #3 surfaces current-run ending targets in the company console", () => {
    expect(menuPanels).toContain("getEndingTargetPlans");
    expect(menuPanels).toContain("ending-target-panel");
    expect(menuPanels).toContain("엔딩 목표");
    expect(menuPanels).toContain("progressPercent");
    expect(appCss).toMatch(/\.ending-target-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-target-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.ending-target-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.67 #4 lets the ending codex seed target replay runs", () => {
    expect(menuPanels).toContain("getEndingReplayPlans");
    expect(menuPanels).toContain("ending-replay-panel");
    expect(menuPanels).toContain("목표 런");
    expect(menuPanels).toContain("plan.selection");
    expect(menuPanels).toContain("plan.openingMoves");
    expect(menuPanels).toContain("setActiveMenu={setActiveMenu}");
    expect(menuPanels).toContain("activeEndingReplayBrief?.id === plan.id");
    expect(menuPanels).toContain("ending-replay-active-card");
    expect(menuPanels).toContain("현재 목표 확인");
    expect(menuPanels).toContain("setActiveMenu?.(\"company\")");
    expect(qaScenarios).toContain("ending-replay");
    expect(appCss).toMatch(/\.ending-replay-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-replay-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.ending-replay-grid article\.ending-replay-active-card\s*{[^}]*border-color:\s*var\(--green\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.ending-replay-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.67 #5 exposes ending reward payoff in the run summary", () => {
    expect(gameChrome).toContain("spotlight.ending");
    expect(gameChrome).toContain("ending-spotlight-card");
    expect(gameChrome).toContain("엔딩 보너스");
    expect(appCss).toMatch(/\.ending-spotlight-card\s*{[^}]*border-color:/s);
  });

  it("v0.67 #6 briefs active ending target runs in the company console", () => {
    expect(menuPanels).toContain("getActiveEndingReplayBrief");
    expect(menuPanels).toContain("ending-replay-brief-panel");
    expect(menuPanels).toContain("목표 엔딩 런");
    expect(menuPanels).toContain("openingMoves");
    expect(menuPanels).toContain("activeEndingReplayBrief.rewardProgressLabel");
    expect(menuPanels).toContain("완주 시");
    expect(menuPanels).toContain("activeEndingReplayBrief.alreadyDiscovered");
    expect(menuPanels).toContain("발견 완료 목표");
    expect(menuPanels).toContain("activeEndingReplayBrief.nextRequirements");
    expect(menuPanels).toContain("ending-replay-checklist");
    expect(menuPanels).toContain("requirement.actionLabel");
    expect(menuPanels).toContain("setActiveMenu?.(requirement.targetMenu");
    expect(qaScenarios).toContain("ending-replay-active");
    expect(qaScenarios).toContain("ending-replay-known");
    expect(appCss).toMatch(/\.ending-replay-brief-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-replay-brief-steps\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.ending-replay-checklist\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.ending-replay-checklist button\s*{[^}]*background:\s*var\(--green\)/s);
  });

  it("v0.67 #17 summarizes active ending replay actions in the deck panel", () => {
    expect(menuPanels).toContain("ending-replay-active-summary");
    expect(menuPanels).toContain("현재 목표 진행");
    expect(menuPanels).toContain("activeEndingReplayBrief.nextRequirements.slice(0, 3)");
    expect(menuPanels).toContain("requirement.actionLabel");
    expect(menuPanels).toContain("setActiveMenu?.(requirement.targetMenu)");
    expect(appCss).toMatch(/\.ending-replay-active-summary\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-replay-active-actions\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.ending-replay-active-actions\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.67 #18 shows active ending target progress in the top HUD", () => {
    expect(gameChrome).toContain("getActiveEndingReplayBrief");
    expect(gameChrome).toContain("activeEndingReplayBrief.progressPercent");
    expect(gameChrome).toContain("ending-target-pill");
    expect(gameChrome).toContain("목표 엔딩");
    expect(appCss).toMatch(/\.status-pill\.ending-target-pill\s*{[^}]*background:\s*#f4fbec/s);
  });

  it("v0.67 #19 summarizes target ending runs in the final results", () => {
    expect(gameChrome).toContain("ending-target-result-panel");
    expect(gameChrome).toContain("목표 엔딩 결과");
    expect(gameChrome).toContain("activeEndingReplayBrief.complete");
    expect(gameChrome).toContain("activeEndingReplayBrief.selection");
    expect(gameChrome).toContain("목표 다시 도전");
    expect(appCss).toMatch(/\.ending-target-result-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-target-result-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.ending-target-result-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.67 #22 highlights newly discovered endings in the final results", () => {
    expect(gameChrome).toContain("getCampaignEndingDiscovery");
    expect(gameChrome).toContain("ending-discovery-panel");
    expect(gameChrome).toContain("새 엔딩 발견");
    expect(gameChrome).toContain("도감 반영");
    expect(gameChrome).toContain("endingDiscovery.completionPercentAfterRun");
    expect(gameChrome).toContain("endingDiscovery.discoveredRewardBonusAfterRun");
    expect(gameChrome).toContain("endingDiscovery.totalRewardBonus");
    expect(gameChrome).toContain("도감 통찰");
    expect(gameChrome).toContain("보상 완성률");
    expect(appCss).toMatch(/\.ending-discovery-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-discovery-panel\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.ending-discovery-panel\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.67 #7 lets final results restart from near-missed endings", () => {
    expect(gameChrome).toContain("getEndingNearMisses");
    expect(gameChrome).toContain("ending-nearmiss-panel");
    expect(gameChrome).toContain("아쉬운 엔딩");
    expect(gameChrome).toContain("nearMiss.replaySelection");
    expect(gameChrome).toContain("nearMiss.discovered");
    expect(gameChrome).toContain("새 도감 후보");
    expect(gameChrome).toContain("nearMiss.rewardLabel");
    expect(appCss).toMatch(/\.ending-nearmiss-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-nearmiss-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.ending-nearmiss-grid em\s*{[^}]*font-style:\s*normal/s);
  });

  it("v0.67 #8 marks target ending runs in the world reveal", () => {
    expect(worldRevealModal).toContain("getActiveEndingReplayBrief");
    expect(worldRevealModal).toContain("world-reveal-ending-target");
    expect(worldRevealModal).toContain("목표 엔딩");
    expect(worldRevealModal).toContain("endingReplayBrief.rewardProgressLabel");
    expect(worldRevealModal).toContain("endingReplayBrief.openingMoves");
    expect(appCss).toMatch(/\.world-reveal-ending-target\s*{[^}]*display:\s*grid/s);
  });

  it("v0.67 #10 explains final ending requirements in the result tab", () => {
    expect(gameChrome).toContain("getCampaignEndingReport");
    expect(gameChrome).toContain("ending-report-panel");
    expect(gameChrome).toContain("endingReport.requirements");
    expect(appCss).toMatch(/\.ending-report-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.ending-report-grid\s*{[^}]*grid-template-columns:/s);
  });

  it("surfaces campaign shock pacing inside the company console", () => {
    expect(menuPanels).toContain("<CampaignShockPanel");
    expect(campaignShockPanel).toContain("getCampaignShockForecast");
    expect(campaignShockPanel).toContain("campaign-shock-panel");
    expect(campaignShockPanel).toContain("campaign-shock-action-grid");
    expect(appCss).toMatch(/\.campaign-shock-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.campaign-shock-action-grid\s*{[^}]*grid-template-columns:/s);
  });

  it("adds recruitment channels and contract badges to the agent console", () => {
    expect(menuPanels).toContain("recruitment-channel-panel");
    expect(menuPanels).toContain("recruitment-channel-button");
    expect(menuPanels).toContain("candidate-pool-strip");
    expect(menuPanels).toContain("candidate-pool-empty");
    expect(menuPanels).toContain("getRecruitmentCandidatePool");
    expect(menuPanels).toContain("getRecruitmentOffer");
    expect(menuPanels).toContain("getAgentCareerStatus");
    expect(menuPanels).toContain("getAgentDevelopmentProfile");
    expect(menuPanels).toContain("getAgentRetentionAlerts");
    expect(menuPanels).toContain("getRecruitmentBrandProfile");
    expect(menuPanels).toContain("getStaffIncidentBriefs");
    expect(menuPanels).toContain("getStaffIncidentResolutionOptions");
    expect(menuPanels).toContain("getRecentStaffIncidentResolutionLog");
    expect(menuPanels).toContain("resolveStaffIncident");
    expect(menuPanels).toContain("getAgentRestCheck");
    expect(menuPanels).toContain("getAgentSalaryNegotiationCheck");
    expect(menuPanels).toContain("getAgentSpecializationOptions");
    expect(menuPanels).toContain("chooseAgentSpecialization");
    expect(menuPanels).toContain("restAgent");
    expect(menuPanels).toContain("negotiateAgentSalary");
    expect(menuPanels).toContain("career-meter");
    expect(menuPanels).toContain("care-actions");
    expect(menuPanels).toContain("specialization-panel");
    expect(menuPanels).toContain("personality-strip");
    expect(menuPanels).toContain("preference-row");
    expect(menuPanels).toContain("retention-alert-list");
    expect(menuPanels).toContain("staff-incident-panel");
    expect(menuPanels).toContain("staff-incident-card");
    expect(menuPanels).toContain("staff-incident-actions");
    expect(menuPanels).toContain("staff-incident-source");
    expect(menuPanels).toContain("projectImpactLabel");
    expect(menuPanels).toContain("office-zone-panel");
    expect(menuPanels).toContain("getOfficeZonePlan");
    expect(gameChrome).toContain("officeZonePlan");
    expect(gameChrome).toContain("getOfficeScenePlan");
    expect(gameChrome).toContain("officeScenePlan");
    expect(gameChrome).toContain("pixel-office-object");
    expect(gameChrome).toContain("pixel-actor");
    expect(gameChrome).toContain("OfficeActorFocusPanel");
    expect(gameChrome).toContain("setSelectedOfficeActorId");
    expect(gameChrome).toContain("getOperationsCommandPlan");
    expect(gameChrome).toContain("OperationCommandPanel");
    expect(gameChrome).toContain("operation-command-panel");
    expect(gameChrome).toContain("staffAftermathSummary");
    expect(gameChrome).toContain("monthly-staff-aftermath-row");
    expect(appCss).toMatch(/\.office-zone-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.pixel-office-grid\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.office-object\.pixel-office-object\s*{[^}]*image-rendering:\s*pixelated/s);
    expect(appCss).toMatch(/\.staff-sprite\.pixel-actor\s*{[^}]*animation:/s);
    expect(appCss).toMatch(/\.staff-sprite\.pixel-actor\s*{[^}]*pointer-events:\s*auto/s);
    expect(appCss).toMatch(/\.office-actor-focus-panel\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.project-stack\s*{[^}]*pointer-events:\s*none/s);
    expect(appCss).toMatch(/\.actor-focus-meters\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/@keyframes\s+pixel-actor-work/s);
    expect(appCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*{[\s\S]*\.staff-sprite\.pixel-actor\s*{[^}]*animation:\s*none/s);
    expect(appCss).toMatch(/\.operation-command-panel\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.operation-command-grid\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.monthly-staff-aftermath-row\s*{/s);
    expect(gameChrome).toContain("getAgentRestCheck");
    expect(gameChrome).toContain("getAgentSalaryNegotiationCheck");
    expect(gameChrome).toContain("restAgent");
    expect(gameChrome).toContain("negotiateAgentSalary");
    expect(gameChrome).toContain("actor-focus-care-actions");
    expect(gameChrome).toContain("즉시 휴식");
    expect(gameChrome).toContain("연봉 협상");
    expect(gameChrome).toContain("onCareAction");
    expect(menuPanels).toContain("staff-incident-aftermath-warning");
    expect(menuPanels).toContain("staff-aftermath-panel");
    expect(menuPanels).toContain("staff-resolution-result-panel");
    expect(menuPanels).toContain("staff-resolution-result-card");
    expect(menuPanels).toContain("recruitment-brand-panel");
    expect(menuPanels).toContain("brand-driver-list");
    expect(menuPanels).toContain("hireAgentViaChannel");
    expect(menuPanels).toContain("getAgentHireCheckForChannel");
    expect(appCss).toMatch(/\.recruitment-channel-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.recruitment-brand-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.brand-driver-list\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.recruitment-channel-buttons\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.candidate-pool-strip\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.staff-incident-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.staff-incident-card\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.staff-incident-actions\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.staff-incident-source\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.staff-incident-aftermath-warning\s*{[^}]*display:\s*block/s);
    expect(appCss).toMatch(/\.staff-aftermath-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.staff-resolution-result-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.staff-resolution-result-card\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.staff-resolution-result-card\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*;/s);
    expect(appCss).toMatch(/\.career-meter\s*{[^}]*height:/s);
    expect(appCss).toMatch(/\.care-actions\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.specialization-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.personality-strip\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.preference-row\s*{[^}]*display:\s*flex/s);
    expect(appCss).toMatch(/\.retention-alert-list\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.contract-badge\s*{[^}]*font-weight:\s*900/s);
    expect(appCss).toMatch(/\.agent-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.58 #1 visualizes market share with derive-only data and top-pressure highlight", () => {
    expect(gameChrome).toContain("MarketSharePanel");
    expect(gameChrome).toContain("<MarketSharePanel gameState={gameState} locale={locale} />");
    expect(marketSharePanel).toContain("getPlayerMarketShare");
    expect(marketSharePanel).toContain("getCompetitionSeasonBrief");
    expect(marketSharePanel).toContain("competitorStates");
    expect(marketSharePanel).toContain("market-share-panel");
    expect(marketSharePanel).toContain("market-share-bar");
    expect(marketSharePanel).toContain("market-share-legend");
    expect(marketSharePanel).toContain("market-share-top");
    expect(appCss).toMatch(/\.market-share-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.market-share-bar\s*{[^}]*display:\s*flex/s);
    expect(appCss).toMatch(/\.market-share-segment\s*{[^}]*transition:/s);
    expect(appCss).toMatch(/\.market-share-top\s*{/s);
    expect(appCss).toMatch(/\.market-share-legend\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.market-share-panel/s);
  });

  it("v0.58 #2 tracks marketShareHistory and renders sparkline polylines for player and top rival", () => {
    expect(marketSharePanel).toContain("marketShareHistory");
    expect(marketSharePanel).toContain("market-share-sparkline");
    expect(marketSharePanel).toContain("market-share-sparkline-player");
    expect(marketSharePanel).toContain("market-share-sparkline-rival");
    expect(marketSharePanel).toContain("polyline");
    expect(marketSharePanel).toContain("market-share-trend");
    expect(appCss).toMatch(/\.market-share-sparkline\s*{[^}]*display:\s*block/s);
    expect(appCss).toMatch(/\.market-share-sparkline-player\s*{[^}]*stroke:/s);
    expect(appCss).toMatch(/\.market-share-sparkline-rival\s*{[^}]*stroke:/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.market-share-sparkline/s);
  });

  it("v0.58 #3 surfaces rival archetype and weakness in a derive-only panel mounted next to market share", () => {
    expect(gameChrome).toContain("RivalArchetypePanel");
    expect(gameChrome).toContain("<RivalArchetypePanel gameState={gameState} locale={locale} />");
    expect(rivalArchetypePanel).toContain("getRivalCounterPlans");
    expect(rivalArchetypePanel).toContain("archetype_key");
    expect(rivalArchetypePanel).toContain("weakness_key");
    expect(rivalArchetypePanel).toContain("rival-archetype-panel");
    expect(rivalArchetypePanel).toContain("rival-archetype-card");
    expect(rivalArchetypePanel).toContain("rival-archetype-severity");
    expect(rivalArchetypePanel).toContain("rival-archetype-weakness-row");
    expect(appCss).toMatch(/\.rival-archetype-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.rival-archetype-list\s*{[^}]*grid-template-columns:\s*repeat\(3/s);
    expect(appCss).toMatch(/\.rival-archetype-card\.rival-archetype-contested\s*{/s);
    expect(appCss).toMatch(/\.rival-archetype-weakness-row\s+\.rival-archetype-value\s*{/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.rival-archetype-list/s);
  });

  it("v0.58 #5 surfaces a big-event modal for annual_challenger / late_boss entry with dismiss action", () => {
    expect(gameChrome).toContain("BigEventModal");
    expect(gameChrome).toContain("<BigEventModal gameState={gameState} setGameState={setGameState} locale={locale} />");
    expect(bigEventModal).toContain("pendingChallengerEntryIds");
    expect(bigEventModal).toContain("dismissChallengerEntry");
    expect(bigEventModal).toContain("entry_announcement");
    expect(bigEventModal).toContain("big-event-overlay");
    expect(bigEventModal).toContain("big-event-card");
    expect(bigEventModal).toContain("role=\"dialog\"");
    expect(bigEventModal).toContain("aria-modal=\"true\"");
    expect(appCss).toMatch(/\.big-event-overlay\s*{[^}]*position:\s*fixed/s);
    expect(appCss).toMatch(/\.big-event-card\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.big-event-card\.big-event-tier-late_boss\s*{/s);
    expect(appCss).toMatch(/\.big-event-dismiss\s*{[^}]*cursor:\s*pointer/s);
    expect(appCss).toMatch(/@keyframes\s+big-event-pop-in/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.big-event-card/s);
  });

  it("v0.62 #1 keeps the payoff celebration modal mobile-safe with reduced-motion fallback", () => {
    expect(gameChrome).toContain("PayoffCelebrationModal");
    expect(gameChrome).toContain("<PayoffCelebrationModal gameState={gameState} setGameState={setGameState} />");
    expect(payoffCelebrationModal).toContain("getPayoffCelebrationMoments");
    expect(payoffCelebrationModal).toContain("getNewPayoffActivationIds");
    expect(payoffCelebrationModal).toContain("discoverActivePayoffs");
    expect(payoffCelebrationModal).toContain("payoff-celebration-overlay");
    expect(payoffCelebrationModal).toContain("payoff-celebration-card");
    expect(payoffCelebrationModal).toContain("신규 발견!");
    expect(payoffCelebrationModal).toContain("role=\"dialog\"");
    expect(payoffCelebrationModal).toContain("scenario\") === \"payoff-juice\"");
    expect(qaScenarios).toContain("\"payoff-juice\"");
    expect(appCss).toMatch(/\.payoff-celebration-overlay\s*{[^}]*position:\s*fixed/s);
    expect(appCss).toMatch(/\.payoff-celebration-card\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.payoff-celebration-card\.payoff-celebration-combo\s*{[^}]*animation:\s*payoff-celebration-pop/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*700px\)[\s\S]*\.payoff-celebration-card\s*{[^}]*max-width:\s*100%/s);
    expect(appCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.payoff-celebration-card/s);
    expect(appCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.payoff-celebration-flare/s);
  });

  it("v0.62 #2 keeps the payoff collection view mobile-safe at the 390x844 contract", () => {
    expect(menuPanels).toContain("getPayoffCollectionEntries");
    expect(menuPanels).toContain("payoff-collection-panel");
    expect(menuPanels).toContain("payoff-collection-grid");
    expect(menuPanels).toContain("발견");
    expect(menuPanels).toContain("\"???\"");
    expect(qaScenarios).toContain("\"collection\"");
    expect(qaScenarios).toContain("discoveredPayoffIds");
    expect(qaScenarios).toContain("activeMenu: \"products\"");
    expect(appCss).toMatch(/--mobile-shell-width:\s*390px/s);
    expect(appCss).toMatch(/--mobile-shell-height:\s*844px/s);
    expect(appCss).toMatch(/\.payoff-collection-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.payoff-collection-grid\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
    expect(appCss).toMatch(/\.payoff-collection-grid article\s*{[^}]*min-width:\s*0/s);
    expect(appCss).toMatch(/\.payoff-collection-grid strong\s*{[^}]*overflow-wrap:\s*anywhere/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.payoff-collection-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });

  it("v0.62 #3 keeps milestone fanfare and annual near-miss relief mobile-safe at 390x844", () => {
    expect(payoffCelebrationModal).toContain("getAchievementCelebrationMoments");
    expect(payoffCelebrationModal).toContain("getNewAchievementUnlockIds");
    expect(payoffCelebrationModal).toContain("scenario\") === \"milestones\"");
    expect(payoffCelebrationModal).toContain("마일스톤 달성");
    expect(menuPanels).toContain("getAnnualReviewNearMissSignal");
    expect(menuPanels).toContain("annual-nearmiss-relief");
    expect(qaScenarios).toContain("\"milestones\"");
    expect(appCss).toMatch(/\.payoff-celebration-card\.payoff-celebration-achievement\s*{/s);
    expect(appCss).toMatch(/\.annual-nearmiss-relief\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.annual-nearmiss-relief\s+strong\s*{[^}]*overflow-wrap:\s*anywhere/s);
    expect(appCss).toMatch(/@media\s*\(max-width:\s*520px\)[\s\S]*\.annual-nearmiss-relief\s*{[^}]*grid-template-columns:\s*1fr/s);
    expect(appCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*\.annual-nearmiss-relief/s);
  });

  it("v0.58 #4 differentiates rival-counter strategy cards with a derive-only pressure badge in deck and reward UI", () => {
    expect(menuPanels).toContain("isCounterCard");
    expect(menuPanels).toContain("getRivalCounterSignal");
    expect(menuPanels).toContain("rivalCounterSignal");
    expect(menuPanels).toContain("strategy-card-counter");
    expect(menuPanels).toContain("strategy-card-counter-badge");
    expect(menuPanels).toContain("압박 대응");
    expect(appCss).toMatch(/\.strategy-card-counter\.strategy-card-counter-high\s*{[^}]*box-shadow:/s);
    expect(appCss).toMatch(/\.strategy-card-counter\.strategy-card-counter-low\s*{[^}]*box-shadow:/s);
    expect(appCss).toMatch(/\.strategy-card-counter-badge\s*{[^}]*background:/s);
    expect(appCss).toMatch(/\.strategy-card-counter-badge\.strategy-card-counter-badge-high\s*{[^}]*animation:/s);
    expect(appCss).toMatch(/@keyframes\s+strategy-card-counter-pulse/s);
    expect(appCss).toMatch(/@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*strategy-card-counter-badge-high/s);
  });
});
