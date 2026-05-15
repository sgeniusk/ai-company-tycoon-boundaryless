import { describe, expect, it } from "vitest";
import { agentTypes, products, strategyCards } from "./data";
import { drawStrategyCards, getStrategyCardPlayCheck, playStrategyCard } from "./deckbuilding";
import { createDevelopmentPuzzle, resolveDevelopmentPuzzle } from "./development-puzzle";
import { getMetaUnlockCheck, getRunInsightReward, resetRunWithMetaUnlocks } from "./meta-progression";
import { createInitialState, hireAgent, startProductProject } from "./simulation";

describe("v0.12 roguelite deckbuilding foundation", () => {
  it("starts each run with a deterministic starter deck and opening hand", () => {
    const state = createInitialState();

    expect(strategyCards.length).toBeGreaterThanOrEqual(6);
    expect(state.roguelite.runNumber).toBe(1);
    expect(state.roguelite.deck.hand).toHaveLength(4);
    expect(state.roguelite.deck.hand).toEqual(["prompt_sprint", "gpu_burst", "customer_interviews", "safety_review"]);
    expect(state.roguelite.deck.drawPile.length).toBeGreaterThan(0);
  });

  it("plays a strategy card into an active product project", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    const sprintCard = strategyCards.find((card) => card.id === "prompt_sprint");
    if (!architect || !writingProduct || !sprintCard) throw new Error("Missing deckbuilding fixture");

    const staffed = hireAgent(architect, createInitialState());
    const started = startProductProject(writingProduct, staffed);
    const beforeProject = started.productProjects[0];

    expect(getStrategyCardPlayCheck(sprintCard, started).ok).toBe(true);

    const played = playStrategyCard(sprintCard, started);
    const afterProject = played.productProjects[0];

    expect(played.roguelite.deck.hand).not.toContain("prompt_sprint");
    expect(played.roguelite.deck.discardPile).toContain("prompt_sprint");
    expect(afterProject.progress).toBeGreaterThan(beforeProject.progress);
    expect(afterProject.quality).toBeGreaterThan(beforeProject.quality);
    expect(played.timeline[0]).toContain("카드 사용");
  });

  it("draws through the discard pile without duplicating played card ids", () => {
    const state = createInitialState();
    const emptied = {
      ...state,
      roguelite: {
        ...state.roguelite,
        deck: {
          drawPile: [],
          hand: ["prompt_sprint"],
          discardPile: ["gpu_burst", "safety_review"],
          playedThisTurn: [],
        },
      },
    };

    const drawn = drawStrategyCards(2, emptied);

    expect(drawn.roguelite.deck.hand).toEqual(["prompt_sprint", "gpu_burst", "safety_review"]);
    expect(new Set(drawn.roguelite.deck.hand).size).toBe(drawn.roguelite.deck.hand.length);
  });

  it("converts a completed or failed run into founder insight and meta unlocks", () => {
    const finished = {
      ...createInitialState(),
      month: 8,
      activeProducts: ["ai_writing_assistant", "meeting_summary_bot"],
      resources: {
        ...createInitialState().resources,
        cash: -3200,
        users: 2500,
        trust: 42,
      },
      status: "failure" as const,
    };

    const reward = getRunInsightReward(finished);
    expect(reward).toBeGreaterThanOrEqual(4);
    expect(getMetaUnlockCheck("eval_harness", finished, reward).ok).toBe(true);

    const nextRun = resetRunWithMetaUnlocks(finished, ["eval_harness"]);

    expect(nextRun.month).toBe(1);
    expect(nextRun.status).toBe("playing");
    expect(nextRun.roguelite.runNumber).toBe(2);
    expect(nextRun.roguelite.founderInsight).toBeGreaterThanOrEqual(1);
    expect(nextRun.roguelite.unlockedMetaIds).toContain("eval_harness");
    expect([...nextRun.roguelite.deck.hand, ...nextRun.roguelite.deck.drawPile]).toContain("redteam_drill");
  });

  it("resolves a compact development puzzle into project score, progress, and quality", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const curator = agentTypes.find((agent) => agent.id === "data_curator");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !curator || !writingProduct) throw new Error("Missing puzzle fixture");

    const staffed = hireAgent(curator, hireAgent(architect, createInitialState()));
    const started = startProductProject(writingProduct, staffed);
    const projectId = started.productProjects[0].id;
    const puzzle = createDevelopmentPuzzle(projectId, started);

    expect(puzzle.tiles).toHaveLength(9);
    expect(puzzle.tiles.map((tile) => tile.challenge)).toContain("ux");

    const resolved = resolveDevelopmentPuzzle(
      projectId,
      puzzle.tiles.slice(0, 4).map((tile) => tile.id),
      started,
    );

    expect(resolved.lastDevelopmentPuzzle?.score).toBeGreaterThan(0);
    expect(resolved.productProjects[0].progress).toBeGreaterThan(started.productProjects[0].progress);
    expect(resolved.productProjects[0].quality).toBeGreaterThan(started.productProjects[0].quality);
    expect(resolved.timeline[0]).toContain("개발 퍼즐");
  });
});
