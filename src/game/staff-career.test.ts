import { describe, expect, it } from "vitest";
import { agentTypes, products } from "./data";
import {
  advanceMonth,
  createInitialState,
  getAgentCareerStatus,
  getAgentEffectiveStats,
  getAgentRetentionAlerts,
  hireAgentViaChannel,
  startProductProject,
} from "./simulation";

const architect = () => {
  const agent = agentTypes.find((entry) => entry.id === "prompt_architect");
  if (!agent) throw new Error("Missing prompt architect");
  return agent;
};

const junior = () => {
  const agent = agentTypes.find((entry) => entry.id === "garage_junior_dev");
  if (!agent) throw new Error("Missing garage junior developer");
  return agent;
};

const writingProduct = () => {
  const product = products.find((entry) => entry.id === "ai_writing_assistant");
  if (!product) throw new Error("Missing writing product");
  return product;
};

describe("v0.34.4 staff career and retention loop", () => {
  it("gives assigned agents experience and drains some energy each month", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const started = startProductProject(writingProduct(), hired, [hired.hiredAgents[0].id]);

    const advanced = advanceMonth(started);
    const agent = advanced.hiredAgents.find((entry) => entry.typeId === "prompt_architect");

    expect(agent?.experience).toBeGreaterThan(0);
    expect(agent?.energy).toBeLessThan(100);
    expect(getAgentCareerStatus(agent!, advanced).progressPercent).toBeGreaterThan(0);
  });

  it("levels up agents when monthly experience reaches the next threshold", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "open_recruiting");
    const primed = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, experience: 2, loyalty: 80 })),
    };

    const advanced = advanceMonth(primed);
    const agent = advanced.hiredAgents[0];

    expect(agent.level).toBe(2);
    expect(getAgentEffectiveStats(agent, advanced).product).toBeGreaterThan(architect().stats.product);
  });

  it("surfaces retention alerts for low-loyalty contracts", () => {
    const hired = hireAgentViaChannel(junior(), createInitialState(), "headhunter");
    const stressed = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, loyalty: 24 })),
    };

    const alerts = getAgentRetentionAlerts(stressed);

    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ severity: "critical" });
    expect(alerts[0].message).toContain("이직");
  });
});
