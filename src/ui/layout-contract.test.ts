import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { menus } from "./menu";

const appCss = readFileSync(new URL("../App.css", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const gameChrome = readFileSync(new URL("../components/GameChrome.tsx", import.meta.url), "utf8");
const menuPanels = readFileSync(new URL("../components/MenuPanels.tsx", import.meta.url), "utf8");
const campaignShockPanel = readFileSync(new URL("../components/CampaignShockPanel.tsx", import.meta.url), "utf8");

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
    expect(appCss).toMatch(/\.card-impact-list\s*{[^}]*gap:/s);
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
    expect(appCss).toMatch(/\.office-hud\s*{[^}]*position:\s*absolute/s);
    expect(appCss).toMatch(/\.office-hud\s*{[^}]*z-index:\s*5/s);
    expect(appCss).toMatch(/\.office-alert-strip\s*{[^}]*position:\s*absolute/s);
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

  it("adds a next-run command room for roguelite restart decisions", () => {
    expect(menuPanels).toContain("getNextRunSetupPlan");
    expect(menuPanels).toContain("next-run-command-panel");
    expect(menuPanels).toContain("next-run-quick-start-grid");
    expect(menuPanels).toContain("meta-category-badge");
    expect(appCss).toMatch(/\.next-run-command-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.next-run-quick-start-grid\s*{[^}]*grid-template-columns:/s);
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
    expect(appCss).toMatch(/\.career-meter\s*{[^}]*height:/s);
    expect(appCss).toMatch(/\.care-actions\s*{[^}]*grid-template-columns:/s);
    expect(appCss).toMatch(/\.specialization-panel\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.personality-strip\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.preference-row\s*{[^}]*display:\s*flex/s);
    expect(appCss).toMatch(/\.retention-alert-list\s*{[^}]*display:\s*grid/s);
    expect(appCss).toMatch(/\.contract-badge\s*{[^}]*font-weight:\s*900/s);
    expect(appCss).toMatch(/\.agent-grid\s*{[^}]*grid-template-columns:\s*1fr/s);
  });
});
