import { describe, expect, it } from "vitest";
import { createQaScenario, createQaScenarioFromSearch, qaScenarioIds } from "./qa-scenarios";
import { getAnnualDirectiveChoiceRows } from "./annual-review";
import { getAnnualStrategyAdvice } from "./annual-strategy-advisor";
import {
  getActiveEndingReplayBrief,
  getCampaignEnding,
  getCampaignEndingDiscovery,
  getEndingAxisCoverageSummary,
  getEndingCollectionSummary,
  getEndingNearMisses,
} from "./campaign-ending";
import { assetManifest, campaignEndings, products } from "./data";
import { getFoundationSnapshot } from "./content-foundation";
import { getDeckSynergySummary } from "./deckbuilding";
import { getNextRunSetupPlan } from "./meta-progression";
import { getPayoffCollectionEntries } from "./payoff-activation";
import { getAiResourceVisibilityMetrics } from "./resource-visibility";
import { runTenYearCampaignSimulation } from "./run-simulator";
import { getBetaReadinessSummary } from "./beta-readiness";
import { getDerivedArchetypes } from "./tag-derivation";
import { getTutorialGuide } from "./tutorial-guide";
import { getAlphaRunCompletionSummary, getAlphaRunDebriefSummary, getAlphaRunRoadmapProgress, getFirstTenMinuteProgress, getGuidanceStep } from "./guidance";
import {
  getAgentRestCheck,
  getAgentSalaryNegotiationCheck,
  getOfficeScenePlan,
  getOperationsCommandPlan,
  getProductProjectCheck,
  getRecentStaffIncidentAftermathLog,
  getRecentStaffIncidentResolutionLog,
  getStaffIncidentBriefs,
  advanceMonth,
} from "./simulation";

describe("alpha v0.9.3 QA scenarios", () => {
  it("exposes stable browser QA scenario ids", () => {
    expect(qaScenarioIds).toEqual([
      "fresh",
      "staffing",
      "project",
      "release",
      "reward",
      "reward-picked",
      "growth-picked",
      "shop",
      "office",
      "deck",
      "deck-result",
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
      "annual-directed",
      "year-two-plan",
      "year-two-research",
      "year-two-research-complete",
      "year-two-product-candidate",
      "year-two-product-ready",
      "year-two-product-started",
      "year-two-product-issue-result",
      "year-two-product-launch-impact",
      "alpha-run-complete",
      "alpha-run-issue-complete",
      "alpha-run-second-launch",
      "alpha-run-second-reward-picked",
      "reward-bias",
      "annual-strategy",
      "ten-year-sim",
      "ten-year-next-run",
      "ten-year-ending-route-start",
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
      "market-share",
      "big-event",
      "resource-visibility",
      "physical-industries",
      "payoff-juice",
      "collection",
      "milestones",
      "run-modifiers",
      "difficulty-hard",
      "difficulty-reward",
      "world-events",
      "beta-readiness",
      "beta-readiness-complete",
      "ending-replay",
      "ending-replay-active",
      "ending-replay-known",
      "ending-replay-complete",
      "ending-replay-final",
      "ending-replay-known-final",
      "ending-san-francisco-final",
      "ending-steady-operator-final",
      "ending-fallback-final",
      "ending-fallback-known-final",
      "ending-nearmiss-final",
      "ending-nearmiss-known-final",
      "ending-nearmiss-retry-start",
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
    expect(scenario.state.seenTutorials).toEqual(expect.arrayContaining(["welcome_garage", "agent_hired"]));
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

  it("creates a resource visibility scenario with non-zero research indicators", () => {
    const scenario = createQaScenario("resource-visibility");
    const metrics = getAiResourceVisibilityMetrics(scenario.state, products);

    expect(scenario.activeMenu).toBe("research");
    expect(scenario.label).toContain("자원 가시화");
    expect(metrics.activeProductCount).toBeGreaterThanOrEqual(3);
    expect(metrics.monthlyComputeLoad).toBeGreaterThan(0);
    expect(metrics.monthlyDataGenerated).toBeGreaterThan(0);
    expect(metrics.nextLaunchComputeNeeded).toBeGreaterThan(0);
    expect(metrics.nextLaunchProductName).toContain("프론티어");
  });

  it("creates a physical industries scenario with the v0.60 domains unlocked for product QA", () => {
    const scenario = createQaScenario("physical-industries");
    const physicalIndustryDomainIds = ["manufacturing", "logistics", "energy"];
    const physicalProducts = products.filter((product) => physicalIndustryDomainIds.includes(product.domain));

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.label).toContain("물리 산업");
    expect(scenario.state.unlockedDomains).toEqual(expect.arrayContaining(physicalIndustryDomainIds));
    expect(scenario.state.capabilities.robotics ?? 0).toBeGreaterThanOrEqual(2);
    expect(scenario.state.capabilities.manufacturing ?? 0).toBeGreaterThanOrEqual(3);
    expect(scenario.state.capabilities.logistics ?? 0).toBeGreaterThanOrEqual(2);
    expect(scenario.state.capabilities.agent ?? 0).toBeGreaterThanOrEqual(2);
    expect(scenario.state.capabilities.optimization ?? 0).toBeGreaterThanOrEqual(3);
    expect(physicalProducts).toHaveLength(6);
    expect(new Set(physicalProducts.map((product) => product.domain))).toEqual(new Set(physicalIndustryDomainIds));
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

  it("keeps post-release reward and growth QA scenarios clear of helper tutorial modals", () => {
    for (const scenarioId of ["reward", "reward-picked", "growth-picked"] as const) {
      const scenario = createQaScenario(scenarioId);

      expect(scenario.state.seenTutorials).toEqual(
        expect.arrayContaining([
          "welcome_garage",
          "agent_hired",
          "product_ideas",
          "development_project",
          "card_reward",
          "office_growth",
          "competition_pressure",
        ]),
      );
      expect(getTutorialGuide(scenario.state, scenario.activeMenu)).toBeUndefined();
    }
  });

  it("creates a picked first reward scenario for the post-choice confirmation", () => {
    const scenario = createQaScenario("reward-picked");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("보상 선택 완료");
    expect(scenario.state.roguelite.pendingCardReward).toBeUndefined();
    expect(scenario.state.roguelite.rewardHistory).toHaveLength(1);
    expect(scenario.state.timeline[0]).toContain("카드 보상 선택");
    expect(scenario.state.seenTutorials).toEqual(
      expect.arrayContaining(["welcome_garage", "agent_hired", "development_project", "card_reward", "office_growth"]),
    );
  });

  it("creates a picked growth branch scenario for the post-choice confirmation", () => {
    const scenario = createQaScenario("growth-picked");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("성장 분기 선택 완료");
    expect(scenario.state.chosenGrowthPath?.id).toBe("productivity_line");
    expect(scenario.state.roguelite.pendingCardReward).toBeUndefined();
    expect(scenario.state.roguelite.rewardHistory).toHaveLength(1);
    expect(scenario.state.timeline[0]).toContain("성장 경로 선택");
  });

  it("creates a deck and puzzle scenario for roguelite QA", () => {
    const scenario = createQaScenario("deck");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("첫 개발 이슈");
    expect(scenario.state.productProjects).toHaveLength(1);
    expect(scenario.state.roguelite.deck.hand.length).toBeGreaterThanOrEqual(4);
    expect(scenario.state.lastDevelopmentPuzzle).toBeUndefined();
  });

  it("creates a first development issue result scenario with card impact", () => {
    const scenario = createQaScenario("deck-result");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("첫 개발 이슈 결과");
    expect(scenario.state.productProjects).toHaveLength(1);
    expect(scenario.state.lastDevelopmentPuzzle?.score).toBeGreaterThan(0);
    expect(scenario.state.lastDevelopmentPuzzle?.appliedModifierLabels).toContain("고객 인터뷰");
    expect(scenario.state.timeline[0]).toContain("개발 퍼즐");
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
    const guidance = getGuidanceStep(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("첫 10분");
    expect(scenario.state.chosenGrowthPath?.id).toBe("productivity_line");
    expect(scenario.state.lastRelease?.productName).toBeTruthy();
    expect(Object.keys(scenario.state.productReviews)).toContain(scenario.state.lastRelease?.productId);
    expect(scenario.state.office.expansionId).toBe("startup_suite");
    expect(scenario.state.ownedItems).toContain("gpu_rack_mini");
    expect(scenario.state.seenTutorials).toEqual(expect.arrayContaining(["welcome_garage", "competition_pressure"]));
    expect(getFirstTenMinuteProgress(scenario.state)).toBe(100);
    expect(guidance.id).toBe("advance_annual_review");
  });

  it("lets the v0.56 flow slice reach the first annual review", () => {
    let state = createQaScenario("flow").state;

    while (state.month < 12) {
      state = advanceMonth(state);
    }

    expect(state.month).toBe(12);
    expect(state.annualReviewHistory[0]).toMatchObject({
      reviewId: "year_1_local_demo_day",
    });
    expect(state.pendingAnnualDirectiveChoices?.offeredDirectiveIds.length).toBeGreaterThanOrEqual(1);
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
  }, 20_000);

  it("creates a v0.50 20-person persona playtest scenario for alpha candidate QA", () => {
    const scenario = createQaScenario("persona20");

    expect(scenario.activeMenu).toBe("log");
    expect(scenario.label).toContain("v0.50");
    expect(scenario.label).toContain("20인");
    expect(scenario.state.timeline[0]).toContain("v0.50 20인 페르소나");
    expect(scenario.state.timeline.some((entry) => entry.includes("P0/P1: 없음"))).toBe(true);
    expect(scenario.state.timeline.some((entry) => entry.includes("첫 30초: 사무실 판타지"))).toBe(true);
    expect(scenario.state.timeline.some((entry) => entry.includes("우측 보조 패널"))).toBe(false);
  }, 20_000);

  it("creates a v0.56 launch impact scenario with card, rival, and team reactions", () => {
    const scenario = createQaScenario("launch-impact");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("v0.56");
    expect(scenario.label).toContain("출시 체감");
    expect(scenario.state.lastRelease?.productName).toBeTruthy();
    expect(scenario.state.timeline[0]).toContain("출시 체감 QA");
    expect(scenario.state.timeline[0]).toContain("경쟁사");
    expect(scenario.state.timeline[0]).toContain("팀 반응");
    expect(scenario.state.roguelite.deck.discardPile).toEqual(expect.arrayContaining(["prompt_sprint", "customer_interviews"]));
    expect(scenario.state.seenTutorials).toEqual(
      expect.arrayContaining(["welcome_garage", "agent_hired", "development_project", "card_reward"]),
    );
  });

  it("creates a v0.40 operations command scenario for first-screen browser QA", () => {
    const scenario = createQaScenario("operations");
    const plan = getOperationsCommandPlan(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("운영");
    expect(plan.focusCards.length).toBeGreaterThanOrEqual(3);
    expect(plan.activeSafeguards.join(" ")).toContain("구획");
  });

  it("creates a v0.55 office visual scenario for screenshot QA", () => {
    const scenario = createQaScenario("office-visuals");
    const plan = getOfficeScenePlan(scenario.state);
    const linkedDecorIds = new Set(assetManifest.office_objects.flatMap((object) => object.linked_item_id ? [object.linked_item_id] : []));
    const staffIncidents = getStaffIncidentBriefs(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("스크린샷 QA");
    expect(scenario.state.timeline[0]).toContain("v0.55 스크린샷 QA");
    expect(scenario.state.timeline[0]).toContain("v0.56 사건 화면");
    expect(scenario.state.currentRivalEvent?.id).toBeTruthy();
    expect(staffIncidents.length).toBeGreaterThan(0);
    expect(staffIncidents.map((incident) => incident.type)).toEqual(expect.arrayContaining(["burnout", "poaching"]));
    expect(plan.objects.length).toBeGreaterThanOrEqual(8);
    expect(plan.actors.some((actor) => actor.kind === "robot")).toBe(true);
    expect(plan.eventReactions.map((reaction) => reaction.trigger)).toContain("card_use");
    expect(plan.actors.map((actor) => actor.reactionPose)).toEqual(expect.arrayContaining(["card_use", "alert"]));
    expect(plan.activityTicker.join(" ")).toContain("구획");
    expect(scenario.state.office.placedItemIds.length).toBeGreaterThanOrEqual(8);
    expect(scenario.state.office.placedItemIds.every((itemId) => linkedDecorIds.has(itemId))).toBe(true);
    expect(scenario.state.ownedItems).toEqual(expect.arrayContaining(scenario.state.office.placedItemIds));
  });

  it("creates a v0.48 office focus scenario with direct rest and salary care candidates", () => {
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
    expect(getTutorialGuide({ ...scenario.state, seenTutorials: [] }, scenario.activeMenu)).toBeUndefined();
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

  it("creates an annual directive confirmation scenario after the first review choice", () => {
    const scenario = createQaScenario("annual-directed");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("지시 선택 완료");
    expect(scenario.state.month).toBe(12);
    expect(scenario.state.annualReviewHistory[0]).toMatchObject({
      reviewId: "year_1_local_demo_day",
      passed: true,
    });
    expect(scenario.state.pendingAnnualDirectiveChoices).toBeUndefined();
    expect(scenario.state.annualDirective?.title).toBe("신뢰 복리 프로그램");
    expect(scenario.state.seenTutorials).toEqual(
      expect.arrayContaining(["welcome_garage", "office_growth", "competition_pressure"]),
    );
    expect(scenario.state.timeline[0]).toContain("연간 지시 선택");
  });

  it("creates a year-two operating plan scenario after the annual directive starts paying monthly bonuses", () => {
    const scenario = createQaScenario("year-two-plan");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("2년차 운영");
    expect(scenario.state.month).toBe(13);
    expect(scenario.state.annualDirective?.title).toBe("신뢰 복리 프로그램");
    expect(scenario.state.pendingAnnualDirectiveChoices).toBeUndefined();
    expect(scenario.state.lastMonthReport?.strategyEffects?.trust).toBeGreaterThanOrEqual(1);
    expect(scenario.state.lastMonthReport?.strategyEffects?.cash).toBeGreaterThanOrEqual(220);
    expect(scenario.state.timeline[0]).toContain("2년차 운영 시작");
  });

  it("creates a year-two research recommendation scenario from the annual directive menu", () => {
    const scenario = createQaScenario("year-two-research");
    const advice = getAnnualStrategyAdvice(scenario.state);

    expect(scenario.activeMenu).toBe("research");
    expect(scenario.label).toContain("2년차 연구");
    expect(scenario.state.month).toBe(13);
    expect(scenario.state.annualDirective?.recommendedMenu).toBe("research");
    expect(advice?.capabilityRecommendations[0]?.name).toBeTruthy();
    expect(scenario.state.timeline[0]).toContain("2년차 연구 추천");
  });

  it("creates a year-two research completion scenario after the recommended research is executed", () => {
    const scenario = createQaScenario("year-two-research-complete");

    expect(scenario.activeMenu).toBe("research");
    expect(scenario.label).toContain("2년차 연구 완료");
    expect(scenario.state.month).toBe(13);
    expect(scenario.state.lastCapabilityUpgrade).toMatchObject({
      capabilityId: "enterprise",
      capabilityName: "엔터프라이즈",
      previousLevel: 0,
      nextLevel: 1,
      unlockedDomainId: "enterprise_automation",
      unlockedDomainName: "기업 자동화",
    });
    expect(scenario.state.unlockedDomains).toContain("enterprise_automation");
    expect(scenario.state.timeline[0]).toContain("2년차 연구 완료");
  });

  it("creates a year-two product candidate scenario from the completed research reward", () => {
    const scenario = createQaScenario("year-two-product-candidate");
    const enterpriseProduct = products.find((product) => product.id === "enterprise_workflow_agent");
    if (!enterpriseProduct) throw new Error("Missing enterprise workflow product fixture");
    const check = getProductProjectCheck(enterpriseProduct, scenario.state, []);

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.label).toContain("2년차 제품 후보");
    expect(scenario.state.month).toBe(13);
    expect(scenario.state.lastCapabilityUpgrade?.unlockedDomainId).toBe("enterprise_automation");
    expect(scenario.state.unlockedDomains).toContain("enterprise_automation");
    expect(scenario.state.capabilities.agent ?? 0).toBeLessThan(2);
    expect(check.reasons.join(" ")).toContain("에이전트 Lv.2 필요");
    expect(scenario.state.timeline[0]).toContain("2년차 제품 후보");
  });

  it("creates a year-two product ready scenario after the missing research is completed", () => {
    const scenario = createQaScenario("year-two-product-ready");
    const enterpriseProduct = products.find((product) => product.id === "enterprise_workflow_agent");
    if (!enterpriseProduct) throw new Error("Missing enterprise workflow product fixture");
    const availableAgentIds = scenario.state.hiredAgents.filter((agent) => !agent.assignment).slice(0, 3).map((agent) => agent.id);
    const check = getProductProjectCheck(enterpriseProduct, scenario.state, availableAgentIds);

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.label).toContain("2년차 제품 개발 준비");
    expect(scenario.state.month).toBe(13);
    expect(scenario.state.capabilities.enterprise ?? 0).toBeGreaterThanOrEqual(1);
    expect(scenario.state.capabilities.agent ?? 0).toBeGreaterThanOrEqual(2);
    expect(check.ok).toBe(true);
    expect(scenario.state.timeline[0]).toContain("2년차 제품 개발 준비");
  });

  it("creates a year-two product started scenario after the ready product is launched into development", () => {
    const scenario = createQaScenario("year-two-product-started");
    const project = scenario.state.productProjects.find((productProject) => productProject.productId === "enterprise_workflow_agent");

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.label).toContain("2년차 제품 개발 착수");
    expect(scenario.state.month).toBe(13);
    expect(project).toBeTruthy();
    expect(project?.progress).toBe(0);
    expect(project?.assignedAgentIds.length).toBeGreaterThan(0);
    expect(scenario.state.timeline[0]).toContain("2년차 제품 개발 착수");
  });

  it("creates a year-two product issue-result scenario after the started product resolves its first issue", () => {
    const scenario = createQaScenario("year-two-product-issue-result");
    const project = scenario.state.productProjects.find((productProject) => productProject.productId === "enterprise_workflow_agent");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("2년차 제품 이슈 결과");
    expect(project).toBeTruthy();
    expect(project?.progress).toBeGreaterThan(0);
    expect(scenario.state.lastDevelopmentPuzzle?.projectId).toBe(project?.id);
    expect(scenario.state.lastDevelopmentPuzzle?.progressGain).toBeGreaterThan(0);
    expect(scenario.state.timeline[0]).toContain("2년차 제품 이슈 결과");
  });

  it("creates a year-two product launch-impact scenario after the second-year product ships", () => {
    const scenario = createQaScenario("year-two-product-launch-impact");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("2년차 신제품 출시");
    expect(scenario.state.lastRelease).toMatchObject({
      productId: "enterprise_workflow_agent",
      productName: "기업 업무 에이전트",
    });
    expect(scenario.state.activeProducts).toContain("enterprise_workflow_agent");
    expect(scenario.state.productProjects.some((project) => project.productId === "enterprise_workflow_agent")).toBe(false);
    expect(scenario.state.roguelite.pendingCardReward?.productId).toBe("enterprise_workflow_agent");
    expect(scenario.state.timeline[0]).toContain("2년차 신제품 출시");
  });

  it("creates a complete alpha-run scenario for the guide payoff panel", () => {
    const scenario = createQaScenario("alpha-run-complete");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("30분 알파런");
    expect(scenario.state.productProjects.some((project) => project.productId === "enterprise_workflow_agent")).toBe(true);
    expect(getAlphaRunRoadmapProgress(scenario.state)).toBe(100);
    expect(getAlphaRunCompletionSummary(scenario.state)).toMatchObject({
      title: "30분 알파런 잠금",
      nextActionLabel: "다음 개발 이슈",
      nextMenu: "deck",
    });
    expect(scenario.state.timeline[0]).toContain("30분 알파런 완료");
  });

  it("creates alpha-run follow-through scenarios through issue resolution, second launch, and second reward", () => {
    const issueScenario = createQaScenario("alpha-run-issue-complete");
    const launchScenario = createQaScenario("alpha-run-second-launch");
    const rewardScenario = createQaScenario("alpha-run-second-reward-picked");

    expect(getAlphaRunCompletionSummary(issueScenario.state)).toMatchObject({
      nextActionId: "launch_product",
      nextActionLabel: "출시까지 진행",
    });
    expect(issueScenario.state.lastDevelopmentPuzzle?.productId).toBe("enterprise_workflow_agent");
    expect(issueScenario.state.productProjects.some((project) => project.productId === "enterprise_workflow_agent")).toBe(true);
    expect(issueScenario.state.timeline[0]).toContain("신제품 이슈 완료");

    expect(getAlphaRunCompletionSummary(launchScenario.state)).toMatchObject({
      nextActionId: "choose_reward",
      nextActionLabel: "두 번째 보상 고르기",
    });
    expect(launchScenario.state.activeProducts).toContain("enterprise_workflow_agent");
    expect(launchScenario.state.roguelite.pendingCardReward?.productId).toBe("enterprise_workflow_agent");
    expect(launchScenario.state.timeline[0]).toContain("두 번째 출시");

    expect(getAlphaRunCompletionSummary(rewardScenario.state)).toMatchObject({
      nextActionId: "view_release",
      nextActionLabel: "디브리프 보기",
      statusLabel: "두 번째 보상 선택 완료",
    });
    expect(getAlphaRunDebriefSummary(rewardScenario.state)).toMatchObject({
      title: "알파런 디브리프",
      statusLabel: "블라인드 테스트 직전 점검",
    });
    expect(getAlphaRunDebriefSummary(rewardScenario.state)?.highlights.map((highlight) => highlight.id)).toEqual([
      "products",
      "rewards",
      "year_two",
      "readiness",
    ]);
    expect(getAlphaRunDebriefSummary(rewardScenario.state)?.moments.map((moment) => moment.id)).toEqual([
      "first_release",
      "card_payoff",
      "annual_directive",
      "second_reward",
    ]);
    expect(rewardScenario.state.roguelite.pendingCardReward).toBeUndefined();
    expect(rewardScenario.state.roguelite.rewardHistory.some((reward) => reward.productId === "enterprise_workflow_agent")).toBe(true);
    expect(rewardScenario.state.timeline[0]).toContain("두 번째 보상 선택");
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

  it("creates a ten-year next-run scenario after ending carryover", () => {
    const scenario = createQaScenario("ten-year-next-run");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("10년 엔딩 다음 런");
    expect(scenario.state.month).toBe(1);
    expect(scenario.state.status).toBe("playing");
    expect(scenario.state.roguelite.runNumber).toBe(2);
    expect(scenario.state.roguelite.discoveredEndingIds).toContain("standard_platform_compounder");
    expect(scenario.state.roguelite.runHistory[0]).toMatchObject({
      endingId: "standard_platform_compounder",
      endingName: "표준 세계의 복리 플랫폼",
      survivedYears: 10,
    });
    expect(scenario.state.timeline[0]).toContain("표준 세계의 복리 플랫폼");
  });

  it("creates a ten-year ending-route quick-start scenario for browser QA", () => {
    const scenario = createQaScenario("ten-year-ending-route-start");
    const activeReplayBrief = getActiveEndingReplayBrief(scenario.state);

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("엔딩 목표 런");
    expect(scenario.state.month).toBe(1);
    expect(scenario.state.status).toBe("playing");
    expect(scenario.state.roguelite.runNumber).toBe(2);
    expect(scenario.state.roguelite.discoveredEndingIds).toContain("standard_platform_compounder");
    expect(scenario.state.runModifiers.seed).toMatch(/^ending:/);
    expect(scenario.state.runModifiers.seed).not.toBe("ending:standard_platform_compounder");
    expect(scenario.state.roguelite.runHistory[0]).toMatchObject({
      endingId: "standard_platform_compounder",
      endingName: "표준 세계의 복리 플랫폼",
      survivedYears: 10,
    });
    expect(activeReplayBrief?.seed).toBe(scenario.state.runModifiers.seed);
    expect(activeReplayBrief?.alreadyDiscovered).toBe(false);
    expect(scenario.state.timeline[0]).toContain("엔딩 목표 런 QA");
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
    expect(createQaScenarioFromSearch("?scenario=year-two-product-candidate")?.id).toBe("year-two-product-candidate");
    expect(createQaScenarioFromSearch("?scenario=year-two-product-ready")?.id).toBe("year-two-product-ready");
    expect(createQaScenarioFromSearch("?scenario=year-two-product-started")?.id).toBe("year-two-product-started");
    expect(createQaScenarioFromSearch("?scenario=year-two-product-issue-result")?.id).toBe("year-two-product-issue-result");
    expect(createQaScenarioFromSearch("?scenario=year-two-product-launch-impact")?.id).toBe("year-two-product-launch-impact");
    expect(createQaScenarioFromSearch("?scenario=alpha-run-complete")?.id).toBe("alpha-run-complete");
    expect(createQaScenarioFromSearch("?scenario=alpha-run-issue-complete")?.id).toBe("alpha-run-issue-complete");
    expect(createQaScenarioFromSearch("?scenario=alpha-run-second-launch")?.id).toBe("alpha-run-second-launch");
    expect(createQaScenarioFromSearch("?scenario=alpha-run-second-reward-picked")?.id).toBe("alpha-run-second-reward-picked");
    expect(createQaScenarioFromSearch("?scenario=reward-bias")?.id).toBe("reward-bias");
    expect(createQaScenarioFromSearch("?scenario=annual-strategy")?.id).toBe("annual-strategy");
    expect(createQaScenarioFromSearch("?scenario=ten-year-sim")?.id).toBe("ten-year-sim");
    expect(createQaScenarioFromSearch("?scenario=ten-year-next-run")?.id).toBe("ten-year-next-run");
    expect(createQaScenarioFromSearch("?scenario=ten-year-ending-route-start")?.id).toBe("ten-year-ending-route-start");
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
    expect(createQaScenarioFromSearch("?scenario=payoff-juice")?.id).toBe("payoff-juice");
    expect(createQaScenarioFromSearch("?scenario=collection")?.id).toBe("collection");
    expect(createQaScenarioFromSearch("?scenario=milestones")?.id).toBe("milestones");
    expect(createQaScenarioFromSearch("?scenario=difficulty-hard")?.id).toBe("difficulty-hard");
    expect(createQaScenarioFromSearch("?scenario=difficulty-reward")?.id).toBe("difficulty-reward");
    expect(createQaScenarioFromSearch("?scenario=world-events")?.id).toBe("world-events");
    expect(createQaScenarioFromSearch("?scenario=beta-readiness")?.id).toBe("beta-readiness");
    expect(createQaScenarioFromSearch("?scenario=beta-readiness-complete")?.id).toBe("beta-readiness-complete");
    expect(createQaScenarioFromSearch("?scenario=archetype-collection")?.id).toBe("archetype-collection");
    expect(createQaScenarioFromSearch("?scenario=ending-replay")?.id).toBe("ending-replay");
    expect(createQaScenarioFromSearch("?scenario=ending-replay-active")?.id).toBe("ending-replay-active");
    expect(createQaScenarioFromSearch("?scenario=ending-replay-known")?.id).toBe("ending-replay-known");
    expect(createQaScenarioFromSearch("?scenario=ending-replay-complete")?.id).toBe("ending-replay-complete");
    expect(createQaScenarioFromSearch("?scenario=ending-replay-known-final")?.id).toBe("ending-replay-known-final");
    expect(createQaScenarioFromSearch("?scenario=ending-san-francisco-final")?.id).toBe("ending-san-francisco-final");
    expect(createQaScenarioFromSearch("?scenario=ending-steady-operator-final")?.id).toBe("ending-steady-operator-final");
    expect(createQaScenarioFromSearch("?scenario=ending-fallback-final")?.id).toBe("ending-fallback-final");
    expect(createQaScenarioFromSearch("?scenario=ending-fallback-known-final")?.id).toBe("ending-fallback-known-final");
    expect(createQaScenarioFromSearch("?scenario=ending-nearmiss-final")?.id).toBe("ending-nearmiss-final");
    expect(createQaScenarioFromSearch("?scenario=ending-nearmiss-known-final")?.id).toBe("ending-nearmiss-known-final");
    expect(createQaScenarioFromSearch("?scenario=ending-nearmiss-retry-start")?.id).toBe("ending-nearmiss-retry-start");
    expect(createQaScenarioFromSearch("?qa=project")?.id).toBe("project");
    expect(createQaScenarioFromSearch("?scenario=unknown")).toBeUndefined();
  }, 20_000);

  it("builds an archetype collection scenario with previous and newly derived discoveries", () => {
    const scenario = createQaScenario("archetype-collection");
    const derivedIds = getDerivedArchetypes(scenario.state).map((rule) => rule.id);

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.label).toContain("아키타입 도감");
    expect(derivedIds).toEqual(["frontier_demo_loop", "frontier_garage", "oss_evangelist"]);
    expect(scenario.state.roguelite.discoveredArchetypeIds).toEqual(["frontier_garage", "frontier_demo_loop", "oss_evangelist"]);
    expect(scenario.state.timeline[0]).toContain("신규 아키타입");
  });

  it("builds a milestone payoff QA state with an unlocked achievement and near-miss annual review", () => {
    const scenario = createQaScenario("milestones");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.state.unlockedAchievements.length).toBeGreaterThan(0);
    expect(scenario.state.annualReviewHistory[0]).toMatchObject({
      reviewId: "year_1_local_demo_day",
      passed: true,
    });
  });

  it("creates a payoff collection scenario with revealed and hidden entries", () => {
    const scenario = createQaScenario("collection");
    const entries = getPayoffCollectionEntries(scenario.state);

    expect(scenario.activeMenu).toBe("products");
    expect(scenario.state.discoveredPayoffIds.length).toBeGreaterThan(0);
    expect(entries.some((entry) => entry.discovered)).toBe(true);
    expect(entries.some((entry) => !entry.discovered)).toBe(true);
  });

  it("builds an ending replay scenario with discovered endings and target plans", () => {
    const scenario = createQaScenario("ending-replay");

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("엔딩 목표");
    expect(scenario.state.roguelite.discoveredEndingIds).toEqual(
      expect.arrayContaining(["standard_platform_compounder", "privacy_trust_bastion"]),
    );
  });

  it("builds a beta readiness guide scenario from ending coverage summaries", () => {
    const scenario = createQaScenario("beta-readiness");
    const summary = getEndingCollectionSummary(scenario.state);
    const axisCoverage = getEndingAxisCoverageSummary();

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("베타 준비 체크");
    expect(summary.totalCount).toBe(campaignEndings.length);
    expect(summary.unlockHintCount).toBe(summary.unlockHintEligibleCount);
    expect(summary.unlockHintCoveragePercent).toBe(100);
    expect(axisCoverage.every((axis) => axis.complete)).toBe(true);
  });

  it("builds a complete beta readiness guide scenario with no remaining target ending", () => {
    const scenario = createQaScenario("beta-readiness-complete");
    const replayableEndingIds = campaignEndings.filter((ending) => ending.condition.fallback !== true).map((ending) => ending.id);
    const summary = getBetaReadinessSummary(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("베타 준비 완료");
    expect(scenario.state.roguelite.discoveredEndingIds).toEqual(expect.arrayContaining(replayableEndingIds));
    expect(summary.nextTargetLabel).toBe("모든 목표 엔딩 발견");
    expect(summary.lockedReplayableLabel).toBe("목표 엔딩 0개 남음");
  });

  it("builds an active ending replay target scenario for the company brief", () => {
    const scenario = createQaScenario("ending-replay-active");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("목표 엔딩");
    expect(scenario.state.runModifiers.seed).toBe("ending:privacy_trust_bastion");
    expect(scenario.state.runModifiers.worldLoreId).toBe("privacy_fortress");
    expect(scenario.state.runModifiers.marketConditionId).toBe("regulation_crackdown");
  });

  it("builds an already-discovered ending replay target scenario for repeat-run QA", () => {
    const scenario = createQaScenario("ending-replay-known");
    const brief = getActiveEndingReplayBrief(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("발견 완료");
    expect(scenario.state.runModifiers.seed).toBe("ending:privacy_trust_bastion");
    expect(scenario.state.roguelite.discoveredEndingIds).toEqual(
      expect.arrayContaining(["standard_platform_compounder", "privacy_trust_bastion"]),
    );
    expect(brief).toMatchObject({
      id: "privacy_trust_bastion",
      alreadyDiscovered: true,
      rewardProgressLabel: expect.stringContaining("발견 완료"),
      rewardStatusLabel: "도감 보상 수집 완료 · 추가 통찰 없음",
    });
  });

  it("builds a completed ending codex scenario without another target recommendation", () => {
    const scenario = createQaScenario("ending-replay-complete");
    const replayableEndingIds = campaignEndings.filter((ending) => ending.condition.fallback !== true).map((ending) => ending.id);
    const summary = getEndingCollectionSummary(scenario.state);

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("목표 엔딩 완료");
    expect(scenario.state.roguelite.discoveredEndingIds).toEqual(expect.arrayContaining(replayableEndingIds));
    expect(summary.nextReplayPlan).toBeUndefined();
    expect(summary.discoveredCount).toBeGreaterThanOrEqual(replayableEndingIds.length);
  });

  it("builds a final active ending replay scenario for the target result panel", () => {
    const scenario = createQaScenario("ending-replay-final");

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("목표 엔딩 결과");
    expect(scenario.state.month).toBe(120);
    expect(scenario.state.status).toBe("success");
    expect(scenario.state.runModifiers.seed).toBe("ending:privacy_trust_bastion");
  });

  it("builds a final known ending replay scenario for repeat reward copy", () => {
    const scenario = createQaScenario("ending-replay-known-final");
    const brief = getActiveEndingReplayBrief(scenario.state);
    const discovery = getCampaignEndingDiscovery(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("반복 목표 엔딩 결과");
    expect(scenario.state.month).toBe(120);
    expect(scenario.state.status).toBe("success");
    expect(scenario.state.runModifiers.seed).toBe("ending:privacy_trust_bastion");
    expect(scenario.state.roguelite.discoveredEndingIds).toEqual(
      expect.arrayContaining(["standard_platform_compounder", "privacy_trust_bastion"]),
    );
    expect(brief).toMatchObject({
      id: "privacy_trust_bastion",
      complete: true,
      alreadyDiscovered: true,
      completionRewardNotice: "이미 발견한 엔딩입니다. 도감 통찰은 추가되지 않지만 기록은 갱신됩니다.",
      rewardStatusLabel: "도감 보상 수집 완료 · 추가 통찰 없음",
    });
    expect(discovery).toMatchObject({
      id: "privacy_trust_bastion",
      alreadyDiscovered: true,
      rewardLabel: "+0 도감 통찰",
      rewardDeltaLabel: "+0 도감 통찰",
      rewardStatusLabel: "도감 보상 수집 완료 · 추가 통찰 없음",
      rewardDeltaDescription: "이미 획득한 도감 보상입니다.",
    });
  });

  it("builds a final San Francisco AI boom ending scenario for browser QA", () => {
    const scenario = createQaScenario("ending-san-francisco-final");
    const discovery = getCampaignEndingDiscovery(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("샌프란시스코");
    expect(scenario.state.month).toBe(120);
    expect(scenario.state.status).toBe("success");
    expect(scenario.state.runModifiers).toMatchObject({
      seed: "ending:san_francisco_ai_boom_launchpad",
      startCityId: "san_francisco",
      worldLoreId: "open_source_heaven",
      marketConditionId: "ai_boom",
      founderTraitId: "serial_founder",
    });
    expect(getCampaignEnding(scenario.state).id).toBe("san_francisco_ai_boom_launchpad");
    expect(discovery).toMatchObject({
      id: "san_francisco_ai_boom_launchpad",
      title: "샌프란시스코 AI 붐 런치패드",
      rewardLabel: "+4 통찰",
      rewardStatusLabel: "+4 통찰 신규 도감 보상",
    });
  });

  it("builds a final steady-market operator ending scenario for browser QA", () => {
    const scenario = createQaScenario("ending-steady-operator-final");
    const discovery = getCampaignEndingDiscovery(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("꾸준한 운영");
    expect(scenario.state.month).toBe(120);
    expect(scenario.state.status).toBe("success");
    expect(scenario.state.runModifiers).toMatchObject({
      seed: "ending:steady_operator_compounder",
      startCityId: "default_city",
      marketConditionId: "steady_market",
      founderTraitId: "operator_founder",
    });
    expect(getCampaignEnding(scenario.state).id).toBe("steady_operator_compounder");
    expect(discovery).toMatchObject({
      id: "steady_operator_compounder",
      title: "꾸준한 운영 복리 회사",
      rewardLabel: "+3 통찰",
      rewardStatusLabel: "+3 통찰 신규 도감 보상",
    });
  });

  it("builds a fallback final ending scenario for the result-only codex branch", () => {
    const scenario = createQaScenario("ending-fallback-final");
    const discovery = getCampaignEndingDiscovery(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("결과 전용");
    expect(scenario.state.month).toBe(120);
    expect(scenario.state.status).toBe("failure");
    expect(getCampaignEnding(scenario.state).id).toBe("garage_restart");
    expect(discovery).toMatchObject({
      id: "garage_restart",
      title: "다시 차고로",
      rewardLabel: "+0 도감 통찰",
      rewardDeltaLabel: "+0 도감 통찰",
      rewardStatusLabel: "결과 전용 기록",
      rewardDeltaDescription: "결과 전용 엔딩이 도감에 기록됩니다.",
      codexApplyLabel: "재시작하면 결과 기록으로 도감에 추가됩니다.",
    });
  });

  it("builds a repeated fallback final ending scenario for result-only record copy", () => {
    const scenario = createQaScenario("ending-fallback-known-final");
    const discovery = getCampaignEndingDiscovery(scenario.state);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("반복 결과 전용");
    expect(scenario.state.roguelite.discoveredEndingIds).toEqual(expect.arrayContaining(["garage_restart"]));
    expect(getCampaignEnding(scenario.state).id).toBe("garage_restart");
    expect(discovery).toMatchObject({
      id: "garage_restart",
      alreadyDiscovered: true,
      rewardDeltaLabel: "+0 도감 통찰",
      rewardStatusLabel: "결과 전용 기록 수집 완료 · 추가 통찰 없음",
      rewardDeltaDescription: "이미 기록한 결과 전용 엔딩입니다.",
      codexApplyLabel: "이미 도감에 있는 결과 기록입니다.",
    });
  });

  it("builds a final near-miss scenario for immediate ending rematch QA", () => {
    const scenario = createQaScenario("ending-nearmiss-final");
    const nearMisses = getEndingNearMisses(scenario.state, 3);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("아쉬운 엔딩");
    expect(scenario.state.month).toBe(120);
    expect(scenario.state.status).toBe("success");
    expect(nearMisses[0]).toMatchObject({
      id: "agi_safety_accord",
      title: "AGI 안전 협정",
      rewardLabel: "+5 통찰",
      replaySelection: {
        seed: "ending:agi_safety_accord",
        worldLoreId: "agi_overhang",
        marketConditionId: "regulation_crackdown",
      },
    });
    expect(nearMisses[0].missingLabels).toContain("신뢰");
  });

  it("builds a final discovered near-miss scenario for repeat reward QA", () => {
    const scenario = createQaScenario("ending-nearmiss-known-final");
    const nearMisses = getEndingNearMisses(scenario.state, 3);

    expect(scenario.activeMenu).toBe("company");
    expect(scenario.label).toContain("발견 완료 아쉬운 엔딩");
    expect(scenario.state.month).toBe(120);
    expect(scenario.state.status).toBe("success");
    expect(scenario.state.roguelite.discoveredEndingIds).toEqual(expect.arrayContaining(["agi_safety_accord"]));
    expect(nearMisses[0]).toMatchObject({
      id: "agi_safety_accord",
      discovered: true,
      rewardStatusLabel: "도감 보상 수집 완료 · 추가 통찰 없음",
    });
  });

  it("builds a near-miss retry-start scenario for browser QA", () => {
    const scenario = createQaScenario("ending-nearmiss-retry-start");
    const activeReplayBrief = getActiveEndingReplayBrief(scenario.state);

    expect(scenario.activeMenu).toBe("deck");
    expect(scenario.label).toContain("아쉬운 엔딩 목표 런");
    expect(scenario.state.month).toBe(1);
    expect(scenario.state.status).toBe("playing");
    expect(scenario.state.roguelite.runNumber).toBe(2);
    expect(scenario.state.runModifiers.seed).toBe("ending:agi_safety_accord");
    expect(scenario.state.roguelite.runHistory[0]).toMatchObject({
      endingName: expect.any(String),
      survivedYears: 10,
    });
    expect(activeReplayBrief?.id).toBe("agi_safety_accord");
    expect(activeReplayBrief?.seed).toBe(scenario.state.runModifiers.seed);
    expect(scenario.state.timeline[0]).toContain("아쉬운 엔딩 목표 런 QA");
  });

  it("allows QA URLs to override the active menu", () => {
    expect(createQaScenarioFromSearch("?scenario=annual-strategy&menu=products")?.activeMenu).toBe("products");
    expect(createQaScenarioFromSearch("?scenario=annual-strategy&menu=research")?.activeMenu).toBe("research");
    expect(createQaScenarioFromSearch("?scenario=annual-strategy&menu=competition")?.activeMenu).toBe("competition");
    expect(createQaScenarioFromSearch("?scenario=year-two-product-candidate&menu=research")?.activeMenu).toBe("research");
    expect(createQaScenarioFromSearch("?scenario=annual-strategy&menu=unknown")?.activeMenu).toBe("company");
  });
});
