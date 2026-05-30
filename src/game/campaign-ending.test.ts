import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { campaignEndings, products } from "./data";
import { CAMPAIGN_FINAL_MONTH, getCampaignFinale } from "./campaign";
import {
  getActiveEndingReplayBrief,
  getCampaignEnding,
  getCampaignEndingDiscovery,
  getCampaignEndingReport,
  getEndingCollectionSummary,
  getEndingCollectionEntries,
  getEndingCollectionProgressEntries,
  getEndingNearMisses,
  getEndingReplayPlans,
  getEndingTargetPlans,
} from "./campaign-ending";
import { runTenYearCampaignSimulation } from "./run-simulator";
import { createInitialState } from "./simulation";
import type { GameState, RunModifiersState } from "./types";

const validateDataSource = readFileSync(new URL("../../scripts/harness/validate-data.mjs", import.meta.url), "utf8");

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
  chip_war_local_compute_pact: finalStateFor(
    {
      startCityId: "texas",
      worldLoreId: "chip_war",
      marketConditionId: "talent_war",
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
      resources: {
        ...createInitialState().resources,
        cash: 320000,
        users: 210000,
        compute: 300,
        data: 220,
        talent: 22,
        trust: 74,
        hype: 52,
        automation: 70,
      },
    },
  ),
  singapore_gateway_trust_mesh: finalStateFor(
    {
      startCityId: "singapore",
      worldLoreId: "regulatory_stronghold",
      marketConditionId: "regulation_crackdown",
      founderTraitId: "operator_founder",
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
        cash: 300000,
        users: 200000,
        compute: 250,
        data: 220,
        talent: 20,
        trust: 94,
        hype: 42,
        automation: 78,
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
  new_york_hype_exchange: finalStateFor(
    {
      startCityId: "new_york",
      worldLoreId: "bigtech_monopoly",
      marketConditionId: "consumer_hype_cycle",
      founderTraitId: "marketer_founder",
    },
    {
      resources: {
        ...createInitialState().resources,
        cash: 260000,
        users: 260000,
        compute: 230,
        data: 210,
        talent: 20,
        trust: 58,
        hype: 88,
        automation: 58,
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
  bengaluru_frugal_research_lab: finalStateFor(
    {
      startCityId: "bengaluru",
      worldLoreId: "ai_winter_redux",
      marketConditionId: "funding_drought",
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
        cash: 170000,
        users: 120000,
        compute: 190,
        data: 230,
        talent: 18,
        trust: 72,
        hype: 32,
        automation: 64,
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
  london_ai_audit_exchange: finalStateFor(
    {
      startCityId: "london",
      worldLoreId: "regulatory_stronghold",
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
        cash: 210000,
        users: 140000,
        compute: 220,
        data: 260,
        talent: 18,
        trust: 90,
        hype: 38,
        automation: 62,
      },
    },
  ),
  berlin_privacy_commons: finalStateFor(
    {
      startCityId: "berlin",
      worldLoreId: "privacy_fortress",
      marketConditionId: "regulation_crackdown",
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
      resources: {
        ...createInitialState().resources,
        cash: 230000,
        users: 150000,
        compute: 240,
        data: 260,
        talent: 18,
        trust: 94,
        hype: 42,
        automation: 66,
      },
    },
  ),
  beijing_domestic_platform_stack: finalStateFor(
    {
      startCityId: "beijing",
      worldLoreId: "bigtech_monopoly",
      marketConditionId: "platform_gold_rush",
      founderTraitId: "serial_founder",
    },
    {
      resources: {
        ...createInitialState().resources,
        cash: 240000,
        users: 280000,
        compute: 260,
        data: 230,
        talent: 20,
        trust: 70,
        hype: 64,
        automation: 64,
      },
    },
  ),
  alphago_slow_science_compound: finalStateFor(
    {
      worldLoreId: "alphago_stall",
      marketConditionId: "funding_drought",
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
        cash: 180000,
        users: 120000,
        compute: 210,
        data: 260,
        talent: 20,
        trust: 72,
        hype: 30,
        automation: 58,
      },
    },
  ),
  texas_energy_compute_grid: finalStateFor(
    {
      startCityId: "texas",
      worldLoreId: "chip_war",
      marketConditionId: "talent_war",
      founderTraitId: "capitalist_founder",
    },
    {
      resources: {
        ...createInitialState().resources,
        cash: 260000,
        users: 150000,
        compute: 300,
        data: 180,
        talent: 26,
        trust: 62,
        hype: 48,
        automation: 70,
      },
    },
  ),
  tokyo_hype_companion_studio: finalStateFor(
    {
      startCityId: "tokyo",
      worldLoreId: "robotics_boom",
      marketConditionId: "consumer_hype_cycle",
      founderTraitId: "marketer_founder",
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
        cash: 210000,
        users: 230000,
        compute: 260,
        data: 220,
        talent: 18,
        trust: 58,
        hype: 88,
        automation: 58,
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
      "chip_war_local_compute_pact",
      "berlin_privacy_commons",
      "singapore_gateway_trust_mesh",
      "data_drought_synthetic_lab",
      "beijing_domestic_platform_stack",
      "new_york_hype_exchange",
      "platform_escape_network",
      "alphago_slow_science_compound",
      "compute_siege_survivor",
      "bengaluru_frugal_research_lab",
      "texas_energy_compute_grid",
      "ai_winter_profitable_lab",
      "london_ai_audit_exchange",
      "tokyo_consumer_companion",
      "tokyo_hype_companion_studio",
      "standard_platform_compounder",
      "garage_restart",
    ]);
    expect(Object.keys(endingFixtures).sort()).toEqual(campaignEndings.map((ending) => ending.id).sort());

    for (const ending of campaignEndings) {
      expect(getCampaignEnding(endingFixtures[ending.id]).id).toBe(ending.id);
    }
  });

  it("guards replay-safe ending data invariants in validate:data", () => {
    expect(validateDataSource).toContain("expected exactly 22 campaign endings");
    expect(validateDataSource).toContain("priority must be unique");
    expect(validateDataSource).toContain("fallback ending must be the final entry");
    expect(validateDataSource).toContain("non-fallback ending must require status success");
    expect(validateDataSource).toContain("non-fallback ending must require min_month 120");
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

  it("summarizes whether the final ending will be newly added to the codex", () => {
    const state = {
      ...endingFixtures.privacy_trust_bastion,
      roguelite: {
        ...endingFixtures.privacy_trust_bastion.roguelite,
        discoveredEndingIds: ["standard_platform_compounder"],
      },
    };
    const discovery = getCampaignEndingDiscovery(state);

    expect(discovery).toMatchObject({
      id: "privacy_trust_bastion",
      title: "프라이버시 신뢰 요새",
      alreadyDiscovered: false,
      discoveredCountBeforeRun: 1,
      discoveredCountAfterRun: 2,
      totalCount: campaignEndings.length,
      completionPercentAfterRun: Math.round((2 / campaignEndings.length) * 100),
      rewardLabel: "+4 통찰",
    });
  });

  it("explains the selected campaign ending with satisfied requirements", () => {
    const report = getCampaignEndingReport(endingFixtures.privacy_trust_bastion);

    expect(report).toMatchObject({
      id: "privacy_trust_bastion",
      complete: true,
      progressPercent: 100,
    });
    expect(report.requirements.every((requirement) => requirement.complete)).toBe(true);
    expect(report.requirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "world_lore_ids", currentLabel: "프라이버시 요새", targetLabel: "프라이버시 요새" }),
        expect.objectContaining({ id: "growth_path_ids", currentLabel: "신뢰 기반 엔터프라이즈" }),
        expect.objectContaining({ id: "archetype_ids", currentLabel: "충족" }),
      ]),
    );
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
    expect(entries.find((entry) => entry.id === "frontier_demo_empire")?.targetLabels).toEqual(
      expect.arrayContaining(["오픈소스 천국", "엔지니어 창업자", "코드/비전 연구소", "프런티어 차고"]),
    );
    expect(entries.find((entry) => entry.id === "frontier_demo_empire")?.selection).toMatchObject({
      seed: "ending:frontier_demo_empire",
      worldLoreId: "open_source_heaven",
      founderTraitId: "engineer_founder",
      challengeTierId: "standard",
    });
  });

  it("summarizes ending collection progress with the next recommended replay target", () => {
    const state = {
      ...createInitialState(),
      roguelite: {
        ...createInitialState().roguelite,
        discoveredEndingIds: ["frontier_demo_empire"],
      },
    };
    const summary = getEndingCollectionSummary(state);

    expect(summary).toMatchObject({
      discoveredCount: 1,
      totalCount: campaignEndings.length,
      lockedCount: campaignEndings.length - 1,
      completionPercent: Math.round((1 / campaignEndings.length) * 100),
    });
    expect(summary.nextReplayPlan).toMatchObject({
      id: "agi_safety_accord",
      selection: {
        seed: "ending:agi_safety_accord",
        worldLoreId: "agi_overhang",
        marketConditionId: "regulation_crackdown",
        founderTraitId: "academic_founder",
        challengeTierId: "standard",
      },
    });
  });

  it("annotates ending collection entries with current-run progress and the next missing condition", () => {
    const state = finalStateFor(
      {
        worldLoreId: "agi_overhang",
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
          cash: 420000,
          users: 260000,
          compute: 340,
          data: 320,
          talent: 22,
          trust: 40,
          hype: 58,
          automation: 76,
        },
      },
    );
    const progressEntry = getEndingCollectionProgressEntries(state).find((entry) => entry.id === "agi_safety_accord");

    expect(progressEntry).toMatchObject({
      id: "agi_safety_accord",
      discovered: false,
      matchedRequirements: 12,
      totalRequirements: 13,
      nextRequirementLabel: "신뢰 40/92",
    });
    expect(progressEntry?.progressPercent).toBeLessThan(100);
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

  it("builds deterministic replay plans that can seed a target ending run", () => {
    const state = {
      ...createInitialState(),
      roguelite: {
        ...createInitialState().roguelite,
        discoveredEndingIds: ["frontier_demo_empire"],
      },
    };
    const plans = getEndingReplayPlans(state, campaignEndings.length);
    const privacyPlan = plans.find((plan) => plan.id === "privacy_trust_bastion");

    expect(plans[0]).toMatchObject({
      id: "agi_safety_accord",
      discovered: false,
    });
    expect(privacyPlan).toMatchObject({
      discovered: false,
      selection: {
        seed: "ending:privacy_trust_bastion",
        worldLoreId: "privacy_fortress",
        marketConditionId: "regulation_crackdown",
        founderTraitId: "researcher_founder",
        challengeTierId: "standard",
      },
    });
    expect(privacyPlan?.targetLabels).toEqual(
      expect.arrayContaining(["프라이버시 요새", "규제 단속", "연구자 창업자", "신뢰 기반 엔터프라이즈"]),
    );
    expect(privacyPlan?.openingMoves).toEqual(
      expect.arrayContaining(["신뢰 기반 엔터프라이즈 성장 경로 선택", "프라이버시 협약 아키타입 완성"]),
    );
    expect(plans.find((plan) => plan.id === "frontier_demo_empire")?.discovered).toBe(true);
  });

  it("summarizes active ending replay runs from the seeded target", () => {
    const state = createInitialState({
      seed: "ending:privacy_trust_bastion",
      worldLoreId: "privacy_fortress",
      marketConditionId: "regulation_crackdown",
      founderTraitId: "researcher_founder",
    });
    const brief = getActiveEndingReplayBrief(state);

    expect(brief).toMatchObject({
      id: "privacy_trust_bastion",
      title: "프라이버시 신뢰 요새",
      progressPercent: expect.any(Number),
      rewardLabel: "완주 보너스 +4 통찰",
      selection: {
        seed: "ending:privacy_trust_bastion",
        worldLoreId: "privacy_fortress",
        marketConditionId: "regulation_crackdown",
        founderTraitId: "researcher_founder",
        challengeTierId: "standard",
      },
    });
    expect(brief?.targetLabels).toEqual(
      expect.arrayContaining(["프라이버시 요새", "규제 단속", "연구자 창업자", "신뢰 기반 엔터프라이즈"]),
    );
    expect(brief?.openingMoves).toEqual(
      expect.arrayContaining(["신뢰 기반 엔터프라이즈 성장 경로 선택", "신뢰 90까지 확보", "프라이버시 협약 아키타입 완성"]),
    );
    expect(brief?.nextRequirements.map((requirement) => requirement.id)).toEqual([
      "growth_path_ids",
      "min_products",
      "min_resource_trust",
      "min_resource_automation",
    ]);
    expect(brief?.nextRequirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "growth_path_ids",
          actionLabel: "제품/성장 선택",
          targetMenu: "products",
        }),
        expect.objectContaining({
          id: "min_resource_trust",
          actionLabel: "신뢰 카드/안전 운영",
          targetMenu: "deck",
        }),
        expect.objectContaining({
          id: "min_resource_automation",
          actionLabel: "자동화 연구",
          targetMenu: "research",
        }),
      ]),
    );
    expect(brief?.nextRequirements.some((requirement) => ["status", "min_month", "world_lore_ids"].includes(requirement.id))).toBe(false);
    expect(getActiveEndingReplayBrief(createInitialState())).toBeUndefined();
  });

  it("ranks final-run near misses with replay selections for immediate rematch", () => {
    const nearAgiState = finalStateFor(
      {
        worldLoreId: "agi_overhang",
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
          cash: 420000,
          users: 260000,
          compute: 340,
          data: 320,
          talent: 22,
          trust: 88,
          hype: 58,
          automation: 76,
        },
      },
    );
    const nearMisses = getEndingNearMisses(nearAgiState, 3);

    expect(getCampaignEnding(nearAgiState).id).not.toBe("agi_safety_accord");
    expect(nearMisses[0]).toMatchObject({
      id: "agi_safety_accord",
      complete: false,
      discovered: false,
      rewardLabel: "+5 통찰",
      replaySelection: {
        seed: "ending:agi_safety_accord",
        worldLoreId: "agi_overhang",
        marketConditionId: "regulation_crackdown",
        challengeTierId: "standard",
      },
    });
    expect(nearMisses[0].missingLabels).toEqual(expect.arrayContaining(["신뢰"]));
    expect(nearMisses[0].targetLabels).toEqual(expect.arrayContaining(["AGI 임박", "규제 단속", "신뢰 기반 엔터프라이즈"]));
    expect(getEndingNearMisses(createInitialState())).toEqual([]);
  });
});
