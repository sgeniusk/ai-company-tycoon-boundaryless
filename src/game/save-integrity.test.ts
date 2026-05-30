import { describe, expect, it } from "vitest";
import { products } from "./data";
import { calculateOfflineSettlement } from "./offline";
import { createInitialState, hydrateGameState, serializeGameState } from "./simulation";
import { validateGameStateIntegrity } from "./state-integrity";
import type { GameState } from "./types";

function createFullLateGameState(): GameState {
  const initialState = createInitialState();
  const activeProducts = [
    "foundation_model_v0",
    "ai_writing_assistant",
    "frontier_reasoning_model",
    "adaptive_factory_control_os",
    "autonomous_fulfillment_router",
    "data_center_load_balancer",
    "smart_grid_demand_orchestrator",
  ];
  const missingProducts = activeProducts.filter((productId) => !products.some((product) => product.id === productId));
  if (missingProducts.length) throw new Error(`Missing late-game product fixtures: ${missingProducts.join(", ")}`);

  return {
    ...initialState,
    month: 96,
    resources: {
      ...initialState.resources,
      cash: 240000,
      users: 125000,
      compute: 1800,
      data: 2600,
      talent: 24,
      trust: 91,
      hype: 42,
      automation: 72,
    },
    capabilities: {
      ...initialState.capabilities,
      language: 4,
      code: 4,
      vision: 3,
      agent: 3,
      enterprise: 2,
      optimization: 3,
      robotics: 3,
      manufacturing: 3,
      logistics: 2,
    },
    activeProducts,
    unlockedDomains: [
      "foundation_models",
      "personal_productivity",
      "developer_tools",
      "enterprise_automation",
      "semiconductors",
      "robotics",
      "manufacturing",
      "logistics",
      "energy",
    ],
    productLevels: {
      foundation_model_v0: 4,
      ai_writing_assistant: 3,
      frontier_reasoning_model: 3,
      adaptive_factory_control_os: 3,
      autonomous_fulfillment_router: 2,
      data_center_load_balancer: 2,
      smart_grid_demand_orchestrator: 1,
    },
    competitorStates: [
      ...initialState.competitorStates.map((competitor, index) => ({
        ...competitor,
        score: competitor.score + 40 + index,
        marketShare: Math.max(4, competitor.marketShare - 1),
        momentum: index % 2 === 0 ? 3 : -1,
        claimedProducts: index === 0 ? ["ai_writing_assistant", "customer_support_chatbot"] : competitor.claimedProducts,
        researchLevel: competitor.researchLevel + 2,
        lastMove: index === 0 ? "시장 방어선 강화" : competitor.lastMove,
      })),
      {
        id: "competitor_autonova_motors",
        score: 132,
        marketShare: 12,
        momentum: 5,
        claimedProducts: ["autonomous_vehicle_stack", "warehouse_robot_fleet"],
        researchLevel: 4,
        lastMove: "자율주행-로봇 통합 압박",
      },
      {
        id: "competitor_ironoracle",
        score: 168,
        marketShare: 16,
        momentum: 7,
        claimedProducts: ["ai_training_chip", "neuromorphic_edge_chip"],
        researchLevel: 5,
        lastMove: "칩-로봇 공급망 압박",
      },
    ],
    marketShareHistory: [
      { month: 72, player: 22, topRivalShare: 24, topRivalId: "competitor_chipspark" },
      { month: 84, player: 29, topRivalShare: 21, topRivalId: "competitor_autonova_motors" },
      { month: 96, player: 35, topRivalShare: 18, topRivalId: "competitor_ironoracle" },
    ],
    pendingChallengerEntryIds: ["competitor_toycloud", "competitor_ironoracle"],
    discoveredPayoffIds: [
      "combo:full_stack_physical_empire",
      "combo:grid_scale_ai_ops",
      "synergy:robotics_manufacturing_cell",
      "synergy:factory_energy_loop",
    ],
    annualReviewHistory: [
      {
        reviewId: "year_6_robotics_showcase",
        year: 6,
        month: 72,
        passed: true,
        score: 88,
        title: "로봇공학 쇼케이스",
        summary: "로봇 랩과 자동화 운영이 공개 심사를 통과했습니다.",
        reward: { cash: 34000, compute: 120, automation: 8 },
      },
      {
        reviewId: "year_7_industry_expansion_fair",
        year: 7,
        month: 84,
        passed: true,
        score: 91,
        title: "산업 확장 박람회",
        summary: "제조, 물류, 에너지 확장성이 검증됐습니다.",
        reward: { cash: 46000, hype: 10, talent: 2 },
      },
    ],
    roguelite: {
      ...initialState.roguelite,
      runNumber: 3,
      founderInsight: 11,
      unlockedMetaIds: ["robotics_seed_memory", "boundaryless_brand_memory"],
      starterDeckId: "hardware_seed",
      deck: {
        hand: ["robot_lab_shift", "compute_arbitrage", "chip_supply_bet", "gpu_burst"],
        drawPile: ["open_source_push", "safety_review"],
        discardPile: ["rival_benchmark_room"],
        playedThisTurn: ["prompt_sprint"],
      },
      deckEditTokens: 2,
      upgradedCardIds: ["gpu_burst"],
      rewardHistory: [
        {
          rewardId: "factory-reward-72",
          productId: "adaptive_factory_control_os",
          chosenCardId: "market_repositioning",
          month: 72,
        },
      ],
      runHistory: [
        {
          id: "run-2",
          runNumber: 2,
          endedMonth: 66,
          status: "success",
          score: 83,
          insightReward: 5,
          note: "로봇 확장 전환점을 확인했습니다.",
        },
      ],
      pendingCardReward: {
        id: "reward-energy-96",
        productId: "smart_grid_demand_orchestrator",
        productName: "스마트 그리드 수요 오케스트레이터",
        month: 96,
        reviewGrade: "A",
        offeredCardIds: ["interoperability_shield", "market_repositioning", "redteam_drill"],
      },
    },
  };
}

describe("v0.11 save integrity and recovery", () => {
  it("recovers to a playable initial state when saved JSON is corrupt", () => {
    const recovered = hydrateGameState("{bad json");

    expect(recovered.status).toBe("playing");
    expect(recovered.month).toBe(createInitialState().month);
    expect(recovered.timeline[0]).toContain("저장 데이터 복구 실패");
  });

  it("sanitizes non-numeric resource values during hydration", () => {
    const corrupted = JSON.stringify({
      version: 2,
      state: {
        ...createInitialState(),
        resources: {
          ...createInitialState().resources,
          cash: null,
          users: "many",
        },
      },
    });
    const hydrated = hydrateGameState(corrupted);

    expect(hydrated.resources.cash).toBe(createInitialState().resources.cash);
    expect(hydrated.resources.users).toBe(createInitialState().resources.users);
    expect(validateGameStateIntegrity(hydrated).issues).toEqual([]);
  });

  it("reports integrity issues for malformed runtime state snapshots", () => {
    const report = validateGameStateIntegrity({
      ...createInitialState(),
      activeProducts: ["missing_product"],
      resources: {
        ...createInitialState().resources,
        cash: Number.NaN,
      },
      roguelite: {
        ...createInitialState().roguelite,
        unlockedMetaIds: ["unknown_meta_unlock"],
      },
    });

    expect(report.ok).toBe(false);
    expect(report.issues.some((issue) => issue.includes("cash"))).toBe(true);
    expect(report.issues.some((issue) => issue.includes("missing_product"))).toBe(true);
    expect(report.issues.some((issue) => issue.includes("unknown_meta_unlock"))).toBe(true);
  });

  it("keeps valid saves free of integrity issues", () => {
    const hydrated = hydrateGameState(serializeGameState(createInitialState()));

    expect(validateGameStateIntegrity(hydrated)).toMatchObject({ ok: true, issues: [] });
  });

  it("round-trips a populated v0.58-v0.60 late-game save and supports offline settlement", () => {
    const state = createFullLateGameState();
    const hydrated = hydrateGameState(serializeGameState(state, new Date("2026-05-01T00:00:00.000Z")));

    expect(hydrated.month).toBe(96);
    expect(hydrated.resources.users).toBe(125000);
    expect(hydrated.capabilities.manufacturing).toBe(3);
    expect(hydrated.capabilities.logistics).toBe(2);
    expect(hydrated.unlockedDomains).toEqual(expect.arrayContaining(["manufacturing", "logistics", "energy"]));
    expect(hydrated.activeProducts).toEqual(
      expect.arrayContaining(["adaptive_factory_control_os", "autonomous_fulfillment_router", "data_center_load_balancer"]),
    );
    expect(hydrated.productLevels).toMatchObject({
      adaptive_factory_control_os: 3,
      autonomous_fulfillment_router: 2,
      data_center_load_balancer: 2,
      smart_grid_demand_orchestrator: 1,
    });
    expect(hydrated.marketShareHistory).toHaveLength(3);
    expect(hydrated.marketShareHistory[2]).toMatchObject({
      month: 96,
      player: 35,
      topRivalShare: 18,
      topRivalId: "competitor_ironoracle",
    });
    expect(hydrated.pendingChallengerEntryIds).toEqual(["competitor_toycloud", "competitor_ironoracle"]);
    expect(hydrated.discoveredPayoffIds).toEqual([
      "combo:full_stack_physical_empire",
      "combo:grid_scale_ai_ops",
      "synergy:robotics_manufacturing_cell",
      "synergy:factory_energy_loop",
    ]);
    expect(hydrated.annualReviewHistory.map((entry) => entry.reviewId)).toEqual([
      "year_6_robotics_showcase",
      "year_7_industry_expansion_fair",
    ]);
    expect(hydrated.roguelite).toMatchObject({
      runNumber: 3,
      founderInsight: 11,
      starterDeckId: "hardware_seed",
      deckEditTokens: 2,
    });
    expect(validateGameStateIntegrity(hydrated)).toMatchObject({ ok: true, issues: [] });

    const settlement = calculateOfflineSettlement(
      hydrated,
      new Date("2026-05-01T00:00:00.000Z"),
      new Date("2026-05-05T00:00:00.000Z"),
    );
    expect(settlement.gameDays).toBe(4);
    expect(Number.isFinite(settlement.delta.cash ?? 0)).toBe(true);
  });

  it("hydrates legacy saves that are missing v0.58-v0.60 fields with safe defaults", () => {
    const legacyState: Record<string, unknown> = {
      ...createInitialState(),
      month: 30,
      status: "playing",
    };
    legacyState.capabilities = { ...(legacyState.capabilities as Record<string, unknown>) };
    delete legacyState.marketShareHistory;
    delete legacyState.pendingChallengerEntryIds;
    delete (legacyState.capabilities as Record<string, unknown>).manufacturing;
    delete (legacyState.capabilities as Record<string, unknown>).logistics;

    const hydrated = hydrateGameState(JSON.stringify({ version: 8, state: legacyState }));

    expect(hydrated.status).toBe("playing");
    expect(hydrated.timeline[0]).not.toContain("저장 데이터 복구 실패");
    expect(hydrated.marketShareHistory).toEqual([]);
    expect(hydrated.pendingChallengerEntryIds).toEqual([]);
    expect(hydrated.capabilities.manufacturing).toBe(0);
    expect(hydrated.capabilities.logistics).toBe(0);
    expect(validateGameStateIntegrity(hydrated)).toMatchObject({ ok: true, issues: [] });
  });

  it("round-trips discoveredPayoffIds and migrates old saves without the field to an empty list", () => {
    const discoveredState: GameState = {
      ...createInitialState(),
      discoveredPayoffIds: ["combo:full_stack_physical_empire", "synergy:robotics_manufacturing_cell"],
    };
    const hydrated = hydrateGameState(serializeGameState(discoveredState));

    expect(hydrated.discoveredPayoffIds).toEqual([
      "combo:full_stack_physical_empire",
      "synergy:robotics_manufacturing_cell",
    ]);

    const legacyState: Partial<GameState> = { ...createInitialState() };
    delete legacyState.discoveredPayoffIds;
    const migrated = hydrateGameState(JSON.stringify({ version: 11, state: legacyState }));

    expect(migrated.discoveredPayoffIds).toEqual([]);
    expect(validateGameStateIntegrity(migrated)).toMatchObject({ ok: true, issues: [] });
  });

  it("round-trips roguelite discoveredArchetypeIds and migrates old roguelite saves to an empty list", () => {
    const discoveredState: GameState = {
      ...createInitialState(),
      roguelite: {
        ...createInitialState().roguelite,
        discoveredArchetypeIds: ["frontier_garage", "oss_evangelist"],
      },
    };
    const hydrated = hydrateGameState(serializeGameState(discoveredState));

    expect(hydrated.roguelite.discoveredArchetypeIds).toEqual(["frontier_garage", "oss_evangelist"]);

    const legacyState: Partial<GameState> = {
      ...createInitialState(),
      roguelite: { ...createInitialState().roguelite },
    };
    delete (legacyState.roguelite as Partial<GameState["roguelite"]>).discoveredArchetypeIds;
    const migrated = hydrateGameState(JSON.stringify({ version: 11, state: legacyState }));

    expect(migrated.roguelite.discoveredArchetypeIds).toEqual([]);
    expect(validateGameStateIntegrity(migrated)).toMatchObject({ ok: true, issues: [] });
  });

  it("round-trips roguelite discoveredEndingIds and migrates old roguelite saves to an empty list", () => {
    const discoveredState: GameState = {
      ...createInitialState(),
      roguelite: {
        ...createInitialState().roguelite,
        discoveredEndingIds: ["standard_platform_compounder", "privacy_trust_bastion"],
      },
    };
    const hydrated = hydrateGameState(serializeGameState(discoveredState));

    expect(hydrated.roguelite.discoveredEndingIds).toEqual(["standard_platform_compounder", "privacy_trust_bastion"]);

    const legacyState: Partial<GameState> = {
      ...createInitialState(),
      roguelite: { ...createInitialState().roguelite },
    };
    delete (legacyState.roguelite as Partial<GameState["roguelite"]>).discoveredEndingIds;
    const migrated = hydrateGameState(JSON.stringify({ version: 11, state: legacyState }));

    expect(migrated.roguelite.discoveredEndingIds).toEqual([]);
    expect(validateGameStateIntegrity(migrated)).toMatchObject({ ok: true, issues: [] });
  });

  it("drops unknown roguelite meta unlock ids during hydration", () => {
    const state = createInitialState();
    const hydrated = hydrateGameState(
      JSON.stringify({
        version: 11,
        state: {
          ...state,
          roguelite: {
            ...state.roguelite,
            unlockedMetaIds: ["eval_harness", "unknown_meta_unlock", "eval_harness"],
          },
        },
      }),
    );

    expect(hydrated.roguelite.unlockedMetaIds).toEqual(["eval_harness"]);
    expect(validateGameStateIntegrity(hydrated)).toMatchObject({ ok: true, issues: [] });
  });

  it("sanitizes malformed physical capability levels during hydration", () => {
    const state = createInitialState();
    const hydrated = hydrateGameState(
      JSON.stringify({
        version: 11,
        state: {
          ...state,
          capabilities: {
            ...state.capabilities,
            manufacturing: "3",
            logistics: Number.NaN,
          },
        },
      }),
    );

    expect(hydrated.capabilities.manufacturing).toBe(0);
    expect(hydrated.capabilities.logistics).toBe(0);
    expect(validateGameStateIntegrity(hydrated).ok).toBe(true);
  });
});
