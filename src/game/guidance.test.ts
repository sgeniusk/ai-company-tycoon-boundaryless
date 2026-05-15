import { describe, expect, it } from "vitest";
import { agentTypes, products } from "./data";
import { createInitialState, hireAgent, startProductProject, advanceMonth, chooseGrowthPath } from "./simulation";
import { getGuidanceStep, getOpeningObjectives } from "./guidance";

describe("alpha v0.9.1 player guidance", () => {
  it("points a new player to hiring the first agent", () => {
    const guidance = getGuidanceStep(createInitialState());

    expect(guidance).toMatchObject({
      id: "hire_first_agent",
      menu: "agents",
      actionLabel: "에이전트 고용",
    });
  });

  it("tracks a visible first-session objective strip", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const product = products.find((entry) => entry.id === "ai_writing_assistant");
    if (!architect || !product) throw new Error("Missing starter fixtures");

    const initialObjectives = getOpeningObjectives(createInitialState());
    const staffed = hireAgent(architect, createInitialState());
    const started = startProductProject(product, staffed);
    const released = advanceMonth(advanceMonth(started));

    expect(initialObjectives.map((objective) => objective.id)).toEqual([
      "hire_agent",
      "start_product",
      "release_product",
      "choose_next_path",
    ]);
    expect(initialObjectives[0].complete).toBe(false);
    expect(getOpeningObjectives(staffed)[0].complete).toBe(true);
    expect(getOpeningObjectives(started)[1].complete).toBe(true);
    expect(getOpeningObjectives(released)[2].complete).toBe(true);
  });

  it("points a staffed company to starting the first product project", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    if (!architect) throw new Error("Missing prompt architect");

    const guidance = getGuidanceStep(hireAgent(architect, createInitialState()));

    expect(guidance).toMatchObject({
      id: "start_first_project",
      menu: "products",
      actionLabel: "제품 개발 시작",
    });
  });

  it("points an active project toward month advancement", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const product = products.find((entry) => entry.id === "ai_writing_assistant");
    if (!architect || !product) throw new Error("Missing starter fixtures");

    const started = startProductProject(product, hireAgent(architect, createInitialState()));
    const guidance = getGuidanceStep(started);

    expect(guidance).toMatchObject({
      id: "advance_project",
      actionLabel: "다음 달 진행",
    });
  });

  it("points a released first product toward choosing a growth path", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const product = products.find((entry) => entry.id === "ai_writing_assistant");
    if (!architect || !product) throw new Error("Missing starter fixtures");

    const started = startProductProject(product, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    const guidance = getGuidanceStep(released);

    expect(guidance).toMatchObject({
      id: "choose_growth_path",
      menu: "products",
      actionLabel: "성장 분기 보기",
    });
  });

  it("marks the next-growth objective complete after committing to a path", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const product = products.find((entry) => entry.id === "ai_writing_assistant");
    if (!architect || !product) throw new Error("Missing starter fixtures");

    const started = startProductProject(product, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    const chosen = chooseGrowthPath("productivity_line", released);

    expect(getOpeningObjectives(chosen)[3]).toMatchObject({
      id: "choose_next_path",
      complete: true,
    });
    expect(getGuidanceStep(chosen).id).not.toBe("choose_growth_path");
  });
});
