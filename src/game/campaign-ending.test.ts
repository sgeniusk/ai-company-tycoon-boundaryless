import { describe, expect, it } from "vitest";
import { campaignEndings, products } from "./data";
import { CAMPAIGN_FINAL_MONTH, getCampaignFinale } from "./campaign";
import { getCampaignEnding, getEndingCollectionEntries, getEndingTargetPlans } from "./campaign-ending";
import { runTenYearCampaignSimulation } from "./run-simulator";
import { createInitialState } from "./simulation";
import type { GameState, RunModifiersState } from "./types";

function finalStateFor(selection: Partial<RunModifiersState>, overrides: Partial<GameState> = {}): GameState {
  const selectedSeed =
    selection.seed ??
    (selection.startCityId || selection.worldLoreId || selection.marketConditionId || selection.founderTraitId || selection.challengeTier
      ? `ending-${selection.worldLoreId ?? "standard"}-${selection.founderTraitId ?? "no-founder"}`
      : undefined);
  const base = createInitialState({
    seed: selectedSeed,
    startCityId: selection.startCityId,
    worldLoreId: selection.worldLoreId,
    marketConditionId: selection.marketConditionId,
    founderTraitId: selection.founderTraitId,
    challengeTierId: selection.challengeTier,
  });

  return {
    ...base,
    month: CAMPAIGN_FINAL_MONTH,
    status: "success",
    activeProducts: products.slice(0, 8).map((product) => product.id),
    productLevels: Object.fromEntries(products.slice(0, 8).map((product) => [product.id, 1])),
    unlockedDomains: ["personal_productivity", "education", "developer_tools", "robotics", "manufacturing", "logistics", "energy"],
    resources: {
      ...base.resources,
      cash: 520000,
      users: 360000,
      compute: 420,
      data: 320,
      talent: 24,
      trust: 88,
      hype: 76,
      automation: 82,
    },
    chosenGrowthPath: {
      id: "productivity_line",
      title: "생산성 제품 라인 확장",
      month: 4,
      bonusDescription: "test fixture",
      effects: {},
      monthlyEffects: {},
    },
    ...overrides,
  };
}

const endingFixtures: Record<string, GameState> = {
  agi_safety_accord: finalStateFor(
    {
      worldLoreId: "agi_overhang",
      marketConditionId: "regulation_crackdown",
      founderTraitId: "academic_founder",
    },
    {
      chosenGrowthPath: {
        id: "trust_enterprise",
        title: "신뢰 기반 엔터프라이즈",
        month: 4,
        bonusDescription: "test fixture",
        effects: {},
        monthlyEffects: {},
      },
      resources: {
        ...createInitialState().resources,
        cash: 420000,
        users: 260000,
        compute: 340,
        data: 320,
        talent: 22,
        trust: 96,
        hype: 58,
        automation: 76,
      },
    },
  ),
  compute_siege_survivor: finalStateFor(
    {
      worldLoreId: "bitcoin_gpu_squeeze",
      marketConditionId: "steady_market",
      founderTraitId: "operator_founder",
    },
    {
      resources: {
        ...createInitialState().resources,
        cash: 210000,
        users: 160000,
        compute: 260,
        data: 160,
        talent: 18,
        trust: 74,
        hype: 42,
        automation: 66,
      },
    },
  ),
  frontier_demo_empire: finalStateFor(
    {
      startCityId: "san_francisco",
      worldLoreId: "open_source_heaven",
      marketConditionId: "ai_boom",
      founderTraitId: "engineer_founder",
    },
    {
      chosenGrowthPath: {
        id: "code_vision_lab",
        title: "코드/비전 연구소",
        month: 4,
        bonusDescription: "test fixture",
        effects: {},
        monthlyEffects: {},
      },
    },
  ),
  physical_ai_supply_chain: finalStateFor(
    {
      startCityId: "texas",
      worldLoreId: "robotics_boom",
      marketConditionId: "talent_war",
      founderTraitId: "operator_founder",
    },
    {
      chosenGrowthPath: {
        id: "code_vision_lab",
        title: "코드/비전 연구소",
        month: 4,
        bonusDescription: "test fixture",
        effects: {},
        monthlyEffects: {},
      },
    },
  ),
  privacy_trust_bastion: finalStateFor(
    {
      startCityId: "berlin",
      worldLoreId: "privacy_fortress",
      marketConditionId: "regulation_crackdown",
      founderTraitId: "researcher_founder",
    },
    {
      chosenGrowthPath: {
        id: "trust_enterprise",
        title: "신뢰 기반 엔터프라이즈",
        month: 4,
        bonusDescription: "test fixture",
        effects: {},
        monthlyEffects: {},
      },
      resources: {
        ...createInitialState().resources,
        cash: 460000,
        users: 260000,
        compute: 300,
        data: 180,
        talent: 20,
        trust: 96,
        hype: 44,
        automation: 70,
      },
    },
  ),
  seoul_enterprise_operating_system: finalStateFor(
    {
      startCityId: "seoul",
      worldLoreId: "standard",
      marketConditionId: "enterprise_winter",
      founderTraitId: "capitalist_founder",
    },
    {
      chosenGrowthPath: {
        id: "trust_enterprise",
        title: "신뢰 기반 엔터프라이즈",
        month: 4,
        bonusDescription: "test fixture",
        effects: {},
        monthlyEffects: {},
      },
      resources: {
        ...createInitialState().resources,
        cash: 340000,
        users: 230000,
        compute: 260,
        data: 220,
        talent: 20,
        trust: 88,
        hype: 48,
        automation: 74,
      },
    },
  ),
  data_drought_synthetic_lab: finalStateFor(
    {
      worldLoreId: "data_drought",
      marketConditionId: "steady_market",
      founderTraitId: "researcher_founder",
    },
    {
      chosenGrowthPath: {
        id: "code_vision_lab",
        title: "코드/비전 연구소",
        month: 4,
        bonusDescription: "test fixture",
        effects: {},
        monthlyEffects: {},
      },
      resources: {
        ...createInitialState().resources,
        cash: 240000,
        users: 170000,
        compute: 240,
        data: 280,
        talent: 18,
        trust: 72,
        hype: 42,
        automation: 62,
      },
    },
  ),
  platform_escape_network: finalStateFor(
    {
      worldLoreId: "bigtech_monopoly",
      marketConditionId: "platform_gold_rush",
      founderTraitId: "serial_founder",
    },
    {
      resources: {
        ...createInitialState().resources,
        cash: 260000,
        users: 240000,
        compute: 230,
        data: 210,
        talent: 20,
        trust: 68,
        hype: 64,
        automation: 60,
      },
    },
  ),
  ai_winter_profitable_lab: finalStateFor(
    {
      worldLoreId: "ai_winter_redux",
      marketConditionId: "funding_drought",
      founderTraitId: "researcher_founder",
    },
    {
      chosenGrowthPath: {
        id: "trust_enterprise",
        title: "신뢰 기반 엔터프라이즈",
        month: 4,
        bonusDescription: "test fixture",
        effects: {},
        monthlyEffects: {},
      },
      resources: {
        ...createInitialState().resources,
        cash: 150000,
        users: 110000,
        compute: 180,
        data: 240,
        talent: 16,
        trust: 70,
        hype: 28,
        automation: 52,
      },
    },
  ),
  tokyo_consumer_companion: finalStateFor(
    {
      startCityId: "tokyo",
      worldLoreId: "standard",
      marketConditionId: "consumer_hype_cycle",
      founderTraitId: "designer_founder",
    },
    {
      resources: {
        ...createInitialState().resources,
        cash: 220000,
        users: 210000,
        compute: 220,
        data: 220,
        talent: 18,
        trust: 62,
        hype: 82,
        automation: 56,
      },
    },
  ),
  standard_platform_compounder: finalStateFor({}),
  garage_restart: finalStateFor(
    {},
    {
      status: "failure",
      activeProducts: products.slice(0, 2).map((product) => product.id),
      resources: {
        ...createInitialState().resources,
        cash: -10000,
        users: 9000,
        trust: 24,
        automation: 8,
      },
    },
  ),
};

describe("v0.67 campaign ending selector", () => {
  it("defines deterministic endings with fixture coverage for every condition", () => {
    expect(campaignEndings.map((ending) => ending.id)).toEqual([
      "frontier_demo_empire",
      "agi_safety_accord",
      "privacy_trust_bastion",
      "seoul_enterprise_operating_system",
      "physical_ai_supply_chain",
      "data_drought_synthetic_lab",
      "platform_escape_network",
      "compute_siege_survivor",
      "ai_winter_profitable_lab",
      "tokyo_consumer_companion",
      "standard_platform_compounder",
      "garage_restart",
    ]);
    expect(Object.keys(endingFixtures).sort()).toEqual(campaignEndings.map((ending) => ending.id).sort());

    for (const ending of campaignEndings) {
      expect(getCampaignEnding(endingFixtures[ending.id]).id).toBe(ending.id);
    }
  });

  it("picks the highest-priority matching ending deterministically", () => {
    const state = endingFixtures.frontier_demo_empire;

    expect(getCampaignEnding(state).id).toBe("frontier_demo_empire");
    expect(getCampaignEnding({ ...state, runModifiers: { ...state.runModifiers, tags: [...state.runModifiers.tags].reverse() } }).id).toBe(
      "frontier_demo_empire",
    );
    expect(Array.from({ length: 5 }, () => getCampaignEnding(state).id)).toEqual(Array(5).fill("frontier_demo_empire"));
  });

  it("maps the standard no-arg ten-year campaign to the sensible default ending", () => {
    const result = runTenYearCampaignSimulation("productivity_line");

    expect(result.finalState.runModifiers).toMatchObject({
      startCityId: "default_city",
      worldLoreId: "standard",
      marketConditionId: "steady_market",
      founderTraitId: "no_founder",
      challengeTier: "standard",
    });
    expect(getCampaignEnding(result.finalState).id).toBe("standard_platform_compounder");
    expect(result.finale.endingName).toBe("표준 세계의 복리 플랫폼");
  });

  it("surfaces the selected ending through the existing campaign finale", () => {
    const finale = getCampaignFinale(endingFixtures.privacy_trust_bastion);

    expect(finale).toMatchObject({
      isFinal: true,
      endingId: "privacy_trust_bastion",
      endingName: "프라이버시 신뢰 요새",
      title: "10년차 최종 평가",
    });
    expect(finale.verdict).toContain("신뢰");
    expect(finale.score).toBeGreaterThan(0);
  });

  it("builds a cross-run ending collection from roguelite discoveries", () => {
    const state = {
      ...createInitialState(),
      roguelite: {
        ...createInitialState().roguelite,
        discoveredEndingIds: ["standard_platform_compounder", "privacy_trust_bastion"],
      },
    };
    const entries = getEndingCollectionEntries(state);

    expect(entries).toHaveLength(campaignEndings.length);
    expect(entries.filter((entry) => entry.discovered).map((entry) => entry.id)).toEqual([
      "privacy_trust_bastion",
      "standard_platform_compounder",
    ]);
    expect(entries.find((entry) => entry.id === "frontier_demo_empire")).toMatchObject({
      title: "프런티어 데모 제국",
      discovered: false,
    });
  });

  it("ranks feasible ending targets for the current run and explains missing requirements", () => {
    const state: GameState = {
      ...endingFixtures.frontier_demo_empire,
      month: 72,
      activeProducts: products.slice(0, 4).map((product) => product.id),
      resources: {
        ...endingFixtures.frontier_demo_empire.resources,
        cash: 120000,
        users: 90000,
        compute: 120,
        hype: 42,
      },
    };
    const plans = getEndingTargetPlans(state, 3);
    const frontier = plans[0];

    expect(frontier).toMatchObject({
      id: "frontier_demo_empire",
      complete: false,
      matchedRequirements: expect.any(Number),
      totalRequirements: expect.any(Number),
    });
    expect(frontier.progressPercent).toBeGreaterThan(50);
    expect(frontier.progressPercent).toBeLessThan(100);
    expect(frontier.requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "world_lore_ids", complete: true }),
        expect.objectContaining({ id: "founder_trait_ids", complete: true }),
        expect.objectContaining({ id: "min_products", complete: false }),
        expect.objectContaining({ id: "min_resource_cash", complete: false }),
      ]),
    );
    expect(plans.map((plan) => plan.id)).not.toContain("privacy_trust_bastion");
  });
});
