import { describe, expect, it } from "vitest";
import { agentTypes, products } from "./data";
import { resetRunWithMetaUnlocks } from "./meta-progression";
import { advanceMonth, createInitialState, dismissTutorialGuide, hireAgent, hydrateGameState, serializeGameState, startProductProject } from "./simulation";
import { getTutorialGuide } from "./tutorial-guide";

describe("v0.30 helper character tutorial guide", () => {
  it("shows the helper once at the start and records dismissed tutorials in save state", () => {
    const initial = createInitialState();
    const guide = getTutorialGuide(initial, "company");

    expect(guide).toMatchObject({
      id: "welcome_garage",
      helperName: "미나",
      targetMenu: "agents",
    });

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
});
