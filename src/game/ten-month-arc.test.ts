import { describe, expect, it } from "vitest";
import { agentTypes, products } from "./data";
import { advanceMonth, chooseGrowthPath, createInitialState, hireAgent, startProductProject } from "./simulation";
import { getTenMonthArc } from "./ten-month-arc";

describe("alpha v0.10.0 ten-month arc", () => {
  it("starts with a readable five-step MVP arc", () => {
    const arc = getTenMonthArc(createInitialState());

    expect(arc.milestones).toHaveLength(5);
    expect(arc.progressPercent).toBe(0);
    expect(arc.milestones[0]).toMatchObject({
      id: "first_release",
      complete: false,
    });
  });

  it("advances the arc after release and strategy commitment", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing ten-month arc fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    const chosen = chooseGrowthPath("productivity_line", released);
    const arc = getTenMonthArc(chosen);

    expect(arc.progressPercent).toBeGreaterThan(0);
    expect(arc.milestones.find((milestone) => milestone.id === "first_release")?.complete).toBe(true);
    expect(arc.milestones.find((milestone) => milestone.id === "strategy_commitment")?.complete).toBe(true);
    expect(arc.summary).toContain("5단계");
  });
});
