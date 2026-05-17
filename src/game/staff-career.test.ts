import { describe, expect, it } from "vitest";
import { agentTypes, products } from "./data";
import {
  advanceMonth,
  createInitialState,
  getAgentCareerStatus,
  getAgentEffectiveStats,
  getAgentRestCheck,
  getAgentRetentionAlerts,
  getAgentSalaryNegotiationCheck,
  hireAgentViaChannel,
  negotiateAgentSalary,
  restAgent,
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

describe("v0.34.5 staff care actions and resignation risk", () => {
  it("lets idle agents take paid rest to recover energy and loyalty", () => {
    const hired = hireAgentViaChannel(junior(), createInitialState(), "headhunter");
    const tired = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, energy: 38, loyalty: 34 })),
    };
    const beforeCash = tired.resources.cash ?? 0;
    const agentId = tired.hiredAgents[0].id;

    expect(getAgentRestCheck(agentId, tired)).toMatchObject({ ok: true });

    const rested = restAgent(agentId, tired);
    const agent = rested.hiredAgents[0];

    expect(rested.resources.cash).toBeLessThan(beforeCash);
    expect(agent.energy).toBeGreaterThan(38);
    expect(agent.loyalty).toBeGreaterThan(34);
    expect(rested.timeline[0]).toContain("유급 휴식");
  });

  it("blocks paid rest while an agent is assigned to a project", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const started = startProductProject(writingProduct(), hired, [hired.hiredAgents[0].id]);

    const restCheck = getAgentRestCheck(hired.hiredAgents[0].id, started);

    expect(restCheck.ok).toBe(false);
    expect(restCheck.reasons.join(" ")).toContain("프로젝트");
  });

  it("lets the player negotiate salary to restore loyalty at a higher monthly cost", () => {
    const hired = hireAgentViaChannel(junior(), createInitialState(), "career_recruiting");
    const stressed = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, loyalty: 28 })),
    };
    const agentId = stressed.hiredAgents[0].id;
    const beforeAgent = stressed.hiredAgents[0];
    const beforeCash = stressed.resources.cash ?? 0;
    const beforeUpkeep = beforeAgent.upkeep?.cash ?? 0;

    expect(getAgentSalaryNegotiationCheck(agentId, stressed)).toMatchObject({ ok: true });

    const negotiated = negotiateAgentSalary(agentId, stressed);
    const agent = negotiated.hiredAgents[0];

    expect(negotiated.resources.cash).toBeLessThan(beforeCash);
    expect(agent.loyalty).toBeGreaterThan(beforeAgent.loyalty ?? 0);
    expect(agent.salaryMultiplier).toBeGreaterThan(beforeAgent.salaryMultiplier ?? 1);
    expect(agent.upkeep?.cash).toBeGreaterThan(beforeUpkeep);
    expect(negotiated.timeline[0]).toContain("연봉 협상");
  });

  it("removes agents who reach zero loyalty and clears their project assignments", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const started = startProductProject(writingProduct(), hired, [hired.hiredAgents[0].id]);
    const quittingRisk = {
      ...started,
      hiredAgents: started.hiredAgents.map((agent) => ({ ...agent, loyalty: 0 })),
    };
    const beforeTalent = quittingRisk.resources.talent ?? 0;

    const advanced = advanceMonth(quittingRisk);

    expect(advanced.hiredAgents).toHaveLength(0);
    expect(advanced.resources.talent).toBe(beforeTalent - 1);
    expect(advanced.productProjects.every((project) => project.assignedAgentIds.length === 0)).toBe(true);
    expect(advanced.timeline.join(" ")).toContain("퇴사");
  });

  it("does not let zero-loyalty idle agents recover without player care", () => {
    const hired = hireAgentViaChannel(junior(), createInitialState(), "open_recruiting");
    const abandoned = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, loyalty: 0 })),
    };

    const advanced = advanceMonth(abandoned);

    expect(advanced.hiredAgents).toHaveLength(0);
    expect(advanced.timeline.join(" ")).toContain("퇴사");
  });
});
