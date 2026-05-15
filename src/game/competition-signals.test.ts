import { describe, expect, it } from "vitest";
import { agentTypes, products } from "./data";
import { advanceMonth, chooseGrowthPath, createInitialState, hireAgent, startProductProject } from "./simulation";
import { getGrowthPathCompetitionSignals } from "./competition-signals";

describe("alpha v0.9.7 growth path competition signals", () => {
  it("marks competitors that overlap the chosen growth path", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing strategy signal fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    const chosen = chooseGrowthPath("code_vision_lab", released);
    const signals = getGrowthPathCompetitionSignals(chosen);

    expect(signals.find((signal) => signal.competitorId === "competitor_jemiinni")).toMatchObject({
      severity: "strategic",
      label: "전략 충돌",
    });
    expect(signals.find((signal) => signal.competitorId === "competitor_chatgody")).toMatchObject({
      severity: "watch",
      label: "관찰 필요",
    });
  });

  it("escalates to claimed-space conflict when a rival takes a product in the chosen path", () => {
    const architect = agentTypes.find((agent) => agent.id === "prompt_architect");
    const writingProduct = products.find((product) => product.id === "ai_writing_assistant");
    if (!architect || !writingProduct) throw new Error("Missing conflict signal fixture");

    const started = startProductProject(writingProduct, hireAgent(architect, createInitialState()));
    const released = advanceMonth(advanceMonth(started));
    let state = chooseGrowthPath("productivity_line", released);
    while (state.month < 4) {
      state = advanceMonth(state);
    }

    const signal = getGrowthPathCompetitionSignals(state).find((entry) => entry.competitorId === "competitor_jemiinni");

    expect(signal).toMatchObject({
      severity: "contested",
      label: "선점 충돌",
      claimedOverlapCount: 1,
    });
  });
});
