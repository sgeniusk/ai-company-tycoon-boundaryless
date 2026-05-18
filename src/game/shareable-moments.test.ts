import { describe, expect, it } from "vitest";
import { products } from "./data";
import { getShareableMoments } from "./shareable-moments";
import { advanceMonth, createInitialState, getStaffIncidentBriefs, hireAgentViaChannel, launchProduct, resolveStaffIncident, startProductProject } from "./simulation";
import { agentTypes } from "./data";

describe("v0.23 shareable moment harness", () => {
  it("captures a release as a screenshot-worthy moment", () => {
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!writingProduct) throw new Error("Missing writing product");

    const launched = launchProduct(writingProduct, createInitialState());
    const moments = getShareableMoments(launched);

    expect(moments[0]).toMatchObject({
      type: "launch",
      title: expect.stringContaining("AI 글쓰기"),
      tone: "positive",
    });
    expect(moments[0].badge).toContain("점");
  });

  it("captures rival pressure and final endings alongside launch moments", () => {
    const finalState = {
      ...createInitialState(),
      month: 120,
      status: "success" as const,
      locationId: "seoul_ai_tower",
      activeProducts: products.slice(0, 6).map((product) => product.id),
      productLevels: Object.fromEntries(products.slice(0, 6).map((product) => [product.id, 1])),
      resources: {
        ...createInitialState().resources,
        cash: 240000,
        users: 180000,
        trust: 86,
        automation: 70,
      },
      competitorStates: createInitialState().competitorStates.map((competitor) =>
        competitor.id === "competitor_chatgody"
          ? {
              ...competitor,
              marketShare: 42,
              score: 180,
              lastMove: "고객지원 챗봇 시장 선점",
            }
          : competitor,
      ),
    };

    const moments = getShareableMoments(finalState);

    expect(moments.map((moment) => moment.type)).toEqual(expect.arrayContaining(["ending", "rival"]));
    expect(moments.find((moment) => moment.type === "ending")?.badge).toMatch(/[SABCD]랭크/);
    expect(moments.find((moment) => moment.type === "rival")?.detail).toContain("고객지원");
  });

  it("captures staff incident resolutions as shareable company drama", () => {
    const architect = agentTypes.find((entry) => entry.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing staff incident fixture data");
    const hired = hireAgentViaChannel(architect, createInitialState(), "career_recruiting");
    const started = startProductProject(writingProduct, hired, [hired.hiredAgents[0].id]);
    const exhausted = {
      ...started,
      resources: { ...started.resources, cash: 12000 },
      hiredAgents: started.hiredAgents.map((agent) => ({ ...agent, energy: 18, loyalty: 66 })),
    };
    const burnout = getStaffIncidentBriefs(exhausted).find((incident) => incident.type === "burnout");
    if (!burnout) throw new Error("Missing burnout incident");

    const resolved = resolveStaffIncident(burnout.id, "recovery_day", exhausted);
    const moments = getShareableMoments(resolved);

    expect(moments[0]).toMatchObject({
      type: "staff",
      title: expect.stringContaining("회복일 지정"),
      badge: "인사 사건",
      tone: "warning",
    });
    expect(moments[0].detail).toContain("프로젝트 배치 해제");
  });

  it("mentions the rival behind a staff poaching moment", () => {
    const architect = agentTypes.find((entry) => entry.id === "prompt_architect");
    if (!architect) throw new Error("Missing staff incident fixture data");
    const hired = hireAgentViaChannel(architect, createInitialState(), "career_recruiting");
    const targeted = {
      ...hired,
      resources: { ...hired.resources, cash: 12000 },
      competitorStates: hired.competitorStates.map((competitor) =>
        competitor.id === "competitor_jemiinni" ? { ...competitor, marketShare: 44, score: 190, momentum: 8 } : competitor,
      ),
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 4, loyalty: 38, energy: 72 })),
    };
    const poaching = getStaffIncidentBriefs(targeted).find((incident) => incident.type === "poaching");
    if (!poaching) throw new Error("Missing poaching incident");

    const resolved = resolveStaffIncident(poaching.id, "retention_bonus", targeted);
    const staffMoment = getShareableMoments(resolved).find((moment) => moment.type === "staff");

    expect(staffMoment?.title).toContain("제미있니");
    expect(staffMoment?.detail).toContain("점유 44%");
  });

  it("labels unresolved staff aftermaths without calling them a defense", () => {
    const architect = agentTypes.find((entry) => entry.id === "prompt_architect");
    if (!architect) throw new Error("Missing staff incident fixture data");
    const hired = hireAgentViaChannel(architect, createInitialState(), "career_recruiting");
    const targeted = {
      ...hired,
      competitorStates: hired.competitorStates.map((competitor) =>
        competitor.id === "competitor_jemiinni" ? { ...competitor, marketShare: 44, score: 190, momentum: 0 } : competitor,
      ),
      hiredAgents: hired.hiredAgents.map((agent) => ({ ...agent, level: 4, loyalty: 38, energy: 72 })),
    };

    const advanced = advanceMonth(targeted);
    const staffMoment = getShareableMoments(advanced).find((moment) => moment.type === "staff");

    expect(staffMoment?.title).toContain("후폭풍");
    expect(staffMoment?.title).not.toContain("방어");
    expect(staffMoment?.detail).toContain("제미있니");
  });
});
