import { describe, expect, it } from "vitest";
import { agentTypes, capabilities, products } from "./data";
import {
  calculateMonthlyEconomy,
  createInitialState,
  getAgentEffectiveStats,
  getAgentHireCostForChannel,
  getRecruitmentBrandProfile,
  getRecruitmentCandidatePool,
  getRecruitmentOffer,
  getTeamMonthlySalaryCost,
  hireAgentViaChannel,
} from "./simulation";
import type { GameState } from "./types";

const junior = () => {
  const agent = agentTypes.find((entry) => entry.id === "garage_junior_dev");
  if (!agent) throw new Error("Missing garage junior developer");
  return agent;
};

const richRecruitingState = (): GameState => {
  const initial = createInitialState();

  return {
    ...initial,
    month: 24,
    locationId: "seoul_ai_tower",
    resources: {
      ...initial.resources,
      cash: 250000,
      users: 80000,
      trust: 85,
      hype: 45,
      data: 1200,
      compute: 1200,
      automation: 10,
      talent: 18,
    },
    activeProducts: products.slice(0, 6).map((product) => product.id),
    capabilities: Object.fromEntries(capabilities.map((capability) => [capability.id, capability.max_level])),
  };
};

describe("v0.34.2 recruitment channels and salary contracts", () => {
  it("keeps rural open recruiting cheap for early human hires", () => {
    const agent = junior();
    const state = createInitialState();

    const openCost = getAgentHireCostForChannel(agent, state, "open_recruiting");

    expect(openCost.cash).toBeLessThan(agent.hire_cost.cash);
  });

  it("stores career contracts with higher upkeep and stronger effective stats", () => {
    const agent = junior();
    const state = createInitialState();

    const hired = hireAgentViaChannel(agent, state, "career_recruiting");
    const contract = hired.hiredAgents[0];

    expect(contract.recruitmentChannelId).toBe("career_recruiting");
    expect(contract.upkeep?.cash).toBeGreaterThan(agent.upkeep.cash);
    expect(getAgentEffectiveStats(contract, hired).engineering).toBeGreaterThan(agent.stats.engineering);
  });

  it("makes headhunter offers more expensive than career recruiting and flags risk", () => {
    const agent = junior();
    const state = createInitialState();

    const careerCost = getAgentHireCostForChannel(agent, state, "career_recruiting");
    const headhunterCost = getAgentHireCostForChannel(agent, state, "headhunter");
    const offer = getRecruitmentOffer(agent, state, "headhunter");

    expect(headhunterCost.cash).toBeGreaterThan(careerCost.cash ?? 0);
    expect(offer.riskLabel).toContain("검증");
  });

  it("uses contract upkeep in monthly salary pressure", () => {
    const agent = junior();
    const state = createInitialState();

    const openHired = hireAgentViaChannel(agent, state, "open_recruiting");
    const careerHired = hireAgentViaChannel(agent, state, "career_recruiting");

    expect(getTeamMonthlySalaryCost(careerHired)).toBeGreaterThan(getTeamMonthlySalaryCost(openHired));
    expect(calculateMonthlyEconomy(careerHired).totalCost).toBeGreaterThan(calculateMonthlyEconomy(openHired).totalCost);
  });

  it("limits each recruitment channel to a monthly candidate pool", () => {
    const state = createInitialState();

    const openPool = getRecruitmentCandidatePool(state, "open_recruiting");
    const careerPool = getRecruitmentCandidatePool(state, "career_recruiting");
    const headhunterPool = getRecruitmentCandidatePool(state, "headhunter");

    expect(openPool.candidateIds.length).toBeGreaterThan(0);
    expect(openPool.candidateIds.length).toBeLessThanOrEqual(5);
    expect(careerPool.candidateIds.length).toBeLessThanOrEqual(4);
    expect(headhunterPool.candidateIds.length).toBeLessThanOrEqual(3);
    expect(openPool.summary).toContain("강원 산골 차고");
  });

  it("refreshes visible candidates when the campaign month changes", () => {
    const state = richRecruitingState();
    const currentPool = getRecruitmentCandidatePool(state, "career_recruiting");
    const nextMonthPool = getRecruitmentCandidatePool({ ...state, month: state.month + 1 }, "career_recruiting");

    expect(currentPool.candidateIds).not.toEqual(nextMonthPool.candidateIds);
    expect(nextMonthPool.refreshLabel).toContain("26개월차");
  });

  it("removes already hired agents from future candidate pools", () => {
    const hired = hireAgentViaChannel(junior(), createInitialState(), "open_recruiting");
    const openPool = getRecruitmentCandidatePool(hired, "open_recruiting");

    expect(openPool.candidateIds).not.toContain("garage_junior_dev");
  });

  it("turns office growth, location, and decor into a visible hiring brand profile", () => {
    const base = createInitialState();
    const branded: GameState = {
      ...richRecruitingState(),
      office: {
        expansionId: "campus_lab",
        placedItemIds: ["ux_sticky_wall", "viral_camera", "redteam_toolkit"],
      },
      ownedItems: ["ux_sticky_wall", "viral_camera", "redteam_toolkit"],
    };

    const baseProfile = getRecruitmentBrandProfile(base);
    const brandedProfile = getRecruitmentBrandProfile(branded);

    expect(brandedProfile.score).toBeGreaterThan(baseProfile.score);
    expect(brandedProfile.candidatePoolBonus).toBeGreaterThanOrEqual(1);
    expect(brandedProfile.gradeLabel).toContain("채용 브랜드");
    expect(brandedProfile.capacityLabel).toContain("빈 자리");
    expect(brandedProfile.drivers.join(" / ")).toContain("캠퍼스 연구동");
    expect(brandedProfile.drivers.join(" / ")).toContain("서울");
    expect(brandedProfile.drivers.join(" / ")).toContain("장식");
  });

  it("uses recruiting brand to widen candidate pools without ignoring full-office pressure", () => {
    const base = createInitialState();
    const branded: GameState = {
      ...richRecruitingState(),
      office: {
        expansionId: "campus_lab",
        placedItemIds: ["ux_sticky_wall", "viral_camera", "redteam_toolkit"],
      },
      ownedItems: ["ux_sticky_wall", "viral_camera", "redteam_toolkit"],
    };
    const fullOffice: GameState = {
      ...branded,
      hiredAgents: Array.from({ length: 12 }, (_, index) => ({
        id: `filled-seat-${index}`,
        typeId: junior().id,
        name: `만석 직원 ${index + 1}`,
        level: 1,
        energy: 80,
        equippedItemIds: [],
      })),
    };

    const basePool = getRecruitmentCandidatePool(base, "career_recruiting");
    const brandedPool = getRecruitmentCandidatePool(branded, "career_recruiting");
    const fullOfficeProfile = getRecruitmentBrandProfile(fullOffice);

    expect(brandedPool.poolSize).toBeGreaterThan(basePool.poolSize);
    expect(brandedPool.summary).toContain("채용 브랜드");
    expect(fullOfficeProfile.hiringSlotsOpen).toBe(0);
    expect(fullOfficeProfile.candidatePoolBonus).toBe(0);
    expect(fullOfficeProfile.warnings.join(" / ")).toContain("정원");
  });

  it("uses an active robotics bay to surface robot candidates in advanced recruiting", () => {
    const base: GameState = {
      ...richRecruitingState(),
      office: {
        expansionId: "campus_lab",
        placedItemIds: [],
      },
      hiredAgents: agentTypes.slice(0, 5).map((agent, index) => ({
        id: `robotics-bay-seat-${index + 1}`,
        typeId: agent.id,
        name: agent.name,
        level: 2,
        energy: 82,
        loyalty: 78,
        equippedItemIds: [],
      })),
      activeProducts: ["foundation_model_v0", "ai_writing_assistant"],
      unlockedDomains: [
        ...new Set([...richRecruitingState().unlockedDomains, "robotics"]),
      ],
      resources: {
        ...richRecruitingState().resources,
        automation: 20,
      },
      capabilities: {
        ...richRecruitingState().capabilities,
        robotics: 1,
      },
    };

    const pool = getRecruitmentCandidatePool(base, "career_recruiting");

    expect(pool.summary).toContain("로봇 고용 베이");
    expect(pool.candidateIds.slice(0, 2)).toEqual(expect.arrayContaining(["factory_robot_unit"]));
  });
});
