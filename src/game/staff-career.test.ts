import { describe, expect, it } from "vitest";
import { agentTypes, items, products } from "./data";
import {
  advanceMonth,
  buyItem,
  createInitialState,
  equipItem,
  getAgentDevelopmentProfile,
  getAgentCareerStatus,
  getAgentEffectiveStats,
  getAgentRestCheck,
  getAgentRetentionAlerts,
  getAgentSalaryNegotiationCheck,
  getAgentSpecializationCheck,
  getAgentSpecializationOptions,
  getRecentStaffIncidentAftermathLog,
  getRecentStaffIncidentResolutionLog,
  getStaffIncidentResolutionOptions,
  getStaffIncidentBriefs,
  hireAgentViaChannel,
  chooseAgentSpecialization,
  negotiateAgentSalary,
  resolveStaffIncident,
  restAgent,
  startProductProject,
} from "./simulation";
import type { GameState } from "./types";

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

describe("v0.34.6 staff personality and preferred equipment", () => {
  it("summarizes each agent's trait, growth focus, and preferred equipment matches", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "open_recruiting");
    const notebook = items.find((item) => item.id === "prompt_notebook");
    if (!notebook) throw new Error("Missing prompt notebook");

    const equipped = equipItem(hired.hiredAgents[0].id, notebook, buyItem(notebook, hired));
    const profile = getAgentDevelopmentProfile(equipped.hiredAgents[0], equipped);

    expect(profile.traitLabel).toContain("AI");
    expect(profile.growthFocusLabel).toContain("제품");
    expect(profile.preferredItemIds).toContain("prompt_notebook");
    expect(profile.matchedPreferredItemNames).toContain("프롬프트 노트");
  });

  it("adds a focused stat bonus when a preferred item is equipped", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "open_recruiting");
    const notebook = items.find((item) => item.id === "prompt_notebook");
    if (!notebook) throw new Error("Missing prompt notebook");

    const equipped = equipItem(hired.hiredAgents[0].id, notebook, buyItem(notebook, hired));
    const stats = getAgentEffectiveStats(equipped.hiredAgents[0], equipped);

    expect(stats.product).toBeGreaterThan(architect().stats.product + (notebook.effects.product ?? 0));
    expect(stats.creativity).toBeGreaterThan(architect().stats.creativity + (notebook.effects.creativity ?? 0));
  });

  it("raises monthly loyalty slightly for agents using preferred gear", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "open_recruiting");
    const notebook = items.find((item) => item.id === "prompt_notebook");
    if (!notebook) throw new Error("Missing prompt notebook");
    const baseline = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, loyalty: 60 })),
    };
    const equipped = {
      ...equipItem(baseline.hiredAgents[0].id, notebook, buyItem(notebook, baseline)),
      hiredAgents: baseline.hiredAgents.map((agent) => ({ ...agent, equippedItemIds: ["prompt_notebook"], loyalty: 60 })),
    };

    const withoutPreference = advanceMonth(baseline).hiredAgents[0].loyalty ?? 0;
    const withPreference = advanceMonth(equipped).hiredAgents[0].loyalty ?? 0;

    expect(withPreference).toBeGreaterThan(withoutPreference);
  });
});

describe("v0.34.7 staff specialization branches", () => {
  it("locks specialization choices until an agent reaches level 3", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "open_recruiting");
    const options = getAgentSpecializationOptions(hired.hiredAgents[0], hired);
    const check = getAgentSpecializationCheck(hired.hiredAgents[0].id, "product", hired);

    expect(options).toHaveLength(2);
    expect(options.every((option) => !option.unlocked)).toBe(true);
    expect(check.ok).toBe(false);
    expect(check.reasons.join(" ")).toContain("Lv.3");
  });

  it("lets a level 3 agent choose one specialization and gain a focused stat bonus", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "open_recruiting");
    const levelThree = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 3, experience: 0 })),
    };
    const beforeProduct = getAgentEffectiveStats(levelThree.hiredAgents[0], levelThree).product;

    const specialized = chooseAgentSpecialization(levelThree.hiredAgents[0].id, "product", levelThree);
    const agent = specialized.hiredAgents[0];
    const stats = getAgentEffectiveStats(agent, specialized);

    expect(agent.specializationStat).toBe("product");
    expect(agent.specializationChosenMonth).toBe(levelThree.month);
    expect(stats.product).toBeGreaterThan(beforeProduct);
    expect(specialized.timeline[0]).toContain("전문화");
  });

  it("prevents changing specialization after a branch has been chosen", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "open_recruiting");
    const levelThree = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 3, specializationStat: "product" as const })),
    };

    const check = getAgentSpecializationCheck(levelThree.hiredAgents[0].id, "creativity", levelThree);
    const unchanged = chooseAgentSpecialization(levelThree.hiredAgents[0].id, "creativity", levelThree);

    expect(check.ok).toBe(false);
    expect(check.reasons.join(" ")).toContain("이미");
    expect(unchanged.hiredAgents[0].specializationStat).toBe("product");
  });
});

describe("v0.34.9 staff incident drama", () => {
  it("surfaces burnout incidents for exhausted assigned agents", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const started = startProductProject(writingProduct(), hired, [hired.hiredAgents[0].id]);
    const exhausted = {
      ...started,
      hiredAgents: started.hiredAgents.map((agent) => ({ ...agent, energy: 18, loyalty: 66 })),
    };

    const incidents = getStaffIncidentBriefs(exhausted);
    const burnout = incidents.find((incident) => incident.type === "burnout");

    expect(burnout).toMatchObject({
      agentId: exhausted.hiredAgents[0].id,
      severity: "critical",
      recommendedAction: "rest",
    });
    expect(burnout?.title).toContain("번아웃");
    expect(burnout?.description).toContain("체력");
  });

  it("surfaces poaching incidents for valuable low-loyalty specialists", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const specialist = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 4, loyalty: 38, energy: 72 })),
    };

    const incidents = getStaffIncidentBriefs(specialist);
    const poaching = incidents.find((incident) => incident.type === "poaching");

    expect(poaching).toMatchObject({
      agentId: specialist.hiredAgents[0].id,
      severity: "critical",
      recommendedAction: "salary",
    });
    expect(poaching?.title).toContain("스카우트");
    expect(poaching?.description).toContain("경쟁사");
  });

  it("surfaces contract discontent before it becomes a resignation", () => {
    const hired = hireAgentViaChannel(junior(), createInitialState(), "headhunter");
    const unhappy = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 1, loyalty: 42, energy: 76 })),
    };

    const incidents = getStaffIncidentBriefs(unhappy);
    const discontent = incidents.find((incident) => incident.type === "discontent");

    expect(discontent).toMatchObject({
      agentId: unhappy.hiredAgents[0].id,
      severity: "warning",
      recommendedAction: "salary",
    });
    expect(discontent?.description).toContain("계약");
  });

  it("offers two resolution choices for each staff incident type", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const started = startProductProject(writingProduct(), hired, [hired.hiredAgents[0].id]);
    const incidentState = {
      ...started,
      hiredAgents: started.hiredAgents.map((agent) => ({ ...agent, level: 4, energy: 18, loyalty: 38 })),
    };
    const incidents = getStaffIncidentBriefs(incidentState);

    for (const incident of incidents) {
      const options = getStaffIncidentResolutionOptions(incident.id, incidentState);

      expect(options).toHaveLength(2);
      expect(options[0].label.length).toBeGreaterThan(0);
      expect(options[0].effectLabel.length).toBeGreaterThan(0);
    }
  });

  it("resolves burnout with a recovery day that clears project assignment and logs the outcome", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const started = startProductProject(writingProduct(), hired, [hired.hiredAgents[0].id]);
    const exhausted = {
      ...started,
      resources: { ...started.resources, cash: 12000 },
      hiredAgents: started.hiredAgents.map((agent) => ({ ...agent, energy: 18, loyalty: 66 })),
    };
    const burnout = getStaffIncidentBriefs(exhausted).find((incident) => incident.type === "burnout");
    if (!burnout) throw new Error("Missing burnout incident");

    const resolved = resolveStaffIncident(burnout.id, "recovery_day", exhausted);
    const agent = resolved.hiredAgents[0];

    expect(agent.energy).toBeGreaterThan(18);
    expect(agent.loyalty).toBeGreaterThan(66);
    expect(agent.assignment).toBeUndefined();
    expect(resolved.productProjects[0].assignedAgentIds).not.toContain(agent.id);
    expect(resolved.resources.cash).toBeLessThan(exhausted.resources.cash ?? 0);
    expect(resolved.timeline[0]).toContain("인사 사건 대응");
  });

  it("resolves a poaching incident with a retention bonus that raises salary pressure", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const specialist = {
      ...hired,
      resources: { ...hired.resources, cash: 12000 },
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 4, loyalty: 38, energy: 72 })),
    };
    const poaching = getStaffIncidentBriefs(specialist).find((incident) => incident.type === "poaching");
    if (!poaching) throw new Error("Missing poaching incident");
    const beforeAgent = specialist.hiredAgents[0];

    const resolved = resolveStaffIncident(poaching.id, "retention_bonus", specialist);
    const agent = resolved.hiredAgents[0];

    expect(agent.loyalty).toBeGreaterThan(beforeAgent.loyalty ?? 0);
    expect(agent.salaryMultiplier).toBeGreaterThan(beforeAgent.salaryMultiplier ?? 1);
    expect(agent.upkeep?.cash).toBeGreaterThan(beforeAgent.upkeep?.cash ?? 0);
    expect(resolved.timeline[0]).toContain("스카우트");
  });

  it("links poaching incidents to a concrete competitor offer", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const targeted = {
      ...hired,
      competitorStates: hired.competitorStates.map((competitor) =>
        competitor.id === "competitor_jemiinni"
          ? { ...competitor, marketShare: 44, score: 190, momentum: 8, lastMove: "개발자 도구 시장 핵심 인재 영입전" }
          : competitor,
      ),
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 4, loyalty: 38, energy: 72 })),
    };

    const poaching = getStaffIncidentBriefs(targeted).find((incident) => incident.type === "poaching") as
      | (ReturnType<typeof getStaffIncidentBriefs>[number] & {
          sourceCompetitorName?: string;
          offerLabel?: string;
          stakesLabel?: string;
        })
      | undefined;

    expect(poaching?.sourceCompetitorName).toContain("제미있니");
    expect(poaching?.description).toContain("제미있니");
    expect(poaching?.offerLabel).toContain("연봉");
    expect(poaching?.stakesLabel).toContain("점유 44%");
    expect(poaching?.triggerLabel).toContain("제안");
  });

  it("keeps the poaching competitor in the resolution record", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const targeted = {
      ...hired,
      resources: { ...hired.resources, cash: 12000 },
      competitorStates: hired.competitorStates.map((competitor) =>
        competitor.id === "competitor_jemiinni" ? { ...competitor, marketShare: 44, score: 190, momentum: 0 } : competitor,
      ),
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 4, loyalty: 38, energy: 72 })),
    };
    const poaching = getStaffIncidentBriefs(targeted).find((incident) => incident.type === "poaching");
    if (!poaching) throw new Error("Missing poaching incident");

    const resolved = resolveStaffIncident(poaching.id, "retention_bonus", targeted);
    const log = getRecentStaffIncidentResolutionLog(resolved);

    expect(log[0].sourceCompetitorName).toContain("제미있니");
    expect(log[0].summary).toContain("제미있니");
    expect(log[0].stakesLabel).toContain("점유 44%");
  });

  it("previews the consequence of ignoring a staff incident", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const targeted = {
      ...hired,
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 4, loyalty: 38, energy: 72 })),
    };

    const poaching = getStaffIncidentBriefs(targeted).find((incident) => incident.type === "poaching");

    expect(poaching?.aftermathLabel).toContain("방치");
    expect(poaching?.aftermathLabel).toContain("충성");
  });

  it("applies unresolved staff incident aftermaths on the next month", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const targeted = {
      ...hired,
      competitorStates: hired.competitorStates.map((competitor) =>
        competitor.id === "competitor_jemiinni" ? { ...competitor, marketShare: 44, score: 190, momentum: 0 } : competitor,
      ),
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 4, loyalty: 38, energy: 72 })),
    };
    const beforeAgent = targeted.hiredAgents[0];
    const beforeRivalMomentum = targeted.competitorStates.find((competitor) => competitor.id === "competitor_jemiinni")?.momentum ?? 0;

    const advanced = advanceMonth(targeted);
    const agent = advanced.hiredAgents.find((entry) => entry.id === beforeAgent.id);
    const afterRivalMomentum = advanced.competitorStates.find((competitor) => competitor.id === "competitor_jemiinni")?.momentum ?? 0;
    const aftermathLog = getRecentStaffIncidentAftermathLog(advanced);

    expect(agent?.loyalty).toBeLessThan(beforeAgent.loyalty ?? 0);
    expect(afterRivalMomentum).toBeGreaterThan(beforeRivalMomentum);
    expect(aftermathLog).toHaveLength(1);
    expect(aftermathLog[0].resolutionLabel).toContain("후폭풍");
    expect(aftermathLog[0].summary).toContain("제미있니");
    expect(advanced.timeline.join(" ")).toContain("인사 후폭풍");
  });

  it("does not apply a staff aftermath after the player resolves the incident", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const targeted = {
      ...hired,
      resources: { ...hired.resources, cash: 12000 },
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 4, loyalty: 38, energy: 72 })),
    };
    const poaching = getStaffIncidentBriefs(targeted).find((incident) => incident.type === "poaching");
    if (!poaching) throw new Error("Missing poaching incident");

    const resolved = resolveStaffIncident(poaching.id, "retention_bonus", targeted);
    const advanced = advanceMonth(resolved);

    expect(getRecentStaffIncidentAftermathLog(advanced)).toHaveLength(0);
    expect(advanced.timeline.join(" ")).not.toContain("인사 후폭풍");
  });

  it("records the latest staff incident resolution as a visible result card", () => {
    const hired = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting");
    const started = startProductProject(writingProduct(), hired, [hired.hiredAgents[0].id]);
    const exhausted = {
      ...started,
      resources: { ...started.resources, cash: 12000 },
      hiredAgents: started.hiredAgents.map((agent) => ({ ...agent, energy: 18, loyalty: 66 })),
    };
    const burnout = getStaffIncidentBriefs(exhausted).find((incident) => incident.type === "burnout");
    if (!burnout) throw new Error("Missing burnout incident");

    const resolved = resolveStaffIncident(burnout.id, "recovery_day", exhausted);
    const log = getRecentStaffIncidentResolutionLog(resolved);

    expect(log).toHaveLength(1);
    expect(log[0]).toMatchObject({
      agentName: exhausted.hiredAgents[0].name,
      incidentType: "burnout",
      incidentTitle: expect.stringContaining("번아웃"),
      resolutionLabel: "회복일 지정",
      severity: "critical",
    });
    expect(log[0].summary).toContain("프로젝트 배치 해제");
    expect(log[0].effectLabel).toContain("체력");
  });

  it("keeps only the three latest staff incident resolution records", () => {
    const baseAgent = hireAgentViaChannel(architect(), createInitialState(), "career_recruiting").hiredAgents[0];
    const logged = {
      ...createInitialState(),
      recentStaffIncidentResolutions: [
        { id: "old", month: 1, agentId: "old", agentName: "오래된 기록", incidentType: "burnout", incidentTitle: "오래된 사건", severity: "warning", resolutionId: "one_on_one", resolutionLabel: "1:1 면담", summary: "낡은 기록", effectLabel: "효과 없음" },
        { id: "mid", month: 2, agentId: "mid", agentName: "중간 기록", incidentType: "discontent", incidentTitle: "중간 사건", severity: "warning", resolutionId: "one_on_one", resolutionLabel: "1:1 면담", summary: "중간 기록", effectLabel: "효과 없음" },
        { id: "new", month: 3, agentId: "new", agentName: "최신 기록", incidentType: "poaching", incidentTitle: "최신 사건", severity: "critical", resolutionId: "retention_bonus", resolutionLabel: "리텐션 보너스", summary: "최신 기록", effectLabel: "충성 +24" },
      ],
      hiredAgents: [{ ...baseAgent, energy: 18, loyalty: 66 }],
    } satisfies GameState;

    const log = getRecentStaffIncidentResolutionLog(logged, 2);

    expect(log.map((entry) => entry.id)).toEqual(["new", "mid"]);
  });
});
