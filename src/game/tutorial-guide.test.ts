import { describe, expect, it } from "vitest";
import { agentTypes, products } from "./data";
import { resetRunWithMetaUnlocks } from "./meta-progression";
import { advanceMonth, createInitialState, dismissTutorialGuide, hireAgent, hydrateGameState, serializeGameState, startProductProject } from "./simulation";
import { getTutorialGuide, tutorialGuideAuditRules } from "./tutorial-guide";
import { menus } from "../ui/menu";

describe("v0.30 helper character tutorial guide", () => {
  const expectedCoreLoopOrder = [
    "welcome_garage",
    "agent_hired",
    "development_project",
    "card_reward",
    "product_ideas",
    "next_run_setup",
    "office_growth",
    "competition_pressure",
  ];

  it("keeps the eight-step helper flow unique and pointed at valid menu ids", () => {
    const menuIds = new Set(menus.map((menu) => menu.id));
    const ruleIds = tutorialGuideAuditRules.map((rule) => rule.id);

    expect(ruleIds).toEqual(expectedCoreLoopOrder);
    expect(new Set(ruleIds).size).toBe(ruleIds.length);
    expect(tutorialGuideAuditRules).toHaveLength(8);
    expect(tutorialGuideAuditRules.every((rule) => menuIds.has(rule.targetMenu))).toBe(true);
    expect(tutorialGuideAuditRules.every((rule) => rule.title.trim() && rule.message.trim() && rule.actionLabel.trim())).toBe(true);
  });

  it("shows the helper once at the start and records dismissed tutorials in save state", () => {
    const initial = createInitialState();
    const guide = getTutorialGuide(initial, "company");

    expect(guide).toMatchObject({
      id: "welcome_garage",
      helperName: "미나",
      targetMenu: "agents",
    });
    expect(guide?.title).toContain("AI 회사");
    expect(guide?.message).toContain("사람과 AI 에이전트");
    expect(guide?.message).toContain("첫 제품 출시");

    const dismissed = dismissTutorialGuide(guide!.id, initial);

    expect(dismissed.seenTutorials).toContain("welcome_garage");
    expect(getTutorialGuide(dismissed, "company")?.id).not.toBe("welcome_garage");
  });

  it("introduces newly available systems when the player first reaches them", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing tutorial fixture");

    const welcomed = {
      ...createInitialState(),
      seenTutorials: ["welcome_garage", "agent_hired", "product_ideas"],
    };
    const staffed = hireAgent(architect, welcomed);
    const started = startProductProject(writingProduct, staffed, [staffed.hiredAgents[0].id]);

    expect(getTutorialGuide(started, "deck")).toMatchObject({
      id: "development_project",
      targetMenu: "deck",
    });

    const released = advanceMonth(advanceMonth({
      ...started,
      seenTutorials: [...started.seenTutorials, "development_project"],
    }));

    expect(getTutorialGuide(released, "deck")).toMatchObject({
      id: "card_reward",
      targetMenu: "deck",
    });
  });

  it("points a hired first teammate to the product menu starter project card", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    if (!architect) throw new Error("Missing prompt architect");

    const staffed = hireAgent(architect, {
      ...createInitialState(),
      seenTutorials: ["welcome_garage"],
    });
    const guide = getTutorialGuide(staffed, "agents");

    expect(guide).toMatchObject({
      id: "agent_hired",
      targetMenu: "products",
      actionLabel: "첫 제품 개발",
    });
    expect(guide?.message).toContain("제품 메뉴 상단");
    expect(guide?.message).toContain("추천 첫 제품");
  });

  it("does not interrupt the starter project card with the idea composer tutorial before the first project starts", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    if (!architect) throw new Error("Missing prompt architect");

    const staffed = hireAgent(architect, {
      ...createInitialState(),
      seenTutorials: ["welcome_garage", "agent_hired"],
    });

    expect(getTutorialGuide(staffed, "products")).toBeUndefined();
  });

  it("keeps dismissed helper guides through save restore and next-run reset", () => {
    const dismissed = dismissTutorialGuide("welcome_garage", createInitialState());
    const restored = hydrateGameState(serializeGameState(dismissed));
    const nextRun = resetRunWithMetaUnlocks(restored);

    expect(restored.seenTutorials).toContain("welcome_garage");
    expect(nextRun.seenTutorials).toContain("welcome_garage");
    expect(getTutorialGuide(nextRun, "company")?.id).not.toBe("welcome_garage");
  });

  it("introduces the next-run setup room when a run reaches its restart window", () => {
    const restartReady = {
      ...createInitialState(),
      month: 10,
      activeProducts: ["ai_writing_assistant"],
      seenTutorials: ["welcome_garage"],
    };

    expect(getTutorialGuide(restartReady, "deck")).toMatchObject({
      id: "next_run_setup",
      targetMenu: "deck",
    });
  });

  it("keeps every helper rule reachable without preempting the first build-launch-reward loop", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing tutorial fixture");

    const initial = createInitialState();
    expect(getTutorialGuide(initial, "company")?.id).toBe("welcome_garage");

    const staffed = hireAgent(architect, {
      ...initial,
      seenTutorials: ["welcome_garage"],
    });
    expect(getTutorialGuide(staffed, "agents")?.id).toBe("agent_hired");

    const started = startProductProject(writingProduct, {
      ...staffed,
      seenTutorials: ["welcome_garage", "agent_hired"],
    }, [staffed.hiredAgents[0].id]);
    expect(getTutorialGuide(started, "deck")?.id).toBe("development_project");

    const released = advanceMonth(advanceMonth({
      ...started,
      seenTutorials: ["welcome_garage", "agent_hired", "development_project"],
    }));
    expect(getTutorialGuide(released, "deck")?.id).toBe("card_reward");

    const postRewardComposer = {
      ...released,
      seenTutorials: ["welcome_garage", "agent_hired", "development_project", "card_reward"],
      roguelite: { ...released.roguelite, pendingCardReward: undefined },
    };
    expect(getTutorialGuide(postRewardComposer, "products")?.id).toBe("product_ideas");

    const restartReady = {
      ...postRewardComposer,
      month: 10,
      seenTutorials: ["welcome_garage", "agent_hired", "development_project", "card_reward", "product_ideas"],
    };
    expect(getTutorialGuide(restartReady, "deck")?.id).toBe("next_run_setup");

    const officeReady = {
      ...restartReady,
      seenTutorials: [...restartReady.seenTutorials, "next_run_setup"],
      resources: { ...restartReady.resources, cash: 10000 },
    };
    expect(getTutorialGuide(officeReady, "shop")?.id).toBe("office_growth");

    const competitionReady = {
      ...officeReady,
      seenTutorials: [...officeReady.seenTutorials, "office_growth"],
      competitorStates: officeReady.competitorStates.map((competitor, index) =>
        index === 0
          ? { ...competitor, claimedProducts: ["ai_writing_assistant"], marketShare: Math.max(competitor.marketShare, 18) }
          : competitor,
      ),
    };
    expect(getTutorialGuide(competitionReady, "competition")?.id).toBe("competition_pressure");
  });
});
