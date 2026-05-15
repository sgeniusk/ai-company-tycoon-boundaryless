import { describe, expect, it } from "vitest";
import { agentTypes, products, strategyCards } from "./data";
import {
  chooseCardReward,
  drawStrategyCards,
  getCardRewardChoiceCheck,
  getDeckEditCheck,
  getStrategyCardEffects,
  getStrategyCardPlayCheck,
  playStrategyCard,
  removeStrategyCardFromDeck,
  upgradeStrategyCard,
} from "./deckbuilding";
import {
  createDevelopmentPuzzle,
  getDevelopmentPuzzleResolveCheck,
  getDevelopmentPuzzleSelectionLimit,
  resolveDevelopmentPuzzle,
} from "./development-puzzle";
import { getMetaUnlockCheck, getRunInsightReward, resetRunWithMetaUnlocks } from "./meta-progression";
import { advanceMonth, createInitialState, hireAgent, startProductProject } from "./simulation";

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

  it("lets cards modify the next development puzzle before it is solved", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    const interviewCard = strategyCards.find((card) => card.id === "customer_interviews");
    if (!architect || !writingProduct || !interviewCard) throw new Error("Missing puzzle modifier fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const projectId = started.productProjects[0].id;
    const basePuzzle = createDevelopmentPuzzle(projectId, started);
    const baseUxTile = basePuzzle.tiles.find((tile) => tile.challenge === "ux");
    if (!baseUxTile) throw new Error("Missing base UX tile");

    const prepared = playStrategyCard(interviewCard, started);
    const boostedPuzzle = createDevelopmentPuzzle(projectId, prepared);
    const boostedUxTile = boostedPuzzle.tiles.find((tile) => tile.challenge === "ux");
    if (!boostedUxTile) throw new Error("Missing boosted UX tile");

    expect(prepared.activeDevelopmentPuzzleModifiers).toHaveLength(1);
    expect(boostedUxTile.difficulty).toBeLessThan(baseUxTile.difficulty);

    const selectedTileIds = boostedPuzzle.tiles.slice(0, 4).map((tile) => tile.id);
    const resolved = resolveDevelopmentPuzzle(projectId, selectedTileIds, prepared);

    expect(resolved.lastDevelopmentPuzzle?.appliedModifierLabels).toContain("고객 인터뷰");
    expect(resolved.lastDevelopmentPuzzle?.score).toBeGreaterThan(0);
    expect(resolved.activeDevelopmentPuzzleModifiers).toHaveLength(0);
  });

  it("enforces direct puzzle selection limits unless a card expands the solve budget", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    const gpuCard = strategyCards.find((card) => card.id === "gpu_burst");
    if (!architect || !writingProduct || !gpuCard) throw new Error("Missing puzzle limit fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const projectId = started.productProjects[0].id;
    const puzzle = createDevelopmentPuzzle(projectId, started);
    const fiveTiles = puzzle.tiles.slice(0, 5).map((tile) => tile.id);

    expect(getDevelopmentPuzzleSelectionLimit(started)).toBe(4);
    expect(getDevelopmentPuzzleResolveCheck(projectId, fiveTiles, started).ok).toBe(false);

    const expanded = playStrategyCard(gpuCard, started);

    expect(getDevelopmentPuzzleSelectionLimit(expanded)).toBe(5);
    expect(getDevelopmentPuzzleResolveCheck(projectId, fiveTiles, expanded).ok).toBe(true);
  });

  it("creates a three-card reward after release and adds the chosen card to discard", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing card reward fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    const reward = released.roguelite.pendingCardReward;
    if (!reward) throw new Error("Missing pending card reward");

    expect(reward.offeredCardIds).toHaveLength(3);
    expect(new Set(reward.offeredCardIds).size).toBe(3);
    expect(released.roguelite.deckEditTokens).toBe(1);
    expect(getCardRewardChoiceCheck(reward.offeredCardIds[0], released).ok).toBe(true);

    const chosen = chooseCardReward(reward.offeredCardIds[0], released);

    expect(chosen.roguelite.pendingCardReward).toBeUndefined();
    expect(chosen.roguelite.deck.discardPile).toContain(reward.offeredCardIds[0]);
    expect(chosen.roguelite.rewardHistory[0]).toMatchObject({
      productId: "ai_writing_assistant",
      chosenCardId: reward.offeredCardIds[0],
    });
  });

  it("uses deck edit tokens to remove exactly one non-last card copy", () => {
    const state = {
      ...createInitialState(),
      roguelite: {
        ...createInitialState().roguelite,
        deckEditTokens: 1,
        deck: {
          drawPile: ["prompt_sprint", "gpu_burst"],
          hand: ["prompt_sprint", "customer_interviews"],
          discardPile: ["safety_review"],
          playedThisTurn: [],
        },
      },
    };

    expect(getDeckEditCheck("remove", "prompt_sprint", state).ok).toBe(true);

    const removed = removeStrategyCardFromDeck("prompt_sprint", state);

    expect(removed.roguelite.deckEditTokens).toBe(0);
    expect(removed.roguelite.deck.hand).toEqual(["customer_interviews"]);
    expect(removed.roguelite.deck.drawPile).toContain("prompt_sprint");
    expect(removeStrategyCardFromDeck("gpu_burst", removed)).toBe(removed);
  });

  it("upgrades a card once and boosts positive effects when played", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    const sprintCard = strategyCards.find((card) => card.id === "prompt_sprint");
    if (!architect || !writingProduct || !sprintCard) throw new Error("Missing card upgrade fixture");

    const state = {
      ...startProductProject(writingProduct, hireAgent(architect, createInitialState())),
      roguelite: {
        ...createInitialState().roguelite,
        deckEditTokens: 1,
        deck: {
          drawPile: [],
          hand: ["prompt_sprint"],
          discardPile: [],
          playedThisTurn: [],
        },
      },
    };
    const baseEffects = getStrategyCardEffects(sprintCard, state);
    const upgraded = upgradeStrategyCard("prompt_sprint", state);
    const upgradedEffects = getStrategyCardEffects(sprintCard, upgraded);

    expect(upgraded.roguelite.deckEditTokens).toBe(0);
    expect(upgraded.roguelite.upgradedCardIds).toContain("prompt_sprint");
    expect(upgradedEffects.project_progress).toBeGreaterThan(baseEffects.project_progress);
    expect(upgradedEffects.project_quality).toBeGreaterThan(baseEffects.project_quality);

    const played = playStrategyCard(sprintCard, upgraded);

    expect(played.productProjects[0].progress).toBeGreaterThan(state.productProjects[0].progress + baseEffects.project_progress);
  });
});
