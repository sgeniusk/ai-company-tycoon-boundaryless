import { describe, expect, it } from "vitest";
import { agentTypes, products } from "./data";
import { advanceMonth, chooseGrowthPath, createInitialState, hireAgent, startProductProject } from "./simulation";
import { getCompetitionSeasonBrief, getGrowthPathCompetitionSignals } from "./competition-signals";

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

  it("summarizes annual rival season pressure and scheduled challenger waves", () => {
    let state = createInitialState();
    while (state.month < 12) {
      state = advanceMonth(state);
    }

    const brief = getCompetitionSeasonBrief(state);

    expect(brief.title).toBe("1년차 경쟁 시즌");
    expect(brief.recentEntrants.map((entry) => entry.id)).toEqual([
      "competitor_autonova_motors",
      "competitor_brewchain",
    ]);
    expect(brief.nextEntrants.map((entry) => entry.entryMonth)).toEqual([24, 24]);
    expect(brief.topPressure?.competitorId).toBeTruthy();
    expect(brief.summary).toContain("신규 경쟁사 2곳");
  });
});
