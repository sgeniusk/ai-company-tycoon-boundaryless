import { describe, expect, it } from "vitest";
import { agentTypes } from "./data";
import {
  calculateMonthlyEconomy,
  createInitialState,
  getAgentEffectiveStats,
  getAgentHireCostForChannel,
  getRecruitmentOffer,
  getTeamMonthlySalaryCost,
  hireAgentViaChannel,
} from "./simulation";

const junior = () => {
  const agent = agentTypes.find((entry) => entry.id === "garage_junior_dev");
  if (!agent) throw new Error("Missing garage junior developer");
  return agent;
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
});
