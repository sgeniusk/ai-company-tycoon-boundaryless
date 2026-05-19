import { describe, expect, it } from "vitest";
import { createQaScenario, createQaScenarioFromSearch, qaScenarioIds } from "./qa-scenarios";
import { getAnnualDirectiveChoiceRows } from "./annual-review";
import { getAnnualStrategyAdvice } from "./annual-strategy-advisor";
import { assetManifest } from "./data";
import { getFoundationSnapshot } from "./content-foundation";
import { getDeckSynergySummary } from "./deckbuilding";
import { getNextRunSetupPlan } from "./meta-progression";
import { runTenYearCampaignSimulation } from "./run-simulator";
import {
  getAgentRestCheck,
  getAgentSalaryNegotiationCheck,
  getOfficeScenePlan,
  getOperationsCommandPlan,
  getRecentStaffIncidentAftermathLog,
  getRecentStaffIncidentResolutionLog,
  getStaffIncidentBriefs,
} from "./simulation";

describe("alpha v0.9.3 QA scenarios", () => {
  it("exposes stable browser QA scenario ids", () => {
    expect(qaScenarioIds).toEqual([
      "fresh",
      "staffing",
      "project",
      "release",
      "reward",
      "shop",
      "office",
      "deck",
      "deck-synergy",
      "strategy",
      "counter",
      "rivals",
      "arc",
      "flow",
      "alpha",
      "next-run",
      "restart-setup",
      "finale",
      "review",
      "reward-bias",
      "annual-strategy",
      "ten-year-sim",
      "campaign-shock",
      "foundation",
      "commercial",
      "result",
      "readiness",
      "persona20",
      "staff-incidents",
      "staff-resolution",
      "staff-aftermath",
      "launch-impact",
      "operations",
      "office-visuals",
    ]);
  });

  it("creates a fresh first-screen scenario", () => {
    const scenario = createQaScenario("fresh");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.state.hiredAgents).toHaveLength(0);
    expect(scenario.state.activeProducts).toHaveLength(0);
    expect(scenario.label).toContain("첫 화면");
  });

  it("creates an active project scenario for progress and objective QA", () => {
    const scenario = createQaScenario("project");

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.state.hiredAgents.length).toBeGreaterThanOrEqual(1);
    expect(scenario.state.productProjects).toHaveLength(1);
    expect(scenario.state.activeProducts).not.toContain("ai_writing_assistant");
  });

  it("creates a staffing scenario for explicit product team assignment QA", () => {
    const scenario = createQaScenario("staffing");

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.state.hiredAgents.length).toBeGreaterThanOrEqual(2);
    expect(scenario.state.productProjects).toHaveLength(0);
    expect(scenario.state.activeProducts).toHaveLength(0);
  });

  it("creates a staff incident scenario for HR drama browser QA", () => {
    const scenario = createQaScenario("staff-incidents");
    const incidents = getStaffIncidentBriefs(scenario.state);

    expect(scenario.activeMenu).toBe("agents");
    expect(scenario.label).toContain("인사 사건");
    expect(incidents.map((incident) => incident.type)).toEqual(expect.arrayContaining(["burnout", "poaching", "discontent"]));
    expect(incidents.find((incident) => incident.type === "poaching")?.sourceCompetitorName).toBeTruthy();
    expect(incidents.find((incident) => incident.type === "poaching")?.offerLabel).toContain("연봉");
  });

  it("creates a resolved staff incident scenario for result-card browser QA", () => {
    const scenario = createQaScenario("staff-resolution");
    const resolutions = getRecentStaffIncidentResolutionLog(scenario.state);

    expect(scenario.activeMenu).toBe("agents");
    expect(scenario.label).toContain("인사 대응");
    expect(resolutions).toHaveLength(1);
    expect(resolutions[0].resolutionLabel).toContain("회복일");
  });

  it("creates an unresolved staff aftermath scenario for monthly pressure browser QA", () => {
    const scenario = createQaScenario("staff-aftermath");
    const aftermaths = getRecentStaffIncidentAftermathLog(scenario.state);

    expect(scenario.activeMenu).toBe("agents");
    expect(scenario.label).toContain("후폭풍");
    expect(aftermaths.length).toBeGreaterThanOrEqual(1);
    expect(aftermaths[0].resolutionLabel).toContain("후폭풍");
    expect(aftermaths[0].projectImpactLabel).toContain("프로젝트");
    expect(scenario.state.lastMonthReport?.staffAftermathCount).toBeGreaterThanOrEqual(1);
    expect(scenario.state.lastMonthReport?.staffAftermathSummary).toContain("프로젝트");
    expect(scenario.state.timeline.join(" ")).toContain("인사 후폭풍");
  });

  it("creates a release spotlight scenario", () => {
    const scenario = createQaScenario("release");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.state.activeProducts).toContain("ai_writing_assistant");
    expect(scenario.state.lastRelease?.productId).toBe("ai_writing_assistant");
    expect(scenario.state.lastRelease?.expansionHint).toContain("회의");
    expect(scenario.state.lastRelease?.growthPaths).toHaveLength(3);
  });

  it("creates a shop guidance scenario after first release", () => {
    const scenario = createQaScenario("shop");

    expect(scenario.activeMenu).toBe("shop");
    expect(scenario.state.activeProducts).toContain("ai_writing_assistant");
    expect(scenario.state.ownedItems).toHaveLength(0);
  });

  it("creates an office expansion and decoration scenario", () => {
    const scenario = createQaScenario("office");

    expect(scenario.activeMenu).toBe("shop");
    expect(scenario.state.office.expansionId).toBe("startup_suite");
    expect(scenario.state.office.placedItemIds.length).toBeGreaterThanOrEqual(2);
    expect(scenario.state.ownedItems).toEqual(expect.arrayContaining(["gpu_rack_mini", "ux_sticky_wall"]));
  });

  it("creates a card reward scenario after first release", () => {
    const scenario = createQaScenario("reward");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.state.activeProducts).toContain("ai_writing_assistant");
    expect(scenario.state.roguelite.pendingCardReward?.offeredCardIds).toHaveLength(3);
    expect(scenario.state.roguelite.deckEditTokens).toBeGreaterThanOrEqual(1);
  });

  it("creates a deck and puzzle scenario for roguelite QA", () => {
    const scenario = createQaScenario("deck");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.state.productProjects).toHaveLength(1);
    expect(scenario.state.roguelite.deck.hand.length).toBeGreaterThanOrEqual(4);
  });

  it("creates an active deck synergy scenario for v0.31 deck QA", () => {
    const scenario = createQaScenario("deck-synergy");
    const summary = getDeckSynergySummary(scenario.state);

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("덱 시너지");
    expect(summary.active.map((synergy) => synergy.id)).toContain("launch_machine");
  });

  it("creates strategy and arc scenarios for post-release QA", () => {
    const strategy = createQaScenario("strategy");
    const counter = createQaScenario("counter");
    const rivals = createQaScenario("rivals");
    const arc = createQaScenario("arc");

    expect(strategy.activeMenu).toBe("competition");
    expect(strategy.state.chosenGrowthPath?.id).toBe("productivity_line");
    expect(counter.activeMenu).toBe("competition");
    expect(counter.state.roguelite.deck.hand).toContain("market_repositioning");
    expect(counter.state.competitorStates.some((competitor) => competitor.claimedProducts.includes("meeting_summary_bot"))).toBe(true);
    expect(rivals.activeMenu).toBe("competition");
    expect(rivals.state.month).toBeGreaterThanOrEqual(12);
    expect(rivals.state.competitorStates.some((competitor) => competitor.id === "competitor_autonova_motors")).toBe(true);
    expect(arc.activeMenu).toBe("company");
    expect(arc.state.chosenGrowthPath?.id).toBe("productivity_line");
    expect(arc.state.month).toBeGreaterThanOrEqual(6);
  });

  it("creates a commercial readiness scenario for final-summary QA", () => {
    const scenario = createQaScenario("commercial");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.state.month).toBeGreaterThanOrEqual(10);
    expect(scenario.state.unlockedAchievements.length).toBeGreaterThanOrEqual(2);
    expect(scenario.state.status).not.toBe("failure");
  });

  it("creates a first ten minute flow scenario for guidance QA", () => {
    const scenario = createQaScenario("flow");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("첫 10분");
    expect(scenario.state.chosenGrowthPath?.id).toBe("productivity_line");
    expect(scenario.state.office.expansionId).toBe("startup_suite");
    expect(scenario.state.ownedItems).toContain("gpu_rack_mini");
  });

  it("creates a 10-minute alpha completion scenario with run result and next-run value", () => {
    const scenario = createQaScenario("alpha");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("10분 알파");
    expect(scenario.state.month).toBeGreaterThanOrEqual(10);
    expect(scenario.state.productReviews).not.toEqual({});
    expect(scenario.state.roguelite.rewardHistory.length).toBeGreaterThanOrEqual(1);
    expect(scenario.state.lastDevelopmentPuzzle?.score).toBeGreaterThan(0);
  });

  it("creates a next-run scenario after accepting alpha insight", () => {
    const scenario = createQaScenario("next-run");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("새 런");
    expect(scenario.state.roguelite.runNumber).toBe(2);
    expect(scenario.state.roguelite.founderInsight).toBeGreaterThan(0);
    expect(scenario.state.roguelite.runHistory[0]).toMatchObject({ runNumber: 1 });
    expect(scenario.state.timeline[0]).toContain("덱");
  });

  it("creates a restart setup scenario before accepting the next run", () => {
    const scenario = createQaScenario("restart-setup");
    const plan = getNextRunSetupPlan(scenario.state);

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("재시작");
    expect(scenario.state.roguelite.runNumber).toBe(1);
    expect(plan.quickStarts.length).toBeGreaterThanOrEqual(3);
    expect(plan.recommendedUnlocks.length).toBeGreaterThan(0);
  });

  it("creates a result scenario that focuses the final run recap", () => {
    const scenario = createQaScenario("result");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("런 결과");
    expect(scenario.state.month).toBeGreaterThanOrEqual(10);
    expect(scenario.state.productReviews).not.toEqual({});
    expect(scenario.state.roguelite.rewardHistory.length).toBeGreaterThanOrEqual(1);
  });

  it("creates a v0.20 alpha readiness scenario from the integrated harness", () => {
    const scenario = createQaScenario("readiness");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("v0.20");
    expect(scenario.state.timeline[0]).toContain("알파 준비도");
    expect(scenario.state.month).toBeGreaterThanOrEqual(120);
    expect(scenario.state.status).not.toBe("playing");
  });

  it("creates a v0.21 20-person persona playtest scenario", () => {
    const scenario = createQaScenario("persona20");

    expect(scenario.activeMenu).toBe("log");
    expect(scenario.label).toContain("20인");
    expect(scenario.state.timeline[0]).toContain("20인 페르소나");
    expect(scenario.state.timeline.some((entry) => entry.includes("우측 보조 패널"))).toBe(true);
  });

  it("creates a v0.22 launch impact scenario with card-influenced release feedback", () => {
    const scenario = createQaScenario("launch-impact");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("출시 체감");
    expect(scenario.state.lastRelease?.productName).toBeTruthy();
    expect(scenario.state.timeline[0]).toContain("출시 체감 QA");
    expect(scenario.state.roguelite.deck.discardPile).toEqual(expect.arrayContaining(["prompt_sprint", "customer_interviews"]));
  });

  it("creates a v0.40 operations command scenario for first-screen browser QA", () => {
    const scenario = createQaScenario("operations");
    const plan = getOperationsCommandPlan(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("운영");
    expect(plan.focusCards.length).toBeGreaterThanOrEqual(3);
    expect(plan.activeSafeguards.join(" ")).toContain("구획");
  });

  it("creates a v0.41 office visual scenario for animated office browser QA", () => {
    const scenario = createQaScenario("office-visuals");
    const plan = getOfficeScenePlan(scenario.state);
    const linkedDecorIds = new Set(assetManifest.office_objects.flatMap((object) => object.linked_item_id ? [object.linked_item_id] : []));

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("사무실 액터");
    expect(plan.objects.length).toBeGreaterThanOrEqual(8);
    expect(plan.actors.some((actor) => actor.kind === "robot")).toBe(true);
    expect(plan.activityTicker.join(" ")).toContain("구획");
    expect(scenario.state.office.placedItemIds.length).toBeGreaterThanOrEqual(8);
    expect(scenario.state.office.placedItemIds.every((itemId) => linkedDecorIds.has(itemId))).toBe(true);
    expect(scenario.state.ownedItems).toEqual(expect.arrayContaining(scenario.state.office.placedItemIds));
  });

  it("creates a v0.44 office focus scenario with direct rest and salary care candidates", () => {
    const scenario = createQaScenario("office-visuals");
    const plan = getOfficeScenePlan(scenario.state);
    const restingActor = plan.actors.find((actor) => actor.state === "resting");
    const warningActor = plan.actors.find((actor) => actor.state === "warning");

    expect(restingActor).toBeTruthy();
    expect(warningActor).toBeTruthy();
    expect(restingActor && getAgentRestCheck(restingActor.id, scenario.state).ok).toBe(true);
    expect(warningActor && getAgentSalaryNegotiationCheck(warningActor.id, scenario.state).ok).toBe(true);
  });

  it("creates a 10-year finale scenario for ending QA", () => {
    const scenario = createQaScenario("finale");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("10년");
    expect(scenario.state.month).toBe(120);
    expect(scenario.state.status).toBe("success");
    expect(scenario.state.locationId).toBe("seoul_ai_tower");
  });

  it("creates an annual review scenario for year-end milestone QA", () => {
    const scenario = createQaScenario("review");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("연간");
    expect(scenario.state.month).toBe(12);
    expect(scenario.state.annualReviewHistory[0]).toMatchObject({
      reviewId: "year_1_local_demo_day",
      passed: true,
    });
    expect(scenario.state.annualDirective?.title).toContain("투자자");
    expect(scenario.state.pendingAnnualDirectiveChoices?.offeredDirectiveIds).toHaveLength(3);
    expect(getAnnualDirectiveChoiceRows(scenario.state).map((choice) => choice.id)).toContain("product_launch_marathon");
  });

  it("creates an annual directive reward-bias scenario for deck QA", () => {
    const scenario = createQaScenario("reward-bias");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("보상 편향");
    expect(scenario.state.annualDirective?.title).toBe("신뢰 복리 프로그램");
    expect(scenario.state.annualDirective?.rewardBiasTags).toEqual(expect.arrayContaining(["trust", "safety", "enterprise"]));
    expect(scenario.state.roguelite.pendingCardReward?.offeredCardIds).toEqual(
      expect.arrayContaining(["interoperability_shield", "safety_review"]),
    );
  });

  it("creates an annual strategy advisor scenario for company QA", () => {
    const scenario = createQaScenario("annual-strategy");
    const advice = getAnnualStrategyAdvice(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("전략실");
    expect(advice?.directiveTitle).toBe("신뢰 복리 프로그램");
    expect(advice?.productRecommendations.map((row) => row.id)).toContain("customer_support_chatbot");
    expect(advice?.capabilityRecommendations.map((row) => row.id)).toEqual(expect.arrayContaining(["safety", "enterprise"]));
  });

  it("creates a ten-year compressed campaign scenario for company QA", () => {
    const scenario = createQaScenario("ten-year-sim");
    const result = runTenYearCampaignSimulation("productivity_line");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("10년");
    expect(scenario.state.month).toBeGreaterThanOrEqual(120);
    expect(scenario.state.annualReviewHistory.length).toBe(result.annualReviewCount);
    expect(scenario.state.status).not.toBe("playing");
  });

  it("creates a campaign shock scenario for v0.33 pacing QA", () => {
    const scenario = createQaScenario("campaign-shock");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("시장 충격");
    expect(scenario.state.month).toBe(36);
    expect(scenario.state.campaignShockHistory).toContain("year3_foundation_model_war");
    expect(scenario.state.timeline.join(" ")).toContain("파운데이션 모델 전쟁");
  });

  it("creates a foundation scenario for content recommendation QA", () => {
    const scenario = createQaScenario("foundation");
    const snapshot = getFoundationSnapshot(scenario.state);

    expect(scenario.activeMenu).toBe("agents");
    expect(scenario.label).toContain("기반");
    expect(snapshot.phase.id).toBe("enterprise");
    expect(snapshot.recommendedAgentIds.length).toBeGreaterThan(0);
    expect(snapshot.recommendedItemIds.length).toBeGreaterThan(0);
  });

  it("creates scenarios from URL search params for browser QA", () => {
    expect(createQaScenarioFromSearch("?scenario=release")?.id).toBe("release");
    expect(createQaScenarioFromSearch("?scenario=staffing")?.id).toBe("staffing");
    expect(createQaScenarioFromSearch("?scenario=reward")?.id).toBe("reward");
    expect(createQaScenarioFromSearch("?scenario=office")?.id).toBe("office");
    expect(createQaScenarioFromSearch("?scenario=strategy")?.id).toBe("strategy");
    expect(createQaScenarioFromSearch("?scenario=counter")?.id).toBe("counter");
    expect(createQaScenarioFromSearch("?scenario=rivals")?.id).toBe("rivals");
    expect(createQaScenarioFromSearch("?scenario=deck")?.id).toBe("deck");
    expect(createQaScenarioFromSearch("?scenario=deck-synergy")?.id).toBe("deck-synergy");
    expect(createQaScenarioFromSearch("?scenario=flow")?.id).toBe("flow");
    expect(createQaScenarioFromSearch("?scenario=alpha")?.id).toBe("alpha");
    expect(createQaScenarioFromSearch("?scenario=next-run")?.id).toBe("next-run");
    expect(createQaScenarioFromSearch("?scenario=restart-setup")?.id).toBe("restart-setup");
    expect(createQaScenarioFromSearch("?scenario=finale")?.id).toBe("finale");
    expect(createQaScenarioFromSearch("?scenario=review")?.id).toBe("review");
    expect(createQaScenarioFromSearch("?scenario=reward-bias")?.id).toBe("reward-bias");
    expect(createQaScenarioFromSearch("?scenario=annual-strategy")?.id).toBe("annual-strategy");
    expect(createQaScenarioFromSearch("?scenario=ten-year-sim")?.id).toBe("ten-year-sim");
    expect(createQaScenarioFromSearch("?scenario=campaign-shock")?.id).toBe("campaign-shock");
    expect(createQaScenarioFromSearch("?scenario=foundation")?.id).toBe("foundation");
    expect(createQaScenarioFromSearch("?scenario=commercial")?.id).toBe("commercial");
    expect(createQaScenarioFromSearch("?scenario=result")?.id).toBe("result");
    expect(createQaScenarioFromSearch("?scenario=persona20")?.id).toBe("persona20");
    expect(createQaScenarioFromSearch("?scenario=staff-incidents")?.id).toBe("staff-incidents");
    expect(createQaScenarioFromSearch("?scenario=staff-resolution")?.id).toBe("staff-resolution");
    expect(createQaScenarioFromSearch("?scenario=launch-impact")?.id).toBe("launch-impact");
    expect(createQaScenarioFromSearch("?scenario=operations")?.id).toBe("operations");
    expect(createQaScenarioFromSearch("?scenario=office-visuals")?.id).toBe("office-visuals");
    expect(createQaScenarioFromSearch("?qa=project")?.id).toBe("project");
    expect(createQaScenarioFromSearch("?scenario=unknown")).toBeUndefined();
  });

  it("allows QA URLs to override the active menu", () => {
    expect(createQaScenarioFromSearch("?scenario=annual-strategy&menu=products")?.activeMenu).toBe("products");
    expect(createQaScenarioFromSearch("?scenario=annual-strategy&menu=research")?.activeMenu).toBe("research");
    expect(createQaScenarioFromSearch("?scenario=annual-strategy&menu=competition")?.activeMenu).toBe("competition");
    expect(createQaScenarioFromSearch("?scenario=annual-strategy&menu=unknown")?.activeMenu).toBe("company");
  });
});
